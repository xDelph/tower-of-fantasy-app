import * as fs from 'fs';

import type { Region } from './shared/types';

import Jimp from 'jimp';
import robot from 'robotjs';

export class Screenshot {
  private readonly image: robot.Bitmap;

  constructor() {
    const gameRegion: Region = global.getGameRegion();

    this.image = robot.screen.capture(
      gameRegion.x,
      gameRegion.y,
      gameRegion.width,
      gameRegion.height,
    );
  }

  async getData(
    mime: string = Jimp.MIME_PNG,
    region?: Region,
    grayscale: boolean = false,
  ): Promise<Buffer> {
    const jimp: Jimp = new Jimp({
      data: this.image.image as Buffer,
      width: this.image.width,
      height: this.image.height,
    });

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
