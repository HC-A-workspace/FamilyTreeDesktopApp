export const Sex = {
  Male: 0,
  Female: 1,
  Other: 2,
} as const;

export type Sex = (typeof Sex)[keyof typeof Sex];

export const SexLabel: Record<Sex, string> = {
  [Sex.Male]: "男",
  [Sex.Female]: "女",
  [Sex.Other]: "その他",
};

export interface Date {
  isBC: boolean;
  year?: number;
  month?: number;
  day?: number;
}

export function dateToString(date: Date): string {
  let str: string = "";
  if (date.isBC !== false) {
    str = str + "紀元前";
  }
  if (date.year !== undefined) {
    str = str + date.year + "年";
  }
  if (date.month != undefined) {
    str = str + date.month + "月";
  }
  if (date.day !== undefined) {
    str = str + date.day + "日";
  }
  return str;
}

export interface Position {
  x: number;
  y: number;
}

export function positionOverwrite(position: Position, x: number, y: number) {
  position.x = x;
  position.y = y;
}

export function sameElementList<T>(list1: T[], list2: T[]) {
  if (list1.length !== list2.length) return false;
  const sortedA = [...list1].sort();
  const sortedB = [...list2].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export function emptyStringToUndefined(
  text: string | undefined
): string | undefined {
  return text === undefined || text === "" ? undefined : text;
}

export interface TagData {
  id: number;
  tag: string;
}

export interface Name {
  familyName?: string;
  familyNameKana?: string;
  givenName: string;
  givenNameKana?: string;
  title?: string;
}

export interface FontData {
  weight: number;
  size: number;
  family: string[];
}

export function getFont(font: FontData) {
  const weightSize = `${font.weight} ${font.size}pt`;
  const fonts = font.family.map((s) => `'${s}'`).join(", ");
  return `${weightSize} ${fonts}`;
}

export class Queue<T> {
  private list: T[] = [];
  private length = 0;
  private position = 0;

  constructor() {}

  push(item: T) {
    this.list.push(item);
    this.length++;
  }

  front(): T {
    return this.list[this.position];
  }

  pop() {
    this.position++;
    this.length--;
    if (this.position > 50) {
      this.list = this.list.slice(this.position);
      this.position = 0;
    }
  }

  size() {
    return this.length;
  }

  isEmpty() {
    return this.length === 0;
  }
}
