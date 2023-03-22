import * as fs from 'fs';

import type { Region } from '../shared/types.js';

import Jimp from 'jimp';
import { captureActiveWindowSync } from 'windows-ss';

export class Screenshot {
  private readonly buffer: Buffer;

  constructor() {
    const gameRegion: Region = global.getGameRegion();

    const buffer: Buffer | null = captureActiveWindowSync({
      bounds: {
        left: gameRegion.x,
        top: gameRegion.y,
        right: gameRegion.width,
        bottom: gameRegion.height,
      },
      format: 'jpeg',
    });

    if (buffer !== null) {
      this.buffer = buffer;
    } else {
      throw new Error('Problem screenshoting !!');
    }
  }

  async getData(
    mime: string = Jimp.MIME_JPEG,
    region?: Region,
    grayscale: boolean = false,
  ): Promise<Buffer> {
    const jimp: Jimp = await Jimp.read(this.buffer);

    if (region !== undefined) {
      jimp.crop(region.x, region.y, region.width, region.height);
    }

    if (grayscale) {
      jimp.grayscale();
    }

    const buffer: Buffer = await jimp.getBufferAsync(mime);

    if (process.env.SAVE_SCREEN_SHOT === 'true') {
      fs.writeFileSync(
        `./debug/screenshot${global.iterationNumber}.${mime.split('/')[1]}`,
        buffer
      );
    }

    return buffer;
  }
}
