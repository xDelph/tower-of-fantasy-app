import type { Position, Region, ResolutionConfig } from '../shared/types';
import type { Point } from '@nut-tree/nut-js';
import type * as tesseract from 'tesseract.js';

/* eslint-disable no-var */

declare global {
  var iterationNumber: number;
  var worker: tesseract.Worker;
  var resolutionConfig: ResolutionConfig;
  var gameRegion: Region | undefined;

  function setGameRegion(region: Region): void;
  function getGameRegion(): Region;
  function gamePositionToScreenPosition(position: Position): Point;
}

// eslint-disable-next-line @typescript-eslint/no-useless-empty-export
export {};
