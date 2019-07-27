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

const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;

export default class App {
  private _app: Application;
  private _loader: Loader;
  private _map: CellSprite[][];

  public constructor(domRoot: HTMLDivElement) {
    this._app = new Application({
      width: 800,
      height: 600,
      backgroundColor: 0x1099bb,
      resolution: window.devicePixelRatio || 1,
    });
    domRoot.appendChild(this._app.view);
    domRoot.addEventListener('contextmenu', e => e.preventDefault());
    this._app.stage.interactive = true;
    this._app.stage.on('pointerdown', (event: interaction.InteractionEvent) => {
      const pos = CellSprite.coordToCellPos(event.data.getLocalPosition(this._app.stage));
      const cell = this._map[pos.y][pos.x];
      if (event.data.button === 0) {
        this.handleClick(cell);
      } else {
        this.handleAltClick(cell);
      }
    });
    this._loader = new Loader();
    this._loader
      .add('spritesheet', '/images/spritesheet.png')
      .load(this.handleLoadResources);
    this._map = [[]];
  }

  public run() {
    this._app.ticker.add(delta => {
      noop();
    });
  }

  public handleClick(cell: CellSprite) {
    if (cell.is(CellType.closed)) {
      if (cell.hasBomb()) {
        cell.type(CellType.detonatedBomb);
        this.openMap();
        this.handleLosing();
      } else {
        const bombAmount = this.placeNumber(cell);
        if (bombAmount === 0) {
          this.walkAroundCell(cell, this.openSaveArea);
        }
      }
    } else if (cell.isNumber()) {
      const bombsAmount = this.calcBombsAmountAroundCell(cell);
      const closedCells: CellSprite[] = [];
      let flagCellsAmount = 0;
      this.walkAroundCell(cell, nearCell => {
        if (nearCell.is(CellType.closed)) {
          closedCells.push(nearCell);
        } else if (nearCell.is(CellType.flag)) {
          flagCellsAmount += 1;
        }
      });
      if (bombsAmount === flagCellsAmount) {
        closedCells.forEach(c => this.handleClick(c));
      }
    }
  }

  public handleAltClick(cell: CellSprite) {
    if (cell.is(CellType.closed)) {
      cell.type(CellType.flag);
    } else if (cell.is(CellType.flag)) {
      cell.type(CellType.closed);
    } else if (cell.isNumber()) {
      const bombsAmount = this.calcBombsAmountAroundCell(cell);
      const nearesCells: CellSprite[] = [];
      this.walkAroundCell(cell, nearCell => {
        if (
          nearCell.is(CellType.closed) ||
          nearCell.is(CellType.flag)
        ) {
          nearesCells.push(nearCell);
        }
      });
      if (nearesCells.length === bombsAmount) {
        nearesCells.forEach(c => c.type(CellType.flag));
      }
    }
    if (this.checkWinningConditions()) {
      this.openMap();
      this.handleWinning();
    }
  }

  public handleLoadResources = (_: unknown, res: {[key: string]: { texture: Texture }}) => {
    this._map = [];
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        this._map.push([]);
        const cell = new CellSprite(res.spritesheet.texture);
        cell.placeOnMap(x, y);
        cell.hasBomb(Math.random() >= 0.9);
        this._map[y].push(cell);
        this._app.stage.addChild(cell);
      }
    }
    for (const row of this._map) {
      console.log(...row.map(c => c.hasBomb() ? '💣' : '∅'));
    }
  }

  public handleWinning() {
    console.log('You are awesome!');
  }

  public handleLosing() {
    console.log('Next time...');
  }

  public openMap() {
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const cell = this._map[y][x];
        if (cell.hasBomb()) {
          if (
            cell.is(CellType.detonatedBomb) ||
            cell.is(CellType.flag)
          ) {
            noop();
          } else {
            cell.type(CellType.bomb);
          }
        } else {
          if (cell.is(CellType.flag)) {
            cell.type(CellType.wrongPalcement);
          } else {
            this.placeNumber(cell);
          }
        }
      }
    }
  }

  private checkWinningConditions() {
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const cell = this._map[y][x];
        if (cell.hasBomb() && cell.isNot(CellType.flag)) {
          return false;
        }
      }
    }
    return true;
  }

  private openSaveArea = (
    cell: CellSprite,
    visitedCells: Array<{ x: number, y: number }> = [],
  ) => {
    const len = visitedCells.length;
    for (let i = 0; i < len; i += 1) {
      const pos = cell.tilePos();
      if (isEqual(visitedCells[i], pos)) {
        return;
      }
    }
    const bombsAmount = this.placeNumber(cell);
    visitedCells.push(cell.tilePos());
    if (bombsAmount === 0) {
      this.walkAroundCell(cell, c => this.openSaveArea(c, visitedCells));
    }
  }

  private calcBombsAmountAroundCell = (centralCell: CellSprite) => {
    let amount = 0;
    this.walkAroundCell(centralCell, cell => {
      if (cell.hasBomb()) {
        amount += 1;
      }
    });
    return amount;
  }

  private walkAroundCell = (cell: CellSprite, cb: (c: CellSprite) => void) => {
    const { x: cellX, y: cellY } = cell.tilePos();
    const startY = Math.max(0, cellY - 1);
    const startX = Math.max(0, cellX - 1);
    const endY = Math.min(MAP_HEIGHT - 1, cellY + 1);
    const endX = Math.min(MAP_WIDTH - 1, cellX + 1);
    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        if (cellX === x && cellY === y) {
          continue;
        }
        cb(this._map[y][x]);
      }
    }
  }

  private placeNumber(cell: CellSprite) {
    const amount = this.calcBombsAmountAroundCell(cell);
    cell.type((`num${amount}` as unknown) as CellType);
    return amount;
  }
}
