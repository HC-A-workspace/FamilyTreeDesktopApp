import { FontData, getFont, type Position } from "../model/FundamentalData";
import { SingleTextInformation } from "./VerticalText";

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
    return getFont(this.font)
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
    const spacing = this.font.size / 5;
    this.height = 0;
    this.width = 0;

    this.singleTextInfos = [];
    for (const c of this.split()) {
      const singleInfo = new SingleTextInformation(c, this.getFont(), this.color);
      singleInfo.translate(0, this.height);
      this.singleTextInfos.push(singleInfo);
      this.height += singleInfo.getHeight() + spacing;
      this.width = Math.max(this.width, singleInfo.getWidth());
    }
    for (const singleInfo of this.singleTextInfos) {
      singleInfo.translate((this.width - singleInfo.getWidth()) / 2, 0)
    }
    this.height -= spacing;
  }

  draw(ctx: CanvasRenderingContext2D, position: Position): void {
    ctx.fillStyle = this.color;
    for (const c of this.singleTextInfos) {
      c.draw(ctx, this.relativeUL, position)
    }
  }

  split() {
    const pattern = /[\x00-\x7F]*[a-z][\x00-\x7F]*[a-z][\x00-\x7F]*/g
    const numbers = /[0-9]+/g
    const matched = this.text.match(pattern);
    let splited: string[] = []
    if (matched === null) {
      const numberMatched = this.text.match(numbers);
      if (numberMatched === null) {
        splited = this.text.split("")
      } else {
        let current = this.text;
        for (const num of numberMatched) {
          const end = current.indexOf(num);
          const substring = current.slice(0, end);
          splited = splited.concat(substring.split("").concat(num));
          current = current.slice(substring.length + num.length);
        }
        splited = splited.concat(current.split(""));
      }
    } else {
      let current = this.text;
      for (const text of matched) {
        const end = current.indexOf(text);
        const substring = current.slice(0, end);
        const numberMatched = substring.match(numbers);
        if (numberMatched === null) {
          splited = splited.concat(substring.split("")).concat(text);
          current = current.slice(substring.length + text.length);
        } else {
          let subcurrent = substring;
          for (const num of numberMatched) {
            const subEnd = subcurrent.indexOf(num);
            const subsubstring = subcurrent.slice(0, subEnd);
            splited = splited.concat(subsubstring.split("").concat(num));
            subcurrent = subcurrent.slice(subsubstring.length + num.length);
          }
        }
      }
      splited = splited.concat(current.split(""));
    }
    return splited;
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
      ...this.singleTextInfos.map((info) => info.clone()),
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
        metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;
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
