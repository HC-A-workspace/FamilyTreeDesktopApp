import { useEffect, useState } from "react";
import { getEmptyPersonData } from "../../model/Person";
import { getNameStyle, NameStyle, Sex } from "../../model/FundamentalData";
import {
  OnlyNameInput,
  WithFamilyNameInput,
  WithTitleInput,
} from "./NameEditor";
import ListEditor from "./ListEditor";
import "./PersonEditor.css";
import EventEditor from "./EventEditor";

const EditingDate = {
  Year: 0,
  Month: 1,
  Day: 2,
} as const;

type EditingDate = (typeof EditingDate)[keyof typeof EditingDate];

const PersonEditor: React.FC = () => {
  const [nameStyle, setNameStyle] = useState<NameStyle>(
    NameStyle.WithFamilyname
  );
  const [personData, setPersonData] = useState(
    getEmptyPersonData(-1, { x: 0, y: 0 })
  );
  const [tagList, setTagList] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [newTags, setNewTags] = useState<string[]>([]);

  useEffect(() => {
    window.electronAPI?.onLoadDataOnEditor((data) => {
      setPersonData(data.personData);
      setTagList([...data.tags]);
      if (data.personData.name.givenName !== "") {
        setNameStyle(getNameStyle(data.personData.name));
      } else {
        setNameStyle(NameStyle.WithFamilyname);
      }
    });
  }, []);

  const handleChangeGivenName = (givenName: string) => {
    setPersonData({
      ...personData,
      name: { ...personData.name, givenName: givenName },
    });
  };

  const handleChangeGivenNameKana = (givenNameKana: string) => {
    setPersonData({
      ...personData,
      name: { ...personData.name, givenNameKana: givenNameKana },
    });
  };

  const handleChangeFamilyName = (familyName: string) => {
    setPersonData({
      ...personData,
      name: { ...personData.name, familyName: familyName },
    });
  };

  const handleChangeFamilyNameKana = (familyNameKana: string) => {
    setPersonData({
      ...personData,
      name: { ...personData.name, familyNameKana: familyNameKana },
    });
  };

  const handleChangeNameTitle = (nameTitle: string) => {
    setPersonData({
      ...personData,
      name: { ...personData.name, title: nameTitle },
    });
  };
  const handleChangeNameTitleKana = (nameTitleKana: string) => {
    setPersonData({
      ...personData,
      name: { ...personData.name, titleKana: nameTitleKana },
    });
  };

  const handleChangeSex = (sex: Sex) => {
    setPersonData({
      ...personData,
      sex: sex,
    });
  };

  const handleChangeDate = (
    isBirth: boolean,
    editingDate: EditingDate,
    value: string
  ) => {
    switch (editingDate) {
      case EditingDate.Year:
        if (isBirth) {
          setPersonData({
            ...personData,
            birthday: {
              ...personData.birthday,
              year:
                value === "" || Number(value) === 0 ? undefined : Number(value),
            },
          });
        } else {
          setPersonData({
            ...personData,
            deathday: {
              ...personData.deathday,
              year:
                value === "" || Number(value) === 0 ? undefined : Number(value),
            },
          });
        }
        break;
      case EditingDate.Month:
        if (isBirth) {
          setPersonData({
            ...personData,
            birthday: {
              ...personData.birthday,
              month:
                value === "" || Number(value) < 1 || Number(value) > 12
                  ? undefined
                  : Number(value),
            },
          });
        } else {
          setPersonData({
            ...personData,
            deathday: {
              ...personData.deathday,
              month:
                value === "" || Number(value) < 1 || Number(value) > 12
                  ? undefined
                  : Number(value),
            },
          });
        }
        break;
      case EditingDate.Day:
        if (isBirth) {
          setPersonData({
            ...personData,
            birthday: {
              ...personData.birthday,
              day:
                value === "" || Number(value) < 1 || Number(value) > 31
                  ? undefined
                  : Number(value),
            },
          });
        } else {
          setPersonData({
            ...personData,
            deathday: {
              ...personData.deathday,
              day:
                value === "" || Number(value) < 1 || Number(value) > 31
                  ? undefined
                  : Number(value),
            },
          });
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="back-ground">
      <div id="region-title">
        <div>基本情報</div>
      </div>
      <div id="edit-field" style={{ alignItems: "center" }}>
        <div id="title">
          <div>名前の形式</div>
        </div>
        <div id="content">
          <div id="checkbox-style">
            <label style={{ marginRight: 5 }}>
              <input
                type="radio"
                checked={nameStyle === NameStyle.WithFamilyname}
                onChange={() => setNameStyle(NameStyle.WithFamilyname)}
              />
              苗字と名前
            </label>
            <label style={{ marginRight: 5 }}>
              <input
                type="radio"
                checked={nameStyle === NameStyle.WithTitle}
                onChange={() => setNameStyle(NameStyle.WithTitle)}
              />
              名前と立場
            </label>
            <label style={{ marginRight: 5 }}>
              <input
                type="radio"
                checked={nameStyle === NameStyle.OnlyGivenName}
                onChange={() => setNameStyle(NameStyle.OnlyGivenName)}
              />
              名前のみ
            </label>
          </div>
        </div>
      </div>
      <div id="edit-field" style={{ alignItems: "flex-end" }}>
        <div id="title">
          <div>名前</div>
        </div>
        <div id="content">
          {nameStyle === NameStyle.WithFamilyname && (
            <WithFamilyNameInput
              name={personData.name}
              onChangeGivenName={handleChangeGivenName}
              onChangeGivenNameKana={handleChangeGivenNameKana}
              onChangeFamilyName={handleChangeFamilyName}
              onChangeFamilyNameKana={handleChangeFamilyNameKana}
            />
          )}
          {nameStyle === NameStyle.WithTitle && (
            <WithTitleInput
              name={personData.name}
              onChangeGivenName={handleChangeGivenName}
              onChangeGivenNameKana={handleChangeGivenNameKana}
              onChangeNameTitle={handleChangeNameTitle}
              onChangeNameTitleKana={handleChangeNameTitleKana}
            />
          )}
          {nameStyle === NameStyle.OnlyGivenName && (
            <OnlyNameInput
              name={personData.name}
              onChangeGivenName={handleChangeGivenName}
              onChangeGivenNameKana={handleChangeGivenNameKana}
            />
          )}
        </div>
      </div>
      <div id="edit-field" style={{ alignItems: "center" }}>
        <div id="title">
          <div>性別</div>
        </div>
        <div id="content">
          <div id="checkbox-style">
            <label style={{ marginRight: 5 }}>
              <input
                type="radio"
                checked={personData.sex === Sex.Male}
                onChange={() => handleChangeSex(Sex.Male)}
              />
              男性
            </label>
            <label style={{ marginRight: 5 }}>
              <input
                type="radio"
                checked={personData.sex === Sex.Female}
                onChange={() => handleChangeSex(Sex.Female)}
              />
              女性
            </label>
            <label style={{ marginRight: 5 }}>
              <input
                type="radio"
                checked={personData.sex === Sex.Other}
                onChange={() => handleChangeSex(Sex.Other)}
              />
              その他
            </label>
          </div>
        </div>
      </div>
      <hr id="editor-hr" />
      <div id="region-title">
        <div>生没年</div>
      </div>
      <div id="edit-field" style={{ alignItems: "center" }}>
        <div id="title">
          <div>誕生</div>
        </div>
        <div id="content">
          <div id="edit-year-container">
            {/* <label>
              <input
                type="checkbox"
                checked={
                  personData.birthday !== undefined && personData.birthday.isBC
                }
                onChange={(e) =>
                  setPersonData({
                    ...personData,
                    birthday: {
                      ...personData.birthday,
                      isBC: e.target.checked,
                    },
                  })
                }
              />
              紀元前
            </label> */}
            <input
              type="number"
              id="year"
              value={personData.birthday?.year ?? ""}
              placeholder="年"
              onChange={(e) =>
                handleChangeDate(true, EditingDate.Year, e.target.value)
              }
            />
            <span id="slash">/</span>
            <input
              type="number"
              min={0}
              max={12}
              id="month-day"
              value={personData.birthday?.month ?? ""}
              placeholder="月"
              onChange={(e) =>
                handleChangeDate(true, EditingDate.Month, e.target.value)
              }
            />
            <span id="slash">/</span>
            <input
              type="number"
              min={0}
              max={31}
              id="month-day"
              value={personData.birthday?.day ?? ""}
              placeholder="日"
              onChange={(e) =>
                handleChangeDate(true, EditingDate.Day, e.target.value)
              }
            />
          </div>
        </div>
      </div>
      <div id="edit-field" style={{ alignItems: "center" }}>
        <div id="title">
          <div>逝去</div>
        </div>
        <div id="content">
          <div id="edit-year-container">
            {/* <label>
              <input
                type="checkbox"
                checked={
                  personData.deathday !== undefined && personData.deathday.isBC
                }
                onChange={(e) =>
                  setPersonData({
                    ...personData,
                    deathday: {
                      ...personData.deathday,
                      isBC: e.target.checked,
                    },
                  })
                }
              />
              紀元前
            </label> */}
            <input
              type="number"
              id="year"
              value={personData.deathday?.year ?? ""}
              placeholder="年"
              onChange={(e) =>
                handleChangeDate(false, EditingDate.Year, e.target.value)
              }
            />
            <span id="slash">/</span>
            <input
              type="number"
              min={0}
              max={12}
              id="month-day"
              value={personData.deathday?.month ?? ""}
              placeholder="月"
              onChange={(e) =>
                handleChangeDate(false, EditingDate.Month, e.target.value)
              }
            />
            <span id="slash">/</span>
            <input
              type="number"
              min={0}
              max={31}
              id="month-day"
              value={personData.deathday?.day ?? ""}
              placeholder="日"
              onChange={(e) =>
                handleChangeDate(false, EditingDate.Day, e.target.value)
              }
            />
          </div>
        </div>
      </div>
      <hr id="editor-hr" />
      <div id="edit-field" style={{ alignItems: "center" }}>
        <div id="title">
          <div>称号</div>
        </div>
        <div id="content">
          <input
            type="text"
            className="bywords-editor"
            value={personData.bywords}
            placeholder="称号"
            onChange={(e) =>
              setPersonData({
                ...personData,
                bywords: e.target.value.trim(),
              })
            }
          />
        </div>
      </div>
      <div id="edit-field" style={{ alignItems: "flex-start" }}>
        <div id="title">
          <div>別名</div>
        </div>
        <div id="list-container">
          <ListEditor
            list={personData.aliases}
            placeholder="別名"
            onAdd={() =>
              setPersonData({
                ...personData,
                aliases: [...personData.aliases, ""],
              })
            }
            onChange={(idx, newText) => {
              const newAliases = [...personData.aliases];
              newAliases[idx] = newText.trim();
              setPersonData({
                ...personData,
                aliases: newAliases,
              });
            }}
            onDelete={(idx) => {
              const newAliases = [...personData.aliases];
              if (newAliases.length === 0) {
                return;
              } else if (newAliases.length === 1) {
                newAliases[0] = "";
              } else {
                newAliases.splice(idx, 1);
              }
              setPersonData({
                ...personData,
                aliases: newAliases,
              });
            }}
          />
        </div>
      </div>
      <hr id="editor-hr" />
      <div id="edit-field" style={{ alignItems: "flex-start" }}>
        <div id="title">
          <div>業績</div>
        </div>
        <div id="list-container">
          <ListEditor
            list={personData.achievements}
            placeholder="業績"
            onAdd={() =>
              setPersonData({
                ...personData,
                achievements: [...personData.achievements, ""],
              })
            }
            onChange={(idx, newText) => {
              const newWorks = [...personData.achievements];
              newWorks[idx] = newText;
              setPersonData({
                ...personData,
                achievements: newWorks,
              });
            }}
            onDelete={(idx) => {
              const newWorks = [...personData.achievements];
              if (newWorks.length === 0) {
                return;
              } else if (newWorks.length === 1) {
                newWorks[0] = "";
              } else {
                newWorks.splice(idx, 1);
              }
              setPersonData({
                ...personData,
                achievements: newWorks,
              });
            }}
          />
        </div>
      </div>
      <div id="edit-field" style={{ alignItems: "flex-start" }}>
        <div id="title">
          <div>言葉・句</div>
        </div>
        <div id="list-container">
          <ListEditor
            list={personData.words}
            placeholder="言葉・句"
            onAdd={() =>
              setPersonData({
                ...personData,
                words: [...personData.words, ""],
              })
            }
            onChange={(idx, newText) => {
              const newWords = [...personData.words];
              newWords[idx] = newText;
              setPersonData({
                ...personData,
                words: newWords,
              });
            }}
            onDelete={(idx) => {
              const newWords = [...personData.words];
              if (newWords.length === 0) {
                return;
              } else if (newWords.length === 1) {
                newWords[0] = "";
              } else {
                newWords.splice(idx, 1);
              }
              setPersonData({
                ...personData,
                words: newWords,
              });
            }}
          />
        </div>
      </div>
      <hr id="editor-hr" />
      <div id="edit-field" style={{ alignItems: "flex-start" }}>
        <div id="title">
          <div>略年表</div>
        </div>
        <div id="list-container">
          <EventEditor
            events={personData.chronologicals}
            onAdd={() =>
              setPersonData({
                ...personData,
                chronologicals: [
                  ...personData.chronologicals,
                  {
                    text: "",
                  },
                ],
              })
            }
            onChange={(idx, newEvent) => {
              const newEvents = [...personData.chronologicals];
              newEvents[idx] = newEvent;
              setPersonData({
                ...personData,
                chronologicals: newEvents,
              });
            }}
            onDelete={(idx) => {
              const newEvents = [...personData.chronologicals];
              if (newEvents.length === 0) {
                return;
              } else if (newEvents.length === 1) {
                newEvents[0] = { text: "" };
              } else {
                newEvents.splice(idx, 1);
              }
              setPersonData({
                ...personData,
                chronologicals: newEvents,
              });
            }}
            onMoveUp={(idx) => {
              if (idx === 0) return;
              const newEvents = [...personData.chronologicals];
              const temp = newEvents[idx - 1];
              newEvents[idx - 1] = newEvents[idx];
              newEvents[idx] = temp;
              setPersonData({
                ...personData,
                chronologicals: newEvents,
              });
            }}
            onMoveDown={(idx) => {
              if (idx === personData.chronologicals.length - 1) return;
              const newEvents = [...personData.chronologicals];
              const temp = newEvents[idx + 1];
              newEvents[idx + 1] = newEvents[idx];
              newEvents[idx] = temp;
              setPersonData({
                ...personData,
                chronologicals: newEvents,
              });
            }}
          />
        </div>
      </div>
      <hr id="editor-hr" />
      <div id="edit-field" style={{ alignItems: "flex-start" }}>
        <div id="title">
          <div>タグ</div>
        </div>
        <div id="content">
          <div className="tag-editor">
            {[...tagList, ...newTags].map((tag, id) => {
              return (
                <label
                  key={id}
                  style={{
                    backgroundColor: personData.tagIds.includes(id)
                      ? "white"
                      : "rgb(233, 233, 233)",
                  }}
                >
                  <input
                    type="checkbox"
                    id="tag-checkbox"
                    checked={personData.tagIds.includes(id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPersonData({
                          ...personData,
                          tagIds: [...personData.tagIds, id],
                        });
                      } else {
                        setPersonData({
                          ...personData,
                          tagIds: personData.tagIds.filter((i) => i !== id),
                        });
                      }
                    }}
                  />
                  {tag}
                </label>
              );
            })}
            <input
              type="text"
              placeholder="新規タグ"
              className="add-tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (
                    newTag !== "" &&
                    tagList.includes(newTag) === false &&
                    newTags.includes(newTag) === false
                  ) {
                    setNewTags([...newTags, newTag]);
                    setNewTag("");
                  }
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>
      </div>
      <hr id="editor-hr" />
      <div id="region-title">
        <div>記述欄</div>
      </div>
      <div className="description-editor">
        <textarea
          placeholder="自由記述欄"
          value={personData.description}
          onChange={(e) => {
            setPersonData({
              ...personData,
              description: e.target.value,
            });
          }}
        />
      </div>
      <hr id="editor-hr" />
      <div className="editor-last-button-container">
        <button onClick={window.electronAPI?.onEditorClose}>キャンセル</button>
        <button
          disabled={personData.name.givenName.trim() === ""}
          onClick={() => {
            const createdTags: string[] = [];
            const oldTagLen = tagList.length;
            const copy = [...personData.tagIds];
            personData.tagIds = personData.tagIds.filter(
              (id) => id < oldTagLen
            );
            let idx = 0;
            for (const id of copy.filter((id) => id >= oldTagLen)) {
              createdTags.push(newTags[id - oldTagLen]);
              personData.tagIds.push(oldTagLen + idx);
              idx++;
            }
            window.electronAPI?.onSendDataFromEditor({
              personData: personData,
              newTags: newTags,
            });
            window.electronAPI?.onEditorClose();
          }}
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default PersonEditor;
