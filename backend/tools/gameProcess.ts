import * as childProcess from 'child_process';

export interface Bounds {
  Left: number;
  Top: number;
  Right: number;
  Bottom: number;
};

export class GameProcess {
  private pid!: string;

  bounds!: Bounds;

  constructor() {
    this.getPid();
    this.getBounds();
  }

  private getPid(): void {
    const windows: childProcess.SpawnSyncReturns<Buffer> = childProcess.spawnSync(
      'powershell.exe',
      ['-c', 'Get-Process | Where-Object {$_.mainWindowTitle} | Format-Table Id, Name, mainWindowtitle -AutoSize'],
    );

    this.pid = (windows.stdout.toString().split('\n').find((x: string) => x.includes('QRSL')) ?? 'Error')
      .split(' ')
      .filter((x: string) => x !== '')[0];

    if (this.pid.includes('Error')) {
      console.log('[Error]: You didn\'t launch TOF');

      process.exit(-1);
    } else {
      console.log('Tower of Fantasy PID:', this.pid);
    }
  }

  private getBounds(): void {
    const windows: childProcess.SpawnSyncReturns<Buffer> = childProcess.spawnSync(
      'powershell.exe',
      ['-c', './scripts/getTOFSize.ps1 ' + this.pid],
    );

    this.bounds = JSON.parse(windows.stdout.toString()) as Bounds;

    console.log('Tower of Fantasy Bounds:', this.bounds);
    global.setGameRegion({
      x: this.bounds.Left,
      y: this.bounds.Top,
      width: this.bounds.Right,
      height: this.bounds.Bottom,
    });
  }

  isProcessInForeground(): boolean {
    const forgroundWindow: childProcess.SpawnSyncReturns<Buffer>
      = childProcess.spawnSync('powershell.exe', ['-c', './scripts/getForgroundWindow.ps1']);

    return forgroundWindow.stdout.toString().includes('QRSL');
  }
}
