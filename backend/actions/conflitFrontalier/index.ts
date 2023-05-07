import sleep from '../../shared/sleep';
import { Screenshot } from '../../tools/screenshot';

import { ConflitFrontalierAnalyzer } from './analyzer';
import { ConflitFrontalierBot } from './bot';
import { ConflitFrontalierState } from './types';

export class ConflitFrontalierAction {
  private readonly analyzer: ConflitFrontalierAnalyzer = new ConflitFrontalierAnalyzer();
  private readonly bot: ConflitFrontalierBot = new ConflitFrontalierBot();

  private state: ConflitFrontalierState = ConflitFrontalierState.UNKNOWN;

  loopDone: number = 0;

  private updateState(analyzerState: ConflitFrontalierState, newState: ConflitFrontalierState): void {
    this.state = newState;

    global.websocket.sendMessage({
      action: 'conflitFrontalier',
      analyzerState,
      state: this.state,
    });
  }

  private async start(): Promise<void> {
    await this.bot.openAventureMenu();
    await sleep(1000);
    await this.bot.switchToAventureDefiTab();

    this.updateState(
      ConflitFrontalierState.UNKNOWN,
      ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB,
    );
  }

  async nextTick(): Promise<void> {
    if (this.state === ConflitFrontalierState.UNKNOWN) {
      await this.start();

      return;
    }

    console.log('Conflit state:', this.state);
    const screenshot: Screenshot = new Screenshot();
    const analyzerState: ConflitFrontalierState = await this.analyzer.analyze(screenshot);
    console.log('Conflit analyzed:', analyzerState);

    switch (this.state) {
      case ConflitFrontalierState.AVENTURE_MENU:
        await this.bot.switchToAventureDefiTab();
        await sleep(1000);
        await this.bot.prepareConflit();
        await sleep(1000);
        await this.bot.launchConflit();
        this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING);
        break;
      case ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB:
        await this.bot.prepareConflit();
        await sleep(1000);
        await this.bot.launchConflit();
        this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING);
        break;
      case ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING:
        if (analyzerState === ConflitFrontalierState.CONFLIT_POPUP_TO_ACCEPT) {
          await this.bot.acceptConflit();
          break;
        }

        if (
          analyzerState === ConflitFrontalierState.CONFLIT_TRANSMISSION_SCREEN
        ) {
          this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_TRANSMISSION_SCREEN);
          break;
        }

        if (
          analyzerState === ConflitFrontalierState.CONFLIT_LOADING_SCREEN
        ) {
          this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_LOADING_SCREEN);
        }
        break;
      case ConflitFrontalierState.CONFLIT_POPUP_TO_ACCEPT:
        await this.bot.acceptConflit();
        this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING);
        break;
      case ConflitFrontalierState.CONFLIT_TRANSMISSION_SCREEN:
        if (analyzerState === ConflitFrontalierState.CONFLIT_LOADING_SCREEN) {
          this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_LOADING_SCREEN);
          break;
        }

        if (analyzerState === ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS) {
          await this.bot.activateAutoMode();
          this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS);
        }
        break;
      case ConflitFrontalierState.CONFLIT_LOADING_SCREEN:
        if (analyzerState === ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS) {
          await this.bot.activateAutoMode();
          this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS);
        }
        break;
      case ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS:
        if (analyzerState === ConflitFrontalierState.CONFLIT_INSTANCE_FINISHED) {
          this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_INSTANCE_FINISHED);
          break;
        }

        if (analyzerState === ConflitFrontalierState.CONFLIT_INSTANCE_EXIT) {
          this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_INSTANCE_EXIT);
        }
        break;
      case ConflitFrontalierState.CONFLIT_INSTANCE_FINISHED:
        if (analyzerState === ConflitFrontalierState.CONFLIT_INSTANCE_EXIT) {
          this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_INSTANCE_EXIT);
        }
        break;
      case ConflitFrontalierState.CONFLIT_INSTANCE_EXIT:
        await this.bot.exitConflit();
        this.updateState(analyzerState, ConflitFrontalierState.CONFLIT_INSTANCE_EXITED);
        this.loopDone++;
        setTimeout(() => this.updateState(analyzerState, ConflitFrontalierState.UNKNOWN), 15_000);
        break;
      default:
        break;
    }

    console.log('Conflit new state:', this.state);
  }
}
