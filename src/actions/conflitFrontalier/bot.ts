import type { Position } from '../../shared/types.js';

import robot from 'robotjs';

import sleep from '../../shared/sleep.js';

export class ConflitFrontalierBot {
  openAventureMenu(): void {
    robot.keyToggle('alt', 'down');

    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.activity_button));
    robot.mouseClick();

    robot.keyToggle('alt', 'up');
  }

  switchToAventureDefiTab(): void {
    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_tab));
    robot.mouseClick();
  }

  dragDefiCarrousel(): void {
    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_caroussel_start));

    robot.mouseToggle('down');
    robot.moveMouseSmooth(
      ...global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_caroussel_stop),
      1,
    );
    robot.mouseToggle('up');
  }

  prepareConflit(positionToOpenPopup: Position): void {
    robot.moveMouse(...global.gamePositionToScreenPosition(positionToOpenPopup));
    robot.mouseClick();
  }

  async launchConflit(): Promise<void> {
    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_go));
    robot.mouseClick();

    await sleep(1000);

    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_group));
    robot.mouseClick();
  }

  async acceptConflit(): Promise<void> {
    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_help));
    robot.mouseClick();

    await sleep(1000);

    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.activity_defi_accept));
    robot.mouseClick();
  }

  activateAutoMode(): void {
    robot.keyToggle('alt', 'down');
    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.conflit_auto));
    robot.mouseClick();
    robot.keyToggle('alt', 'up');
  }

  async exitConflit(): Promise<void> {
    robot.keyToggle('alt', 'down');

    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.conflit_exit));
    robot.mouseClick();

    await sleep(1000);

    robot.mouseClick();

    await sleep(1000);

    robot.mouseClick();

    await sleep(1000);

    robot.moveMouse(...global.gamePositionToScreenPosition(global.resolutionConfig.conflit_confirm_exit));

    robot.mouseClick();
    robot.keyToggle('alt', 'up');
  }
}
