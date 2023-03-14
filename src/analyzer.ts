// import type { Overlay } from './overlay.ts';

import * as fs from 'fs';

import * as tesseract from 'tesseract.js';

import { GAME_STATE } from './game';

const VISUAL_STUDIO: RegExp = /(Visual Studio)/;

const REGEX_IDLE: RegExp = /(Canal)/;
const REGEX_IDLE_WITH_MENU: RegExp = /(Canal)[\S\s]*(Suppresseurs|uppresseurs)/;

const REGEX_LOADING_INSTANCE: RegExp = /(Transmission)/;
const REGEX_LOADING_SCREEN: RegExp = /(Tour fantastique)/;

const REGEX_AVENTURE_MENU: RegExp = /(150|300|450|600|750|900|hebdomadaire)/;

const REGEX_DEFI_MENU: RegExp = /(llimité|Illimité|Hllimité|Hlimité)/;
const REGEX_DEFI_MENU_CONFLIT: RegExp = /(Conflit|frontalier)/;
const REGEX_DEFI_POPUP: RegExp = /(du jour)/;
const REGEX_DEFI_POPUP_WAIT: RegExp = /(Attendre des membres du groupe)/;
const REGEX_DEFI_POPUP_TO_ACCEPT: RegExp = /(Compte)[\S\s]*(rebours)/;

const REGEX_END_INSTANCE: RegExp = /(secondes|fermer)/;

interface Word {
  text: string;
  bbox: tesseract.Bbox
}

export class Analyzer {
  private readonly worker: tesseract.Worker;
  private readonly lang: string;

  conflitGoLocation: [number, number] = [-1, -1];

  constructor(
    // private readonly overlay: Overlay,
  ) {
    this.worker = tesseract.createWorker({
      logger: (m: unknown) => {
        if (process.env.OCR_LOG === 'true') {
          console.log(m);
        }
      },
    });

    this.lang = process.env.TESSERACT_LANGUAGE ?? 'fra';
  }

  async init(): Promise<void> {
    await this.worker.load();
    await this.worker.loadLanguage(this.lang);
    await this.worker.initialize(this.lang);
  }

  async analyze(num: number, screenshot: Buffer): Promise<GAME_STATE> {
    const { data: { text, words } } = await this.worker.recognize(screenshot);

    if (text.match(VISUAL_STUDIO)) {
      // TOF not anymore in front
      return GAME_STATE.IDLE;
    }

    fs.writeFileSync(`./debud/screenshot${num}-text.txt`, text);

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

        const x: number | undefined = matches
          .filter((w: Word) => w.text.match(REGEX_DEFI_MENU_CONFLIT))
          .at(0)?.bbox.x1;
        const y: number | undefined = matches
          .filter((w: Word) => w.text.match(/(aller|12h00)/))
          .at(0)?.bbox.y1;

        if (x !== undefined && y !== undefined) {
          this.conflitGoLocation = [x, y];
        }

        return GAME_STATE.DEFI_MENU_CONFLIT;
      }

      return GAME_STATE.DEFI_MENU_NO_CONFLIT;
    }

    if (text.match(REGEX_AVENTURE_MENU)) {
      return GAME_STATE.AVENTURE_MENU;
    }

    if (text.match(REGEX_DEFI_POPUP)) {
      return GAME_STATE.DEFI_GROUPE;
    }

    if (text.match(REGEX_DEFI_POPUP_WAIT)) {
      return GAME_STATE.TO_DEFINED;
    }

    if (text.match(REGEX_DEFI_POPUP_TO_ACCEPT)) {
      return GAME_STATE.GROUP_TO_ACCEPT;
    }

    if (text.match(REGEX_END_INSTANCE)) {
      return GAME_STATE.END_INSTANCE;
    }

    console.error('nothing match, returning idle state');

    return GAME_STATE.IDLE;
  }
}
