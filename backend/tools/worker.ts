import * as tesseract from 'tesseract.js';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TesseractWorker {
  private static worker: tesseract.Worker | undefined;

  static async getWorker(): Promise<tesseract.Worker> {
    if (this.worker === undefined) {
      const lang: string = process.env.TESSERACT_LANGUAGE ?? 'fra';

      this.worker = await tesseract.createWorker({
        logger: (m: unknown) => {
          if (process.env.OCR_LOG === 'true') {
            console.log(m);
          }
        },
      });

      await this.worker.loadLanguage(lang);
      await this.worker.initialize(lang);

      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÈÉabcdefghijklmnopqrstuvwxyzàèé0123456789: ',
      });
    }

    return this.worker;
  }
}
