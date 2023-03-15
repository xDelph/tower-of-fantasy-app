import * as fs from 'fs';

import * as dotenv from 'dotenv';
dotenv.config();

import { Analyzer } from './analyzer';
import { GAME_STATE } from './game';
import { Game } from './game';
import { GameProcess } from './gameProcess';
import { Resource } from './resource';

// import { Overlay } from './overlay';

const gameProcess: GameProcess = new GameProcess();
const resource: Resource = new Resource();

const game: Game = new Game(gameProcess);
// const overlay: Overlay = new Overlay();

const analyzer: Analyzer = new Analyzer();

let num: number = 0;

// remove previous debug
fs.readdirSync('./debug')
  .filter((f: string) => /[0-9]\.(png|txt)$/.test(f))
  .map((f: string) => fs.unlinkSync(`./debug/${f}`));

(async (): Promise<void> => {
  await analyzer.init();

  async function loop(): Promise<void> {
    if (!gameProcess.isProcessInForeground()) {
      if (process.env.FOREGROUND_WARN === 'true') {
        console.log('-----------------------------------');
        console.log('[Warn] Tower of Fantasy is not the forground window !');
        console.log('[Warn] Please switch to Tower of Fantasy window !');
        console.log('[Warn] Waiting for 5 seconds before retrying...');
        console.log('-----------------------------------');
      }

      setTimeout(
        () => {
          void (async (): Promise<void> => {
            await loop();
          })();
        },
        5_000,
      );

      return;
    }

    console.log(`\n---> NEW PROCESS TICK (number: ${num}) <---`);

    // const start: number = Date.now();

    // for (let i: number = 0; i < 25; i++) {
    //   const screenshot: Buffer = await gameProcess.getScreenshot(
    //     i,
    //     {
    //       Left: 250,
    //       Right: 500,
    //       Top: 650,
    //       Bottom: 750,
    //     },
    //     false,
    //     true,
    //   );
    //   await analyzer.analyze(i, screenshot);
    // }

    // const end: number = Date.now();
    // console.log('time', end-start);

    // process.exit(0);

    const screenshot: Buffer = await gameProcess.getScreenshot(num);
    let state: GAME_STATE = await analyzer.analyze(num, screenshot);

    if (state === GAME_STATE.UNKNOWN) {
      const envSaveScreenshotBackup: string | undefined = process.env.SAVE_SCREEN_SHOT;
      process.env.SAVE_SCREEN_SHOT = 'false';

      const positions: Array<[number, number]> = resource.getSubImagePositions(
        await gameProcess.getScreenshot(
          num,
          {
            Left: Math.round((gameProcess.bounds.Right - gameProcess.bounds.Left) * 0.8),
            Right: gameProcess.bounds.Right,
            Top: gameProcess.bounds.Top,
            Bottom: Math.round((gameProcess.bounds.Bottom - gameProcess.bounds.Top) * 0.5),
          },
          true,
        ),
        'quest_tab',
        0.4,
      );
      process.env.SAVE_SCREEN_SHOT = envSaveScreenshotBackup;

      if (positions.length !== 0 && positions.length < 4) {
        state = GAME_STATE.IDLE;
      }
    }

    console.log('Analyzer state:', state);
    console.log('Before Game state:', game.state);
    await game.doConflit(state, analyzer.conflitGoLocation);
    console.log('After Game state:', game.state);

    num += 1;

    if (num === 25) {
      num = 0;
    }

    setTimeout(
      () => {
        void (async (): Promise<void> => {
          await loop();
        })();
      },
      game.state === GAME_STATE.DEFI_IN_PROGRESS ? 10_000 : 1_000,
    );
  }

  await loop();
})().catch((e: Error) => {
  console.error(e);
});

process.on('exit', (code: number) => {
  console.log(`About to exit with code: ${code}`);
});

process.on('error', (e: Error) => {
  console.error(e);
  process.exit(-1);
});

