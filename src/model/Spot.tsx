import {
  Field,
  FontData,
  getFont,
  Position,
  SearchedWord,
  SearchResult,
} from "./FundamentalData";

export interface SpotData {
  id: number;
  text: string;
  position: Position;
}

export class Spot {
  private data: SpotData;
  private static font: FontData = {
    weight: 600,
    size: 20,
    family: "MS Gothic",
    color: "#000000",
  };
  private width: number = 0;
  private height: number = 0;

  constructor(data: SpotData) {
    this.data = { ...data, position: { ...data.position } };
    this.calculateSize();
  }

  private calculateSize() {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = getFont(Spot.font);
    const metric = ctx.measureText(this.data.text);
    this.width = metric.width;
    this.height =
      metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;
  }

  draw(ctx: CanvasRenderingContext2D, scale: number) {
    const resizedFont: FontData = {
      ...Spot.font,
      size: Spot.font.size / scale,
    };
    ctx.fillStyle = "black";
    ctx.font = getFont(resizedFont);
    ctx.textBaseline = "middle";
    ctx.fillText(
      this.data.text,
      this.data.position.x - this.width / (2 * scale),
      this.data.position.y
    );
  }

  clone() {
    return new Spot(this.data);
  }

  equal(spot: Spot) {
    return (
      this.data.text === spot.data.text &&
      this.data.position.x === spot.data.position.x &&
      this.data.position.y === spot.data.position.y
    );
  }

  isContained(uncaledPosition: Position, scale: number): boolean {
    const offset = 0;
    const scaledWidth = (this.width + 2 * offset) / scale;
    const scaledHeight = (this.height + 2 * offset) / scale;
    if (
      this.data.position.x - scaledWidth / 2 <= uncaledPosition.x &&
      uncaledPosition.x <= this.data.position.x + scaledWidth / 2
    ) {
      if (
        this.data.position.y - scaledHeight / 2 <= uncaledPosition.y &&
        uncaledPosition.y <= this.data.position.y + scaledHeight / 2
      ) {
        return true;
      }
    }
    return false;
  }

  getCenterX() {
    return this.data.position.x;
  }

  getCenterY() {
    return this.data.position.y;
  }

  setText(text: string) {
    this.data = {
      id: this.data.id,
      text: text,
      position: { ...this.data.position },
    };
    this.calculateSize();
  }

  getText() {
    return this.data.text;
  }

  getData() {
    return this.data;
  }

  setPosition(position: Position) {
    this.data.position.x = position.x;
    this.data.position.y = position.y;
  }

  getId() {
    return this.data.id;
  }

  normaliseId(rule: Map<number, number>) {
    const newId = rule.get(this.data.id);
    if (newId !== undefined) {
      this.data.id = newId;
    }
  }

  addOffSet(offsetId: number, offsetPosition: Position) {
    this.data.id += offsetId;
    this.data.position.x += offsetPosition.x;
    this.data.position.y += offsetPosition.y;
  }

  search(texts: string[]): SearchResult {
    for (const text of texts) {
      if (this.data.text.includes(text)) {
        return {
          type: this,
          result: [
            {
              field: Field.Spot,
              text: "スポット",
            },
          ],
        };
      }
    }
    return {
      type: this,
      result: [],
    };
  }
}
