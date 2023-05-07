import * as fs from 'fs';

import type { Screenshot } from '../../tools/screenshot';

import { sortBy } from 'lodash';

import { EventState } from './types';

interface Matcher {
  name: string;
  order: number;
  regex: RegExp;
  state: EventState;
}

export class EventAnalyzer {
  private readonly matchers: Matcher[] = sortBy<Matcher>(
    [
      {
        name: 'event_transmission_screen',
        order: 5,
        regex: /(transmission)/,
        state: EventState.EVENT_TRANSMISSION_SCREEN,
      },
      {
        name: 'event_loading_screen',
        order: 4,
        regex: /(Tour fantastique)/,
        state: EventState.EVENT_LOADING_SCREEN,
      },

      {
        name: 'event_in_progress',
        order: 3,
        regex: /(Recyclage)/,
        state: EventState.EVENT_INSTANCE_IN_PROGRESS,
      },
      {
        name: 'event_finished',
        order: 2,
        regex: /(Classement|match)/,
        state: EventState.EVENT_INSTANCE_FINISHED,
      },
    ],
    'order',
  );

  async analyze(screenshot: Screenshot): Promise<EventState> {
    const { data: { text } } = await global.worker.recognize(await screenshot.getData());

    if (process.env.SAVE_SCREEN_SHOT === 'true') {
      fs.writeFileSync(`./debug/screenshot${global.iterationNumber}.txt`, text);
    }

    for (const matcher of this.matchers) {
      if (text.match(matcher.regex)) {
        return matcher.state;
      }
    }

    return EventState.UNKNOWN;
  }
}
