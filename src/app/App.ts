import {
  Application,
  interaction,
  Loader,
  Texture,
  TilingSprite,
} from 'pixi.js';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';

import CellSprite, { CellType } from './CellSprite';
import GameScreen from './GameScreen';
import MenuScreen from './MenuScreen';
import {
  SCENE_HEIGHT,
  SCENE_WIDTH,
} from './consts';

export default class App {
  private _app: Application;
  private _loader: Loader; private _map: CellSprite[][];

  public constructor(domRoot: HTMLDivElement) {
    this._app = new Application({
      width: SCENE_WIDTH,
      height: SCENE_HEIGHT,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1,
    });
    domRoot.appendChild(this._app.view);
    domRoot.addEventListener('contextmenu', e => e.preventDefault());
    this._loader = new Loader();
    this._loader
      .add('spritesheet', '/images/spritesheet.png')
      .load(this.onLoadResources);
    this._map = [[]];
  }

  public run() {
    this._app.ticker.add(delta => {
      noop();
    });
  }

  private onLoadResources = (_: unknown, res: {[key: string]: { texture: Texture }}) => {
    const game = new GameScreen();
    game.init(res.spritesheet.texture);
    game.visible = false;
    this._app.stage.addChild(game);

    const menu = new MenuScreen();
    menu.onStartGame(() => {
      menu.visible = false;
      game.visible = true;
    });
    this._app.stage.addChild(menu);
  }
}
