import {
  Point,
  Texture,
  TilingSprite,
} from 'pixi.js';
import noop from 'lodash/noop';

const TEXTURE_TILE_WIDTH = 128;
const TEXTURE_TILE_HEIGHT = 128;
const TILE_WIDTH = 32;
const TILE_HEIGHT = 32;

export enum CellType {
  bomb = 'bomb',
  closed = 'closed',
  detonatedBomb = 'detonatedBomb',
  flag = 'flag',
  num0 = 'num0',
  num1 = 'num1',
  num2 = 'num2',
  num3 = 'num3',
  num4 = 'num4',
  num5 = 'num5',
  num6 = 'num6',
  num7 = 'num7',
  num8 = 'num8',
  wrongPalcement = 'wrongPalcement',
}

export default class CellSprite extends TilingSprite {
  public static coordToCellPos(coord: Point) {
    return new Point(Math.floor(coord.x / TILE_WIDTH), Math.floor(coord.y / TILE_HEIGHT));
  }

  private _cellType!: CellType;
  private _hasBomb: boolean;

  constructor(texture: Texture) {
    super(texture, TEXTURE_TILE_WIDTH, TEXTURE_TILE_HEIGHT);
    this.scale.set(0.25, 0.25);
    this.type(CellType.closed);
    this._hasBomb = false;
  }

  public placeOnMap(x: number, y: number) {
    this.position.set(x * TILE_WIDTH, y * TILE_HEIGHT);
  }

  public type(cellType?: CellType) {
    if (this._cellType === cellType) {
      return;
    }
    switch (cellType) {
      case CellType.bomb: this.tilePosition = this.textureTilePos(2, 4); break;
      case CellType.detonatedBomb: this.tilePosition = this.textureTilePos(1, 4); break;
      case CellType.wrongPalcement: this.tilePosition = this.textureTilePos(2, 3); break;
      case CellType.flag: this.tilePosition = this.textureTilePos(4, 3); break;
      case CellType.num0: this.tilePosition = this.textureTilePos(3, 4); break;
      case CellType.num1: this.tilePosition = this.textureTilePos(4, 2); break;
      case CellType.num2: this.tilePosition = this.textureTilePos(3, 2); break;
      case CellType.num3: this.tilePosition = this.textureTilePos(2, 2); break;
      case CellType.num4: this.tilePosition = this.textureTilePos(1, 2); break;
      case CellType.num5: this.tilePosition = this.textureTilePos(4, 1); break;
      case CellType.num6: this.tilePosition = this.textureTilePos(3, 1); break;
      case CellType.num7: this.tilePosition = this.textureTilePos(2, 1); break;
      case CellType.num8: this.tilePosition = this.textureTilePos(1, 1); break;
      case CellType.closed: this.tilePosition = this.textureTilePos(0, 0); break;
      default: return this._cellType;
    }
    this._cellType = cellType;
  }

  public hasBomb(value?: boolean) {
    if (typeof value === 'boolean') {
      this._hasBomb = value;
    } else {
      return this._hasBomb;
    }
  }

  public tilePos() {
    return CellSprite.coordToCellPos(this.position);
  }

  public isNumber() {
    switch (this.type()) {
      case CellType.num0:
      case CellType.num1:
      case CellType.num2:
      case CellType.num3:
      case CellType.num4:
      case CellType.num5:
      case CellType.num6:
      case CellType.num7:
      case CellType.num8:
        return true;
    }
    return false;
  }

  public is(cellType: CellType) {
    return this._cellType === cellType;
  }

  public isNot(cellType: CellType) {
    return !this.is(cellType);
  }

  private textureTilePos(x: number, y: number) {
    return new Point(x * TEXTURE_TILE_WIDTH, y * TEXTURE_TILE_HEIGHT);
  }
}
