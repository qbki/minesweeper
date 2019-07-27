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
import { Container } from 'pixi.js';

const MAP_WIDTH = 20;
const MAP_HEIGHT = 10;

export default class MenuScreen extends Container {
  private _map: CellSprite[][];

  constructor() {
    super();
    this.interactive = true;
    this.on('pointerdown', this.onPointerDown);
    this._map = [[]];
  }

  public init(texture: Texture) {
    this._map = [];
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        this._map.push([]);
        const cell = new CellSprite(texture);
        cell.placeOnMap(x, y);
        cell.hasBomb(Math.random() >= 0.9);
        this._map[y].push(cell);
        this.addChild(cell);
      }
    }
    for (const row of this._map) {
      console.log(...row.map(c => c.hasBomb() ? '💣' : '∅'));
    }
  }

  private onPointerDown = (event: interaction.InteractionEvent) => {
    const pos = CellSprite.coordToCellPos(event.data.getLocalPosition(this));
    const cell = this._map[pos.y][pos.x];
    if (event.data.button === 0) {
      this.handleClick(cell);
    } else {
      this.handleAltClick(cell);
    }
  }

  private handleClick(cell: CellSprite) {
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

  private handleAltClick(cell: CellSprite) {
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

  private handleWinning() {
    console.log('You are awesome!');
  }

  private handleLosing() {
    console.log('Next time...');
  }

  private openMap() {
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
