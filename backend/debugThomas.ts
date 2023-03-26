import * as fs from 'fs';

import * as dotenv from 'dotenv';
import { captureActiveWindow } from 'windows-ss';
dotenv.config();

import './global';

// import { Analyzer } from './analyzer';
import { TesseractWorker } from './tools/worker';

(async (): Promise<void> => {
  global.worker = await TesseractWorker.getWorker();
  // const analyze: Analyzer = new Analyzer();

  let start: number = Date.now();
  const buffer: Buffer | null = await captureActiveWindow({
    bounds: {
      left: 0,
      top: 0,
      right: 2560,
      bottom: 1440,
    },
    crop: {
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
    },
    format: 'jpeg',
  });
  console.log(buffer);
  console.log(Date.now() - start);
  if (buffer !== null) {
    fs.writeFileSync('./debug/windows-ss.jpeg', buffer);
    start = Date.now();
    // await analyze.analyze(1, buffer);
    console.log(Date.now() - start);
  }
})().catch((e: Error) => {
  console.error(e);
});

process.on('exit', (code: number) => {
  console.log(`About to exit with code: ${code}`);
});
