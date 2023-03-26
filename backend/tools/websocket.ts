import type { IMessageEvent } from 'websocket';

import minimist from 'minimist';
import * as uuid from 'uuid';
import * as ws from 'websocket';

export class Websocket {
  private readonly nlPort: string;
  private readonly nlExtensionId: string;
  private readonly nlToken: string;

  private readonly client!: ws.w3cwebsocket;

  constructor() {
    const argv: minimist.ParsedArgs = minimist(process.argv.slice(2));
    this.nlPort = (argv['nl-port'] as string | undefined) ?? '';
    this.nlExtensionId = (argv['nl-extension-id'] as string | undefined) ?? '';
    this.nlToken = (argv['nl-token'] as string | undefined) ?? '';

    return;

    this.client = new ws.w3cwebsocket(`ws://localhost:${this.nlPort}?extensionId=${this.nlExtensionId}`);

    this.setupClientEvent();
  }

  private setupClientEvent(): void {
    this.client.onerror = (error: Error): void => console.error('ws: Connection error!', error);
    this.client.onopen = (): void => console.log('ws: Connected');
    this.client.onclose = (): void => {
      console.log('ws: exit');
      process.exit(0);
    };

    this.client.onmessage = (message: IMessageEvent): void => {
      console.log('Message received:', message.data);
    };
  };

  sendMessage(obj: unknown): void {
    return;
    this.client.send(
      JSON.stringify({
        id: uuid.v4(),
        method: 'app.broadcast',
        accessToken: this.nlToken,
        data: { event: 'botMessage', data: obj },
      })
    );
  }
}
