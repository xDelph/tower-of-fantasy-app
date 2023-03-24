import sleep from '../../shared/sleep';
import { Screenshot } from '../../tools/screenshot';

import { ConflitFrontalierAnalyzer } from './analyzer';
import { ConflitFrontalierBot } from './bot';
import { ConflitFrontalierState } from './types';

export class ConflitFrontalierAction {
  private readonly analyzer: ConflitFrontalierAnalyzer = new ConflitFrontalierAnalyzer();
  private readonly bot: ConflitFrontalierBot = new ConflitFrontalierBot();

  private state: ConflitFrontalierState = ConflitFrontalierState.UNKNOWN;

  private async start(): Promise<void> {
    await this.bot.openAventureMenu();
    await sleep(1000);
    await this.bot.switchToAventureDefiTab();

    this.state = ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB_WITHOUT_CONFLIT_OPTION;
  }

  async nextTick(): Promise<void> {
    if (this.state === ConflitFrontalierState.UNKNOWN) {
      await this.start();

      return;
    }

    console.log('Conflit state:', this.state);
    const screenshot: Screenshot = new Screenshot();
    const newState: ConflitFrontalierState = await this.analyzer.analyze(screenshot);
    console.log('Conflit analyzed:', newState);

    switch (this.state) {
      case ConflitFrontalierState.AVENTURE_MENU:
        await this.bot.switchToAventureDefiTab();
        this.state = ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB_WITHOUT_CONFLIT_OPTION;
        break;
      case ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB_WITHOUT_CONFLIT_OPTION:
        if (newState === ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB_WITH_CONFLIT_OPTION) {
          await this.bot.prepareConflit(this.analyzer.positionToOpenPopup);
          await sleep(1000);
          await this.bot.launchConflit();
          this.state = ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING;
          break;
        }

        await this.bot.dragDefiCarrousel();
        this.state = ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB_WITH_CONFLIT_OPTION;
        break;
      case ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB_WITH_CONFLIT_OPTION:
        await this.bot.prepareConflit(this.analyzer.positionToOpenPopup);
        await sleep(1000);
        await this.bot.launchConflit();
        this.state = ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING;
        break;
      case ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING:
        if (newState === ConflitFrontalierState.CONFLIT_POPUP_TO_ACCEPT) {
          await this.bot.acceptConflit();
          break;
        }

        if (
          newState === ConflitFrontalierState.CONFLIT_TRANSMISSION_SCREEN
        ) {
          this.state = ConflitFrontalierState.CONFLIT_TRANSMISSION_SCREEN;
          break;
        }

        if (
          newState === ConflitFrontalierState.CONFLIT_LOADING_SCREEN
        ) {
          this.state = ConflitFrontalierState.CONFLIT_LOADING_SCREEN;
        }
        break;
      case ConflitFrontalierState.CONFLIT_POPUP_TO_ACCEPT:
        await this.bot.acceptConflit();
        this.state = ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING;
        break;
      case ConflitFrontalierState.CONFLIT_TRANSMISSION_SCREEN:
        if (newState === ConflitFrontalierState.CONFLIT_LOADING_SCREEN) {
          this.state = ConflitFrontalierState.CONFLIT_LOADING_SCREEN;
          break;
        }

        if (newState === ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS) {
          await this.bot.activateAutoMode();
          this.state = ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS;
        }
        break;
      case ConflitFrontalierState.CONFLIT_LOADING_SCREEN:
        if (newState === ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS) {
          await this.bot.activateAutoMode();
          this.state = ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS;
        }
        break;
      case ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS:
        if (newState === ConflitFrontalierState.CONFLIT_INSTANCE_FINISHED) {
          this.state = ConflitFrontalierState.CONFLIT_INSTANCE_FINISHED;
          break;
        }

        if (newState === ConflitFrontalierState.CONFLIT_INSTANCE_EXIT) {
          this.state = ConflitFrontalierState.CONFLIT_INSTANCE_EXIT;
        }
        break;
      case ConflitFrontalierState.CONFLIT_INSTANCE_FINISHED:
        if (newState === ConflitFrontalierState.CONFLIT_INSTANCE_EXIT) {
          this.state = ConflitFrontalierState.CONFLIT_INSTANCE_EXIT;
        }
        break;
      case ConflitFrontalierState.CONFLIT_INSTANCE_EXIT:
        await this.bot.exitConflit();
        this.state = ConflitFrontalierState.CONFLIT_INSTANCE_EXITED;
        setTimeout(() => this.state = ConflitFrontalierState.UNKNOWN, 15_000);
        break;
      default:
        break;
    }

    console.log('Conflit new state:', this.state);
  }
}
