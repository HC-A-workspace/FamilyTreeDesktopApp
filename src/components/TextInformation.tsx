import { type Position } from "../model/FundamentalData";


interface SingleTextInformation {
  text: string;
  width: number;
  height: number;
  relativeCenter: Position;
}

function singleTextInformationClone(
  clone: SingleTextInformation
): SingleTextInformation {
  return {
    text: clone.text,
    width: clone.width,
    height: clone.height,
    relativeCenter: { ...clone.relativeCenter },
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
  protected relativeCenter: Position = {x: 0, y: 0}
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

  getRelativeCenter(): Position {
    return { ...this.relativeCenter };
  }

  setRelativeCenter(center: Position) {
    this.relativeCenter.x = center.x;
    this.relativeCenter.y = center.y;
  }

  setColor(color: string) {
    this.color = color;
  }

  translate(dx: number, dy: number) {
    this.relativeCenter.x += dx;
    this.relativeCenter.y += dy;
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
        relativeCenter: { x: 0, y: this.height + height / 2 },
      };
      this.singleTextInfos.push(char);
      this.height += height + spacing;
      this.width = Math.max(this.width, width);
    }
    this.height -= spacing;

    for (const char of this.singleTextInfos) {
      char.relativeCenter.y += -this.height / 2;
    }
  }

  draw(ctx: CanvasRenderingContext2D, position: Position): void {
    ctx.fillStyle = this.color;
    ctx.font = this.getFont();
    ctx.textBaseline = "middle";
    for (const c of this.singleTextInfos) {
      ctx.fillText(
        c.text,
        this.relativeCenter.x + c.relativeCenter.x + position.x - c.width / 2,
        this.relativeCenter.y + c.relativeCenter.y + position.y
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
    clone.relativeCenter = { ...this.relativeCenter };
    clone.singleTextInfos = [
      ...this.singleTextInfos.map((info) => singleTextInformationClone(info)),
    ];
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
    ctx.textBaseline = "middle";
    ctx.fillText(
      this.text,
      this.relativeCenter.x + position.x - this.width / 2,
      this.relativeCenter.y + position.y
    );
  }

  public clone() {
    const clone = new HorizontalTextInformation();
    clone.text = this.text;
    clone.font = this.font;
    clone.color = this.color;
    clone.width = this.width;
    clone.height = this.height;
    clone.relativeCenter = { ...this.relativeCenter };
    return clone;
  }
}
