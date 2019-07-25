import { Application } from 'pixi.js';
import noop from 'lodash/noop';

export default class App {
  private _app: Application;

  public constructor(domRoot: HTMLDivElement) {
    this._app = new Application({
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1,
    });
    domRoot.appendChild(this._app.view);
  }

  public run() {
    this._app.ticker.add(delta => {
      noop();
    });
  }
}
