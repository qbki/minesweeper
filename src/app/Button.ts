import {
  Container,
  Graphics,
  Text,
  TextStyle,
} from 'pixi.js';

interface ButtonProps {
  x: number;
  y: number;
  caption: string;
}

export default class Button extends Container {
  private _text: Text;

  constructor(props: ButtonProps) {
    super();

    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ff99'],
      stroke: '#4a1850',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
    });
    this._text = new Text(props.caption, style);
    this._text.position.set(props.x, props.y);
    this._text.anchor.set(0.5, 0.5);
    this.addChild(this._text);

    this.interactive = true;
    this.buttonMode = true;
    this.on('pointerover', this.onButtonOver);
    this.on('pointerout', this.onButtonOut);
    this.on('pointerdown', this.onButtonDown);
    this.on('pointerup', this.onButtonOver);
  }

  private onButtonOver = () => {
    this._text.style.fill = ['#ffffff', '#ff0099'];
    this._text.style.dropShadowDistance = 6;
  }

  private onButtonOut = () => {
    this._text.style.fill = ['#ffffff', '#00ff99'];
    this._text.style.dropShadowDistance = 6;
  }

  private onButtonDown = () => {
    this._text.style.dropShadowDistance = 3;
  }
}
