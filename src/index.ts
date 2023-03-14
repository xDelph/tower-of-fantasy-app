import type { GAME_STATE } from './game';

import * as dotenv from 'dotenv';
dotenv.config();

import { Analyzer } from './analyzer';
import { Game } from './game';
import { GameProcess } from './gameProcess';
// import { Overlay } from './overlay';

const gameProcess: GameProcess = new GameProcess();

const game: Game = new Game(gameProcess);
// const overlay: Overlay = new Overlay();

const analyzer: Analyzer = new Analyzer();

let num: number = 0;

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

    const screenshot: Buffer = await gameProcess.getScreenshot(num);
    const state: GAME_STATE = await analyzer.analyze(num, screenshot);

    console.log('Analyzer state:', state);
    console.log('Before Game state:', game.state);
    await game.doConflit(state, analyzer.conflitGoLocation);
    console.log('After Game state:', game.state);

    num += 1;

    setTimeout(
      () => {
        void (async (): Promise<void> => {
          await loop();
        })();
      },
      0,
    );
  }

  await loop();
})().catch((e: Error) => {
  console.error(e);
});

process.on('exit', (code: number) => {
  console.log(`About to exit with code: ${code}`);
});

process.on('error', () => {
  process.exit(-1);
});

