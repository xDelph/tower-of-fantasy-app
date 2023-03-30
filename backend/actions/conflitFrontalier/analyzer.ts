import * as fs from 'fs';

import type { Screenshot } from '../../tools/screenshot';

import { sortBy } from 'lodash';

import { ConflitFrontalierState } from './types';

interface Matcher {
  name: string;
  order: number;
  regex: RegExp;
  state: ConflitFrontalierState;
}

export class ConflitFrontalierAnalyzer {
  private readonly matchers: Matcher[] = sortBy<Matcher>(
    [
      {
        name: 'aventure_menu',
        order: 11,
        regex: /(150|300|450|600|750|900|hebdomadaire)/,
        state: ConflitFrontalierState.AVENTURE_MENU,
      },
      {
        name: 'aventure_menu_defi_tab',
        order: 9,
        regex: /(Conflit|frontalier)/,
        state: ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB,
      },

      {
        name: 'conflit_popup',
        order: 8,
        regex: /(du jour)/,
        state: ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING,
      },
      {
        name: 'conflit_popup_matchmaking',
        order: 7,
        regex:  /(Attendre des membres du groupe)/,
        state: ConflitFrontalierState.CONFLIT_POPUP_MATCHMAKING,
      },
      {
        name: 'conflit_popup_to_accept',
        order: 6,
        regex: /(matériaux)[\S\s]*(récompenses)/,
        state: ConflitFrontalierState.CONFLIT_POPUP_TO_ACCEPT,
      },

      {
        name: 'conflit_transmission_screen',
        order: 5,
        regex: /(transmission)/,
        state: ConflitFrontalierState.CONFLIT_TRANSMISSION_SCREEN,
      },
      {
        name: 'conflit_loading_screen',
        order: 4,
        regex: /(Tour fantastique)/,
        state: ConflitFrontalierState.CONFLIT_LOADING_SCREEN,
      },

      {
        name: 'conflit_in_progress',
        order: 3,
        regex: /((07:|08:))|((assistance)[\S\s]*(bataille))/,
        state: ConflitFrontalierState.CONFLIT_INSTANCE_IN_PROGRESS,
      },
      {
        name: 'conflit_finished',
        order: 2,
        regex: /(passage)[\S\s]*(dans)[\S\s]*(secondes)/,
        state: ConflitFrontalierState.CONFLIT_INSTANCE_FINISHED,
      },
      {
        name: 'conflit_exit',
        order: 1,
        regex: /(Appuyer)[\S\s]*(importe)[\S\s]*(pour)/,
        state: ConflitFrontalierState.CONFLIT_INSTANCE_EXIT,
      },
    ],
    'order',
  );

  async analyze(screenshot: Screenshot): Promise<ConflitFrontalierState> {
    const { data: { text } } = await global.worker.recognize(await screenshot.getData());

    if (process.env.SAVE_SCREEN_SHOT === 'true') {
      fs.writeFileSync(`./debug/screenshot${global.iterationNumber}.txt`, text);
    }

    for (const matcher of this.matchers) {
      if (text.match(matcher.regex)) {
        return matcher.state;
      }
    }

    return ConflitFrontalierState.UNKNOWN;
  }
}
