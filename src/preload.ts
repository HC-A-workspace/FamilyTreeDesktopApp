import { contextBridge, ipcRenderer } from "electron";
import { getEmptyPersonData, PersonData } from "./model/Person";
import { FamilyTreeSetting } from "./model/FamilyTree";

console.log("preloaded!");

contextBridge.exposeInMainWorld("electronAPI", {
  onChangeColor: (callback: (color: string) => void) =>
    ipcRenderer.on("change-color", (_, color) => callback(color)),
  onLoadData: (callback: (path: string, content: string) => void) =>
    ipcRenderer.on("load-data", (_, [path, content]) =>
      callback(path, content)
    ),
  onLoadAndAddData: (callback: (path: string, content: string) => void) =>
    ipcRenderer.on("load-and-add-data", (_, [path, content]) =>
      callback(path, content)
    ),
  onOpenEditor: (personData: PersonData) =>
    ipcRenderer.invoke("open-editor", personData),
  onLoadName: (callback: (name: string) => void) =>
    ipcRenderer.on("editor-person", (_, name) => callback(name)),
  onLoadDataOnEditor: (callback: (personData: PersonData) => void) =>
    ipcRenderer.on("load-person-on-editor", (_, personData) =>
      callback(personData)
    ),
  onEditorClose: () => ipcRenderer.invoke("close-editor"),
  onSendDataFromEditor: (personData: PersonData) =>
    ipcRenderer.send("send-persondata-from-editor", personData),
  onSendDataToMain: (callback: (personData: PersonData) => void) =>
    ipcRenderer.on("send-persondata-to-main", (_, personData) =>
      callback(personData)
    ),
  onSaveFamilyTree: (callback: () => void) =>
    ipcRenderer.on("save-familyTree", (_) => callback()),
  onUndo: (callback: () => void) => ipcRenderer.on("undo", (_) => callback()),
  onRedo: (callback: () => void) => ipcRenderer.on("redo", (_) => callback()),
  onCreateNewPerson: (callback: () => void) =>
    ipcRenderer.on("create-person", (_) => callback()),
  onMoveWithDescents: (callback: (isMovingWithDescents: boolean) => void) =>
    ipcRenderer.on("move-with-descents", (_, flag) => callback(flag)),
  onAllClear: (callback: () => void) =>
    ipcRenderer.on("all-clear", (_) => callback()),
  onShowGrid: (callback: (isShowingGrid: boolean) => void) =>
    ipcRenderer.on("show-grids", (_, flag) => callback(flag)),
  onShowBywords: (callback: (isShowingBywords: boolean) => void) =>
    ipcRenderer.on("show-bywords", (_, flag) => callback(flag)),
  onShowYears: (callback: (isShowingYears: boolean) => void) =>
    ipcRenderer.on("show-years", (_, flag) => callback(flag)),
  onIsVertical: (callback: (isVertical: boolean) => void) =>
    ipcRenderer.on("is-vertical", (_, flag) => callback(flag)),
  onOpenSettingEditor: (callback: () => void) => {
    ipcRenderer.on("open-setting-editor", callback);
  },
  openSettingEditor: () => ipcRenderer.invoke("open-settingEditor"),
  onSendSettingFromSettingEditor: (setting: FamilyTreeSetting) =>
    ipcRenderer.send("send-setting-from-editor", setting),
  onSendSettingToMain: (callback: (setting: FamilyTreeSetting) => void) =>
    ipcRenderer.on("send-setting-to-main", (_, setting) => callback(setting)),
});
