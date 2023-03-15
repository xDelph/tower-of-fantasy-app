import type { GameProcess } from './gameProcess';

import robot from 'robotjs';

import * as resolutions from './config/resolutions.json';

export enum GAME_STATE {
  IDLE = 'IDLE',
  IDLE_WITH_MENU = 'IDLE_WITH_MENU',

  LOADING_SCREEN = 'LOADING_SCREEN',
  LOADING_INSTANCE = 'LOADING_INSTANCE',

  AVENTURE_MENU = 'AVENTURE_MENU',

  DEFI_MENU_CONFLIT = 'DEFI_MENU_CONFLIT',
  DEFI_MENU_NO_CONFLIT = 'DEFI_MENU_NO_CONFLIT',
  DEFI_GROUPE = 'DEFI_GROUPE',
  DEFI_GROUPE_WAIT = 'DEFI_GROUPE_WAIT',
  DEFI_LOADING = 'DEFI_LOADING',
  DEFI_IN_PROGRESS = 'DEFI_IN_PROGRESS',
  DEFI_FINISHED = 'DEFI_FINISHED',
  DEFI_FINISHED_TO_EXIT = 'DEFI_FINISHED_TO_EXIT',
  DEFI_FINISHED_RETURN = 'DEFI_FINISHED_RETURN',

  GROUP_TO_ACCEPT = 'GROUP_TO_ACCEPT',

  END_INSTANCE = 'END_INSTANCE',

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

async function sleep(time: number): Promise<void> {
  return new Promise((resolve: () => void) => setTimeout(resolve, time));
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

  async doConflit(analyzerState: GAME_STATE, conflitGoLocation: [number, number]): Promise<void> {
    switch (this.state) {
      case GAME_STATE.IDLE:
        this.openAventureMenu();
        await sleep(1000);
        this.switchToAventureDefiTab();
        this.state = GAME_STATE.DEFI_MENU_NO_CONFLIT;
        break;
      case GAME_STATE.AVENTURE_MENU:
        this.switchToAventureDefiTab();
        this.state = GAME_STATE.DEFI_MENU_NO_CONFLIT;
        break;
      case GAME_STATE.DEFI_MENU_NO_CONFLIT:
        if (analyzerState === GAME_STATE.DEFI_MENU_CONFLIT) {
          this.prepareConflit(conflitGoLocation);
          await sleep(1000);
          await this.launchConflit();
          this.state = GAME_STATE.DEFI_GROUPE_WAIT;
        } else {
          this.dragDefiCarrousel();
          this.state = GAME_STATE.DEFI_MENU_CONFLIT;
        }
        break;
      case GAME_STATE.DEFI_MENU_CONFLIT:
        this.prepareConflit(conflitGoLocation);
        await sleep(1000);
        await this.launchConflit();
        this.state = GAME_STATE.DEFI_GROUPE_WAIT;
        break;
      case GAME_STATE.DEFI_GROUPE:
        await this.launchConflit();
        await sleep(1000);
        this.state = GAME_STATE.DEFI_GROUPE_WAIT;
        break;
      case GAME_STATE.DEFI_GROUPE_WAIT:
        if (analyzerState === GAME_STATE.GROUP_TO_ACCEPT) {
          await this.acceptConflit();
        } else if (
          analyzerState === GAME_STATE.LOADING_INSTANCE
        ) {
          this.state = GAME_STATE.LOADING_INSTANCE;
        } else if (
          analyzerState === GAME_STATE.LOADING_SCREEN
        ) {
          this.state = GAME_STATE.LOADING_SCREEN;
        }
        break;
      case GAME_STATE.GROUP_TO_ACCEPT:
        await this.acceptConflit();
        this.state = GAME_STATE.DEFI_GROUPE_WAIT;
        break;
      case GAME_STATE.LOADING_INSTANCE:
        if (analyzerState === GAME_STATE.LOADING_SCREEN) {
          this.state = GAME_STATE.LOADING_SCREEN;
        } else if (analyzerState === GAME_STATE.DEFI_IN_PROGRESS) {
          this.activateAutoMode();
          this.state = GAME_STATE.DEFI_IN_PROGRESS;
        }
        break;
      case GAME_STATE.LOADING_SCREEN:
        if (analyzerState === GAME_STATE.DEFI_IN_PROGRESS) {
          this.activateAutoMode();
          this.state = GAME_STATE.DEFI_IN_PROGRESS;
        }
        break;
      case GAME_STATE.DEFI_IN_PROGRESS:
        if (analyzerState === GAME_STATE.DEFI_FINISHED) {
          this.state = GAME_STATE.DEFI_FINISHED;
        }
        break;
      case GAME_STATE.DEFI_FINISHED:
        if (analyzerState === GAME_STATE.DEFI_FINISHED_TO_EXIT) {
          this.state = GAME_STATE.DEFI_FINISHED_TO_EXIT;
        }
        break;
      case GAME_STATE.DEFI_FINISHED_TO_EXIT:
        await this.exitConflit();
        this.state = GAME_STATE.DEFI_FINISHED_RETURN;
        break;
      case GAME_STATE.DEFI_FINISHED_RETURN:
        if (analyzerState === GAME_STATE.IDLE) {
          this.state = GAME_STATE.IDLE;
        }
        break;
      default:
        return;
    }
  }

  private openAventureMenu(): void {
    if (this.state === GAME_STATE.IDLE) {
      console.log('action: openAventureMenu');
      robot.keyToggle('alt', 'down');

      robot.moveMouse(
        this.resolutionConfig.activity_button.x,
        this.resolutionConfig.activity_button.y,
      );
      robot.mouseClick();

      robot.keyToggle('alt', 'up');
    }
  }

  private switchToAventureDefiTab(): void {
    console.log('action: switchToAventureDefiTab');
    robot.moveMouse(
      this.resolutionConfig.activity_defi_tab.x,
      this.resolutionConfig.activity_defi_tab.y,
    );
    robot.mouseClick();
  }

  private dragDefiCarrousel(): void {
    console.log('action: dragDefiCarrousel');
    robot.moveMouse(
      this.resolutionConfig.activity_defi_caroussel_start.x,
      this.resolutionConfig.activity_defi_caroussel_start.y,
    );

    robot.mouseToggle('down');
    robot.moveMouseSmooth(
      this.resolutionConfig.activity_defi_caroussel_stop.x,
      this.resolutionConfig.activity_defi_caroussel_stop.y,
      1,
    );
    robot.mouseToggle('up');
  }

  private prepareConflit(conflitGoLocation: [number, number]): void {
    console.log('action: prepareConflit');
    robot.moveMouse(conflitGoLocation[0], conflitGoLocation[1] + this.gameProcess.bounds.Top);
    robot.mouseClick();
  }

  private async launchConflit(): Promise<void> {
    console.log('action: launchConflit');
    robot.moveMouse(
      this.resolutionConfig.activity_defi_go.x,
      this.resolutionConfig.activity_defi_go.y,
    );
    robot.mouseClick();

    await sleep(1000);

    robot.moveMouse(
      this.resolutionConfig.activity_defi_group.x,
      this.resolutionConfig.activity_defi_group.y,
    );
    robot.mouseClick();
  }

  private async acceptConflit(): Promise<void> {
    console.log('action: acceptConflit');
    robot.moveMouse(
      this.resolutionConfig.activity_defi_help.x,
      this.resolutionConfig.activity_defi_help.y,
    );
    robot.mouseClick();

    await sleep(1000);

    robot.moveMouse(
      this.resolutionConfig.activity_defi_accept.x,
      this.resolutionConfig.activity_defi_accept.y,
    );
    robot.mouseClick();
  }

  private activateAutoMode(): void {
    console.log('action: activateAutoMode');
    robot.keyToggle('alt', 'down');
    robot.moveMouse(
      this.resolutionConfig.conflit_auto.x,
      this.resolutionConfig.conflit_auto.y,
    );
    robot.mouseClick();
    robot.keyToggle('alt', 'up');
  }

  private async exitConflit(): Promise<void> {
    console.log('action: exitConflit');
    robot.keyToggle('alt', 'down');

    robot.moveMouse(
      this.resolutionConfig.conflit_exit.x,
      this.resolutionConfig.conflit_exit.y,
    );
    robot.mouseClick();

    await sleep(1000);

    robot.mouseClick();

    await sleep(1000);

    robot.mouseClick();

    await sleep(1000);

    robot.moveMouse(
      this.resolutionConfig.conflit_confirm_exit.x,
      this.resolutionConfig.conflit_confirm_exit.y,
    );

    robot.mouseClick();
    robot.keyToggle('alt', 'up');
  }
}
