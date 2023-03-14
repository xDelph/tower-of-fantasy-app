import { BrowserWindow, app, globalShortcut } from 'electron';

// https://github.com/electron/electron/issues/25153
app.disableHardwareAcceleration();

export class Overlay {

  private window: BrowserWindow;
  private readonly nbChestOpened: string = 'NoData';

  private readonly toggleExitKey: string = 'CmdOrCtrl + E';
  private readonly toggleShowKey: string = 'CmdOrCtrl + H';

  constructor() {
    app.on('ready', () => {
      setTimeout(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises, @typescript-eslint/unbound-method
        this.createWindow,
        process.platform === 'linux' ? 1000 : 0, // https://github.com/electron/electron/issues/16809
      );

      return;
    });
  }

  private async createWindow(): Promise<void> {
    this.window = new BrowserWindow({
      width: 600,
      height: 35,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      skipTaskbar: true,
      y: 10,
      x: 250,
      movable: false,
      minimizable: false,
      maximizable: false,
      frame: false,
      transparent: true,
    });

    this.window.setAlwaysOnTop(true, 'screen-saver'); // - 2 -
    this.window.setVisibleOnAllWorkspaces(true); // - 3 -
    this.window.setIgnoreMouseEvents(true);

    await this.window.loadURL(this.getWindowBody());

    this.createKeyboardShortcut();
  }

  private getWindowBody(): string {
    return `data:text/html;charset=utf-8,
      <head>
        <title>overlay-demo</title>
      </head>
      <body style="padding: 0; margin: 0; overflow: hidden;">
        <div style="
          position: absolute; 
          width: 100%; 
          height: 100%; 
          background: rgba(255,255,255,0); 
          box-sizing: border-box; 
          pointer-events: none;"
        ></div>
        <div style="text-align: center;">
          <div style="padding: 5px 16px; border-radius: 8px; background: rgb(255,255,255); display: inline-block;">
            <span><b>Nb chests opened: </span><span id="text1">${this.nbChestOpened}</span>
          </div>
        </div>
        <script>
          const electron = require('electron');

          electron.ipcRenderer.on('visibility-change', (e, state) => {
            if (document.body.style.display) {
              document.body.style.display = null
            } else {
              document.body.style.display = 'none'
            }
          });

          electron.ipcRenderer.on('chests-update', (e, state) => {
            document.getElementById('text1').innerHTML = state;
          });
        </script>
      </body>
    `;
  }

  private createKeyboardShortcut(): void {
    globalShortcut.register(this.toggleExitKey, () => {
      process.exit(0);
    });

    globalShortcut.register(this.toggleShowKey, () => {
      this.window.webContents.send('visibility-change', false);
    });
  }

  setNbChestOpened(nb: string): void {
    this.window.webContents.send('chests-update', nb);
  }

}
