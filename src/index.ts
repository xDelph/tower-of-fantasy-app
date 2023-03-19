import * as fs from 'fs';

import * as dotenv from 'dotenv';
dotenv.config();

import './global';

import { ConflitFrontalierAction } from './actions/conflitFrontalier';
import { GameProcess } from './gameProcess';
import { TesseractWorker } from './worker';

const gameProcess: GameProcess = new GameProcess();
const conflitFrontalier: ConflitFrontalierAction = new ConflitFrontalierAction();

// remove previous debug
fs.readdirSync('./debug')
  .filter((f: string) => /[0-9]\.(png|txt)$/.test(f))
  .map((f: string) => fs.unlinkSync(`./debug/${f}`));

(async (): Promise<void> => {
  global.worker = await TesseractWorker.getWorker();

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

    console.log(`\n---> NEW PROCESS TICK (number: ${global.iterationNumber}) <---`);
    await conflitFrontalier.nextTick();

    global.iterationNumber++;
    if (global.iterationNumber === 25) {
      global.iterationNumber = 0;
    }

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

process.on('error', (e: Error) => {
  console.error(e);
  process.exit(-1);
});

