import { Container } from 'pixi.js';

import Button from './Button';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from './consts';

export default class MenuScreen extends Container {
  private _button: Button;

  constructor() {
    super();
    this._button = new Button({
      x: SCENE_WIDTH / 2,
      y: SCENE_HEIGHT / 2,
      caption: 'Start Game',
    });
    this.addChild(this._button);
  }

  public onStartGame(cb: () => void) {
    this._button.on('pointerup', cb);
  }
}
