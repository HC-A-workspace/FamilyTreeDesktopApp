import {
  FontData,
  Queue,
  sameElementList,
  type Position,
} from "./FundamentalData";
import { Marriage, type MarriageData } from "./Marriage";
import { Person, type PersonData } from "./Person";
import { Spot, SpotData } from "./Spot";

export type PersonId = number | undefined;
export type MarriageId = number | undefined;

export class FamilyTree {
  private personMap: Map<number, Person>;
  private marriageMap: Map<number, Marriage>;
  private spotList: Map<number, Spot>;
  private title: string = "家系図";
  private nextPersonId: number = 0;
  private nextMarriageId: number = 0;
  private nextSpotId: number = 0;
  public static NORMAL_FONT: FontData = {
    weight: 400,
    size: 20,
    family: ["Yu Mincho"],
  };
  public static BOLD_FONT: FontData = {
    weight: 700,
    size: 20,
    family: ["Yu Mincho"],
  };
  public static YEAR_FONT: FontData = {
    weight: 400,
    size: 8,
    family: ["serif"],
  };
  public static BYWORDS_FONT: FontData = {
    weight: 400,
    size: 8,
    family: ["serif"],
  };
  private isVertical = true;
  private showBywords = true;
  private showYears = true;

  private topY: number = 0;
  private bottomY: number = 0;
  private leftX: number = 0;
  private rightX: number = 0;

  constructor(people: Person[], marriage: Marriage[], spots: Spot[]);
  constructor(
    peopleData: PersonData[],
    marriagesData: MarriageData[],
    spotData: SpotData[]
  );
  constructor(
    people: Person[] | PersonData[],
    marriages: Marriage[] | MarriageData[],
    spots: Spot[] | SpotData[]
  ) {
    this.personMap = new Map(
      people.length === 0
        ? []
        : people[0] instanceof Person
          ? (people as Person[]).map((p) => [p.getId(), p])
          : (people as PersonData[]).map((p) => [
              p.id,
              new Person(p, this.showBywords, this.showYears, this.isVertical),
            ])
    );

    this.marriageMap = new Map(
      marriages.length === 0
        ? []
        : marriages[0] instanceof Marriage
          ? (marriages as Marriage[]).map((m) => [m.getId(), m])
          : (marriages as MarriageData[]).map((m) => [m.id, new Marriage(m)])
    );

    this.spotList = new Map(
      spots.length === 0
        ? []
        : spots[0] instanceof Spot
          ? (spots as Spot[]).map((spot) => [spot.getId(), spot.clone()])
          : (spots as SpotData[]).map((spot) => [spot.id, new Spot(spot)])
    );

    if (people.length > 0) {
      this.personMap = new Map();
      if (people[0] instanceof Person) {
        this.topY = people[0].getTopY();
        this.bottomY = people[0].getBottomY();
        this.leftX = people[0].getLeftX();
        this.rightX = people[0].getRightX();
      } else {
        this.topY = people[0].position.y;
        this.bottomY = people[0].position.y;
        this.leftX = people[0].position.x;
        this.rightX = people[0].position.x;
      }
      for (const person of people) {
        if (person instanceof Person) {
          this.personMap.set(person.getId(), person);
          this.topY = Math.min(this.topY, person.getTopY());
          this.bottomY = Math.max(this.bottomY, person.getBottomY());
          this.leftX = Math.min(this.leftX, person.getLeftX());
          this.rightX = Math.max(this.rightX, person.getRightX());
        } else {
          this.personMap.set(
            person.id,
            new Person(
              person,
              this.showBywords,
              this.showYears,
              this.isVertical
            )
          );
          this.topY = Math.min(this.topY, person.position.y);
          this.bottomY = Math.max(this.bottomY, person.position.y);
          this.leftX = Math.min(this.leftX, person.position.x);
          this.rightX = Math.max(this.rightX, person.position.x);
        }
      }
    }

    this.nextPersonId = people.length;
    this.nextMarriageId = marriages.length;
    this.nextSpotId = spots.length;

    this.normalizeId();
  }

  clone(): FamilyTree {
    const clone = new FamilyTree([], [], []);
    clone.personMap = new Map(
      Array.from(this.personMap).map(
        (p) => [p[0], p[1].clone()] as [number, Person]
      )
    );
    clone.marriageMap = new Map(
      Array.from(this.marriageMap).map(
        (m) => [m[0], m[1].clone()] as [number, Marriage]
      )
    );
    clone.spotList = new Map(
      Array.from(this.spotList).map(
        (m) => [m[0], m[1].clone()] as [number, Spot]
      )
    );
    clone.title = this.title;
    clone.nextMarriageId = this.nextMarriageId;
    clone.nextPersonId = this.nextPersonId;
    clone.topY = this.topY;
    clone.bottomY = this.bottomY;
    clone.leftX = this.leftX;
    clone.rightX = this.rightX;
    return clone;
  }

  getShowBywords() {
    return this.showBywords;
  }

  getShowYears() {
    return this.showYears;
  }

  getIsVertical() {
    return this.isVertical;
  }

  setShowBywords(showBywords: boolean) {
    if (this.showBywords !== showBywords) {
      for (const [, person] of this.personMap) {
        person.setShowBywords(showBywords);
      }
      this.showBywords = showBywords;
    }
  }

  setShowYears(showYears: boolean) {
    if (this.showYears !== showYears) {
      for (const [, person] of this.personMap) {
        person.setShowYears(showYears);
      }
      this.showYears = showYears;
    }
  }

  setIsVertical(isVertical: boolean) {
    if (this.isVertical !== isVertical) {
      for (const [, person] of this.personMap) {
        person.setIsVertical(isVertical);
      }
      this.isVertical = isVertical;
    }
  }

  getNextPersonId() {
    return this.nextPersonId;
  }

  getNextMarriageId() {
    return this.nextMarriageId;
  }

  getPersonMap(): Map<number, Person> {
    return this.personMap;
  }

  getMarriageMap(): Map<number, Marriage> {
    return this.marriageMap;
  }

  getTopY() {
    return this.topY;
  }

  getBottomY() {
    return this.bottomY;
  }

  getLeftX() {
    return this.leftX;
  }

  getRightX() {
    return this.rightX;
  }

  findPersonById(personId: PersonId): Person | undefined {
    return personId !== undefined ? this.personMap.get(personId) : undefined;
  }

  findMarriageById(marrigeId: MarriageId): Marriage | undefined {
    return marrigeId !== undefined
      ? this.marriageMap.get(marrigeId)
      : undefined;
  }

  getParentsMarriageId(personId: PersonId): MarriageId {
    const person = this.findPersonById(personId);
    return person?.raw().parentMarriageId;
  }

  findParentsMarriage(personId: PersonId): Marriage | undefined {
    return this.findMarriageById(this.getParentsMarriageId(personId));
  }

  getAdoptedParentMarriageId(personId: PersonId): MarriageId {
    return this.findPersonById(personId)?.raw().adoptedParentMarriageId;
  }

  findAdoptedParentMarriage(personId: PersonId): Marriage | undefined {
    return this.findMarriageById(this.getAdoptedParentMarriageId(personId));
  }

  getAllParentMarriageIds(personId: PersonId): MarriageId[] {
    return [
      this.getParentsMarriageId(personId),
      this.getAdoptedParentMarriageId(personId),
    ].filter((mId) => mId !== undefined);
  }

  private findPersonsByIds(personIds: PersonId[]): Person[] {
    return personIds
      .map((id) => this.findPersonById(id))
      .filter((p): p is Person => p !== undefined);
  }

  private findMarriagesByIds(marriageIds: MarriageId[]): Marriage[] {
    return marriageIds
      .map((id) => this.findMarriageById(id))
      .filter((m): m is Marriage => m !== undefined);
  }

  getMarriageIds(personId: PersonId): MarriageId[] {
    const person = this.findPersonById(personId);
    return person?.raw().marriageIds ?? [];
  }

  findMarriages(personId: PersonId): Marriage[] {
    return this.findMarriagesByIds(this.getMarriageIds(personId));
  }

  getSpousesIdsOfMarriage(marriageId: MarriageId): PersonId[] {
    return this.findMarriageById(marriageId)?.getParentsIds() ?? [];
  }

  findSpousesOfMarriage(marriageId: MarriageId): Person[] {
    return this.findPersonsByIds(this.getSpousesIdsOfMarriage(marriageId));
  }

  getParentsIds(personId: PersonId): PersonId[] {
    return this.getSpousesIdsOfMarriage(
      this.findPersonById(personId)?.getParentMarriageId()
    );
  }

  findParents(personId: PersonId): Person[] {
    return this.findSpousesOfMarriage(
      this.findPersonById(personId)?.getParentMarriageId()
    );
  }

  getAdoptedParentsIds(personId: PersonId): PersonId[] {
    return this.getSpousesIdsOfMarriage(
      this.findPersonById(personId)?.getAdoptedParentMarriageId()
    );
  }

  findAdoptedParents(personId: PersonId): Person[] {
    return this.findSpousesOfMarriage(
      this.findPersonById(personId)?.getAdoptedParentMarriageId()
    );
  }

  getAllParentsIds(personId: PersonId): PersonId[] {
    return [
      ...this.getParentsIds(personId),
      ...this.getAdoptedParentsIds(personId),
    ];
  }

  getChildrenIdsOfMarriage(marriageId: MarriageId): PersonId[] {
    const marriage = this.findMarriageById(marriageId);
    return marriage?.raw().childrenIds ?? [];
  }

  findChildrenOfMarriage(marriageId: MarriageId): Person[] {
    return this.findPersonsByIds(this.getChildrenIdsOfMarriage(marriageId));
  }

  getAdoptedChildrenIdsOfMarriage(marriageId: MarriageId): PersonId[] {
    const marriage = this.findMarriageById(marriageId);
    return marriage?.raw().adoptedChildrenIds ?? [];
  }

  findAdoptedChildrenOfMarriage(marriageId: MarriageId): Person[] {
    return this.findPersonsByIds(
      this.getAdoptedChildrenIdsOfMarriage(marriageId)
    );
  }

  getAllChildrenIdsOfMarriage(marriageId: MarriageId): PersonId[] {
    return [
      ...this.getChildrenIdsOfMarriage(marriageId),
      ...this.getAdoptedChildrenIdsOfMarriage(marriageId),
    ];
  }

  getChildrenIds(personId: PersonId): PersonId[] {
    const marriageIds = this.getMarriageIds(personId);
    return marriageIds.flatMap((id) => this.getChildrenIdsOfMarriage(id));
  }

  findChildren(personId: PersonId): Person[] {
    return this.findPersonsByIds(this.getChildrenIds(personId));
  }

  hasChildren(marriageId: MarriageId): boolean {
    return this.findChildrenOfMarriage(marriageId).length !== 0;
  }

  getAdoptedChildrenIds(personId: PersonId): PersonId[] {
    const marriageIds = this.getMarriageIds(personId);
    return marriageIds.flatMap((id) =>
      this.getAdoptedChildrenIdsOfMarriage(id)
    );
  }

  findAdoptedChildren(personId: PersonId): Person[] {
    return this.findPersonsByIds(this.getAdoptedChildrenIds(personId));
  }

  hasAdoptedChildren(marriageId: MarriageId): boolean {
    return this.findAdoptedChildrenOfMarriage(marriageId).length !== 0;
  }

  normalizeId() {
    for (const m of this.marriageMap.values()) {
      const sortedChildren = this.findChildrenOfMarriage(m.getId()).sort(
        (c1, c2) => c2.getCenterX() - c1.getCenterX()
      );
      m.raw().childrenIds = sortedChildren.map((c) => c.getId());
    }

    const personRules = new Map<number, number>(
      Array.from(this.personMap.keys()).map((oldIdx, newIdx) => [
        oldIdx,
        newIdx,
      ])
    );
    const marriageRules = new Map<number, number>(
      Array.from(this.marriageMap.keys()).map((oldIdx, newIdx) => [
        oldIdx,
        newIdx,
      ])
    );
    const spotRules = new Map<number, number>(
      Array.from(this.spotList.keys()).map((oldIdx, newIdx) => [oldIdx, newIdx])
    );

    this.personMap = new Map<number, Person>(
      Array.from(this.personMap.values()).map((p) => {
        p.normaliseId(personRules, marriageRules);
        return [p.getId(), p];
      })
    );
    this.marriageMap = new Map<number, Marriage>(
      Array.from(this.marriageMap.values()).map((m) => {
        m.normaliseId(personRules, marriageRules);
        return [m.getId(), m];
      })
    );
    this.spotList = new Map<number, Spot>(
      Array.from(this.spotList.values()).map((s) => {
        s.normaliseId(spotRules);
        return [s.getId(), s];
      })
    );
    this.nextPersonId = this.personMap.size;
    this.nextMarriageId = this.marriageMap.size;
  }

  getPersonData(): PersonData[] {
    return Array.from(this.personMap.values()).map((p) => p.raw());
  }

  getMarriageData(): MarriageData[] {
    return Array.from(this.marriageMap.values()).map((m) => m.raw());
  }

  getSpotData(): SpotData[] {
    return Array.from(this.spotList.values()).map((s) => s.getData());
  }

  getTitle(): string {
    return this.title;
  }

  setTitle(newTitle: string) {
    this.title = newTitle;
  }

  nextPersonIdCountUp() {
    this.nextPersonId++;
  }

  nextMarriageIdCountUp() {
    this.nextMarriageId++;
  }

  nextSpotIdCountUp() {
    this.nextSpotId++;
  }

  deletePersonOfMarriage(mId: number, pId: number) {
    const marriage = this.findMarriageById(mId);
    marriage?.deleteSprouse(pId);
    marriage?.deleteChild(pId);
    marriage?.deleteAdoptedChild(pId);
  }

  deleteMarriageIfNoSense(marriageId: MarriageId) {
    if (marriageId === undefined) return;
    const spouses = this.findSpousesOfMarriage(marriageId);
    const children = this.findChildrenOfMarriage(marriageId);
    const adoptedChildren = this.findAdoptedChildrenOfMarriage(marriageId);
    if (spouses.length + children.length + adoptedChildren.length === 1) {
      if (spouses.length === 1) {
        spouses[0].deleteMarriageId(marriageId);
      } else if (children.length === 1) {
        children[0].setParentMarriageId(undefined);
      } else {
        adoptedChildren[0].setAdoptedParentMarriageId(undefined);
      }
      this.marriageMap.delete(marriageId);
    }
  }

  deletePerson(person: Person) {
    for (const id of person.getMarriageIds()) {
      this.deletePersonOfMarriage(id, person.getId());
      this.deleteMarriageIfNoSense(id);
    }
    const parentMarriageId = person.getParentMarriageId();
    if (parentMarriageId !== undefined) {
      const parentMarriage = this.findMarriageById(parentMarriageId);
      parentMarriage?.deleteChild(person.getId());
      this.deleteMarriageIfNoSense(parentMarriage?.getId());
    }
    this.personMap.delete(person.getId());
  }

  getSelectedPerson(position: Position): Person | undefined {
    for (const [, person] of this.personMap) {
      if (
        position.y > person.getTopY() &&
        position.y < person.getBottomY() &&
        position.x > person.getLeftX() &&
        position.x < person.getRightX()
      ) {
        return person;
      }
    }
  }

  load(familyTree: FamilyTree) {
    this.personMap = new Map(
      Array.from(familyTree.personMap).map(
        (p) => [p[0], p[1].clone()] as [number, Person]
      )
    );
    this.marriageMap = new Map(
      Array.from(familyTree.marriageMap).map(
        (m) => [m[0], m[1].clone()] as [number, Marriage]
      )
    );
    this.spotList = new Map(
      Array.from(familyTree.spotList).map(
        (m) => [m[0], m[1].clone()] as [number, Spot]
      )
    );
    this.title = familyTree.title;
    this.nextPersonId = familyTree.nextPersonId;
    this.nextMarriageId = familyTree.nextMarriageId;
    this.topY = familyTree.topY;
    this.bottomY = familyTree.bottomY;
    this.leftX = familyTree.leftX;
    this.rightX = familyTree.rightX;
  }

  makeSpouses(person1: Person, person2: Person): boolean {
    for (const m of this.findMarriages(person1.getId())) {
      const spouses = this.findSpousesOfMarriage(m.getId());
      if (spouses.includes(person2)) {
        return false;
      }
    }
    const newMarriage = new Marriage({
      id: this.nextMarriageId,
      parentsIds: [person1.getId(), person2.getId()],
      childrenIds: [],
      adoptedChildrenIds: [],
    });
    person1.addMarriageId(newMarriage.getId());
    person2.addMarriageId(newMarriage.getId());
    this.marriageMap.set(newMarriage.getId(), newMarriage);
    this.nextMarriageId++;
    return true;
  }

  getAllDescents(person: Person): Person[] {
    const descents: Person[] = [];
    const queue = new Queue<number>();
    queue.push(person.getId());

    const checked = new Set<number>();
    checked.add(person.getId());

    while (queue.isEmpty() === false) {
      const parentId = queue.front();
      queue.pop();

      for (const childId of this.getChildrenIds(parentId)) {
        if (childId === undefined || checked.has(childId)) continue;
        const child = this.findPersonById(childId);
        if (child === undefined) continue;
        checked.add(childId);
        queue.push(childId);
        descents.push(child);
      }

      for (const adoptedChildId of this.getAdoptedChildrenIds(parentId)) {
        if (adoptedChildId === undefined || checked.has(adoptedChildId))
          continue;
        const adoptedChild = this.findPersonById(adoptedChildId);
        if (adoptedChild === undefined) continue;
        checked.add(adoptedChildId);
        queue.push(adoptedChildId);
        descents.push(adoptedChild);
      }
    }
    return descents;
  }

  isAscendant(elder: Person, young: Person) {
    const queue = new Queue<number>();

    queue.push(young.getId());

    const checked = new Set<number>();
    checked.add(young.getId());

    const target: number[] = (
      elder.getParentMarriageId() !== undefined
        ? this.getAllChildrenIdsOfMarriage(elder.getParentMarriageId()).filter(
            (p): p is number => p !== undefined
          )
        : [elder.getId()]
    ).concat(
      elder.getAdoptedParentMarriageId() !== undefined
        ? this.getAllChildrenIdsOfMarriage(
            elder.getAdoptedParentMarriageId()
          ).filter((p): p is number => p !== undefined)
        : []
    );

    while (queue.isEmpty() === false) {
      const child = queue.front();
      queue.pop();

      if (target.includes(child)) {
        return true;
      }

      for (const parent of this.getAllParentsIds(child)) {
        if (parent === undefined || checked.has(parent)) continue;
        checked.add(parent);
        queue.push(parent);
      }
    }
  }

  makeChild(parent: Person, child: Person): boolean {
    if (this.isAscendant(child, parent)) return false;
    const adoptedParentMarriage = this.findAdoptedParentMarriage(child.getId());
    if (adoptedParentMarriage?.getParentsIds().includes(parent.getId()))
      return false;

    const parentMarriage = this.findParentsMarriage(child.getId());
    if (parentMarriage === undefined) {
      for (const m of this.findMarriages(parent.getId())) {
        if (m.getParentsIds().length === 1) {
          m.addChild(child.getId());
          child.setParentMarriageId(m.getId());
          return true;
        }
      }
      const newMarriage = new Marriage({
        id: this.nextMarriageId,
        childrenIds: [child.getId()],
        parentsIds: [parent.getId()],
        adoptedChildrenIds: [],
      });
      child.setParentMarriageId(this.nextMarriageId);
      parent.addMarriageId(this.nextMarriageId);
      this.marriageMap.set(this.nextMarriageId, newMarriage);
      this.nextMarriageId++;
      return true;
    } else {
      const parentSprouse = [...parentMarriage.getParentsIds()];
      parentSprouse.push(parent.getId());
      for (const marriage of this.findMarriages(parent.getId())) {
        const sprouses = marriage.getParentsIds();
        if (sameElementList(parentSprouse, sprouses)) {
          for (const c of this.findChildrenOfMarriage(parentMarriage.getId())) {
            marriage.addChild(c.getId());
            c.setParentMarriageId(marriage.getId());
          }
          for (const c of this.findAdoptedChildrenOfMarriage(
            parentMarriage.getId()
          )) {
            marriage.addAdoptedChild(c.getId());
            c.setAdoptedParentMarriageId(marriage.getId());
          }
          this.marriageMap.delete(parentMarriage.getId());
          return true;
        }
      }
      parentMarriage.addSprouse(parent.getId());
      parent.addMarriageId(parentMarriage.getId());
      return true;
    }
  }

  makeAdoptedChild(parent: Person, child: Person): boolean {
    if (this.isAscendant(child, parent)) return false;
    const parentMarriage = this.findParentsMarriage(child.getId());
    if (parentMarriage?.getParentsIds().includes(parent.getId())) return false;

    const adoptedParentMarriage = this.findAdoptedParentMarriage(child.getId());
    if (adoptedParentMarriage === undefined) {
      for (const m of this.findMarriages(parent.getId())) {
        if (m.getParentsIds().length === 1) {
          m.addAdoptedChild(child.getId());
          child.setAdoptedParentMarriageId(m.getId());
          return true;
        }
      }
      const newMarriage = new Marriage({
        id: this.nextMarriageId,
        childrenIds: [],
        parentsIds: [parent.getId()],
        adoptedChildrenIds: [child.getId()],
      });
      child.setAdoptedParentMarriageId(this.nextMarriageId);
      parent.addMarriageId(this.nextMarriageId);
      this.marriageMap.set(this.nextMarriageId, newMarriage);
      this.nextMarriageId++;
      return true;
    } else {
      const parentSprouse = [...adoptedParentMarriage.getParentsIds()];
      parentSprouse.push(parent.getId());
      for (const marriage of this.findMarriages(parent.getId())) {
        const sprouses = marriage.getParentsIds();
        if (sameElementList(parentSprouse, sprouses)) {
          for (const c of this.findAdoptedChildrenOfMarriage(
            adoptedParentMarriage.getId()
          )) {
            marriage.addAdoptedChild(c.getId());
            c.setAdoptedParentMarriageId(marriage.getId());
          }
          for (const c of this.findChildrenOfMarriage(
            adoptedParentMarriage.getId()
          )) {
            marriage.addChild(c.getId());
            c.setParentMarriageId(marriage.getId());
          }
          this.marriageMap.delete(adoptedParentMarriage.getId());
          return true;
        }
      }
      adoptedParentMarriage.addSprouse(parent.getId());
      parent.addMarriageId(adoptedParentMarriage.getId());
      return true;
    }
  }

  makeBrother(person1: Person, person2: Person): boolean {
    if (
      this.isAscendant(person1, person2) ||
      this.isAscendant(person2, person1)
    )
      return false;
    const mid1 = person1.getParentMarriageId();
    const mid2 = person2.getParentMarriageId();
    if (mid1 === undefined) {
      if (mid2 === undefined) {
        const marriage = new Marriage({
          id: this.nextMarriageId,
          childrenIds: [person1.getId(), person2.getId()],
          parentsIds: [],
          adoptedChildrenIds: [],
        });
        this.marriageMap.set(this.nextMarriageId, marriage);
        person1.setParentMarriageId(this.nextMarriageId);
        person2.setParentMarriageId(this.nextMarriageId);
        this.nextMarriageId++;
      } else {
        this.findMarriageById(person2.getParentMarriageId())?.addChild(
          person1.getId()
        );
        person1.setParentMarriageId(mid2);
      }
    } else {
      if (person2.getParentMarriageId() === undefined) {
        this.findMarriageById(person1.getParentMarriageId())?.addChild(
          person2.getId()
        );
        person2.setParentMarriageId(mid1);
      } else {
        const parents = new Set(
          [
            ...this.getSpousesIdsOfMarriage(mid1),
            ...this.getSpousesIdsOfMarriage(mid2),
          ].filter((id): id is number => id !== undefined)
        );
        if (parents.size <= 2) {
          const marriage = this.findMarriageById(mid1);
          marriage?.setSprouses(Array.from(parents));
          for (const parent of this.findParents(person2.getId())) {
            parent.addMarriageId(mid1);
            parent.deleteMarriageId(mid2);
          }
          for (const child of this.findChildrenOfMarriage(mid2)) {
            child.setParentMarriageId(mid1);
            marriage?.addChild(child.getId());
          }
          for (const adoptedChild of this.findAdoptedChildren(mid2)) {
            adoptedChild.setAdoptedParentMarriageId(mid1);
            marriage?.addAdoptedChild(adoptedChild.getId());
          }
          this.marriageMap.delete(mid2!);
        }
      }
    }
    return true;
  }

  deleteRelation(person1: Person, person2: Person): boolean {
    for (const marriage of this.findMarriages(person1.getId())) {
      if (
        sameElementList(marriage.getParentsIds(), [
          person1.getId(),
          person2.getId(),
        ])
      ) {
        this.deleteSprouse(person1, person2, marriage);
        return true;
      }
    }

    if (person1.getParentMarriageId() !== undefined) {
      const marriage = this.findMarriageById(person1.getParentMarriageId());
      if (marriage?.getChildrenId().includes(person2.getId())) {
        this.deleteBrother(person1, person2, marriage);
        return true;
      } else if (marriage?.getParentsIds().includes(person2.getId())) {
        this.deleteParent(person1, person2, marriage);
        return true;
      }
    }

    if (person1.getAdoptedParentMarriageId() !== undefined) {
      const marriage = this.findMarriageById(
        person1.getAdoptedParentMarriageId()
      );
      if (marriage?.getAdoptedChildrenId().includes(person2.getId())) {
        this.deleteBrother(person1, person2, marriage);
        return true;
      } else if (marriage?.getParentsIds().includes(person2.getId())) {
        this.deleteAdoptedParent(person1, person2, marriage);
        return true;
      }
    }

    if (person2.getParentMarriageId() !== undefined) {
      const marriage = this.findMarriageById(person2.getParentMarriageId());
      if (marriage?.getParentsIds().includes(person1.getId())) {
        this.deleteChild(person1, person2, marriage);
        return true;
      }
    }

    if (person2.getAdoptedParentMarriageId() !== undefined) {
      const marriage = this.findMarriageById(
        person2.getAdoptedParentMarriageId()
      );
      if (marriage?.getParentsIds().includes(person1.getId())) {
        this.deleteAdoptedChild(person1, person2, marriage);
        return true;
      }
    }
    return false;
  }

  deleteSprouse(person1: Person, person2: Person, marriage: Marriage) {
    marriage.deleteSprouse(person2.getId());
    person2.deleteMarriageId(marriage.getId());
    this.deleteMarriageIfNoSense(marriage.getId());

    if (marriage.getAllChildrenId().length === 0) {
      person1.deleteMarriageId(marriage.getId());
      this.marriageMap.delete(marriage.getId());
    }
  }

  deleteBrother(person1: Person, person2: Person, marriage: Marriage) {
    if (person2.getParentMarriageId() === marriage.getId()) {
      person2.setParentMarriageId(undefined);
      marriage.deleteChild(person2.getId());
    } else {
      person2.setAdoptedParentMarriageId(undefined);
      marriage.deleteAdoptedChild(person2.getId());
    }
    if (
      marriage.getParentsIds().length + marriage.getAllChildrenId().length ===
      1
    ) {
      person1.setParentMarriageId(undefined);
      this.marriageMap.delete(marriage.getId());
    }
  }

  deleteChild(parent: Person, child: Person, marriage: Marriage) {
    child.setParentMarriageId(undefined);
    marriage.deleteChild(child.getId());
    if (
      marriage.getParentsIds().length + marriage.getAllChildrenId().length ===
      1
    ) {
      parent.deleteMarriageId(marriage.getId());
      this.marriageMap.delete(marriage.getId());
    }
  }

  deleteAdoptedChild(parent: Person, child: Person, marriage: Marriage) {
    child.setAdoptedParentMarriageId(undefined);
    marriage.deleteAdoptedChild(child.getId());
    if (
      marriage.getParentsIds().length + marriage.getAllChildrenId().length ===
      1
    ) {
      parent.deleteMarriageId(marriage.getId());
      this.marriageMap.delete(marriage.getId());
    }
  }

  deleteParent(child: Person, parent: Person, marriage: Marriage) {
    parent.deleteMarriageId(marriage.getId());
    marriage.deleteSprouse(parent.getId());
    if (
      marriage.getParentsIds().length + marriage.getAllChildrenId().length ===
      1
    ) {
      child.setParentMarriageId(undefined);
      this.marriageMap.delete(marriage.getId());
    }
  }

  deleteAdoptedParent(child: Person, parent: Person, marriage: Marriage) {
    parent.deleteMarriageId(marriage.getId());
    marriage.deleteSprouse(parent.getId());
    if (
      marriage.getParentsIds().length + marriage.getAllChildrenId().length ===
      1
    ) {
      child.setAdoptedParentMarriageId(undefined);
      this.marriageMap.delete(marriage.getId());
    }
  }

  getSpots() {
    return this.spotList;
  }

  addSpot(spot: Spot) {
    this.spotList.set(spot.getId(), spot);
  }

  deleteSpot(spot: Spot | number) {
    if (spot instanceof Spot) {
      this.spotList.delete(spot.getId());
    } else {
      this.spotList.delete(spot);
    }
  }

  getSpotAt(unscaledPosition: Position, scale: number): Spot | undefined {
    for (const [, spot] of this.spotList) {
      if (spot.isContained(unscaledPosition, scale)) {
        return spot;
      }
    }
    return undefined;
  }

  getNextSpotId() {
    return this.nextSpotId;
  }
}
