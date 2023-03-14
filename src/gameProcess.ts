import * as childProcess from 'child_process';
import * as fs from 'fs';

import Jimp from 'jimp';
import robot from 'robotjs';

export interface Bounds {
  Left: number;
  Top: number;
  Right: number;
  Bottom: number;
};

export class GameProcess {
  private pid!: string;

  bounds!: Bounds;

  constructor() {
    this.getPid();
    this.getBounds();
  }

  private getPid(): void {
    const windows: childProcess.SpawnSyncReturns<Buffer> = childProcess.spawnSync(
      'powershell.exe',
      ['-c', 'Get-Process | Where-Object {$_.mainWindowTitle} | Format-Table Id, Name, mainWindowtitle -AutoSize'],
    );

    this.pid = (windows.stdout.toString().split('\n').find((x: string) => x.includes('QRSL')) ?? 'Error')
      .split(' ')[0];

    if (this.pid.includes('Error')) {
      console.log('[Error]: You didn\'t launch TOF');

      process.exit(-1);
    } else {
      console.log('Tower of Fantasy PID:', this.pid);
    }
  }

  private getBounds(): void {
    const windows: childProcess.SpawnSyncReturns<Buffer> = childProcess.spawnSync(
      'powershell.exe',
      ['-c', './scripts/getTOFSize.ps1 ' + this.pid],
    );

    this.bounds = JSON.parse(windows.stdout.toString()) as Bounds;

    console.log('Tower of Fantasy Bounds:', this.bounds);
  }

  private async screenshot(
    x: number,
    y: number,
    width: number,
    height: number,
    swapRedAndBlueChannel: boolean,
  ): Promise<Buffer> {
    // console.log(x, y, width, height);
    const bmp: robot.Bitmap = robot.screen.capture(x, y, width, height);

    if (swapRedAndBlueChannel) {
      this.swapRedAndBlueChannel(bmp);
    }

    const img: Buffer = await new Promise(
      (resolve: (value: Buffer | PromiseLike<Buffer>) => void, reject: (reason?: unknown) => void) => {
        const image: Jimp = new Jimp({ data: bmp.image as Buffer, width: bmp.width, height: bmp.height });

        image.grayscale();
        image.getBuffer(Jimp.MIME_PNG, (err: Error | null, buffer: Buffer) => {
          if (err !== null) {
            reject(err);
          }
          else {
            resolve(buffer);
          }
        });
      },
    );

    return img;
  }

  private swapRedAndBlueChannel(bmp: robot.Bitmap): void {
    for (let i: number = 0; i < (bmp.width * bmp.height) * 4; i += 4) { // swap red and blue channel
      const image: Buffer = bmp.image as Buffer;

      [image[i], image[i + 2]] = [image[i + 2], image[i]]; // red channel

      bmp.image = image;
    }
  }

  async getScreenshot(num: number, swapRedAndBlueChannel: boolean = false): Promise<Buffer> {
    const img: Buffer = await this.screenshot(
      this.bounds.Left,
      this.bounds.Top,
      this.bounds.Right - this.bounds.Left,
      this.bounds.Bottom - this.bounds.Top,
      swapRedAndBlueChannel,
    );

    if (process.env.SAVE_SCREEN_SHOT === 'true') {
      fs.writeFileSync(`./debug/screenshot${num}.png`, Buffer.from(img));
    }

    return img;
  }

  isProcessInForeground(): boolean {
    const forgroundWindow: childProcess.SpawnSyncReturns<Buffer>
      = childProcess.spawnSync('powershell.exe', ['-c', './scripts/getForgroundWindow.ps1']);

    return forgroundWindow.stdout.toString().includes('QRSL');
  }
}
