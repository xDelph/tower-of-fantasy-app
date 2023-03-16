import * as fs from 'fs';

import { Resource } from './resource';

const resource: Resource = new Resource();

const screenshot: Buffer = fs.readFileSync('./debug/screenshot0.png');
console.log('closed 0', resource.getSubImagePositions(screenshot, 'chest_closed', 0.4));
console.log('closed_bastien 0', resource.getSubImagePositions(screenshot, 'chest_closed_bastien', 0.4));
console.log('closed_bastien 01', resource.getSubImagePositions(screenshot, 'chest_closed_bastien_2', 0.4));
