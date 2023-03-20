import type { GameProcess } from './gameProcess';

import * as resolutions from './config/resolutions.json';

export enum GAME_STATE {
  IDLE = 'IDLE',
  IDLE_WITH_MENU = 'IDLE_WITH_MENU',

  LOADING_SCREEN = 'LOADING_SCREEN',
  LOADING_INSTANCE = 'LOADING_INSTANCE',

  UNKNOWN = 'UNKNOWN',
  VISUAL_STUDIO = 'VISUAL_STUDIO',
}

interface ResolutionConfigCoord {
  x: number;
  y: number;
}

interface ResolutionConfig {
  activity_button: ResolutionConfigCoord;
  activity_defi_tab: ResolutionConfigCoord;
  activity_defi_caroussel_start: ResolutionConfigCoord;
  activity_defi_caroussel_stop: ResolutionConfigCoord;
  activity_defi_go: ResolutionConfigCoord;
  activity_defi_group: ResolutionConfigCoord;
  activity_defi_help: ResolutionConfigCoord;
  activity_defi_accept: ResolutionConfigCoord;
  conflit_auto: ResolutionConfigCoord;
  conflit_exit: ResolutionConfigCoord;
  conflit_confirm_exit: ResolutionConfigCoord;
}

export class Game {
  state: GAME_STATE = GAME_STATE.IDLE;
  private readonly resolutionConfig: ResolutionConfig;

  constructor(private readonly gameProcess: GameProcess) {
    const typedResolutions: Record<string, ResolutionConfig | undefined>
      = resolutions as Record<string, ResolutionConfig | undefined>;

    const resolutionConfig: ResolutionConfig | undefined =
      typedResolutions[`${gameProcess.bounds.Right}x${gameProcess.bounds.Bottom}`] ??
      typedResolutions[Object.keys(resolutions)[0]];

    if (resolutionConfig === undefined) {
      throw new Error('At least one resolution config is needed in ./config/resolutions.jons');
    }

    this.resolutionConfig = resolutionConfig;
  }
}
