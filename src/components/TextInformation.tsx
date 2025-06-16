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

export class VerticalTextInformations {
  private width: number = 0;
  private height: number = 0;
  private font: string = "";
  private color: string = "";
  private relativeCenter: Position = { x: 0, y: 0 };
  private singleTextInfos: SingleTextInformation[] = [];

  constructor();
  constructor(text: string, font: string, color: string);
  constructor(text?: string, font?: string, color?: string) {
    if (text !== undefined && font !== undefined && color !== undefined) {
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = font;
      this.font = font;
      this.color = color;
      this.relativeCenter = { x: 0, y: 0 };

      const fontSize = Number(font.split(" ")[1].split("px")[0]);
      const spacing = fontSize / 4;

      this.height = 0;
      this.width = 0;

      this.singleTextInfos = [];

      for (const c of text) {
        const metric = ctx.measureText(c);
        const width = metric.width;
        const height =
          metric.actualBoundingBoxAscent - metric.actualBoundingBoxDescent;
        const info: SingleTextInformation = {
          text: c,
          width: width,
          height: height,
          relativeCenter: { x: 0, y: this.height + height / 2 },
        };
        this.singleTextInfos.push(info);
        this.height += height + spacing;
        this.width = Math.max(this.width, width);
      }
      this.height -= spacing;

      for (const info of this.singleTextInfos) {
        info.relativeCenter.y += -this.height / 2;
      }
    }
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getFont() {
    return this.font;
  }

  getColor() {
    return this.color;
  }

  getRelativeCenter() {
    return this.relativeCenter;
  }

  getSingleTextInfos() {
    return this.singleTextInfos;
  }

  setRelativeCenter(position: Position) {
    this.relativeCenter = position;
  }

  setColor(color: string) {
    this.color = color;
  }

  clone(): VerticalTextInformations {
    const clone = new VerticalTextInformations();
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

  translete(dx: number, dy: number) {
    this.relativeCenter.x += dx;
    this.relativeCenter.y += dy;
  }
}

export class HorizontalTextInformations {
  private text: string = "";
  private font: string = "";
  private color: string = "";
  private width: number = 0;
  private height: number = 0;
  private relativeCenter: Position = { x: 0, y: 0 };

  constructor();
  constructor(text: string, font: string, color: string);
  constructor(text?: string, font?: string, color?: string) {
    if (text !== undefined && font !== undefined && color !== undefined) {
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = font;
      const metric = ctx.measureText(text);
      this.text = text;
      this.font = font;
      this.color = color;
      this.relativeCenter = { x: 0, y: 0 };
      this.height =
        metric.actualBoundingBoxAscent - metric.actualBoundingBoxDescent;
      this.width = metric.width;
    }
  }

  public clone() {
    const clone = new HorizontalTextInformations();
    clone.text = this.text;
    clone.font = this.font;
    clone.color = this.color;
    clone.width = this.width;
    clone.height = this.height;
    clone.relativeCenter = { ...this.relativeCenter };
  }

  getText() {
    return this.text;
  }

  getFont() {
    return this.font;
  }

  getColor() {
    return this.color;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getRelativeCenter() {
    return this.relativeCenter;
  }

  setRelativeCenter(postion: Position) {
    this.relativeCenter = { x: postion.x, y: postion.y };
  }

  translate(dx: number, dy: number) {
    this.relativeCenter.x += dx;
    this.relativeCenter.y += dy;
  }
}
