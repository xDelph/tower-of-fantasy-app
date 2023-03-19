import * as fs from 'fs';

import * as dotenv from 'dotenv';
dotenv.config();

import * as tesseract from 'tesseract.js';

// import { Analyzer } from './analyzer';
import { GAME_STATE } from './game';
import { Game } from './game';
import { GameProcess } from './gameProcess';
import { LootTracker } from './tasks/lootTracker/lootTracker';

// import { Overlay } from './overlay';
const lang: string = process.env.TESSERACT_LANGUAGE ?? 'fra';
const gameProcess: GameProcess = new GameProcess();

const game: Game = new Game(gameProcess);
// const overlay: Overlay = new Overlay();

// const analyzer: Analyzer = new Analyzer();
let num: number = 0;

// remove previous debug
fs.readdirSync('./debug')
  .filter((f: string) => /[0-9]\.(png|txt)$/.test(f))
  .map((f: string) => fs.unlinkSync(`./debug/${f}`));

(async (): Promise<void> => {
  const worker: Tesseract.Worker = await tesseract.createWorker({
    logger: (m: unknown) => {
      if (process.env.OCR_LOG === 'true') {
        console.log(m);
      }
    },
  });

  await worker.loadLanguage(lang);
  await worker.initialize(lang);

  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÈÉabcdefghijklmnopqrstuvwxyzàèé0123456789: ',
  });

  const lootTracker: LootTracker = new LootTracker(worker);

  // await analyzer.init();

  async function loop(): Promise<void> {
    // if (!gameProcess.isProcessInForeground()) {
    //   if (process.env.FOREGROUND_WARN === 'true') {
    //     console.log('-----------------------------------');
    //     console.log('[Warn] Tower of Fantasy is not the forground window !');
    //     console.log('[Warn] Please switch to Tower of Fantasy window !');
    //     console.log('[Warn] Waiting for 5 seconds before retrying...');
    //     console.log('-----------------------------------');
    //   }

    //   setTimeout(
    //     () => {
    //       void (async (): Promise<void> => {
    //         await loop();
    //       })();
    //     },
    //     5_000,
    //   );

    //   return;
    // }
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
    let start: number = Date.now();
    const screenshot: Buffer = await gameProcess.getScreenshot(num);
    let end: number = Date.now();
    console.log(`gameProcess.getScreenshot() Execution time: ${end - start} ms`);

    // let state: GAME_STATE = await analyzer.analyze(num, screenshot);
    // const state: GAME_STATE = await ltAnalyzer.analyze(num, screenshot);

    start = Date.now();
    await lootTracker.execute(num, screenshot);
    end = Date.now();
    console.log(`lootTracker.execute() Execution time: ${end - start} ms`);

    // if (state === GAME_STATE.UNKNOWN) {
    //   const envSaveScreenshotBackup: string | undefined = process.env.SAVE_SCREEN_SHOT;
    //   process.env.SAVE_SCREEN_SHOT = 'false';

    //   const positions: Array<[number, number]> = resource.getSubImagePositions(
    //     await gameProcess.getScreenshot(
    //       num,
    //       {
    //         Left: Math.round((gameProcess.bounds.Right - gameProcess.bounds.Left) * 0.8),
    //         Right: gameProcess.bounds.Right,
    //         Top: gameProcess.bounds.Top,
    //         Bottom: Math.round((gameProcess.bounds.Bottom - gameProcess.bounds.Top) * 0.5),
    //       },
    //       true,
    //     ),
    //     'quest_tab',
    //     0.4,
    //   );
    //   process.env.SAVE_SCREEN_SHOT = envSaveScreenshotBackup;

    //   if (positions.length !== 0 && positions.length < 4) {
    //     state = GAME_STATE.IDLE;
    //   }
    // }

    // console.log('Analyzer state:', state);
    // console.log('Before Game state:', game.state);
    // await game.doConflit(state, analyzer.conflitGoLocation);
    // console.log('After Game state:', game.state);

    num += 1;

    if (num === 25) {
      num = 0;
    }

    setImmediate(
      () => {
        void (async (): Promise<void> => {
          start = Date.now();
          await loop();
          end = Date.now();
          console.log(`Loop Execution time: ${end - start} ms`);
        })();
      },
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

