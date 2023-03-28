import * as fs from 'fs';

import * as dotenv from 'dotenv';
dotenv.config();

import './global';

import { ConflitFrontalierAction } from './actions/conflitFrontalier';
import { GameProcess } from './tools/gameProcess';
import { TesseractWorker } from './tools/worker';

const gameProcess: GameProcess = new GameProcess();
const conflitFrontalier: ConflitFrontalierAction = new ConflitFrontalierAction();

// remove previous debug
fs.readdirSync('./debug')
  .filter((f: string) => /[0-9]\.(jpeg|txt)$/.test(f))
  .map((f: string) => fs.unlinkSync(`./debug/${f}`));

(async (): Promise<void> => {
  global.worker = await TesseractWorker.getWorker();

  async function loop(): Promise<void> {
    try {
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
      console.log('Loop done:', conflitFrontalier.loopDone);

      global.iterationNumber++;
      if (global.iterationNumber === 25) {
        global.iterationNumber = 0;
      }
    } catch (e) {
      console.error('Loop error:', e);
    }

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

