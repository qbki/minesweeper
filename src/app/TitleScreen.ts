import { Container } from 'pixi.js-legacy';

import Button from './Button';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from './consts';

export default class TitleScreen extends Container {
  constructor() {
    super();
    const button = new Button({
      x: SCENE_WIDTH / 2,
      y: SCENE_HEIGHT / 2,
      caption: 'Start Game',
    });
    button.on('pointerup', () => this.emit('start'));
    this.addChild(button);
  }
}
