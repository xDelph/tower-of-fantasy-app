import sleep from '../../shared/sleep';
import { Screenshot } from '../../tools/screenshot';

import { EventAnalyzer } from './analyzer';
import { EventBot } from './bot';
import { EventState } from './types';

export class EventAction {
  private readonly analyzer: EventAnalyzer = new EventAnalyzer();
  private readonly bot: EventBot = new EventBot();

  private state: EventState = EventState.UNKNOWN;

  loopDone: number = 0;

  private updateState(analyzerState: EventState, newState: EventState): void {
    this.state = newState;

    global.websocket.sendMessage({
      action: 'event',
      analyzerState,
      state: this.state,
    });
  }

  private async start(): Promise<void> {
    await this.bot.launchEvent();

    this.updateState(
      EventState.UNKNOWN,
      EventState.EVENT_GROUPING,
    );
  }

  async nextTick(): Promise<void> {
    if (this.state === EventState.UNKNOWN) {
      await this.start();

      return;
    }

    console.log('Event state:', this.state);
    const screenshot: Screenshot = new Screenshot();
    const analyzerState: EventState = await this.analyzer.analyze(screenshot);
    console.log('Event analyzed:', analyzerState);

    switch (this.state) {
      case EventState.EVENT_GROUPING:
      case EventState.EVENT_TRANSMISSION_SCREEN:
      case EventState.EVENT_LOADING_SCREEN:
        if (analyzerState === EventState.EVENT_INSTANCE_IN_PROGRESS) {
          this.updateState(analyzerState, EventState.EVENT_INSTANCE_IN_PROGRESS);
        }
        break;
      case EventState.EVENT_INSTANCE_IN_PROGRESS:
        if (analyzerState === EventState.EVENT_INSTANCE_FINISHED) {
          this.updateState(analyzerState, EventState.EVENT_INSTANCE_FINISHED);

          await sleep(2000);

          await this.bot.exitEvent();

          this.loopDone++;
          setTimeout(() => this.updateState(analyzerState, EventState.UNKNOWN), 15_000);
          break;
        }

        break;
      default:
        break;
    }

    console.log('Event new state:', this.state);
  }
}
