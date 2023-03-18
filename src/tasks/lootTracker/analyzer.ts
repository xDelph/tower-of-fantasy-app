// import type { Overlay } from './overlay.ts';
import * as fs from 'fs';

import Jimp from 'jimp';

import { GAME_STATE } from '../../game';
import { Resource } from '../../resource';

const resource: Resource = new Resource();
const REGEX_SUPPORTED_JOINT_OPERATION: RegExp = /( I| II| III| IV| VIII|)/;
const REGEX_IDLE: RegExp = /(Canal)/;

export class Analyzer {
  private readonly chests: [boolean, boolean, boolean, boolean] = [false, false, false, false];

  constructor(private readonly worker: Tesseract.Worker) { }

  async analyze(num: number, screenshot: Buffer): Promise<GAME_STATE> {
    if(await this.isIdle(num, screenshot)) {
      return GAME_STATE.IDLE;
    }

    // const isInJointOperation: boolean|undefined = await this.isInJointOperation(num, screenshot);
    // if(isInJointOperation != null && isInJointOperation) {
    //   return GAME_STATE.JOINT_OPERATION;
    // }else if(isInJointOperation == false) {
    //   return GAME_STATE.UNSUPPORTED_JOINT_OPERATION;
    // }

    return GAME_STATE.UNKNOWN;
  }

  async getJointOperationState(
    num: number,
    screenshot: Buffer,
  ) : Promise<{state: GAME_STATE, jointOperationName: string}| null> {
    let croppedBuffer: Buffer = await this.crop(num, 'chests', true, screenshot, 3155,475,215,40);
    const result: Array<[number, number]> = resource.getSubImagePositions(croppedBuffer, 'chest_closed_grayscale', 0.4);

    // If we got a match on closed chest, it means we are in a joint operation
    if(result.length > 0) {
      croppedBuffer = await this.crop(num, 'jointName', true, screenshot, 3029,196,345,45);
      const { data: { text } } = await this.worker.recognize(croppedBuffer);
      const matchResult: RegExpMatchArray | null =text.match(REGEX_SUPPORTED_JOINT_OPERATION);

      return {
        state: matchResult && result.length == 4 ? GAME_STATE.JOINT_OPERATION : GAME_STATE.UNSUPPORTED_JOINT_OPERATION,
        jointOperationName: text.replace('\n', ''),
      };
    }

    return null;
  }

  async getOpenedChests(num: number, screenshot: Buffer) : Promise<number[]> {
    const croppedBuffer: Buffer = await this.crop(num, 'chests', true, screenshot, 3155,475,215,40);
    const result: Array<[number, number]> = resource.getSubImagePositions(croppedBuffer, 'chest_open_grayscale', 0.4);
    const openedChests: number[] = [];

    result.forEach((e: [number, number]) => {
      const numChest: number = Math.floor(e[0]/(215/4));
      openedChests.push(numChest);
      // this.chests[numChest] = true;
    });

    return openedChests;
  }

  async isIdle(num: number, screenshot: Buffer) : Promise<boolean> {
    // const croppedBuffer: Buffer = await this.crop(num, 'isIdle', false, screenshot, 145,235,80,80);
    // const result: Array<[number, number]> = resource.getSubImagePositions(croppedBuffer, 'map_arrow_body', 0.3);

    const croppedBuffer: Buffer = await this.crop(num, 'isIdle', true, screenshot, 45,70,75,25);

    const { data: { text } } = await this.worker.recognize(croppedBuffer);

    if (process.env.SAVE_SCREEN_SHOT === 'true') {
      fs.writeFileSync(`./debug/cropped_isIdle${num}.txt`, text);
    }

    if(text.match(REGEX_IDLE)) {
      return true;
    }

    return false;
  }

  private async crop(
    num: number,
    name: string,
    grayScale: boolean,
    screenshot: Buffer,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<Buffer> {
    const img: Jimp = await Jimp.read(screenshot);
    const cropped: Jimp = img.crop(x, y, width, height);
    if(grayScale) {
      cropped.grayscale();
    }
    if (process.env.SAVE_SCREEN_SHOT === 'true') {
      cropped.write(`./debug/cropped_${name}${num}.png`);
    }

    return cropped.getBufferAsync(Jimp.MIME_PNG);
  }

}
