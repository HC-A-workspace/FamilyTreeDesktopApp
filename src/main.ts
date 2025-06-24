import path from "node:path";
import fs from "fs";
import { BrowserWindow, Menu, app, dialog, ipcMain } from "electron";
import { PersonData } from "./model/Person";
import { FamilyTreeSetting } from "./model/FamilyTree";

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // mainWindow.webContents.openDevTools();

  const menu = Menu.buildFromTemplate([
    {
      label: "ファイル",
      submenu: [
        {
          label: "保存",
          accelerator: "Ctrl+S",
          click: () => mainWindow.webContents.send("save-familyTree"),
        },
        {
          type: "separator",
        },
        {
          label: "読み込み",
          accelerator: "Ctrl+O",
          click: async () => {
            return dialog
              .showOpenDialog(mainWindow, {
                properties: ["openFile"],
                filters: [{ name: "data", extensions: ["json", "txt"] }],
              })
              .then((result) => {
                if (result.canceled || result.filePaths.length === 0) return;
                const content = fs.readFileSync(result.filePaths[0], "utf-8");
                mainWindow.webContents.send("load-data", [
                  result.filePaths[0],
                  content,
                ]);
              })
              .catch((err) => console.log(`Error: ${err}`));
          },
        },
        {
          label: "読み込んで追加",
          accelerator: "Ctrl+Shift+O",
          click: async () => {
            return dialog
              .showOpenDialog(mainWindow, {
                properties: ["openFile"],
                filters: [{ name: "data", extensions: ["json", "txt"] }],
              })
              .then((result) => {
                if (result.canceled || result.filePaths.length === 0) return;
                const content = fs.readFileSync(result.filePaths[0], "utf-8");
                mainWindow.webContents.send("load-and-add-data", [
                  result.filePaths[0],
                  content,
                ]);
              })
              .catch((err) => console.log(`Error: ${err}`));
          },
        },
        {
          label: "閉じる",
          accelerator: "Ctrl+Q",
          click: () => mainWindow.close(),
        },
      ],
    },
    {
      label: "編集",
      submenu: [
        {
          label: "戻る",
          accelerator: "Ctrl+Z",
          click: () => mainWindow.webContents.send("undo"),
        },
        {
          label: "進む",
          accelerator: "Ctrl+Y",
          click: () => mainWindow.webContents.send("redo"),
        },
        {
          type: "separator",
        },
        {
          label: "人物を新規作成",
          accelerator: "Ctrl+N",
          click: () => mainWindow.webContents.send("create-person"),
        },
        {
          type: "separator",
        },
        {
          label: "子孫も移動",
          type: "checkbox",
          accelerator: "Ctrl+H",
          click: (e) => {
            mainWindow.webContents.send("move-with-descents", e.checked);
          },
        },
        {
          type: "separator",
        },
        {
          label: "全て消去",
          accelerator: "Ctrl+D",
          click: () => mainWindow.webContents.send("all-clear"),
        },
      ],
    },
    {
      label: "外観",
      submenu: [
        {
          label: "格子を表示",
          type: "checkbox",
          checked: true,
          accelerator: "Ctrl+G",
          click: (e) => {
            mainWindow.webContents.send("show-grids", e.checked);
          },
        },
        {
          type: "separator",
        },
        {
          label: "生没年を表示",
          type: "checkbox",
          checked: true,
          accelerator: "Ctrl+B",

          click: (e) => {
            mainWindow.webContents.send("show-years", e.checked);
          },
        },
        {
          label: "称号を表示",
          type: "checkbox",
          checked: true,
          accelerator: "Ctrl+T",
          click: (e) => {
            mainWindow.webContents.send("show-bywords", e.checked);
          },
        },
        {
          label: "縦書き",
          type: "checkbox",
          checked: true,
          accelerator: "Ctrl+Shift+V",
          click: (e) => {
            mainWindow.webContents.send("is-vertical", e.checked);
          },
        },
        {
          label: "設定",
          accelerator: "Ctrl+,",
          click: () => {
            mainWindow.webContents.send("open-setting-editor");
          },
        },
      ],
    },
  ]);

  mainWindow.setMenu(menu);

  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
    hash: "/main",
  });

  ipcMain.handle("open-editor", (_, personData: PersonData) => {
    const editorWindow = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
    // editorWindow.webContents.openDevTools();
    editorWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
      hash: "/editor",
    });
    editorWindow.webContents.once("did-finish-load", () => {
      editorWindow.webContents.send("load-person-on-editor", personData);
    });
    editorWindow.setMenu(null);
  });

  ipcMain.on("send-persondata-from-editor", (_, personData: PersonData) => {
    mainWindow.webContents.send("send-persondata-to-main", personData);
  });

  ipcMain.handle("close-editor", (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (win) win.close();
  });
  ipcMain.handle("open-settingEditor", (_, setting) => {
    const settingEditorWindow = new BrowserWindow({
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
      width: 350,
      height: 590,
    });
    settingEditorWindow.loadFile(path.join(__dirname, "../dist/index.html"), {
      hash: "/settingEditor",
    });
    settingEditorWindow.setMenu(null);
    settingEditorWindow.webContents.once("did-finish-load", () => {
      settingEditorWindow.webContents.send(
        "send-setting-to-setting-editor",
        setting
      );
    });
    // settingEditorWindow.webContents.openDevTools();
  });

  ipcMain.on("send-setting-from-editor", (_, setting: FamilyTreeSetting) => {
    mainWindow.webContents.send("send-setting-to-main", setting);
  });

  ipcMain.handle("close-editor", (e) => {
    const win = BrowserWindow.fromWebContents(e.sender);
    if (win) win.close();
  });
});

app.once("window-all-closed", () => app.quit());
