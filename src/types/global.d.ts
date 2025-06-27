import { FamilyTree, FamilyTreeSetting } from "../model/FamilyTree";
import { ProfileData, TagData } from "../model/FundamentalData";
import { Person, PersonData } from "../model/Person";

export {};

declare global {
  interface Window {
    electronAPI?: {
      onLoadData: (callback: (path: string, content: string) => void) => void;
      onLoadAndAddData: (
        callback: (path: string, content: string) => void
      ) => void;
      onOpenEditor: (data: { personData: PersonData; tags: string[] }) => void;
      onLoadDataOnEditor: (
        callback: (data: { personData: PersonData; tags: string[] }) => void
      ) => void;
      onEditorClose: () => void;
      onSendDataFromEditor: (data: {
        personData: PersonData;
        newTags: string[];
      }) => void;
      onSendDataToMain: (
        callback: (data: { personData: PersonData; newTags: string[] }) => void
      ) => void;
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
      onOpenSettingEditor: (callback: () => void) => void;
      openSettingEditor: (setting: FamilyTreeSetting) => void;
      onSendSettingFromSettingEditor: (setting: FamilyTreeSetting) => void;
      onSendSettingToMain: (
        callback: (setting: FamilyTreeSetting) => void
      ) => void;
      onSendSettingToSettingEditor: (
        callback: (setting: FamilyTreeSetting) => void
      ) => void;
      onLoadDataOnProfile: (callback: (profile: ProfileData) => void) => void;
      onOpenProfile: (profile: ProfileData) => void;
    };
  }
}
