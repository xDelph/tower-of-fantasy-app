import * as fs from 'fs';

import * as tesseract from 'tesseract.js';

import { Analyzer } from './tasks/lootTracker/analyzer';

(async (): Promise<void> => {
  const worker: Tesseract.Worker = await tesseract.createWorker({
    logger: (m: unknown) => {
      if (process.env.OCR_LOG === 'true') {
        console.log(m);
      }
    },
  });

  await worker.loadLanguage('fra');
  await worker.initialize('fra');

  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÈÉabcdefghijklmnopqrstuvwxyzàèé0123456789: ',
  });

  const screenshot: Buffer = fs.readFileSync('./debug/screenshot17.png');
  const analyzer: Analyzer = new Analyzer(worker);

  const result: number[] = await analyzer.getOpenedChests(1, screenshot);

  console.log(result);
})().catch((e: Error) => {
  console.error(e);
});
