import * as fs from 'fs';

import type { Position } from '../../shared/types.js';
import type { Screenshot } from '../../tools/screenshot.js';
import type { Bbox, Word } from 'tesseract.js';

import { sortBy } from 'lodash';

import { ConflitFrontalierState } from './types.js';

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
        regex: /(llimité|Illimité|Hllimité|Hlimité)/,
        state: ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB,
      },
      {
        name: 'aventure_menu_defi_tab_with_conflit',
        order: 10,
        regex: /(Conflit|frontalier)/,
        state: ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB_WITH_CONFLIT_OPTION,
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

  positionToOpenPopup: Position = { x: 0, y: 0 };

  async analyze(screenshot: Screenshot): Promise<ConflitFrontalierState> {
    const { data: { text, words } } = await global.worker.recognize(await screenshot.getData());

    if (process.env.SAVE_SCREEN_SHOT === 'true') {
      fs.writeFileSync(`./debug/screenshot${global.iterationNumber}.txt`, text);
    }

    for (const matcher of this.matchers) {
      if (text.match(matcher.regex)) {
        if (matcher.name === 'aventure_menu_defi_tab') {
          return this.analyzeDefiTab(text, words);
        }

        return matcher.state;
      }
    }

    return ConflitFrontalierState.UNKNOWN;
  }

  private analyzeDefiTab(text: string, words: Word[]): ConflitFrontalierState {
    const conflitChallengeMatcher: RegExp | undefined
      = this.matchers.find((m: Matcher) => m.name === 'aventure_menu_defi_tab_with_conflit')?.regex;

    if (conflitChallengeMatcher !== undefined && text.match(conflitChallengeMatcher)) {
      const matches: Word[] = words
        .filter((w: Word) => w.text.match(conflitChallengeMatcher) ?? w.text.match(/(aller|12h00)/));

      const matchConflitFrontalierTitle: Word[]
        = matches.filter((w: Word) => w.text.match(conflitChallengeMatcher));
      const x: number | undefined
        = matchConflitFrontalierTitle.at(1)?.bbox.x0 ??matchConflitFrontalierTitle.at(0)?.bbox.x1;

      const matchGoConflitFrontalierButtonPos: Bbox = matches
        .filter((w: Word) => w.text.match(/(aller|12h00)/))
        .at(0)?.bbox ?? { x0: 0, y0: 0, x1: 0, y1: 0 };
      const y: number = matchGoConflitFrontalierButtonPos.y0 +
        (matchGoConflitFrontalierButtonPos.y1 - matchGoConflitFrontalierButtonPos.y0);

      if (x !== undefined && y !== 0) {
        this.positionToOpenPopup = { x, y };
        console.log('positionToOpenPopup:', this.positionToOpenPopup);
      }

      return ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB_WITH_CONFLIT_OPTION;
    }

    return ConflitFrontalierState.AVENTURE_MENU_DEFI_TAB_WITHOUT_CONFLIT_OPTION;
  }
}
