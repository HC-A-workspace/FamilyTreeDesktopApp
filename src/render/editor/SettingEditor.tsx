import { useEffect, useState } from "react";
import { FamilyTreeSetting } from "../../model/FamilyTree";
import "./SettingEditor.css";

const SettingEditor: React.FC = () => {
  const [setting, setSetting] = useState<FamilyTreeSetting | undefined>(
    undefined
  );
  const [tab1, setTab1] = useState(1);
  const [tab2, setTab2] = useState(1);

  useEffect(() => {
    window.electronAPI?.onSendSettingToSettingEditor((setting) => {
      setSetting({
        ...setting,
        commonFont: { ...setting.commonFont },
        maleFont: { ...setting.maleFont },
        femaleFont: { ...setting.femaleFont },
        bywordsFont: { ...setting.bywordsFont },
        yearFont: { ...setting.yearFont },
        lineColors: [...setting.lineColors],
      });
    });
  }, []);

  const handleChangeColor = (color: string, idx: number) => {
    if (setting) {
      const newList = setting.lineColors;
      newList[idx] = color;
      setSetting({
        ...setting,
        lineColors: [...newList],
      });
    }
  };

  const handleDeleteColor = (idx: number) => {
    if (setting && setting.useColorList) {
      const newList = setting.lineColors;
      newList.splice(idx, 1);
      setSetting({
        ...setting,
        lineColors: [...newList],
      });
    }
  };

  const handleAddColor = () => {
    if (setting) {
      setSetting({
        ...setting,
        lineColors: [...setting.lineColors, "#000000"],
      });
    }
  };

  return (
    <div className="setting-editor">
      {setting !== undefined && (
        <div>
          <div id="tab">
            <input type="radio" checked={tab1 === 1} onChange={() => {}} />
            <label onClick={() => setTab1(1)}>全体</label>
            <div>
              <label id="checkbox-style">
                <input
                  type="checkbox"
                  checked={setting.showGrid}
                  onChange={(e) =>
                    setSetting({ ...setting, showGrid: e.target.checked })
                  }
                />
                格子を表示する
              </label>
              <label id="checkbox-style">
                <input
                  type="checkbox"
                  checked={setting.showSideYear}
                  onChange={(e) =>
                    setSetting({ ...setting, showSideYear: e.target.checked })
                  }
                />
                目盛りを表示する
              </label>
              <label id="checkbox-style">
                <input
                  type="checkbox"
                  checked={setting.isVertical}
                  onChange={(e) =>
                    setSetting({ ...setting, isVertical: e.target.checked })
                  }
                />
                縦書きで表示する
              </label>
              <div id="color-container-title">キャンバス</div>
              <div id="color-container">
                <label>背景色</label>
                <input
                  type="color"
                  value={setting.backgroundColor}
                  onChange={(e) => {
                    setSetting({
                      ...setting,
                      backgroundColor: e.target.value,
                    });
                  }}
                />
                <label>枠色</label>
                <input
                  type="color"
                  value={setting.borderColor}
                  onChange={(e) => {
                    setSetting({
                      ...setting,
                      borderColor: e.target.value,
                    });
                  }}
                />
              </div>
              <div id="color-container-title">名前</div>
              <div id="color-container">
                <label>背景色</label>
                <input
                  type="color"
                  value={setting.nameBackgroundColor}
                  onChange={(e) => {
                    setSetting({
                      ...setting,
                      nameBackgroundColor: e.target.value,
                    });
                  }}
                />
                <label>枠色</label>
                <input
                  type="color"
                  value={setting.nameBorderColor}
                  onChange={(e) => {
                    setSetting({
                      ...setting,
                      nameBorderColor: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <input type="radio" checked={tab1 === 2} onChange={() => {}} />
            <label onClick={() => setTab1(2)}>文字</label>
            <div>
              <div id="tab">
                <input type="radio" checked={tab2 === 1} onChange={() => {}} />
                <label onClick={() => setTab2(1)}>名前</label>
                <div>
                  <div id="font-container">
                    <div>
                      <input
                        id="font-size"
                        type="number"
                        value={setting.commonFont.size}
                        min={1}
                        onChange={(e) => {
                          const size = Number(e.target.value);
                          setSetting({
                            ...setting,
                            commonFont: { ...setting.commonFont, size },
                            maleFont: { ...setting.maleFont, size },
                            femaleFont: { ...setting.femaleFont, size },
                          });
                        }}
                      />
                      <label>px</label>
                    </div>
                    <select
                      value={setting.commonFont.family}
                      style={{
                        fontFamily: setting.commonFont.family,
                        width: "8em",
                        height: "2em",
                        fontSize: "1em",
                        padding: "0.1em 0.2em",
                      }}
                      onChange={(e) =>
                        setSetting({
                          ...setting,
                          commonFont: {
                            ...setting.commonFont,
                            family: e.target.value,
                          },
                          maleFont: {
                            ...setting.maleFont,
                            family: e.target.value,
                          },
                          femaleFont: {
                            ...setting.femaleFont,
                            family: e.target.value,
                          },
                        })
                      }
                    >
                      <option
                        value="Yu Mincho"
                        style={{ fontFamily: "Yu Mincho" }}
                      >
                        游明朝
                      </option>
                      <option
                        value="sans-serif"
                        style={{ fontFamily: "sans-serif" }}
                      >
                        サンセリフ
                      </option>
                      <option
                        value="MS PGothic"
                        style={{ fontFamily: "MS PGothic" }}
                      >
                        MSゴシック
                      </option>
                    </select>
                  </div>
                  <label id="checkbox-style">
                    <input
                      type="checkbox"
                      checked={setting.useCommonColor === false}
                      onChange={(e) =>
                        setSetting({
                          ...setting,
                          useCommonColor: e.target.checked === false,
                        })
                      }
                    />
                    性別で色を変える
                  </label>
                  <div id="font-container" hidden={setting.useCommonColor}>
                    {setting.useCommonColor && (
                      <>
                        <label>
                          共通：
                          <input
                            type="color"
                            value={setting.commonFont.color}
                            onChange={(e) =>
                              setSetting({
                                ...setting,
                                commonFont: {
                                  ...setting.commonFont,
                                  color: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                      </>
                    )}
                    {setting.useCommonColor === false && (
                      <>
                        <label>
                          男性：
                          <input
                            type="color"
                            value={setting.maleFont.color}
                            onChange={(e) =>
                              setSetting({
                                ...setting,
                                maleFont: {
                                  ...setting.maleFont,
                                  color: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                        <label>
                          女性：
                          <input
                            type="color"
                            value={setting.femaleFont.color}
                            onChange={(e) =>
                              setSetting({
                                ...setting,
                                femaleFont: {
                                  ...setting.femaleFont,
                                  color: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                        <label>
                          その他：
                          <input
                            type="color"
                            value={setting.commonFont.color}
                            onChange={(e) =>
                              setSetting({
                                ...setting,
                                commonFont: {
                                  ...setting.commonFont,
                                  color: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
                <input type="radio" checked={tab2 === 2} onChange={() => {}} />
                <label onClick={() => setTab2(2)}>称号</label>
                <div>
                  <label id="checkbox-style">
                    <input
                      type="checkbox"
                      checked={setting.showBywords}
                      onChange={(e) =>
                        setSetting({
                          ...setting,
                          showBywords: e.target.checked,
                        })
                      }
                    />
                    称号を表示する
                  </label>
                  <div id="font-container">
                    <div>
                      <input
                        id="font-size"
                        type="number"
                        value={setting.bywordsFont.size}
                        min={1}
                        disabled={setting.showBywords === false}
                        onChange={(e) => {
                          const size = Number(e.target.value);
                          setSetting({
                            ...setting,
                            bywordsFont: { ...setting.bywordsFont, size },
                          });
                        }}
                      />
                      <label>px</label>
                    </div>
                    <select
                      value={setting.bywordsFont.family}
                      style={{
                        fontFamily: setting.bywordsFont.family,
                        width: "8em",
                        height: "2em",
                        fontSize: "1em",
                        padding: "0.1em 0.2em",
                        backgroundColor: setting.showBywords
                          ? "white"
                          : "rgb(224, 224, 224)",
                      }}
                      disabled={setting.showBywords === false}
                      onChange={(e) =>
                        setSetting({
                          ...setting,
                          bywordsFont: {
                            ...setting.bywordsFont,
                            family: e.target.value,
                          },
                        })
                      }
                    >
                      <option
                        value="Yu Mincho"
                        style={{ fontFamily: "Yu Mincho" }}
                      >
                        游明朝
                      </option>
                      <option
                        value="sans-serif"
                        style={{ fontFamily: "sans-serif" }}
                      >
                        サンセリフ
                      </option>
                      <option
                        value="MS PGothic"
                        style={{ fontFamily: "MS PGothic" }}
                      >
                        MSゴシック
                      </option>
                    </select>
                    <input
                      type="color"
                      disabled={setting.showBywords === false}
                    />
                  </div>
                </div>
                <input type="radio" checked={tab2 === 3} onChange={() => {}} />
                <label onClick={() => setTab2(3)}>生没年</label>
                <div>
                  <label id="checkbox-style">
                    <input
                      type="checkbox"
                      checked={setting.showYears}
                      onChange={(e) =>
                        setSetting({
                          ...setting,
                          showYears: e.target.checked,
                        })
                      }
                    />
                    生没年を表示する
                  </label>
                  <div id="font-container">
                    <div>
                      <input
                        id="font-size"
                        type="number"
                        value={setting.yearFont.size}
                        min={1}
                        onChange={(e) => {
                          const size = Number(e.target.value);
                          setSetting({
                            ...setting,
                            yearFont: { ...setting.yearFont, size },
                          });
                        }}
                        disabled={setting.showYears === false}
                      />
                      <label>px</label>
                    </div>
                    <select
                      value={setting.yearFont.family}
                      style={{
                        fontFamily: setting.yearFont.family,
                        width: "8em",
                        height: "2em",
                        fontSize: "1em",
                        padding: "0.1em 0.2em",
                      }}
                      onChange={(e) =>
                        setSetting({
                          ...setting,
                          yearFont: {
                            ...setting.yearFont,
                            family: e.target.value,
                          },
                        })
                      }
                      disabled={setting.showYears === false}
                    >
                      <option
                        value="Yu Mincho"
                        style={{ fontFamily: "Yu Mincho" }}
                      >
                        游明朝
                      </option>
                      <option
                        value="sans-serif"
                        style={{ fontFamily: "sans-serif" }}
                      >
                        サンセリフ
                      </option>
                      <option
                        value="MS PGothic"
                        style={{ fontFamily: "MS PGothic" }}
                      >
                        MSゴシック
                      </option>
                    </select>
                    <input
                      type="color"
                      disabled={setting.showYears === false}
                    />
                  </div>
                </div>
              </div>
            </div>
            <input type="radio" checked={tab1 === 3} onChange={() => {}} />
            <label onClick={() => setTab1(3)}>線</label>
            <div>
              <label id="checkbox-style">
                <input
                  type="checkbox"
                  checked={setting.useColorList}
                  onChange={(e) =>
                    setSetting({ ...setting, useColorList: e.target.checked })
                  }
                />
                色リストを用いる
              </label>
              <div className="color-list">
                {setting.lineColors.map((color, idx) => (
                  <div key={idx}>
                    <input
                      type="color"
                      value={color}
                      disabled={setting.useColorList === false}
                      onChange={(e) => handleChangeColor(e.target.value, idx)}
                      onContextMenu={() => handleDeleteColor(idx)}
                    />
                  </div>
                ))}
                <button
                  disabled={setting.useColorList === false}
                  onClick={handleAddColor}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            id="apply"
            onClick={() => {
              window.electronAPI?.onSendSettingFromSettingEditor(setting);
              window.electronAPI?.onEditorClose();
            }}
          >
            適応して閉じる
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingEditor;
