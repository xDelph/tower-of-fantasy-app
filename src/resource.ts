import * as fs from 'fs';

import type { PNGWithMetadata } from 'pngjs';

import { PNG } from 'pngjs';

import { subImageMatch } from './lib/subImageMatcher';

export class Resource {
  private readonly cache: Record<string, PNGWithMetadata | undefined>;
  private readonly threshold: number;

  constructor(threshold: number = 0.3) {
    this.cache = {};
    this.threshold = threshold;
  }

  private get(name: string): PNGWithMetadata {
    let png: PNGWithMetadata | undefined = this.cache[name];

    if (png === undefined) {
      png = PNG.sync.read(fs.readFileSync(`./resources/${name}.png`));
    }

    return png;
  }

  private getPNGWithMetadataFromScreenshot(screenshot: Buffer): PNGWithMetadata {
    return PNG.sync.read(screenshot);
  }

  getSubImagePositions(screenshot: Buffer, imageName: string, threshold?: number): Array<[number, number]> {
    return subImageMatch(
      this.getPNGWithMetadataFromScreenshot(screenshot),
      this.get(imageName),
      threshold ?? this.threshold,
    );
  }
}
