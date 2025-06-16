export interface MarriageData {
  id: number;
  parentsIds: number[];
  childrenIds: number[];
  adoptedChildrenIds: number[];
}

export function MarriageDataClone(data: MarriageData): MarriageData {
  return {
    id: data.id,
    parentsIds: [...data.parentsIds],
    childrenIds: [...data.childrenIds],
    adoptedChildrenIds: [...data.adoptedChildrenIds],
  };
}

export class Marriage {
  private data: MarriageData;

  constructor(data: MarriageData) {
    this.data = MarriageDataClone(data);
  }

  clone(): Marriage {
    return new Marriage(this.data);
  }

  public raw(): MarriageData {
    return this.data;
  }

  public getId(): number {
    return this.data.id;
  }

  setId(id: number) {
    this.data.id = id;
  }

  getParentsIds() {
    return this.data.parentsIds;
  }

  addSprouse(sprouseId: number | undefined) {
    if (
      sprouseId === undefined ||
      this.data.parentsIds.includes(sprouseId) ||
      this.data.parentsIds.length === 2
    )
      return;
    this.data.parentsIds.push(sprouseId);
  }

  deleteSprouse(sprouseId: number | undefined) {
    if (sprouseId === undefined) return;
    this.data.parentsIds = this.data.parentsIds.filter((p) => p !== sprouseId);
  }

  setSprouses(sprouses: number[]) {
    this.data.parentsIds = sprouses;
  }

  addChild(id: number) {
    if (this.data.childrenIds.includes(id) === false) {
      this.data.childrenIds.push(id);
    }
  }

  addAdoptedChild(id: number) {
    if (this.data.adoptedChildrenIds.includes(id) === false) {
      this.data.adoptedChildrenIds.push(id);
    }
  }

  deleteChild(id: number) {
    this.data.childrenIds = this.data.childrenIds.filter((p) => p !== id);
  }

  deleteAdoptedChild(id: number) {
    this.data.adoptedChildrenIds = this.data.adoptedChildrenIds.filter(
      (p) => p !== id
    );
  }

  getChildrenId() {
    return this.data.childrenIds;
  }

  getAdoptedChildrenId() {
    return this.data.adoptedChildrenIds;
  }

  getAllChildrenId() {
    return [...this.data.childrenIds, ...this.data.adoptedChildrenIds];
  }

  public normaliseId(
    personRules: Map<number, number>,
    marriageRules: Map<number, number>
  ) {
    const parentsIds = this.data.parentsIds;
    const childrenIds = this.data.childrenIds;
    const adoptedChildrenIds = this.data.adoptedChildrenIds;

    this.data.id = marriageRules.get(this.getId()) ?? -1;
    this.data.parentsIds = parentsIds
      .map((p) => personRules.get(p))
      .filter((p): p is number => p !== undefined);
    this.data.childrenIds = childrenIds
      .map((p) => personRules.get(p))
      .filter((p): p is number => p !== undefined);
    this.data.adoptedChildrenIds = adoptedChildrenIds
      .map((p) => personRules.get(p))
      .filter((p): p is number => p != undefined);
  }

  public eraseDegeneracy() {
    this.data.childrenIds = Array.from(new Set(this.data.childrenIds));
    this.data.adoptedChildrenIds = Array.from(
      new Set(this.data.adoptedChildrenIds)
    );
  }

  public addOffset(offsetPersonId: number, offsetMarriageId: number) {
    this.data.id += offsetMarriageId;
    this.data.parentsIds = this.data.parentsIds.map(
      (id) => id + offsetPersonId
    );
    this.data.childrenIds = this.data.childrenIds.map(
      (id) => id + offsetPersonId
    );
    this.data.adoptedChildrenIds = this.data.adoptedChildrenIds.map(
      (id) => id + offsetPersonId
    );
  }
}
