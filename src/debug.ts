import * as fs from 'fs';

import { Screenshot, VRect } from 'windows-ffi';

import { CaptureScreenshot, GetForegroundWindowHandle } from 'windows-ffi';

import sharp from 'sharp';


let start: number = Date.now();

// First capture a screenshot of a section of the screen.
const screenshot: Screenshot = CaptureScreenshot({
  windowHandle: GetForegroundWindowHandle(), // comment to screenshot all windows
  rectToCapture: new VRect(0, 0, 2560, 1440),
  log: true,
});

console.log(Date.now() - start);
start = Date.now();
const buffer: sharp.Sharp = await sharp(Buffer.from(screenshot.buffer), {
  raw: {
    width: 2560,
    height: 1440,
    channels: 4,
  },
});
fs.writeFileSync('./debug/ffi.jpeg', await buffer.jpeg().toBuffer());
console.log(Date.now() - start);