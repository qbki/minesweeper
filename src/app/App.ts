import {
  Application,
  filters,
  interaction,
  Loader,
  Texture,
  TilingSprite,
} from 'pixi.js';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';

import CellSprite, { CellType } from './CellSprite';
import GameScreen from './GameScreen';
import TitleScreen from './TitleScreen';
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
    const game = new GameScreen(res.spritesheet.texture);
    const title = new TitleScreen();
    const menu = new MenuScreen();
    const blurFilter = new filters.BlurFilter();

    title.visible = true;
    title.on('start', () => {
      title.visible = false;
      game.visible = true;
    });
    this._app.stage.addChild(title);

    game.visible = false;
    game.on('menu', () => {
      game.interactiveChildren = false;
      game.filters = [blurFilter];
      menu.visible = true;
    });
    this._app.stage.addChild(game);

    menu.visible = false;
    menu.on('tomenu', () => {
      game.filters = [];
      menu.visible = false;
      game.visible = false;
      game.restart();
      game.interactiveChildren = true;
      title.visible = true;
    });
    menu.on('resume', () => {
      game.filters = [];
      menu.visible = false;
      game.interactiveChildren = true;
    });
    this._app.stage.addChild(menu);
  }
}
