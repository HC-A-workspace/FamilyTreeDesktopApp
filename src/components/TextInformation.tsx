import { type Position } from "../model/FundamentalData";


interface SingleTextInformation {
  text: string;
  width: number;
  height: number;
  relativeUL: Position;
}

function singleTextInformationClone(
  clone: SingleTextInformation
): SingleTextInformation {
  return {
    text: clone.text,
    width: clone.width,
    height: clone.height,
    relativeUL: {...clone.relativeUL}
  };
}

export interface FontData {
  weight: number;
  size: number;
  family: string[];
}

export abstract class TextInformation {
  protected width = 0;
  protected height = 0;
  protected font: FontData = {
    weight: 400,
    size: 20,
    family: ['Yu Mincho']
  };
  protected color = "";
  protected relativeUL: Position = {x: 0, y: 0}
  protected text = "";
  protected singleTextInfos: SingleTextInformation[] = []

  constructor();
  constructor(text: string, font: string | FontData, color: string);
  constructor(text?: string, font?: string | FontData, color?: string) {
    if (text !== undefined && font !== undefined && color !== undefined) {
      this.text = text;
      this.color = color;
      if (typeof font === "string") {
        const weightSize = font.slice(0, font.indexOf("p")).split(" ");
        const fonts = font.slice(font.indexOf("p") + 2).split(",");
        this.font = {
          weight: Number(weightSize[0]),
          size: Number(weightSize[1]),
          family: fonts.map((str) => str.replace(/['"]/g, "").trim().trim())
        }
      } else {
        this.font = font
      }
    }
    this.align();
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getFont() {
    const weightSize = `${this.font.weight} ${this.font.size}pt`
    const fonts = this.font.family.map(s => `'${s}'`).join(", ");
    return `${weightSize} ${fonts}`;
  }

  getColor() {
    return this.color;
  }

  getRelativeUL(): Position {
    return { ...this.relativeUL };
  }

  setRelativeUL(center: Position) {
    this.relativeUL.x = center.x;
    this.relativeUL.y = center.y;
  }

  setColor(color: string) {
    this.color = color;
  }

  translate(dx: number, dy: number) {
    this.relativeUL.x += dx;
    this.relativeUL.y += dy;
  }

  getText() {
    return this.text;
  }

  setText(text: string) {
    this.text = text;
    this.align();
  }

  setFontFamily(fontFamily: string[]) {
    this.font.family = fontFamily;
    this.align();
  }

  setFontSize(size: number) {
    this.font.size = size;
    this.align();
  }

  setFontWeight(weight: number) {
    this.font.weight = weight;
    this.align();
  }

  setFont(font: FontData) {
    this.font = font;
    this.align();
  }

  getFontSize() {
    return this.font.size;
  }

  abstract clone(): TextInformation;

  protected abstract align(): void;


  abstract draw(ctx: CanvasRenderingContext2D, position: Position): void;

}

export class VerticalTextInformation extends TextInformation{
  protected align(): void {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = this.getFont();
    const spacing = this.font.size / 4;
    this.height = 0;
    this.width = 0;

    this.singleTextInfos = [];
    for (const c of this.text) {
      const metric = ctx.measureText(c);
      const width = metric.width;
      const height =
        metric.actualBoundingBoxAscent - metric.actualBoundingBoxDescent;
      const char: SingleTextInformation = {
        text: c,
        width: width,
        height: height,
        relativeUL: { x: 0, y: this.height },
      };
      this.singleTextInfos.push(char);
      this.height += height + spacing;
      this.width = Math.max(this.width, width);
    }
    this.height -= spacing;
  }

  draw(ctx: CanvasRenderingContext2D, position: Position): void {
    ctx.fillStyle = this.color;
    ctx.font = this.getFont();
    ctx.textBaseline = "top";
    for (const c of this.singleTextInfos) {
      ctx.fillText(
        c.text,
        this.relativeUL.x + c.relativeUL.x + position.x,
        this.relativeUL.y + c.relativeUL.y + position.y
      );
    }
  }

  getSingleTextInfos() {
    return this.singleTextInfos;
  }

  clone(): VerticalTextInformation {
    const clone = new VerticalTextInformation();
    clone.text = this.text;
    clone.width = this.width;
    clone.height = this.height;
    clone.font = this.font;
    clone.color = this.color;
    clone.singleTextInfos = [
      ...this.singleTextInfos.map((info) => singleTextInformationClone(info)),
    ];
    clone.relativeUL = {...this.relativeUL}; 
    return clone;
  }
}

export class HorizontalTextInformation extends TextInformation{
  protected align(): void {
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = this.getFont();
      const metric = ctx.measureText(this.text);
      this.height =
        metric.actualBoundingBoxAscent - metric.actualBoundingBoxDescent;
      this.width = metric.width;
  }
  
  draw(ctx: CanvasRenderingContext2D, position: Position): void {
    ctx.fillStyle = this.color;
    ctx.font = this.getFont();
    ctx.textBaseline = "top";
    ctx.fillText(
      this.text,
      this.relativeUL.x + position.x,
      this.relativeUL.y + position.y
    );
  }

  public clone() {
    const clone = new HorizontalTextInformation();
    clone.text = this.text;
    clone.font = this.font;
    clone.color = this.color;
    clone.width = this.width;
    clone.height = this.height;
    clone.relativeUL = {...this.relativeUL}; 
    return clone;
  }
}
