// import type { Overlay } from './overlay.ts';

import * as fs from 'fs';

import * as tesseract from 'tesseract.js';

import { GAME_STATE } from './game';

const VISUAL_STUDIO: RegExp = /(Visual Studio)/;

const REGEX_IDLE: RegExp = /(Canal)/;
const REGEX_IDLE_WITH_MENU: RegExp = /(Bazar)[\S\s]*(Suppresseurs|uppresseurs)/;

const REGEX_LOADING_INSTANCE: RegExp = /(transmission)/;
const REGEX_LOADING_SCREEN: RegExp = /(Tour fantastique)/;

const REGEX_AVENTURE_MENU: RegExp = /(150|300|450|600|750|900|hebdomadaire)/;

const REGEX_DEFI_MENU: RegExp = /(llimité|Illimité|Hllimité|Hlimité)/;
const REGEX_DEFI_MENU_CONFLIT: RegExp = /(Conflit|frontalier)/;
const REGEX_DEFI_POPUP: RegExp = /(du jour)/;
const REGEX_DEFI_POPUP_WAIT: RegExp = /(Attendre des membres du groupe)/;
const REGEX_DEFI_POPUP_TO_ACCEPT: RegExp = /(matériaux)[\S\s]*(récompenses)/;
const REGEX_DEFI_STARTING: RegExp = /(07:|08:)/;
const REGEX_DEFI_STARTING_2: RegExp = /(assistance)[\S\s]*(bataille)/;
const REGEX_DEFI_ENDING: RegExp = /(Compte)[\S\s]*(dans)[\S\s]*(secondes)/;
const REGEX_DEFI_CAN_EXIT: RegExp = /(Appuyer)[\S\s]*(importe)[\S\s]*(fermer)/;

const REGEX_END_INSTANCE: RegExp = /(secondes|fermer)/;

interface Word {
  text: string;
  bbox: tesseract.Bbox
}

export class Analyzer {
  private worker!: tesseract.Worker;
  private readonly lang: string;

  conflitGoLocation: [number, number] = [-1, -1];

  constructor(
    // private readonly overlay: Overlay,
  ) {
    this.lang = process.env.TESSERACT_LANGUAGE ?? 'fra';
  }

  async init(): Promise<void> {
    this.worker = await tesseract.createWorker({
      logger: (m: unknown) => {
        if (process.env.OCR_LOG === 'true') {
          console.log(m);
        }
      },
    });

    await this.worker.loadLanguage(this.lang);
    await this.worker.initialize(this.lang);
  }

  async analyze(num: number, screenshot: Buffer): Promise<GAME_STATE> {
    const { data: { text, words } } = await this.worker.recognize(screenshot);

    if (text.match(VISUAL_STUDIO)) {
      // TOF not anymore in front
      return GAME_STATE.VISUAL_STUDIO;
    }

    if (process.env.SAVE_SCREEN_SHOT === 'true') {
      fs.writeFileSync(`./debug/screenshot${num}.txt`, text);
    }

    if (text.match(REGEX_IDLE_WITH_MENU)) {
      return GAME_STATE.IDLE_WITH_MENU;
    }

    if (text.match(REGEX_IDLE)) {
      return GAME_STATE.IDLE;
    }

    if (text.match(REGEX_LOADING_INSTANCE)) {
      return GAME_STATE.LOADING_INSTANCE;
    }

    if (text.match(REGEX_LOADING_SCREEN)) {
      return GAME_STATE.LOADING_SCREEN;
    }

    if (text.match(REGEX_DEFI_MENU)) {
      if (text.match(REGEX_DEFI_MENU_CONFLIT)) {
        const matches: Word[] = words
          .filter((w: tesseract.Word) => w.text.match(REGEX_DEFI_MENU_CONFLIT) ?? w.text.match(/(aller|12h00)/))
          .map((w: tesseract.Word) => ({ text: w.text, bbox: w.bbox }));

        const matchConflitFrontalierTitle: Word[] = matches.filter((w: Word) => w.text.match(REGEX_DEFI_MENU_CONFLIT));
        const x: number | undefined
          = matchConflitFrontalierTitle.at(1)?.bbox.x0 ??matchConflitFrontalierTitle.at(0)?.bbox.x1;

        const matchGoConflitFrontalierButtonPos: tesseract.Bbox = matches
          .filter((w: Word) => w.text.match(/(aller|12h00)/))
          .at(0)?.bbox ?? { x0: 0, y0: 0, x1: 0, y1: 0 };
        const y: number = matchGoConflitFrontalierButtonPos.y0 +
          (matchGoConflitFrontalierButtonPos.y1 - matchGoConflitFrontalierButtonPos.y0);

        if (x !== undefined && y !== 0) {
          this.conflitGoLocation = [x, y];
        }

        return GAME_STATE.DEFI_MENU_CONFLIT;
      }

      return GAME_STATE.DEFI_MENU_NO_CONFLIT;
    }

    if (text.match(REGEX_DEFI_STARTING) || text.match(REGEX_DEFI_STARTING_2)) {
      return GAME_STATE.DEFI_IN_PROGRESS;
    }

    if (text.match(REGEX_DEFI_ENDING)) {
      return GAME_STATE.DEFI_FINISHED;
    }

    if (text.match(REGEX_DEFI_CAN_EXIT)) {
      return GAME_STATE.DEFI_FINISHED_TO_EXIT;
    }

    if (text.match(REGEX_AVENTURE_MENU)) {
      return GAME_STATE.AVENTURE_MENU;
    }

    if (text.match(REGEX_DEFI_POPUP)) {
      return GAME_STATE.DEFI_GROUPE;
    }

    if (text.match(REGEX_DEFI_POPUP_WAIT)) {
      return GAME_STATE.DEFI_GROUPE_WAIT;
    }

    if (text.match(REGEX_DEFI_POPUP_TO_ACCEPT)) {
      return GAME_STATE.GROUP_TO_ACCEPT;
    }

    if (text.match(REGEX_END_INSTANCE)) {
      return GAME_STATE.END_INSTANCE;
    }

    console.error('nothing match, returning unknown state');

    return GAME_STATE.UNKNOWN;
  }
}
