import * as fs from 'fs';

import * as dotenv from 'dotenv';
dotenv.config();

import { Analyzer } from './analyzer';
// import { Resource } from './resource';

// const resource: Resource = new Resource();

(async (): Promise<void> => {
  const analyzer: Analyzer = new Analyzer();
  await analyzer.init();

  const screenshot: Buffer = fs.readFileSync('./resources/test/matchmakingOPBigName.png');
  await analyzer.analyze(1, screenshot);
})().catch((e: Error) => {
  console.error(e);
});

process.on('exit', (code: number) => {
  console.log(`About to exit with code: ${code}`);
});
