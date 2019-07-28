import {
  Application,
  Container,
  interaction,
  Loader,
  Point,
  Text,
  Texture,
  TilingSprite,
} from 'pixi.js';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';

import CellSprite, { CellType } from './CellSprite';
import Button from './Button';
import {
  BOMBS_AMOUNT,
  GAME_FIELD_HEIGHT,
  GAME_FIELD_WIDTH,
  MAP_HEIGHT,
  MAP_WIDTH,
  SCENE_WIDTH,
  TEXT_STYLE,
  TILE_OFFSET_X,
  TILE_OFFSET_Y,
} from './consts';

export default class MenuScreen extends Container {
  private _map: CellSprite[][];
  private _infoText: Text;
  private _resultText: Text;

  constructor(texture: Texture) {
    super();

    const button = new Button({
      x: TILE_OFFSET_X + GAME_FIELD_WIDTH,
      y: TILE_OFFSET_Y + 3,
      caption: 'Restart',
      anchor: new Point(1, 1),
      style: { fontSize: 24 },
    });
    button.on('pointerdown', this.onRestart);
    this.addChild(button);

    this._infoText = new Text(
      '',
      {
        ...TEXT_STYLE,
        fontSize: 24,
      },
    );
    this._infoText.anchor.set(0, 1);
    this._infoText.position.set(TILE_OFFSET_X, TILE_OFFSET_Y);
    this.addChild(this._infoText);
    this.setInfoText(0);

    this._resultText = new Text(
      '',
      {
        ...TEXT_STYLE,
        fontSize: 36,
      },
    );
    this._resultText.anchor.set(0.5, 1);
    this._resultText.position.set(SCENE_WIDTH / 2, TILE_OFFSET_Y);
    this.addChild(this._resultText);

    const cellsContainer = new Container();
    cellsContainer.name = 'cells';
    cellsContainer.on('pointerdown', this.onPointerDown);
    cellsContainer.interactive = true;
    this.addChild(cellsContainer);

    this._map = [];
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      this._map.push([]);
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const cell = new CellSprite(texture);
        cell.placeOnMap(x, y);
        cell.hasBomb(Math.random() >= 0.9);
        this._map[y].push(cell);
        cellsContainer.addChild(cell);
      }
    }
    for (const row of this._map) {
      window.console.log(...row.map(c => c.hasBomb() ? '💣' : '∅'));
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

  private onRestart = () => {
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const cell = this._map[y][x];
        cell.type(CellType.closed);
      }
    }
    this.setInfoText(0);
    this._resultText.text = '';
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
    const flagsAmount = this.calcFlagsAmount();
    this.setInfoText(flagsAmount);
  }

  private handleWinning() {
    this._resultText.text = 'You are awesome!';
    this._resultText.style.fill = ['#ffffff', '#00ff66'];
  }

  private handleLosing() {
    this._resultText.text = 'Game Over';
    this._resultText.style.fill = ['#ffffff', '#ff0066'];
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

  private setInfoText(flagsAmount: number) {
    const bombsAmount = BOMBS_AMOUNT - flagsAmount;
    this._infoText.text = `💣  ${bombsAmount}`;
    if (bombsAmount > 0) {
      this._infoText.style.fill = ['#ffffff', '#ffff00'];
    } else if (bombsAmount < 0) {
      this._infoText.style.fill = ['#ffffff', '#ff0000'];
    } else {
      this._infoText.style.fill = ['#ffffff', '#00ff99'];
    }
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

  private calcFlagsAmount = () => {
    let flagsAmount = 0;
    for (let y = 0; y < MAP_HEIGHT; y += 1) {
      for (let x = 0; x < MAP_WIDTH; x += 1) {
        const cell = this._map[y][x];
        if (cell.is(CellType.flag)) {
          flagsAmount += 1;
        }
      }
    }
    return flagsAmount;
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
