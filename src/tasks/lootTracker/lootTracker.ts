import type { LootTrackerState } from './state';
import type Tesseract from 'tesseract.js';

import { GAME_STATE } from '../../game';

import { Analyzer } from './analyzer';

const LOOT_TIMER: number = 4000;
export class LootTracker {
  private readonly analyzer: Analyzer;
  private readonly state: LootTrackerState;
  constructor(private readonly worker: Tesseract.Worker) {
    this.analyzer = new Analyzer(worker);
    this.state = {
      gameState: GAME_STATE.UNKNOWN,
      jointOperationName: '',
      openedChests: [false,false,false,false],
      lastChestOpenedDate: 0,
    };
  }

  async execute(num: number, screenhot: Buffer): Promise<void> {
    console.debug('Current state: ', this.state);
    if(this.state.lastChestOpenedDate > 0) {
      if(new Date().getTime() - this.state.lastChestOpenedDate < LOOT_TIMER) {
        // TODO: check loot

        // We return so we don't check anything else until the loot timer ran out
        return;
      }
      this.state.lastChestOpenedDate = 0;
    }

    if(this.state.gameState == GAME_STATE.UNKNOWN || this.state.gameState == GAME_STATE.IDLE) {
      const result: {
          state: GAME_STATE;
          jointOperationName: string;
      } | null = await this.analyzer.getJointOperationState(num, screenhot);
      if(result) {
        this.state.gameState = result.state;
        this.state.jointOperationName = result.jointOperationName;
      }
    }

    if(await this.analyzer.isIdle(num, screenhot)) {
      this.state.gameState = GAME_STATE.IDLE;
      this.state.jointOperationName = '';
      this.state.lastChestOpenedDate = 0;
      this.state.openedChests = [false,false,false,false];

      return;
    }

    const openedChests: number[] = await this.analyzer.getOpenedChests(num, screenhot);
    console.debug('opened chests:', openedChests);
    openedChests.forEach((p: number)=> {
      if(!this.state.openedChests[p])
      {
        this.state.openedChests[p] = true;
        // We don't care what we loot in the 4th chest
        if(p != 3) {
          this.state.lastChestOpenedDate = new Date().getTime();
        }
      }
    });

    console.debug('New state: ', this.state);
  }

}
