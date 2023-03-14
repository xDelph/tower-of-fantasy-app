
import type { PNGWithMetadata } from 'pngjs';

import { pixelMatches } from './delta';

export function subImageMatch(
  img: PNGWithMetadata,
  subImg: PNGWithMetadata,
  threshold: number = 0.1,
): Array<[number, number]> {
  const { data: imgData, width: imgWidth, height: imgHeight } = img;
  const { data: subImgData, width: subImgWidth } = subImg;

  const res: Array<[number, number]> = [];

  if (!isPixelData(imgData) || !isPixelData(subImgData)) {
    throw new Error('Image data: Uint8Array, Uint8ClampedArray or Buffer expected.');
  }
  if (imgData.length < subImgData.length) {
    throw new Error('Subimage is larger than base image');
  }
  const maxDelta: number = 35215 * threshold * threshold;

  const subImgPos: number = 0;
  let matchingTopRowStartX: number = 0;
  let matchingTopRowStartY: number = 0;

  for (let y: number = 0; y < imgHeight; y++) {
    let matchingTopRowX: number = 0; // restart finding top row mode when we hit a new row in the main img
    for (let x: number = 0; x < imgWidth; x++) {
      const imgPos: number = posFromCoordinates(y, x, imgWidth);

      const matches: boolean = pixelMatches(imgData, subImgData, imgPos, subImgPos, maxDelta);
      if (matches) {
        if (matchingTopRowX === 0) {
          // This means this is a new matching row, save these coordinates in the matchingTopRowStartX and Y
          matchingTopRowStartX = x;
          matchingTopRowStartY = y;
        }

        matchingTopRowX++;
        if (matchingTopRowX === subImgWidth) {
          if (subImageMatchOnCoordinates(img, subImg, matchingTopRowStartY, matchingTopRowStartX, maxDelta)) {
            res.push([matchingTopRowStartX, matchingTopRowStartY]);
            // return true;
          }
          x = matchingTopRowStartX; // put our search position x back to where the matching row began
          matchingTopRowX = 0;
        }
      } else {
        matchingTopRowX = 0; // restart finding top row mode when 2 pixels don't match
      }
    }
  }

  return res;
}

function subImageMatchOnCoordinates(
  img: PNGWithMetadata,
  subImg: PNGWithMetadata,
  matchY: number,
  matchX: number,
  maxDelta: number,
): boolean {
  const { data: imgData, width: imgWidth } = img;
  const { data: subImgData, width: subImgWidth, height: subImgHeight } = subImg;
  let subImgX: number = 0;
  let subImgY: number = 0;
  for (let imgY: number = matchY; imgY < (matchY + subImgHeight); imgY++) {
    subImgX = 0;

    for (let imgX: number = matchX; imgX < (matchX + subImgWidth); imgX++) {
      const imgPos: number = posFromCoordinates(imgY, imgX, imgWidth);
      const subImgPos: number = posFromCoordinates(subImgY, subImgX, subImgWidth);
      const matches: boolean = pixelMatches(imgData, subImgData, imgPos, subImgPos, maxDelta, imgY === 5);

      if (!matches) {
        return false;
      }

      subImgX++;
    }
    subImgY++;
  }

  return true;
}

function isPixelData(arr: Buffer): boolean {
  // work around instanceof Uint8Array not working properly in some Jest environments
  return ArrayBuffer.isView(arr) && (arr as Uint8Array).BYTES_PER_ELEMENT === 1;
}

function posFromCoordinates(y: number, x: number, width: number): number {
  return (y * width + x) * 4;
}
