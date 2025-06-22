export class UndoRedoList<State> {
  private maxSize: number;
  private saveList: State[];
  private position: number;
  private tail: number;
  private head: number;
  private isReachedMax: boolean;

  private updateState: (oldState: State, newState: State) => void;

  constructor(
    maxSize: number,
    createInstance: () => State,
    update: (oldState: State, newState: State) => void
  ) {
    this.maxSize = maxSize;
    this.saveList = [];
    for (let i = 0; i < maxSize; i++) {
      this.saveList.push(createInstance());
    }
    this.position = 0;
    this.tail = 0;
    this.head = 0;
    this.isReachedMax = false;
    this.updateState = update;
  }

  public save(state: State) {
    this.position++;
    if (this.position === this.maxSize) {
      this.position = 0;
      this.isReachedMax = true;
    }
    this.updateState(this.saveList[this.position], state);
    this.head = this.position;
    if (this.isReachedMax) {
      this.tail = this.position + 1;
      this.tail = this.position + 1 < this.maxSize ? this.position + 1 : 0;
    }
  }

  public clear() {
    this.position = 0;
    this.head = 0;
    this.tail = 0;
    this.isReachedMax = false;
  }

  public canRedo() {
    return this.position !== this.head;
  }

  public getRedoState() {
    this.position++;
    return this.saveList[this.position];
  }

  public canUndo() {
    return this.position !== this.tail;
  }

  public getUndoState() {
    this.position--;
    return this.saveList[this.position];
  }
}
