// import { getVerticalTextInformation, type VerticalTextInformation } from '../components/VerticalText.tsx';
import {
  HorizontalTextInformations,
  VerticalTextInformations,
} from "../components/TextInformation";
import { FamilyTree } from "./FamilyTree";
import {
  emptyStringToUndefined,
  Sex,
  type Date,
  type Name,
  type Position,
} from "./FundamentalData";

export interface PersonData {
  id: number;
  name: Name;
  sex: Sex;
  bywords: string;
  birthday?: Date;
  deathday?: Date;
  parentMarriageId?: number;
  adoptedParentMarriageId?: number;
  marriageIds: number[];
  aliases: string[];
  tagIds: number[];
  works: string[];
  description: string;
  words: string[];
  position: Position;
}

export function getEmptyPersonData(id: number, position: Position): PersonData {
  return {
    id: id,
    name: {
      givenName: "",
    },
    sex: Sex.Male,
    bywords: "",
    aliases: [],
    works: [],
    words: [],
    description: "",
    tagIds: [],
    marriageIds: [],
    position: { ...position },
  };
}

function displayName(name: Name) {
  if (name.familyName !== undefined)
    return `${name.familyName}${name.givenName}`;
  if (name.title !== undefined) return `${name.givenName}${name.title}`;
  return `${name.givenName}`;
}

export function personDataClone(personData: PersonData): PersonData {
  return {
    id: personData.id,
    name: personData.name,
    sex: personData.sex,
    bywords: personData.bywords,
    birthday:
      personData.birthday !== undefined
        ? { ...personData.birthday }
        : undefined,
    deathday:
      personData.deathday !== undefined
        ? { ...personData.deathday }
        : undefined,
    parentMarriageId: personData.parentMarriageId,
    adoptedParentMarriageId: personData.adoptedParentMarriageId,
    marriageIds: [...personData.marriageIds],
    aliases: [...personData.aliases],
    tagIds: [...personData.tagIds],
    works: [...personData.works],
    description: personData.description,
    words: [...personData.words],
    position: { ...personData.position },
  };
}

function getNameColor(sex: Sex) {
  switch (sex) {
    case Sex.Male:
      return "rgb(33, 13, 214)";
    case Sex.Female:
      return "rgb(226, 8, 73)";
    default:
      return "rgb(0, 0, 0)";
  }
}

export class Person {
  private data: PersonData;
  private nameTextInfo: VerticalTextInformations;
  private bywordsTextInfo?: VerticalTextInformations;
  private birthTextInfo?: HorizontalTextInformations;
  private deathTextInfo?: HorizontalTextInformations;
  private height: number = 0;
  private width: number = 0;

  constructor(data: PersonData, nameTextInfo: VerticalTextInformations);
  constructor(data: PersonData, font?: string, color?: string);
  constructor(
    data: PersonData,
    font?: string | VerticalTextInformations,
    color?: string
  ) {
    if (font instanceof VerticalTextInformations) {
      this.data = personDataClone(data);
      this.nameTextInfo = font.clone();
    } else {
      this.data = personDataClone(data);
      const newFont = font === undefined ? FamilyTree.NORMAL_FONT : font;
      const newColor = color === undefined ? getNameColor(data.sex) : color;
      this.nameTextInfo = new VerticalTextInformations(
        displayName(this.data.name),
        newFont,
        newColor
      );
      if (
        this.data.parentMarriageId !== undefined &&
        this.data.parentMarriageId < 0
      ) {
        this.data.parentMarriageId = undefined;
      }
      this.data.marriageIds = this.data.marriageIds.filter((id) => id >= 0);
      this.data.tagIds = this.data.tagIds.filter((id) => id >= 0);

      if (this.data.bywords !== "") {
        this.bywordsTextInfo = new VerticalTextInformations(
          this.data.bywords,
          FamilyTree.BYWORDS_FONT,
          "black"
        );
      }

      if (this.data.birthday?.year !== undefined) {
        const prefix = this.data.birthday.isBC ? "" : "前";
        this.birthTextInfo = new HorizontalTextInformations(
          `${prefix}${this.data.birthday?.year}年 生`,
          FamilyTree.YEAR_FONT,
          "black"
        );
      }
      if (this.data.deathday?.year !== undefined) {
        const prefix = this.data.deathday.isBC ? "" : "前";
        this.deathTextInfo = new HorizontalTextInformations(
          `${prefix}${this.data.deathday?.year}年 没`,
          FamilyTree.YEAR_FONT,
          "black"
        );
      }
      this.adjustPosition();
    }
  }

  public clone() {
    const clone = new Person(this.data, this.nameTextInfo);
    clone.bywordsTextInfo = this.bywordsTextInfo;
    clone.birthTextInfo = this.birthTextInfo;
    clone.deathTextInfo = this.deathTextInfo;
    clone.width = this.width;
    clone.height = this.height;
    return clone;
  }

  private adjustPosition() {
    const spacing = 5;

    let heightofUpper = this.nameTextInfo.getHeight();
    let widthOfUpper = this.nameTextInfo.getWidth();
    if (this.bywordsTextInfo !== undefined) {
      widthOfUpper += spacing + this.bywordsTextInfo.getWidth();
      if (this.nameTextInfo.getHeight() > this.bywordsTextInfo.getHeight()) {
        this.nameTextInfo.setRelativeCenter({
          x: -(spacing + this.bywordsTextInfo.getWidth()) / 2,
          y: 0,
        });
        this.bywordsTextInfo.setRelativeCenter({
          x: (spacing + this.nameTextInfo.getWidth()) / 2,
          y:
            -(
              this.nameTextInfo.getHeight() - this.bywordsTextInfo.getHeight()
            ) / 2,
        });
      } else {
        heightofUpper = this.bywordsTextInfo.getHeight();
        this.nameTextInfo.setRelativeCenter({
          x: -(spacing + this.bywordsTextInfo.getWidth()) / 2,
          y:
            -(
              this.bywordsTextInfo.getHeight() - this.nameTextInfo.getHeight()
            ) / 2,
        });
        this.bywordsTextInfo.setRelativeCenter({
          x: (spacing + this.nameTextInfo.getWidth()) / 2,
          y: 0,
        });
      }
    }

    this.height = heightofUpper;

    let widthOfLower = 0;
    let heightOfLower = 0;
    if (this.birthTextInfo !== undefined && this.deathTextInfo !== undefined) {
      widthOfLower = Math.max(
        this.birthTextInfo.getWidth(),
        this.deathTextInfo.getWidth()
      );
      heightOfLower =
        this.birthTextInfo.getHeight() +
        spacing +
        this.deathTextInfo.getHeight();
      this.birthTextInfo.setRelativeCenter({
        x: 0,
        y: -(spacing + this.deathTextInfo.getHeight()) / 2,
      });
      this.deathTextInfo.setRelativeCenter({
        x: 0,
        y: (spacing + this.birthTextInfo.getHeight()) / 2,
      });
    } else if (this.birthTextInfo !== undefined) {
      widthOfLower = this.birthTextInfo.getWidth();
      heightOfLower = this.birthTextInfo.getHeight();
      this.birthTextInfo.setRelativeCenter({ x: 0, y: 0 });
    } else if (this.deathTextInfo !== undefined) {
      widthOfLower = this.deathTextInfo.getWidth();
      heightOfLower = this.deathTextInfo.getHeight();
      this.deathTextInfo.setRelativeCenter({ x: 0, y: 0 });
    }

    this.width = Math.max(widthOfUpper, widthOfLower);

    if (heightOfLower !== 0) {
      this.height += spacing + heightOfLower;
      this.nameTextInfo.translete(0, -(spacing + heightOfLower) / 2);
      if (this.bywordsTextInfo !== undefined) {
        this.bywordsTextInfo.translete(0, -(spacing + heightOfLower) / 2);
      }
      if (this.birthTextInfo !== undefined) {
        this.birthTextInfo.translate(0, (spacing + heightofUpper) / 2);
      }
      if (this.deathTextInfo !== undefined) {
        this.deathTextInfo.translate(0, (spacing + heightofUpper) / 2);
      }
    }
  }

  public getNameTextInfo(): VerticalTextInformations {
    return this.nameTextInfo;
  }

  public getByWordsTextInfo(): VerticalTextInformations | undefined {
    return this.bywordsTextInfo;
  }

  public getBirthTextInfo(): HorizontalTextInformations | undefined {
    return this.birthTextInfo;
  }

  public getDeathTextInfo(): HorizontalTextInformations | undefined {
    return this.deathTextInfo;
  }

  public raw(): PersonData {
    return this.data;
  }

  public update(data: PersonData, nameTextInfo?: VerticalTextInformations) {
    this.data = data;
    if (nameTextInfo === undefined) {
      this.nameTextInfo = new VerticalTextInformations(
        displayName(this.data.name),
        this.nameTextInfo.getFont(),
        this.nameTextInfo.getColor()
      );
    } else {
      this.nameTextInfo = new VerticalTextInformations(
        displayName(this.data.name),
        nameTextInfo.getFont(),
        nameTextInfo.getColor()
      );
    }
    if (this.data.bywords !== "") {
      this.bywordsTextInfo = new VerticalTextInformations(
        this.data.bywords,
        FamilyTree.BYWORDS_FONT,
        "black"
      );
    } else {
      this.bywordsTextInfo = undefined;
    }
    if (this.data.birthday?.year !== undefined) {
      const prefix = this.data.birthday.isBC ? "" : "前";
      this.birthTextInfo = new HorizontalTextInformations(
        `${prefix}${this.data.birthday?.year}年 生`,
        FamilyTree.YEAR_FONT,
        "black"
      );
    } else {
      this.birthTextInfo = undefined;
    }
    if (this.data.deathday?.year !== undefined) {
      const prefix = this.data.deathday.isBC ? "" : "前";
      this.deathTextInfo = new HorizontalTextInformations(
        `${prefix}${this.data.deathday?.year}年 没`,
        FamilyTree.YEAR_FONT,
        "black"
      );
    } else {
      this.deathTextInfo = undefined;
    }
    this.adjustPosition();
  }

  public changeFont(font: string) {
    this.nameTextInfo = new VerticalTextInformations(
      displayName(this.data.name),
      font,
      this.nameTextInfo.getColor()
    );
    this.adjustPosition();
  }

  public changeColor(color?: string) {
    if (color === undefined) {
      this.nameTextInfo.setColor(getNameColor(this.data.sex));
    } else {
      this.nameTextInfo.setColor(color);
    }
  }

  public getColor() {
    return this.nameTextInfo.getColor();
  }

  public getId(): number {
    return this.data.id;
  }

  public setId(id: number) {
    this.data.id = id;
  }

  public getDisplayName(): string {
    return displayName(this.data.name);
  }

  public getSex(): Sex {
    return this.data.sex;
  }

  getBirthday() {
    return this.data.birthday;
  }

  getDeathday() {
    return this.data.deathday;
  }

  getX(): number {
    return this.data.position.x;
  }

  getY(): number {
    return this.data.position.y;
  }

  getTopY(): number {
    return this.getY() - this.height / 2;
  }

  getBottomY(): number {
    return this.getY() + this.height / 2;
  }

  getLeftX(): number {
    return this.getX() - this.width / 2;
  }

  getRightX(): number {
    return this.getX() + this.width / 2;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getParentMarriageId() {
    return this.data.parentMarriageId;
  }

  setParentMarriageId(id?: number) {
    this.data.parentMarriageId = id;
  }

  getAdoptedParentMarriageId() {
    return this.data.adoptedParentMarriageId;
  }

  setAdoptedParentMarriageId(id?: number) {
    this.data.adoptedParentMarriageId = id;
  }

  getAllParentMarriageIds(): number[] {
    return [
      this.getParentMarriageId(),
      this.getAdoptedParentMarriageId(),
    ].filter((id) => id !== undefined);
  }

  getMarriageIds() {
    return this.data.marriageIds;
  }

  deleteMarriageId(id: number | undefined) {
    if (id === undefined) return;
    this.data.marriageIds = this.data.marriageIds.filter((m) => m !== id);
  }

  addMarriageId(id: number) {
    if (this.data.marriageIds.includes(id) === false) {
      this.data.marriageIds.push(id);
    }
  }

  getAliases() {
    return this.data.aliases;
  }

  getTagIds() {
    return this.data.tagIds;
  }

  getWorks() {
    return this.data.works;
  }

  getDescription() {
    return this.data.description;
  }

  getWords() {
    return this.data.words;
  }

  hasBywords() {
    return this.data.bywords !== undefined;
  }

  isKnownBirthyear() {
    return this.data.birthday?.year !== undefined;
  }

  isKnownDeththyear() {
    return this.data.deathday?.year !== undefined;
  }

  public getPosition(): Position {
    return this.data.position;
  }

  public setPosition(position: Position) {
    this.data.position.x = position.x;
    this.data.position.y = position.y;
  }

  public normaliseId(
    personRules: Map<number, number>,
    marriageRules: Map<number, number>
  ) {
    this.data.id = personRules.get(this.getId()) ?? -1;
    const parentMarriageId = this.data.parentMarriageId;
    const adoptedParentMarriageId = this.data.adoptedParentMarriageId;
    this.data.parentMarriageId =
      parentMarriageId !== undefined
        ? marriageRules.get(parentMarriageId)
        : undefined;
    this.data.adoptedParentMarriageId =
      adoptedParentMarriageId !== undefined
        ? marriageRules.get(adoptedParentMarriageId)
        : undefined;
    this.data.marriageIds = this.data.marriageIds.map(
      (id) => marriageRules.get(id) ?? -1
    );
  }

  public eraseDegeneracy() {
    this.data.marriageIds = Array.from(new Set(this.data.marriageIds));
    this.data.tagIds = Array.from(new Set(this.data.tagIds));
  }

  public addOffset(
    offsetPosition: Position,
    offsetPersonId: number,
    offsetMarriageId: number,
    offsetTagId: number
  ) {
    this.data.position = {
      x: this.data.position.x + offsetPosition.x,
      y: this.data.position.y + offsetPosition.y,
    };
    this.data.id += offsetPersonId;
    if (this.data.parentMarriageId !== undefined) {
      this.data.parentMarriageId += offsetMarriageId;
    }
    if (this.data.adoptedParentMarriageId !== undefined) {
      this.data.adoptedParentMarriageId += offsetMarriageId;
    }
    this.data.marriageIds = this.data.marriageIds.map(
      (id) => id + offsetMarriageId
    );
    this.data.tagIds = this.data.tagIds.map((id) => id + offsetTagId);
  }

  static formatData(personData: PersonData) {
    personData.name.givenNameKana = emptyStringToUndefined(
      personData.name.givenNameKana
    );
    personData.name.familyName = emptyStringToUndefined(
      personData.name.familyName
    );
    personData.name.familyNameKana = emptyStringToUndefined(
      personData.name.familyNameKana
    );
    personData.name.title = emptyStringToUndefined(personData.name.title);

    if (
      personData.birthday !== undefined &&
      personData.birthday.year === undefined &&
      personData.birthday.month === undefined &&
      personData.birthday.day === undefined
    ) {
      personData.birthday = undefined;
    }

    if (
      personData.deathday !== undefined &&
      personData.deathday.year === undefined &&
      personData.deathday.month === undefined &&
      personData.deathday.day === undefined
    ) {
      personData.deathday = undefined;
    }

    personData.aliases = personData.aliases.filter((alias) => alias !== "");
    personData.works = personData.works.filter((work) => work !== "");
    personData.words = personData.words.filter((word) => word !== "");
  }
}
