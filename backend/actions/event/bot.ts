import { Button, Key, keyboard, mouse, straightTo } from '@nut-tree/nut-js';

import sleep from '../../shared/sleep';

export class EventBot {
  constructor() {
    mouse.config.autoDelayMs = 0;
    mouse.config.mouseSpeed = 10000;
  }

  async launchEvent(): Promise<void> {
    await keyboard.pressKey(Key.LeftAlt);

    await mouse.move(straightTo(global.gamePositionToScreenPosition({ x: 2166, y: 66 })));
    await mouse.click(Button.LEFT);

    await sleep(1000);

    await mouse.move(straightTo(global.gamePositionToScreenPosition({ x: 1395, y: 1375 })));
    await mouse.click(Button.LEFT);

    await sleep(1000);

    await mouse.move(straightTo(global.gamePositionToScreenPosition({ x: 2168, y: 1068 })));
    await mouse.click(Button.LEFT);

    await keyboard.releaseKey(Key.LeftAlt);
  }

  async exitEvent(): Promise<void> {
    await keyboard.pressKey(Key.LeftAlt);

    await mouse.move(straightTo(global.gamePositionToScreenPosition({ x: 1262, y: 1352 })));
    await mouse.click(Button.LEFT);

    await keyboard.releaseKey(Key.LeftAlt);
  }
}
