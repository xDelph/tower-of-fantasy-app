// @ts-ignore
import type { GameProcess } from './gameProcess.ts';

import robot from 'robotjs';

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

  GROUP_TO_ACCEPT = 'GROUP_TO_ACCEPT',

  END_INSTANCE = 'END_INSTANCE',

  TO_DEFINED = 'TO_DEFINED',
}

async function sleep(time: number): Promise<void> {
  return new Promise((resolve: (value: void) => void) => setTimeout(resolve, time));
}

export class Game {
  state: GAME_STATE = GAME_STATE.IDLE;

  constructor(private readonly gameProcess: GameProcess) {}

  async doConflit(analyzerState: GAME_STATE, conflitGoLocation: [number, number]): Promise<void> {
    switch (this.state)  {
      case GAME_STATE.IDLE:
        this.openAventureMenu();
        await sleep(500);
        this.switchToAventureDefiTab();
        this.state = GAME_STATE.DEFI_MENU_NO_CONFLIT;
        break;
      case GAME_STATE.AVENTURE_MENU:
        this.switchToAventureDefiTab();
        this.state = GAME_STATE.DEFI_MENU_NO_CONFLIT;
        break;
      case GAME_STATE.DEFI_MENU_NO_CONFLIT:
        this.dragDefiCarrousel();
        this.state = GAME_STATE.DEFI_MENU_CONFLIT;
        break;
      case GAME_STATE.DEFI_MENU_CONFLIT:
        this.prepareConflit(conflitGoLocation);
        await sleep(500);
        await this.launchConflit();
        this.state = GAME_STATE.DEFI_GROUPE_WAIT;
        break;
      case GAME_STATE.DEFI_GROUPE:
        await this.launchConflit();
        await sleep(500);
        this.state = GAME_STATE.DEFI_GROUPE_WAIT;
        break;
      case GAME_STATE.DEFI_GROUPE_WAIT:
        if (analyzerState === GAME_STATE.GROUP_TO_ACCEPT) {
          await this.acceptConflit();
        }
        break;
      case GAME_STATE.GROUP_TO_ACCEPT:
        await this.acceptConflit();
        this.state = GAME_STATE.GROUP_TO_ACCEPT;
        break;
      default:
        return;
    }
  }

  private openAventureMenu(): void {
    if (this.state === GAME_STATE.IDLE) {
      robot.keyToggle('alt', 'down');

      robot.moveMouse(
        this.gameProcess.bounds.Left +
          this.gameProcess.bounds.Right -
          Math.round((this.gameProcess.bounds.Left + this.gameProcess.bounds.Right) * 0.119),
        this.gameProcess.bounds.Top + 50,
      );
      robot.mouseClick();

      robot.keyToggle('alt', 'up');
    }
  }

  private switchToAventureDefiTab(): void {
    robot.moveMouse(
      this.gameProcess.bounds.Left + Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.14),
      this.gameProcess.bounds.Top + Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.55),
    );
    robot.mouseClick();
  }

  private dragDefiCarrousel(): void {
    robot.moveMouse(
      this.gameProcess.bounds.Left +
        this.gameProcess.bounds.Right -
        Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.19),
      this.gameProcess.bounds.Top +
        this.gameProcess.bounds.Bottom -
        Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.50),
    )
    
    robot.mouseToggle("down");
    robot.moveMouseSmooth(
      this.gameProcess.bounds.Left +
        this.gameProcess.bounds.Right -
        Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.75),
      this.gameProcess.bounds.Top +
        this.gameProcess.bounds.Bottom -
        Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.50),
      1,
    );
    robot.mouseToggle("up");
  }

  private prepareConflit(conflitGoLocation: [number, number]): void {
    robot.moveMouse(conflitGoLocation[0], conflitGoLocation[1]);
    robot.mouseClick();
  }

  private async launchConflit(): Promise<void> {
    robot.moveMouse(
      this.gameProcess.bounds.Left +
        this.gameProcess.bounds.Right -
        Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.25),
      this.gameProcess.bounds.Top +
        this.gameProcess.bounds.Bottom -
        Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.25),
    );
    robot.mouseClick();
    
    await sleep(500);
    
    // entre
    robot.moveMouse(
      this.gameProcess.bounds.Left +
        this.gameProcess.bounds.Right -
        Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.65),
      this.gameProcess.bounds.Top +
        this.gameProcess.bounds.Bottom -
        Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.45),
    );
    robot.mouseClick();

    // groupe
    // robot.moveMouse(
    //   this.gameProcess.bounds.Left +
    //     this.gameProcess.bounds.Right -
    //     Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.35),
    //   this.gameProcess.bounds.Top +
    //     this.gameProcess.bounds.Bottom -
    //     Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.45),
    // );
    // robot.mouseClick();

    // // test in progress, cancel matchmaking
    // await sleep(50);
    // robot.moveMouse(
    //   this.gameProcess.bounds.Left +
    //     this.gameProcess.bounds.Right -
    //     Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.35),
    //   this.gameProcess.bounds.Top +
    //     this.gameProcess.bounds.Bottom -
    //     Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.45),
    // );
    // robot.mouseClick();
  }

  private async acceptConflit(): Promise<void> {
    robot.moveMouse(
      this.gameProcess.bounds.Left +
        this.gameProcess.bounds.Right -
        Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.58),
      this.gameProcess.bounds.Top +
        this.gameProcess.bounds.Bottom -
        Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.20),
    );
    robot.mouseClick();

    await sleep(10000);

    robot.moveMouse(
      this.gameProcess.bounds.Left +
        this.gameProcess.bounds.Right -
        Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.40),
      this.gameProcess.bounds.Top +
        this.gameProcess.bounds.Bottom -
        Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.27),
    );
    robot.mouseClick();
  }

  private refuseClick(): void { // TODO RENAME TO CORRECT ACTION
    robot.moveMouse(
      this.gameProcess.bounds.Left +
        this.gameProcess.bounds.Right -
        Math.round((this.gameProcess.bounds.Right - this.gameProcess.bounds.Left) * 0.41),
      this.gameProcess.bounds.Top +
      this.gameProcess.bounds.Bottom -
      Math.round((this.gameProcess.bounds.Bottom - this.gameProcess.bounds.Top) * 0.34),
    );
    robot.mouseClick();

    // enabled ? // TODO CHECK WHAT THIS DO

    /* robot.keyToggle('alt', 'down');
       robot.moveMouse(
         this.gameProcess.bounds.Left +
           Math.round((this.gameProcess.bounds.Left + this.gameProcess.bounds.Right) * 0.6),
         this.gameProcess.bounds.Top +
           Math.round((this.gameProcess.bounds.Top + this.gameProcess.bounds.Bottom) * 0.85),
       );
       robot.mouseClick();
       robot.keyToggle('alt', 'up'); */
  }
}
