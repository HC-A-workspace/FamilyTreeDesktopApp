import {
  HorizontalTextInformation,
  TextInformation,
  VerticalTextInformation,
} from "../components/TextInformation";
import { FamilyTree } from "./FamilyTree";
import {
  emptyStringToUndefined,
  FontData,
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

function isAllHalfWidth(str: string): boolean {
  return /^[\x00-\x7F]*$/.test(str);
}

function displayName(name: Name) {
  if (name.familyName !== undefined) {
    if (isAllHalfWidth(name.familyName) && isAllHalfWidth(name.givenName)) {
      return `${name.givenName} ${name.familyName}`;
    }else{
      return `${name.familyName}${name.givenName}`;
    }
  }
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
  private nameText: TextInformation;
  private bywordsText?: TextInformation;
  private birthText?: HorizontalTextInformation;
  private deathText?: HorizontalTextInformation;
  private height: number = 0;
  private width: number = 0;
  private isVertical = true;
  private showBywords = true;
  private showYears = true
  private isFixedHorizontally = false;

  constructor(data: PersonData, showBywords: boolean, showYears: boolean, nameText: TextInformation, bywordsText?: TextInformation
    , birthText?: HorizontalTextInformation, deathText?: HorizontalTextInformation, height?: number, width?: number);
  constructor(data: PersonData, showBywords: boolean, showYears: boolean, isVertical?: boolean, color?: string, font?: FontData);
  constructor(
    data: PersonData,
    showBywords: boolean,
    showYears: boolean,
    isVertical?: boolean | TextInformation,
    color?: string | TextInformation,
    font?: FontData | HorizontalTextInformation,
    deathText?: HorizontalTextInformation, height?: number, width?: number
  ) {

    this.data = personDataClone(data);
    this.showBywords = showBywords;
    this.showYears = showYears;
    
    if (isVertical instanceof TextInformation) {
      this.nameText = isVertical.clone();
      this.isVertical = this.nameText instanceof VerticalTextInformation;
    } else {
      const newFont = font === undefined ? FamilyTree.NORMAL_FONT : (font as FontData);
      const newColor = color === undefined ? getNameColor(this.data.sex) : (color as string);
      this.isVertical = (isVertical === undefined) || (isVertical as boolean);
      if (this.isVertical) {
        this.nameText = new VerticalTextInformation(displayName(this.data.name), newFont, newColor)
      } else {
        this.nameText = new HorizontalTextInformation(displayName(this.data.name), newFont, newColor)
      }
    }
    if (color instanceof TextInformation) {
      this.bywordsText = color.clone();
    } else if (this.data.bywords !== "" && this.showBywords) {
      if (this.isVertical) {
        this.bywordsText = new VerticalTextInformation(this.data.bywords, FamilyTree.BYWORDS_FONT, "rgb(0, 0, 0)")
      } else {
        this.bywordsText = new HorizontalTextInformation(this.data.bywords, FamilyTree.BYWORDS_FONT, "rgb(0, 0, 0)")
      }
    }
    if (font instanceof HorizontalTextInformation) {
      this.birthText = font.clone();
    } else if (this.data.birthday?.year !== undefined && this.isVertical) {
      const prefix = this.data.birthday.isBC ? "前" : "";
      this.birthText = new HorizontalTextInformation(
        `${prefix}${this.data.birthday?.year}年 生`,
        FamilyTree.YEAR_FONT,
        "rgb(0, 0, 0)"
      );
    }
    

    if (deathText !== undefined) {
      this.deathText = deathText.clone();
    } else if (this.data.deathday?.year !== undefined && this.isVertical) {
      const prefix = this.data.deathday.isBC ? "前" : "";
      this.deathText = new HorizontalTextInformation(
        `${prefix}${this.data.deathday?.year}年 没`,
        FamilyTree.YEAR_FONT,
        "rgb(0, 0, 0)"
      );
    }
    if (this.isVertical === false && this.birthText === undefined) {
      if (this.data.birthday?.year !== undefined || this.data.deathday?.year !== undefined) {
        const birthPrefix = (this.data.birthday?.isBC === undefined || this.data.birthday.isBC === false) ? "" : "BC"
        const deathPrefix = (this.data.deathday?.isBC === undefined || this.data.deathday.isBC === false) ? "" : "BC"
        const birth = birthPrefix + (this.data.birthday?.year ?? "?")
        const death = deathPrefix + (this.data.deathday?.year ?? "?")
        this.birthText = new HorizontalTextInformation(`${birth} ~ ${death}`, FamilyTree.YEAR_FONT, "rgb(0, 0, 0)")
      }
    }
    if (height !== undefined && width !== undefined) {
      this.height = height
      this.width = width
    } else {
      this.adjustPosition();
    }
  }

  public clone() {
    const clone = new Person(this.data, this.showBywords, this.showYears, this.nameText, this.bywordsText, this.birthText, this.deathText, this.height, this.width);
    return clone;
  }

  private adjustPositionVertically() {
    const spacing = FamilyTree.NORMAL_FONT.size / 4;

    let heightOfUpper = this.nameText.getHeight();
    let widthOfUpper = this.nameText.getWidth();
    this.nameText.setRelativeUL({x: 0, y: 0});

    if (this.bywordsText !== undefined && this.showBywords) {
      this.bywordsText.setRelativeUL({x: this.nameText.getWidth() + spacing, y: 0})
      widthOfUpper += spacing + this.bywordsText.getWidth();
      heightOfUpper = Math.max(heightOfUpper, this.bywordsText.getHeight());
    }

    let widthOfLower = 0;
    let heightOfLower = 0;
    if (this.showYears) {
      if (this.birthText !== undefined && this.deathText !== undefined) {
        this.birthText.setRelativeUL({x: 0, y: 0});
        heightOfLower = this.birthText.getHeight();
        this.deathText.setRelativeUL({x: 0, y: heightOfLower + spacing});
        heightOfLower += spacing + this.deathText.getHeight();
        widthOfLower = Math.max(this.birthText.getWidth(), this.deathText.getWidth());
      } else if (this.birthText !== undefined) {
        widthOfLower = this.birthText.getWidth();
        heightOfLower = this.birthText.getHeight();
        this.birthText.setRelativeUL({ x: 0, y: 0 });
      } else if (this.deathText !== undefined) {
        widthOfLower = this.deathText.getWidth();
        heightOfLower = this.deathText.getHeight();
        this.deathText.setRelativeUL({ x: 0, y: 0 });
      }
    }
    this.width = Math.max(widthOfUpper, widthOfLower);
    this.height = heightOfUpper;

    if (heightOfLower !== 0) {
      this.height += spacing + heightOfLower;
      const diffWidth = widthOfUpper - widthOfLower
      if (diffWidth > 0) {
        if (this.birthText !== undefined && this.showYears) {
          this.birthText.translate(diffWidth / 2, heightOfUpper + spacing);
        }
        if (this.deathText !== undefined && this.showYears) {
          this.deathText.translate(diffWidth / 2, heightOfUpper + spacing);
        }        
      } else {
        this.nameText.translate(-diffWidth / 2, 0);
        if (this.bywordsText !== undefined && this.showBywords) {
          this.bywordsText.translate(-diffWidth / 2, 0)
        }
        if (this.birthText !== undefined && this.showYears) {
          this.birthText.translate(0, heightOfUpper + spacing);
        }
        if (this.deathText !== undefined && this.showYears) {
          this.deathText.translate(0, heightOfUpper + spacing);
        }
      }
    }
  }

  private adjustPositionHorizontally() {
    this.width = this.nameText.getWidth();
    this.height = this.nameText.getHeight();

    const spacing = FamilyTree.NORMAL_FONT.size / 4;

    this.nameText.setRelativeUL({x: 0, y: 0})

    if (this.bywordsText !== undefined && this.showBywords) {
      this.bywordsText.setRelativeUL({x: 0, y: 0})
      this.nameText.translate(0, this.bywordsText.getHeight() + spacing);
      this.height += spacing + this.bywordsText.getHeight();
      this.width = Math.max(this.width, this.bywordsText.getWidth());
    }

    if (this.birthText !== undefined && this.showYears) {
      this.birthText.setRelativeUL({x: 0, y: 0});
      this.birthText.translate(0, this.height + spacing);
      const diffWidth = this.width - this.birthText.getWidth();
      if (diffWidth > 0) {
        this.birthText.translate(diffWidth, 0)
      } else {
        this.nameText.translate(-diffWidth, 0);
        if (this.bywordsText !== undefined && this.showBywords) {
          this.bywordsText.translate(-diffWidth, 0)
        }
      }
      this.height += spacing + this.birthText.getHeight();
    }
  }

  private adjustPosition() {
    if (this.isVertical) {
      this.adjustPositionVertically();
    } else {
      this.adjustPositionHorizontally();
    }
  }

  setShowBywords(flag: boolean) {
    if (this.showBywords === flag) return;
    this.showBywords = flag;
    this.adjustPosition();
  }

  setShowYears(flag: boolean) {
    if (this.showYears === flag) return;
    this.showYears = flag;
    this.adjustPosition();
  }

  setIsVertical(flag: boolean) {
    if (this.isVertical === flag) return;
    this.isVertical = flag;
    this.update(this.data);
    this.adjustPosition();
  }

  public getNameTextInfo(): TextInformation {
    return this.nameText;
  }

  public getByWordsTextInfo(): TextInformation | undefined {
    return this.bywordsText;
  }

  public getBirthTextInfo(): HorizontalTextInformation | undefined {
    return this.birthText;
  }

  public getDeathTextInfo(): HorizontalTextInformation | undefined {
    return this.deathText;
  }

  public raw(): PersonData {
    return this.data;
  }

  public update(data: PersonData) {
    this.data = data;
    if (this.isVertical) {
      this.nameText = new VerticalTextInformation(displayName(this.data.name), this.nameText.getFont(), this.nameText.getColor());
    } else {
      this.nameText = new HorizontalTextInformation(displayName(this.data.name), this.nameText.getFont(), this.nameText.getColor());
    }
    if (this.data.bywords !== "") {
      if (this.isVertical) {
        this.bywordsText = new VerticalTextInformation(this.data.bywords, FamilyTree.BYWORDS_FONT, "rgb(0, 0, 0)")
      } else {
        this.bywordsText = new HorizontalTextInformation(this.data.bywords, FamilyTree.BYWORDS_FONT, "rgb(0, 0, 0)")
      }
    } else {
      this.bywordsText = undefined;
    }
    if (this.isVertical) {
      if (this.data.birthday?.year !== undefined) {
        const prefix = this.data.birthday.isBC ? "前" : "";
        this.birthText = new HorizontalTextInformation(
          `${prefix}${this.data.birthday?.year}年 生`,
          FamilyTree.YEAR_FONT,
          "rgb(0, 0, 0)"
        );
      } else {
        this.birthText = undefined;
      }
      if (this.data.deathday?.year !== undefined) {
        const prefix = this.data.deathday.isBC ? "前" : "";
        this.deathText = new HorizontalTextInformation(
          `${prefix}${this.data.deathday?.year}年 没`,
          FamilyTree.YEAR_FONT,
          "rgb(0, 0, 0)"
        );
      } else {
        this.deathText = undefined;
      }
    } else {
      if (this.data.birthday?.year !== undefined || this.data.deathday?.year !== undefined) {
        const birthPrefix = (this.data.birthday?.isBC === undefined || this.data.birthday.isBC === false) ? "" : "BC"
        const deathPrefix = (this.data.deathday?.isBC === undefined || this.data.deathday.isBC === false) ? "" : "BC"
        const birth = birthPrefix + (this.data.birthday?.year ?? "?")
        const death = deathPrefix + (this.data.deathday?.year ?? "?")
        this.birthText = new HorizontalTextInformation(`${birth} ~ ${death}`, FamilyTree.YEAR_FONT, "rgb(0, 0, 0)")
        this.deathText = undefined;
      } else {
        this.birthText = undefined;
        this.deathText = undefined;
      }
    }
    this.adjustPosition();
  }

  public changeFont(font: FontData) {
    this.nameText.setFont(font);
    this.adjustPosition();
  }

  public changeColor(color?: string) {
    if (color === undefined) {
      this.nameText.setColor(getNameColor(this.data.sex));
    } else {
      this.nameText.setColor(color);
    }
  }

  public getColor() {
    return this.nameText.getColor();
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

  getCenterX(): number {
    return this.data.position.x + this.width / 2;
  }

  getCenterY(): number {
    return this.data.position.y + this.height / 2;
  }

  getTopY(): number {
    return this.data.position.y;
  }

  getBottomY(): number {
    return this.data.position.y + this.height;
  }

  getLeftX(): number {
    return this.data.position.x;
  }

  getRightX(): number {
    return this.data.position.x + this.width;
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
    this.data.position.x += offsetPosition.x;
    if (this.isFixedHorizontally === false) {
      this.data.position.y += offsetPosition.y
    }
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

  draw(ctx: CanvasRenderingContext2D) {
    this.nameText.draw(ctx, this.data.position);
    if (this.bywordsText !== undefined && this.showBywords) {
      this.bywordsText.draw(ctx, this.data.position);
    }
    if (this.birthText !== undefined && this.showYears) {
      this.birthText.draw(ctx, this.data.position);
    }
    if (this.deathText !== undefined && this.showYears) {
      this.deathText.draw(ctx, this.data.position);
    }
  }

  setIsFixedHolizontally(isFixed: boolean) {
    this.isFixedHorizontally = isFixed
  }

  getIsFixedHolizontally() {
    return this.isFixedHorizontally;
  }
}
