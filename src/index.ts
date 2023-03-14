import * as dotenv from 'dotenv';
dotenv.config();

// @ts-ignore
import { Analyzer } from './analyzer.ts';
// @ts-ignore
import { Game, GAME_STATE } from './game.ts';
// @ts-ignore
import { GameProcess } from './gameProcess.ts';
// @ts-ignore
// import { Overlay } from './overlay';

const gameProcess: GameProcess = new GameProcess();

const game: Game = new Game(gameProcess);
// const overlay: Overlay = new Overlay();

const analyzer: Analyzer = new Analyzer();
await analyzer.init();

async function loop(): Promise<void> {
  console.log('--- PROCESS TICK ---');

  if (!gameProcess.isProcessInForeground()) {
    if (process.env.FOREGROUND_WARN === 'true') {
      console.log('-----------------------------------');
      console.log('[Warn] Tower of Fantasy is not the forground window !');
      console.log('[Warn] Please switch to Tower of Fantasy window !');
      console.log('[Warn] Waiting for 5 seconds before retrying...');
      console.log('-----------------------------------');
    }

    setTimeout(() => loop(), 5_000);
    
    return;
  }

  const screenshot: Buffer = await gameProcess.getScreenshot();
  const state: GAME_STATE = await analyzer.analyze(screenshot);

  console.log('Analyzer state:', state);
  game.doConflit(state, analyzer.conflitGoLocation);
  console.log('Game state:', game.state);

  setTimeout(() => loop(), 0);
}

await loop();

process.on('exit', (code: number) => {
  console.log(`About to exit with code: ${code}`);
});

process.on('error', () => {
  process.exit(-1);
});

