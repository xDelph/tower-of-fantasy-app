import * as fs from 'fs';

import { GAME_STATE } from './game.js';

const VISUAL_STUDIO: RegExp = /(Visual Studio)/;

const REGEX_IDLE: RegExp = /(Canal)/;
const REGEX_IDLE_WITH_MENU: RegExp = /(Bazar)[\S\s]*(Suppresseurs|uppresseurs)/;

const REGEX_LOADING_INSTANCE: RegExp = /(transmission)/;
const REGEX_LOADING_SCREEN: RegExp = /(Tour fantastique)/;

export class Analyzer {
  conflitGoLocation: [number, number] = [-1, -1];

  async analyze(num: number, screenshot: Buffer): Promise<GAME_STATE> {
    const { data: { text } } = await global.worker.recognize(screenshot);

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

    console.error('nothing match, returning unknown state');

    return GAME_STATE.UNKNOWN;
  }
}
