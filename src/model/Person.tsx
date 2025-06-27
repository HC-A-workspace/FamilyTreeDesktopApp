import {
  HorizontalTextInformation,
  TextInformation,
  VerticalTextInformation,
} from "../components/TextInformation";
import { FamilyTree } from "./FamilyTree";
import {
  emptyStringToUndefined,
  SearchedWord,
  Sex,
  Field,
  type Date,
  type Name,
  type Position,
  SearchResult,
  isAllHalfWidth,
  getPlainText,
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
  isFixedVertically: boolean;
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
    isFixedVertically: false,
    description: "",
    tagIds: [],
    marriageIds: [],
    position: { ...position },
  };
}

export function displayName(name: Name) {
  if (name.familyName !== undefined) {
    if (isAllHalfWidth(name.familyName) && isAllHalfWidth(name.givenName)) {
      return `${name.givenName} ${name.familyName}`;
    } else {
      return `${name.familyName}${name.givenName}`;
    }
  }
  if (name.title !== undefined) return `${name.givenName}${name.title}`;
  return `${name.givenName}`;
}

function displayNameKana(name: Name) {
  if (name.familyName !== undefined) {
    if (isAllHalfWidth(name.familyName) && isAllHalfWidth(name.givenName)) {
      return `${name.givenNameKana} ${name.familyNameKana}`;
    } else {
      return `${name.familyNameKana}${name.givenNameKana}`;
    }
  }
  if (name.title !== undefined) return `${name.givenNameKana}${name.titleKana}`;
  return `${name.givenNameKana}`;
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
    isFixedVertically: personData.isFixedVertically,
    position: { ...personData.position },
  };
}

export class Person {
  private data: PersonData = getEmptyPersonData(-1, { x: 0, y: 0 });
  private nameText: TextInformation = new VerticalTextInformation();
  private bywordsText?: TextInformation;
  private birthText?: HorizontalTextInformation;
  private deathText?: HorizontalTextInformation;
  private height: number = 0;
  private width: number = 0;
  private isSelected = false;

  constructor(person: Person);
  constructor(person: PersonData);
  constructor(person: PersonData | Person) {
    if (person instanceof Person) {
      this.data = personDataClone(person.data);
      this.nameText = person.nameText.clone();
      this.bywordsText = person.bywordsText?.clone();
      this.birthText = person.birthText?.clone();
      this.deathText = person.deathText?.clone();
      this.height = person.height;
      this.width = person.width;
    } else {
      this.update(person);
    }
  }

  public setIsSelected(flag: boolean) {
    this.isSelected = flag;
    this.update();
  }

  public clone() {
    const clone = new Person(this);
    return clone;
  }

  private adjustPositionVertically() {
    let nameFont = FamilyTree.setting.commonFont;
    if (FamilyTree.setting.useCommonColor === false) {
      switch (this.data.sex) {
        case Sex.Male:
          nameFont = FamilyTree.setting.maleFont;
          break;
        case Sex.Female:
          nameFont = FamilyTree.setting.femaleFont;
          break;
        default:
          break;
      }
    }
    if (this.isSelected) {
      nameFont.weight += 300;
    }

    const spacing = nameFont.size / 4;

    let heightOfUpper = this.nameText.getHeight();
    let widthOfUpper = this.nameText.getWidth();
    this.nameText.setRelativeUL({ x: 0, y: 0 });

    if (this.bywordsText !== undefined && FamilyTree.setting.showBywords) {
      this.bywordsText.setRelativeUL({
        x: this.nameText.getWidth() + spacing,
        y: 0,
      });
      widthOfUpper += spacing + this.bywordsText.getWidth();
      heightOfUpper = Math.max(heightOfUpper, this.bywordsText.getHeight());
    }

    let widthOfLower = 0;
    let heightOfLower = 0;
    if (FamilyTree.setting.showYears) {
      if (this.birthText !== undefined && this.deathText !== undefined) {
        this.birthText.setRelativeUL({ x: 0, y: 0 });
        heightOfLower = this.birthText.getHeight();
        this.deathText.setRelativeUL({ x: 0, y: heightOfLower + spacing });
        heightOfLower += spacing + this.deathText.getHeight();
        widthOfLower = Math.max(
          this.birthText.getWidth(),
          this.deathText.getWidth()
        );
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
      const diffWidth = widthOfUpper - widthOfLower;
      if (diffWidth > 0) {
        if (this.birthText !== undefined && FamilyTree.setting.showYears) {
          this.birthText.translate(diffWidth / 2, heightOfUpper + spacing);
        }
        if (this.deathText !== undefined && FamilyTree.setting.showYears) {
          this.deathText.translate(diffWidth / 2, heightOfUpper + spacing);
        }
      } else {
        this.nameText.translate(-diffWidth / 2, 0);
        if (this.bywordsText !== undefined && FamilyTree.setting.showBywords) {
          this.bywordsText.translate(-diffWidth / 2, 0);
        }
        if (this.birthText !== undefined && FamilyTree.setting.showYears) {
          this.birthText.translate(0, heightOfUpper + spacing);
        }
        if (this.deathText !== undefined && FamilyTree.setting.showYears) {
          this.deathText.translate(0, heightOfUpper + spacing);
        }
      }
    }
  }

  private adjustPositionHorizontally() {
    this.width = this.nameText.getWidth();
    this.height = this.nameText.getHeight();

    let nameFont = FamilyTree.setting.commonFont;
    if (FamilyTree.setting.useCommonColor === false) {
      switch (this.data.sex) {
        case Sex.Male:
          nameFont = FamilyTree.setting.maleFont;
          break;
        case Sex.Female:
          nameFont = FamilyTree.setting.femaleFont;
          break;
        default:
          break;
      }
    }
    if (this.isSelected) {
      nameFont.weight += 300;
    }

    const spacing = nameFont.size / 4;

    this.nameText.setRelativeUL({ x: 0, y: 0 });

    if (this.bywordsText !== undefined && FamilyTree.setting.showBywords) {
      this.bywordsText.setRelativeUL({ x: 0, y: 0 });
      this.nameText.translate(0, this.bywordsText.getHeight() + spacing);
      this.height += spacing + this.bywordsText.getHeight();
      this.width = Math.max(this.width, this.bywordsText.getWidth());
    }

    if (this.birthText !== undefined && FamilyTree.setting.showYears) {
      this.birthText.setRelativeUL({ x: 0, y: 0 });
      this.birthText.translate(0, this.height + spacing);
      const diffWidth = this.width - this.birthText.getWidth();
      if (diffWidth > 0) {
        this.birthText.translate(diffWidth, 0);
      } else {
        this.nameText.translate(-diffWidth, 0);
        if (this.bywordsText !== undefined && FamilyTree.setting.showBywords) {
          this.bywordsText.translate(-diffWidth, 0);
        }
      }
      this.height += spacing + this.birthText.getHeight();
    }
  }

  private adjustPosition() {
    if (FamilyTree.setting.isVertical) {
      this.adjustPositionVertically();
    } else {
      this.adjustPositionHorizontally();
    }
  }

  public getNameTextInfo(): TextInformation {
    return this.nameText;
  }

  getText() {
    return displayName(this.data.name);
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

  public update(): void;
  public update(data: PersonData): void;
  public update(data?: PersonData): void {
    if (data !== undefined) {
      this.data = personDataClone(data);
    }
    let nameFont = { ...FamilyTree.setting.commonFont };
    if (FamilyTree.setting.useCommonColor === false) {
      switch (this.data.sex) {
        case Sex.Male:
          nameFont = { ...FamilyTree.setting.maleFont };
          break;
        case Sex.Female:
          nameFont = { ...FamilyTree.setting.femaleFont };
          break;
        default:
          break;
      }
    }

    if (this.isSelected) {
      nameFont.weight = 700;
    } else {
      nameFont.weight = 400;
    }
    if (FamilyTree.setting.isVertical) {
      this.nameText = new VerticalTextInformation(
        displayName(this.data.name),
        nameFont
      );
    } else {
      this.nameText = new HorizontalTextInformation(
        displayName(this.data.name),
        nameFont
      );
    }
    if (
      getPlainText(this.data.bywords) !== "" &&
      FamilyTree.setting.showBywords
    ) {
      if (FamilyTree.setting.isVertical) {
        this.bywordsText = new VerticalTextInformation(
          getPlainText(this.data.bywords),
          FamilyTree.setting.bywordsFont
        );
      } else {
        this.bywordsText = new HorizontalTextInformation(
          getPlainText(this.data.bywords),
          FamilyTree.setting.bywordsFont
        );
      }
    } else {
      this.bywordsText = undefined;
    }
    if (
      this.data.birthday?.year !== undefined &&
      FamilyTree.setting.isVertical
    ) {
      const prefix = this.data.birthday.isBC ? "前" : "";
      this.birthText = new HorizontalTextInformation(
        `${prefix}${this.data.birthday?.year}年 生`,
        FamilyTree.setting.yearFont
      );
    } else {
      this.birthText = undefined;
    }
    if (
      this.data.deathday?.year !== undefined &&
      FamilyTree.setting.isVertical
    ) {
      const prefix = this.data.deathday.isBC ? "前" : "";
      this.deathText = new HorizontalTextInformation(
        `${prefix}${this.data.deathday?.year}年 没`,
        FamilyTree.setting.yearFont
      );
    } else {
      this.deathText = undefined;
    }
    if (
      (this.data.birthday?.year !== undefined ||
        this.data.deathday?.year !== undefined) &&
      FamilyTree.setting.isVertical === false
    ) {
      const birthPrefix =
        this.data.birthday?.isBC === undefined ||
        this.data.birthday.isBC === false
          ? ""
          : "BC";
      const deathPrefix =
        this.data.deathday?.isBC === undefined ||
        this.data.deathday.isBC === false
          ? ""
          : "BC";
      const birth = birthPrefix + (this.data.birthday?.year ?? "?");
      const death = deathPrefix + (this.data.deathday?.year ?? "?");
      this.birthText = new HorizontalTextInformation(
        `${birth} ~ ${death}`,
        FamilyTree.setting.yearFont
      );
    }
    this.adjustPosition();
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
    this.data.marriageIds = this.data.marriageIds
      .map((id) => marriageRules.get(id) ?? -1)
      .filter((id) => id !== -1);
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
    if (this.data.isFixedVertically === false) {
      this.data.position.y += offsetPosition.y;
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
    personData.name.titleKana = emptyStringToUndefined(
      personData.name.titleKana
    );
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
    personData.aliases = personData.aliases
      .map((alias) => alias.trim())
      .filter((alias) => alias !== "");
    personData.works = personData.works
      .map((work) => work.trim())
      .filter((work) => work !== "");
    personData.words = personData.words
      .map((word) => word.trim())
      .filter((word) => word !== "");
    personData.description = personData.description.trim();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.nameText.draw(ctx, this.data.position);
    if (this.bywordsText !== undefined && FamilyTree.setting.showBywords) {
      this.bywordsText.draw(ctx, this.data.position);
    }
    if (this.birthText !== undefined && FamilyTree.setting.showYears) {
      this.birthText.draw(ctx, this.data.position);
    }
    if (
      this.deathText !== undefined &&
      FamilyTree.setting.showYears &&
      FamilyTree.setting.isVertical
    ) {
      this.deathText.draw(ctx, this.data.position);
    }
  }

  setIsFixedVertically(isFixed: boolean) {
    this.data.isFixedVertically = isFixed;
  }

  getIsFixedVertically() {
    return this.data.isFixedVertically;
  }

  private includingInName(text: string) {
    return (
      displayName(this.data.name).includes(text) ||
      displayNameKana(this.data.name).includes(text)
    );
  }

  search(familyTree: FamilyTree, texts: string[]): SearchResult {
    const results: SearchedWord[] = [];
    for (const text of texts) {
      const result = this.searchSingleWord(familyTree, text);
      if (result) {
        results.push(result);
      }
    }
    return {
      type: this,
      result: results.sort((res1, res2) => res1.field - res2.field),
    };
  }

  private searchSingleWord(
    familyTree: FamilyTree,
    text: string
  ): SearchedWord | undefined {
    if (this.includingInName(text)) {
      return {
        field: Field.Name,
        text: "",
      };
    }
    for (const id of this.data.tagIds) {
      const tag = familyTree.getTags()[id];
      if (tag.includes(text)) {
        return {
          field: Field.Tag,
          text: `タグ:${tag}`,
        };
      }
    }
    for (const alias of this.data.aliases) {
      const plainAlias = getPlainText(alias);
      if (plainAlias.includes(text)) {
        return {
          field: Field.Alias,
          text: `別名：${plainAlias}`,
        };
      }
    }

    const plainBywords = getPlainText(this.data.bywords);
    if (plainBywords.includes(text)) {
      return {
        field: Field.Bywords,
        text: plainBywords,
      };
    }

    for (const id of this.data.marriageIds) {
      const sprouse = familyTree
        .findSpousesOfMarriage(id)
        .filter((p) => p.data.id !== this.data.id);
      for (const person of sprouse) {
        if (person.includingInName(text)) {
          switch (this.data.sex) {
            case Sex.Male:
              return {
                field: Field.Sprouse,
                text: `${displayName(person.data.name)}の夫`,
              };
            case Sex.Female:
              return {
                field: Field.Sprouse,
                text: `${displayName(person.data.name)}の妻`,
              };
            default:
              return {
                field: Field.Sprouse,
                text: `${displayName(person.data.name)}の配偶者`,
              };
          }
        }
      }

      const children = familyTree.findChildrenOfMarriage(id);
      for (const child of children) {
        if (child.includingInName(text)) {
          switch (this.data.sex) {
            case Sex.Male:
              return {
                field: Field.Child,
                text: `${displayName(child.data.name)}の父`,
              };
            case Sex.Female:
              return {
                field: Field.Child,
                text: `${displayName(child.data.name)}の母`,
              };
            default:
              return {
                field: Field.Child,
                text: `${displayName(child.data.name)}の親`,
              };
          }
        }
      }

      const adoptedChildren = familyTree.findAdoptedChildrenOfMarriage(id);
      for (const child of adoptedChildren) {
        if (child.includingInName(text)) {
          switch (this.data.sex) {
            case Sex.Male:
              return {
                field: Field.Child,
                text: `${displayName(child.data.name)}の養父`,
              };
            case Sex.Female:
              return {
                field: Field.Child,
                text: `${displayName(child.data.name)}の養母`,
              };
            default:
              return {
                field: Field.Child,
                text: `${displayName(child.data.name)}の養親`,
              };
          }
        }
      }
    }

    if (this.data.parentMarriageId) {
      for (const child of familyTree.findAllChildrenOfMarriage(
        this.data.parentMarriageId
      )) {
        if (child.data.id !== this.data.id) {
          if (child.includingInName(text)) {
            switch (this.data.sex) {
              case Sex.Male:
                return {
                  field: Field.Brother,
                  text: `${displayName(child.data.name)}の兄弟`,
                };
              case Sex.Female:
                return {
                  field: Field.Brother,
                  text: `${displayName(child.data.name)}の姉妹`,
                };
              default:
                return {
                  field: Field.Brother,
                  text: `${displayName(child.data.name)}の兄弟・姉妹`,
                };
            }
          }
        }
      }
      const parents = familyTree.findSpousesOfMarriage(
        this.data.parentMarriageId
      );
      for (const parent of parents) {
        if (parent.includingInName(text)) {
          return {
            field: Field.Parent,
            text: `${displayName(parent.data.name)}の子`,
          };
        }
        const marriageIds = parent.data.marriageIds.filter(
          (id) => id !== this.data.parentMarriageId
        );
        let prefix;
        switch (parent.data.sex) {
          case Sex.Male:
            prefix = "異母";
            break;
          case Sex.Female:
            prefix = "異父";
          default:
            prefix = "異親";
            break;
        }
        for (const mid of marriageIds) {
          const children = familyTree.findChildrenOfMarriage(mid);
          for (const child of children) {
            if (child.includingInName(text)) {
              switch (this.data.sex) {
                case Sex.Male:
                  return {
                    field: Field.Brother,
                    text: `${displayName(child.data.name)}の${prefix}兄弟`,
                  };
                case Sex.Female:
                  return {
                    field: Field.Brother,
                    text: `${displayName(child.data.name)}の${prefix}姉妹`,
                  };
                default:
                  return {
                    field: Field.Brother,
                    text: `${displayName(child.data.name)}の${prefix}兄弟・${prefix}姉妹`,
                  };
              }
            }
          }
        }
      }
    }

    if (this.data.adoptedParentMarriageId) {
      for (const child of familyTree.findAllChildrenOfMarriage(
        this.data.adoptedParentMarriageId
      )) {
        if (child.data.id !== this.data.id) {
          if (child.includingInName(text)) {
            switch (this.data.sex) {
              case Sex.Male:
                return {
                  field: Field.Brother,
                  text: `${displayName(child.data.name)}の兄弟`,
                };
              case Sex.Female:
                return {
                  field: Field.Brother,
                  text: `${displayName(child.data.name)}の姉妹`,
                };
              default:
                return {
                  field: Field.Brother,
                  text: `${displayName(child.data.name)}の兄弟・姉妹`,
                };
            }
          }
        }
      }
      const parents = familyTree.findSpousesOfMarriage(
        this.data.parentMarriageId
      );
      for (const parent of parents) {
        if (parent.includingInName(text)) {
          return {
            field: Field.Parent,
            text: `${displayName(parent.data.name)}の養子`,
          };
        }
        const marriageIds = parent.data.marriageIds.filter(
          (id) => id !== this.data.parentMarriageId
        );
        let prefix;
        switch (parent.data.sex) {
          case Sex.Male:
            prefix = "異母";
            break;
          case Sex.Female:
            prefix = "異父";
          default:
            prefix = "異親";
            break;
        }
        for (const mid of marriageIds) {
          const children = familyTree.findChildrenOfMarriage(mid);
          for (const child of children) {
            if (child.includingInName(text)) {
              switch (this.data.sex) {
                case Sex.Male:
                  return {
                    field: Field.Brother,
                    text: `${displayName(child.data.name)}の${prefix}兄弟`,
                  };
                case Sex.Female:
                  return {
                    field: Field.Brother,
                    text: `${displayName(child.data.name)}の${prefix}姉妹`,
                  };
                default:
                  return {
                    field: Field.Brother,
                    text: `${displayName(child.data.name)}の${prefix}兄弟・${prefix}姉妹`,
                  };
              }
            }
          }
        }
      }
    }

    for (const work of this.data.works) {
      const plainWork = getPlainText(work);
      const idx = plainWork.indexOf(text);
      if (idx !== -1) {
        const additional = 3;
        const prefix = idx - additional > 0 ? "..." : "";
        const postfix =
          idx + text.length + additional !== plainWork.length - 1 ? "..." : "";
        return {
          field: Field.Work,
          text: `功績：${prefix}${plainWork.slice(
            Math.max(idx - additional, 0),
            idx + text.length + 3
          )}${postfix}`,
        };
      }
    }
    for (const word of this.data.words) {
      const plainWord = getPlainText(word);
      const idx = plainWord.indexOf(text);
      if (idx !== -1) {
        const additional = 3;
        const prefix = idx - additional > 0 ? "..." : "";
        const postfix =
          idx + text.length + additional !== plainWord.length - 1 ? "..." : "";
        return {
          field: Field.Desciption,
          text: `言葉・句${prefix}${plainWord.slice(
            Math.max(idx - additional, 0),
            idx + text.length + 3
          )}${postfix}`,
        };
      }
    }

    const plainDescription = getPlainText(this.data.description);
    const idx = plainDescription.indexOf(text);
    if (idx !== -1) {
      const additional = 3;
      const prefix = idx - additional > 0 ? "..." : "";
      const postfix =
        idx + text.length + additional !== plainDescription.length - 1
          ? "..."
          : "";
      return {
        field: Field.Desciption,
        text: `記述：${prefix}${plainDescription.slice(
          Math.max(idx - additional, 0),
          idx + text.length + 3
        )}${postfix}`,
      };
    }
  }
}
