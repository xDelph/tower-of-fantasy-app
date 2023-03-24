import type { Position } from '../../shared/types';

import { Button, Key, keyboard, mouse, straightTo } from '@nut-tree/nut-js';

import sleep from '../../shared/sleep';

export class ConflitFrontalierBot {
  constructor() {
    mouse.config.autoDelayMs = 0;
    mouse.config.mouseSpeed = 5000;
  }

  async openAventureMenu(): Promise<void> {
    await keyboard.pressKey(Key.LeftAlt);

    await mouse.move(straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.activity_button)));
    await mouse.click(Button.LEFT);

    await keyboard.releaseKey(Key.LeftAlt);
  }

  async switchToAventureDefiTab(): Promise<void> {
    await mouse.move(straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_tab)));
    await mouse.click(Button.LEFT);
  }

  async dragDefiCarrousel(): Promise<void> {
    await mouse.move(
      straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_caroussel_start)),
    );

    await mouse.drag(
      straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_caroussel_stop)),
    );
  }

  async prepareConflit(positionToOpenPopup: Position): Promise<void> {
    await mouse.move(straightTo(global.gamePositionToScreenPosition(positionToOpenPopup)));
    await mouse.click(Button.LEFT);
  }

  async launchConflit(): Promise<void> {
    await mouse.move(straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_go)));
    await mouse.click(Button.LEFT);

    await sleep(1000);

    await mouse.move(straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_group)));
    await mouse.click(Button.LEFT);
  }

  async acceptConflit(): Promise<void> {
    await mouse.move(straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_help)));
    await mouse.click(Button.LEFT);

    await sleep(1000);

    await mouse.move(straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_accept)));
    await mouse.click(Button.LEFT);
  }

  async activateAutoMode(): Promise<void> {
    await keyboard.pressKey(Key.LeftAlt);
    await mouse.move(straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.conflit_auto)));
    await mouse.click(Button.LEFT);
    await keyboard.releaseKey(Key.LeftAlt);
  }

  async exitConflit(): Promise<void> {
    await keyboard.pressKey(Key.LeftAlt);

    await mouse.move(straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.conflit_exit)));
    await mouse.click(Button.LEFT);

    await sleep(1000);

    await mouse.click(Button.LEFT);

    await sleep(1000);

    await mouse.click(Button.LEFT);

    await sleep(1000);

    await mouse.move(straightTo(global.gamePositionToScreenPosition(global.resolutionConfig.conflit_confirm_exit)));

    await mouse.click(Button.LEFT);
    await keyboard.releaseKey(Key.LeftAlt);
  }
}
