import { Person, PersonData } from "./Person";
import { Spot } from "./Spot";

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
  titleKana?: string;
}

export const NameStyle = {
  WithFamilyname: 0,
  WithTitle: 1,
  OnlyGivenName: 2,
} as const;

export type NameStyle = (typeof NameStyle)[keyof typeof NameStyle];

export function getNameStyle(name: Name): NameStyle {
  if (name.familyName !== undefined && name.familyName !== "") {
    return NameStyle.WithFamilyname;
  }
  if (name.title !== undefined && name.title !== "") {
    return NameStyle.WithTitle;
  }
  return NameStyle.OnlyGivenName;
}

export interface ProfileData {
  person: PersonData;
  parents: PersonData[];
  adoptedParents: PersonData[];
  brothers: PersonData[];
  marriages: {
    sprouse?: PersonData;
    children: {
      isAdopted: boolean;
      child: PersonData;
    }[];
  }[];
  deathText: string;
  tags: string[];
}

export function isAllHalfWidth(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str);
}

export function getPlainText(str: string) {
  return str.replace(/\[([^\(\)\[\]]+)\([^\(\)\[\]]+\)\]/g, (_, a) => a);
}

export interface FontData {
  weight: number;
  size: number;
  family: string;
  color: string;
}

export function getFont(font: FontData) {
  return `${font.weight} ${font.size}pt '${font.family}'`;
}

export const Field = {
  Name: 0,
  Spot: 1,
  Tag: 2,
  Alias: 3,
  Bywords: 4,
  Sprouse: 5,
  Parent: 6,
  Child: 7,
  Brother: 8,
  Work: 9,
  Word: 10,
  Desciption: 11,
} as const;

export type Field = (typeof Field)[keyof typeof Field];

export interface SearchedWord {
  field: Field;
  text: string;
}

export interface SearchResult {
  type: Person | Spot;
  result: SearchedWord[];
}

export function compareSearchResult(
  result1: SearchResult,
  result2: SearchResult
) {
  if (result1.result.length !== result2.result.length) {
    return -(result1.result.length - result2.result.length);
  }
  for (let i = 0; i < result1.result.length; i++) {
    const field1 = result1.result[i].field;
    const field2 = result2.result[i].field;
    if (field1 !== field2) {
      return field1 - field2;
    }
  }
  return 0;
}

export function includesSubtext(strs: string[], text: string): boolean {
  return strs.some((str) => str.includes(text));
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
