import { Position } from "../model/FundamentalData";

export class SingleTextInformation {
  private static smallCharList = "っゃゅょぁぃぅぇぉッャュョァィゥェォ";
  private static punctuationList = "。、";
  private static rotatedCenterCharList = "（）【】ー～：「」『』｛｝";
  private static rotatedCenterHalfCharList = "() {}[]…-~:";
  private static baseChar = "あ";
  private static baseSmallChar = "ぁ";
  private static ctx = document.createElement("canvas").getContext("2d")!;

  private text: string = "";
  private width: number = 0;
  private height: number = 0;
  private relativeUL: Position = { x: 0, y: 0 };
  private isRotated: boolean = false;
  private font: string = "";
  private color: string = "rgb(0, 0, 0)";

  constructor(text: string, font: string, color: string);
  constructor(
    text: string,
    font: string,
    color: string,
    width: number,
    height: number,
    relativeUL: Position,
    isRotated: boolean
  );
  constructor(
    text: string,
    font: string,
    color: string,
    width?: number,
    height?: number,
    relativeUL?: Position,
    isRotated?: boolean
  ) {
    this.text = text;
    this.font = font;
    this.color = color;

    if (
      width !== undefined &&
      height !== undefined &&
      relativeUL !== undefined &&
      isRotated !== undefined
    ) {
      this.width = width;
      this.height = height;
      this.relativeUL = { ...relativeUL };
      this.isRotated = isRotated;
      return;
    }

    if (this.isHalfNumber()) {
      this.halfNumberJustify();
    } else if (text.length > 1) {
      this.rotatedTextJustfy();
    } else if (SingleTextInformation.smallCharList.includes(text)) {
      this.smallCharJustfy();
    } else if (SingleTextInformation.punctuationList.includes(text)) {
      this.punctuationJustify();
    } else if (SingleTextInformation.rotatedCenterCharList.includes(text)) {
      this.rotatedCenterCharJustify();
    } else if (SingleTextInformation.rotatedCenterHalfCharList.includes(text)) {
      this.rotatedCenterHalfCharJustify();
    } else {
      this.normalCharJustify();
    }
  }

  private isHalfNumber() {
    return this.text.match(/[0-9]+/g) !== null;
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public translate(dx: number, dy: number) {
    this.relativeUL.x += dx;
    this.relativeUL.y += dy;
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    verticalTextRelativeUL: Position,
    mainUL: Position
  ) {
    ctx.fillStyle = this.color;
    ctx.font = this.font;
    ctx.textBaseline = "alphabetic";
    if (this.isRotated === false) {
      ctx.fillText(
        this.text,
        this.relativeUL.x + verticalTextRelativeUL.x + mainUL.x,
        this.relativeUL.y + verticalTextRelativeUL.y + mainUL.y + this.height
      );
    } else {
      ctx.rotate(Math.PI / 2);
      ctx.fillText(
        this.text,
        this.relativeUL.y + verticalTextRelativeUL.y + mainUL.y,
        -(this.relativeUL.x + verticalTextRelativeUL.x + mainUL.x)
      );
      ctx.rotate(-Math.PI / 2);
    }
  }

  public clone() {
    return new SingleTextInformation(
      this.text,
      this.font,
      this.color,
      this.width,
      this.height,
      this.relativeUL,
      this.isRotated
    );
  }

  private halfNumberJustify() {
    SingleTextInformation.ctx.font = this.font;
    const metric = SingleTextInformation.ctx.measureText(this.text);
    const baseMetric = SingleTextInformation.ctx.measureText("8");
    if (this.text.length <= 3) {
      this.width = metric.width;
      this.height =
        baseMetric.actualBoundingBoxAscent +
        baseMetric.actualBoundingBoxDescent;
    } else {
      this.width =
        baseMetric.actualBoundingBoxAscent +
        baseMetric.actualBoundingBoxDescent;
      this.height = metric.width;
      this.isRotated = true;
    }
    this.relativeUL = { x: 0, y: 0 };
  }

  private rotatedTextJustfy() {
    SingleTextInformation.ctx.font = this.font;
    const metric = SingleTextInformation.ctx.measureText(this.text);
    this.width =
      metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;
    this.height = metric.width;
    this.isRotated = true;
    this.relativeUL = {
      x: 0,
      y: 0,
    };
  }

  private smallCharJustfy() {
    SingleTextInformation.ctx.font = this.font;
    const metric = SingleTextInformation.ctx.measureText(
      SingleTextInformation.baseSmallChar
    );
    const smallWidth =
      metric.actualBoundingBoxLeft + metric.actualBoundingBoxRight;
    const smallHeight =
      metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;

    const baseMetric = SingleTextInformation.ctx.measureText(
      SingleTextInformation.baseChar
    );
    this.width = baseMetric.width;
    const baseActualWidth =
      baseMetric.actualBoundingBoxLeft + baseMetric.actualBoundingBoxRight;
    this.height =
      baseMetric.actualBoundingBoxAscent + baseMetric.actualBoundingBoxDescent;
    this.relativeUL = {
      x: (baseActualWidth - smallWidth) / 2,
      y: -(this.height - smallHeight),
    };
  }

  private punctuationJustify() {
    SingleTextInformation.ctx.font = this.font;
    const metric = SingleTextInformation.ctx.measureText(
      SingleTextInformation.baseSmallChar
    );
    const smallWidth =
      metric.actualBoundingBoxLeft + metric.actualBoundingBoxRight;
    const baseMetric = SingleTextInformation.ctx.measureText(
      SingleTextInformation.baseChar
    );
    this.width = baseMetric.width;
    const baseActualWidth =
      baseMetric.actualBoundingBoxLeft + baseMetric.actualBoundingBoxRight;
    this.height =
      baseMetric.actualBoundingBoxAscent + baseMetric.actualBoundingBoxDescent;
    this.relativeUL = {
      x: (baseActualWidth * 3) / 4,
      y: (-this.height * 3) / 4,
    };
    console.log(smallWidth, this.width, baseActualWidth);
  }

  private rotatedCenterCharJustify() {
    SingleTextInformation.ctx.font = this.font;
    this.normalCharJustify();
    const metric = SingleTextInformation.ctx.measureText(
      SingleTextInformation.baseChar
    );
    this.width = metric.width;
    this.height =
      metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;
    const baseRotateMetric = SingleTextInformation.ctx.measureText(
      SingleTextInformation.rotatedCenterCharList.charAt(0)
    );
    const baseHeight =
      baseRotateMetric.actualBoundingBoxAscent +
      baseRotateMetric.actualBoundingBoxDescent;
    this.relativeUL = { x: ((baseHeight - this.height) * 3) / 4, y: 0 };
    this.isRotated = true;
  }

  private rotatedCenterHalfCharJustify() {
    SingleTextInformation.ctx.font = this.font;
    this.normalCharJustify();
    const metric = SingleTextInformation.ctx.measureText("(");
    this.height = metric.width;
    this.width =
      metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;
    this.relativeUL = { x: this.width / 8, y: 0 };
    this.isRotated = true;
  }

  private normalCharJustify() {
    SingleTextInformation.ctx.font = this.font;
    const baseMetric = SingleTextInformation.ctx.measureText(
      SingleTextInformation.baseChar
    );
    const metric = SingleTextInformation.ctx.measureText(this.text);
    this.width = metric.width;
    this.height =
      baseMetric.actualBoundingBoxAscent + baseMetric.actualBoundingBoxDescent;
    this.relativeUL = { x: 0, y: 0 };
  }
}
