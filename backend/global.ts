import * as fs from 'fs';

import type { Position, Region, ResolutionConfig } from './shared/types';

import { Point } from '@nut-tree/nut-js';
import * as winston from 'winston';

import * as resolutions from './config/resolutions.json';
import { Websocket } from './tools/websocket';

global.iterationNumber = 0;

global.setGameRegion = (region: Region): void => {
  if (global.gameRegion !== undefined) {
    throw new Error('global gameRegion already defined');
  }

  global.gameRegion = region;

  const typedResolutions: Record<string, ResolutionConfig | undefined>
    = resolutions as Record<string, ResolutionConfig | undefined>;

  const resolutionConfig: ResolutionConfig | undefined =
    typedResolutions[`${region.width}x${region.height}`] ??
    typedResolutions[Object.keys(typedResolutions)[0]];

  if (resolutionConfig === undefined) {
    throw new Error('At least one resolution config is needed in ./config/resolutions.jons');
  }

  global.resolutionConfig = resolutionConfig;
};

global.getGameRegion = (): Region => {
  if (global.gameRegion === undefined) {
    throw new Error('global gameRegion not defined');
  }

  return global.gameRegion;
};

global.gamePositionToScreenPosition = (position: Position): Point => {
  return new Point(
    position.x + (global.gameRegion?.x ?? 0),
    position.y + (global.gameRegion?.y ?? 0),
  );
};

fs.writeFileSync('./backend.log', '');

const logger: winston.Logger = winston.createLogger({
  level: 'info',
  format: winston.format.printf((log: winston.Logform.TransformableInfo) =>
    // eslint-disable-next-line
    log.message.toString()
      // eslint-disable-next-line no-control-regex
      .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
      .replace(/(\n)$/, '')
  ),
  transports: [
    new winston.transports.File({ filename: 'backend.log' }),
  ],
});

logger.on('error', (e: Error) => {
  console.error(e);
});

const stdoutWrite: (buffer: Uint8Array | string, cb?: ((err?: Error | undefined) => void) | undefined) => boolean
  = process.stdout.write.bind(process.stdout);
const stderrWrite: (buffer: Uint8Array | string, cb?: ((err?: Error | undefined) => void) | undefined) => boolean
  = process.stderr.write.bind(process.stderr);

process.stdout.write = (data: never, cb?: never): boolean => {
  logger.info(data);

  return stdoutWrite(data, cb);
};

process.stderr.write = (data: never, cb?: never): boolean => {
  logger.error(data);

  return stderrWrite(data, cb);
};

global.websocket = new Websocket();
