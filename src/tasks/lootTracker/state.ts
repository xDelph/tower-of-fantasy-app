import type { GAME_STATE } from '../../game';

export interface LootTrackerState {
    gameState: GAME_STATE;
    jointOperationName: string,
    openedChests: [boolean, boolean, boolean, boolean],
    lastChestOpenedDate: number,
  }
