import type { Position, Region, ResolutionConfig } from './shared/types.js';

import * as resolutions from './config/resolutions.json' assert { type: 'json' };;

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

global.gamePositionToScreenPosition = (position: Position): [number, number] => {
  return [
    position.x + (global.gameRegion?.x ?? 0),
    position.y + (global.gameRegion?.y ?? 0),
  ];
};

