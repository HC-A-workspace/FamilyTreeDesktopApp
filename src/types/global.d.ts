import { PersonData } from "../model/Person";

export {};

declare global {
  interface Window {
    electronAPI?: {
      onLoadData: (callback: (path: string, content: string) => void) => void;
      onLoadAndAddData: (
        callback: (path: string, content: string) => void
      ) => void;
      onOpenEditor: (personData: PersonData) => void;
      onLoadDataOnEditor: (callback: (personData: PersonData) => void) => void;
      onEditorClose: () => void;
      onSendDataFromEditor: (personData: PersonData) => void;
      onSendDataToMain: (callback: (personData: PersonData) => void) => void;
      onSaveFamilyTree: (callback: () => void) => void;
      onUndo: (callback: () => void) => void;
      onRedo: (callback: () => void) => void;
      onCreateNewPerson: (callback: () => void) => void;
      onMoveWithDescents: (
        callback: (isMovingWithDescents: boolean) => void
      ) => void;
      onAllClear: (callback: () => void) => void;
      onShowGrid: (callback: (isShowingGrid: boolean) => void) => void;
      onShowBywords: (callback: (isShowingBywords: boolean) => void) => void;
      onShowYears: (callback: (isShowingYears: boolean) => void) => void;
      onIsVertical: (callback: (isVertical: boolean) => void) => void;
    };
  }
}
