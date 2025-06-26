import { useEffect, useState } from "react";
import { getEmptyPersonData, type PersonData } from "../../model/Person";
import {
  getNameStyle,
  NameStyle,
  Sex,
  type Name,
} from "../../model/FundamentalData";
import {
  OnlyNameInput,
  WithFamilyNameInput,
  WithTitleInput,
} from "./NameEditor";
import ListEditor from "./ListEditor";

const EditingDate = {
  Year: 0,
  Month: 1,
  Day: 2,
} as const;

type EditingDate = (typeof EditingDate)[keyof typeof EditingDate];

interface ItemTitleProp {
  title: string;
  titleWidth: number;
  font?: string;
  backgroundColor?: string;
  drawRect?: boolean;
  top: number;
}

const ItemTitle: React.FC<ItemTitleProp> = ({
  title,
  titleWidth,
  font,
  backgroundColor,
  drawRect,
  top,
}) => {
  const titlefont = font !== undefined ? font : "700 20px 'Yu Gothic'";
  const isDrawRect = drawRect !== undefined ? drawRect : true;
  const fontSize = Number(titlefont.split(" ")[1].split("px")[0]);

  return (
    <div
      style={{
        width: titleWidth,
        display: "flex",
        justifyContent: "center",
        position: "relative",
        top: top,
        // alignItems: "center",
        backgroundColor: backgroundColor,
      }}
    >
      <div
        style={{
          backgroundColor: isDrawRect ? "rgb(255,255,255)" : undefined,
          border: isDrawRect ? "1px solid black" : undefined,
          font: titlefont,
          padding: 3,
          paddingRight: 5,
          paddingLeft: 5,
          margin: 3,
          height: fontSize * 1.6,
          textAlign: "center",
        }}
      >
        {title}
      </div>
    </div>
  );
};

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

const PersonEditor: React.FC = () => {
  const titleWidth = 150;
  const [nameStyle, setNameStyle] = useState<NameStyle>(
    NameStyle.WithFamilyname
  );
  const [personData, setPersonData] = useState(
    getEmptyPersonData(-1, { x: 0, y: 0 })
  );
  const { width } = useWindowSize();

  useEffect(() => {
    window.electronAPI?.onLoadDataOnEditor((data) => {
      setPersonData(data);
      if (data.name.givenName !== "") {
        setNameStyle(getNameStyle(data.name));
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
              isBC:
                personData.birthday?.isBC !== undefined
                  ? personData.birthday?.isBC
                  : false,
              year:
                value === "" || Number(value) < 0 ? undefined : Number(value),
            },
          });
        } else {
          setPersonData({
            ...personData,
            deathday: {
              ...personData.deathday,
              isBC:
                personData.deathday?.isBC !== undefined
                  ? personData.deathday?.isBC
                  : false,
              year:
                value === "" || Number(value) < 0 ? undefined : Number(value),
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
              isBC:
                personData.birthday?.isBC !== undefined
                  ? personData.birthday?.isBC
                  : false,
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
              isBC:
                personData.deathday?.isBC !== undefined
                  ? personData.deathday?.isBC
                  : false,
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
              isBC:
                personData.birthday?.isBC !== undefined
                  ? personData.birthday?.isBC
                  : false,
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
              isBC:
                personData.deathday?.isBC !== undefined
                  ? personData.deathday?.isBC
                  : false,
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
    <div
      style={{
        position: "absolute",
        width: width,
        // height: height,
        // border: "1px solid black",
        backgroundColor: "rgba(243, 152, 77, 0.12)",
      }}
    >
      <div
        style={{
          width: width,
          // backgroundColor: "rgb(255, 255, 255)",
        }}
      >
        <ItemTitle
          title="基本情報"
          titleWidth={titleWidth}
          font="700 30px 'Yu Gothic'"
          drawRect={false}
          top={0}
        />
        <div style={{ display: "flex" }}>
          <ItemTitle title="名前の形式" titleWidth={titleWidth} top={5} />
          <div
            style={{
              width: width - titleWidth,
              display: "flex",
            }}
          >
            <div
              style={{
                backgroundColor: "rgb(255,255,255)",
                padding: 3,
                margin: 10,
                border: "1px solid black",
                font: "400 17px 'Yu Gothic'",
                alignItems: "center",
              }}
            >
              <label style={{ marginRight: 5 }}>
                <input
                  type="checkbox"
                  checked={nameStyle === NameStyle.WithFamilyname}
                  onChange={() => setNameStyle(NameStyle.WithFamilyname)}
                />
                苗字と名前
              </label>
              <label style={{ marginRight: 5 }}>
                <input
                  type="checkbox"
                  checked={nameStyle === NameStyle.WithTitle}
                  onChange={() => setNameStyle(NameStyle.WithTitle)}
                />
                名前と立場
              </label>
              <label style={{ marginRight: 5 }}>
                <input
                  type="checkbox"
                  checked={nameStyle === NameStyle.OnlyGivenName}
                  onChange={() => setNameStyle(NameStyle.OnlyGivenName)}
                />
                名前のみ
              </label>
            </div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <ItemTitle title="名前" titleWidth={titleWidth} top={33} />
          <div
            style={{
              width: width - titleWidth,
              display: "flex",
            }}
          >
            {nameStyle === NameStyle.WithFamilyname && (
              <WithFamilyNameInput
                name={personData.name}
                width={width - titleWidth}
                onChangeGivenName={handleChangeGivenName}
                onChangeGivenNameKana={handleChangeGivenNameKana}
                onChangeFamilyName={handleChangeFamilyName}
                onChangeFamilyNameKana={handleChangeFamilyNameKana}
              />
            )}
            {nameStyle === NameStyle.WithTitle && (
              <WithTitleInput
                name={personData.name}
                width={width - titleWidth}
                onChangeGivenName={handleChangeGivenName}
                onChangeGivenNameKana={handleChangeGivenNameKana}
                onChangeNameTitle={handleChangeNameTitle}
                onChangeNameTitleKana={handleChangeNameTitleKana}
              />
            )}
            {nameStyle === NameStyle.OnlyGivenName && (
              <OnlyNameInput
                name={personData.name}
                width={width - titleWidth}
                onChangeGivenName={handleChangeGivenName}
                onChangeGivenNameKana={handleChangeGivenNameKana}
              />
            )}
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <ItemTitle title="性別" titleWidth={titleWidth} top={5} />
          <div style={{ display: "flex", width: width - titleWidth }}>
            <div
              style={{
                backgroundColor: "rgb(255,255,255)",
                padding: 3,
                margin: 10,
                border: "1px solid black",
                font: "400 17px 'Yu Gothic'",
                alignItems: "center",
              }}
            >
              <label style={{ marginRight: 5 }}>
                <input
                  type="checkbox"
                  checked={personData.sex === Sex.Male}
                  onChange={() => handleChangeSex(Sex.Male)}
                />
                男性
              </label>
              <label style={{ marginRight: 5 }}>
                <input
                  type="checkbox"
                  checked={personData.sex === Sex.Female}
                  onChange={() => handleChangeSex(Sex.Female)}
                />
                女性
              </label>
              <label style={{ marginRight: 5 }}>
                <input
                  type="checkbox"
                  checked={personData.sex === Sex.Other}
                  onChange={() => handleChangeSex(Sex.Other)}
                />
                その他
              </label>
            </div>
          </div>
        </div>
        <hr style={{ width: width * 0.95, color: "rgb(0,0,0)" }} />
        <ItemTitle
          title="生没年"
          titleWidth={titleWidth}
          font="700 30px 'Yu Gothic'"
          drawRect={false}
          top={0}
        />
        <div style={{ display: "flex" }}>
          <ItemTitle title="誕生" titleWidth={titleWidth} top={10} />
          <div style={{ display: "flex", width: width - titleWidth }}>
            <div style={{ padding: 3, marginLeft: 10 }}>
              <label
                style={{
                  font: "400 20px 'Yu Gothic'",
                  padding: 3,
                  backgroundColor: "rgb(255,255,255)",
                  border: "1px solid black",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    personData.birthday !== undefined &&
                    personData.birthday.isBC
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
              </label>
              <input
                type="number"
                min={0}
                style={{
                  font: "400 20px 'serif",
                  width: 70,
                  margin: 10,
                  marginRight: 5,
                  padding: 3,
                  textAlign: "right",
                }}
                value={personData.birthday?.year ?? ""}
                placeholder="年"
                onChange={(e) =>
                  handleChangeDate(true, EditingDate.Year, e.target.value)
                }
              />
              <span style={{ fontSize: 30 }}>/</span>
              <input
                type="number"
                min={1}
                max={12}
                style={{
                  font: "400 20px 'serif",
                  width: 40,
                  margin: 10,
                  marginRight: 5,
                  marginLeft: 5,
                  padding: 3,
                  textAlign: "right",
                }}
                value={personData.birthday?.month ?? ""}
                onChange={(e) =>
                  handleChangeDate(true, EditingDate.Month, e.target.value)
                }
                placeholder="月"
              />
              <span style={{ fontSize: 30 }}>/</span>
              <input
                type="number"
                min={1}
                max={31}
                style={{
                  font: "400 20px 'serif",
                  width: 40,
                  margin: 10,
                  marginLeft: 5,
                  padding: 3,
                  textAlign: "right",
                }}
                value={personData.birthday?.day ?? ""}
                onChange={(e) =>
                  handleChangeDate(true, EditingDate.Day, e.target.value)
                }
                placeholder="日"
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <ItemTitle title="逝去" titleWidth={titleWidth} top={10} />
          <div style={{ display: "flex", width: width - titleWidth }}>
            <div style={{ padding: 3, marginLeft: 10 }}>
              <label
                style={{
                  font: "400 20px 'Yu Gothic'",
                  padding: 3,
                  backgroundColor: "rgb(255,255,255)",
                  border: "1px solid black",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    personData.deathday !== undefined &&
                    personData.deathday.isBC
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
              </label>
              <input
                type="number"
                min={0}
                style={{
                  font: "400 20px 'serif",
                  width: 70,
                  margin: 10,
                  marginRight: 5,
                  padding: 3,
                  textAlign: "right",
                }}
                value={personData.deathday?.year ?? ""}
                placeholder="年"
                onChange={(e) =>
                  handleChangeDate(false, EditingDate.Year, e.target.value)
                }
              />
              <span style={{ fontSize: 30 }}>/</span>
              <input
                type="number"
                min={1}
                max={12}
                style={{
                  font: "400 20px 'serif",
                  width: 40,
                  margin: 10,
                  marginRight: 5,
                  marginLeft: 5,
                  padding: 3,
                  textAlign: "right",
                }}
                value={personData.deathday?.month ?? ""}
                onChange={(e) =>
                  handleChangeDate(false, EditingDate.Month, e.target.value)
                }
                placeholder="月"
              />
              <span style={{ fontSize: 30 }}>/</span>
              <input
                type="number"
                min={1}
                max={31}
                style={{
                  font: "400 20px 'serif",
                  width: 40,
                  margin: 10,
                  marginLeft: 5,
                  padding: 3,
                  textAlign: "right",
                }}
                value={personData.deathday?.day ?? ""}
                onChange={(e) =>
                  handleChangeDate(false, EditingDate.Day, e.target.value)
                }
                placeholder="日"
              />
            </div>
          </div>
        </div>
        <hr style={{ width: width * 0.95, color: "rgb(0,0,0)" }} />
        <div style={{ display: "flex" }}>
          <ItemTitle title="称号" titleWidth={titleWidth} top={10} />
          <div style={{ display: "flex", width: width - titleWidth }}>
            <input
              type="text"
              style={{ margin: 10, font: "400 25px 'Yu Gothic'", width: 250 }}
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
        <div style={{ display: "flex" }}>
          <ItemTitle title="別名" titleWidth={titleWidth} top={2} />
          <div style={{ display: "flex", width: width - titleWidth }}>
            <ListEditor
              list={personData.aliases}
              width={width - titleWidth}
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
        <hr style={{ width: width * 0.95, color: "rgb(0,0,0)" }} />
        <div style={{ display: "flex" }}>
          <ItemTitle title="功績" titleWidth={titleWidth} top={2} />
          <div style={{ display: "flex", width: width - titleWidth }}>
            <ListEditor
              list={personData.works}
              width={width - titleWidth}
              placeholder="功績"
              onAdd={() =>
                setPersonData({
                  ...personData,
                  works: [...personData.works, ""],
                })
              }
              onChange={(idx, newText) => {
                const newWorks = [...personData.works];
                newWorks[idx] = newText;
                setPersonData({
                  ...personData,
                  works: newWorks,
                });
              }}
              onDelete={(idx) => {
                const newWorks = [...personData.works];
                if (newWorks.length === 0) {
                  return;
                } else if (newWorks.length === 1) {
                  newWorks[0] = "";
                } else {
                  newWorks.splice(idx, 1);
                }
                setPersonData({
                  ...personData,
                  works: newWorks,
                });
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <ItemTitle title="言葉・句" titleWidth={titleWidth} top={2} />
          <div style={{ display: "flex", width: width - titleWidth }}>
            <ListEditor
              list={personData.words}
              width={width - titleWidth}
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
        <hr style={{ width: width * 0.95, color: "rgb(0,0,0)" }} />
        <div>
          <ItemTitle
            title="自由記述欄"
            titleWidth={titleWidth + 30}
            font="700 30px 'Yu Gothic'"
            drawRect={false}
            top={0}
          />
          <textarea
            style={{
              margin: 30,
              marginTop: 10,
              marginBottom: 50,
              width: width - 100,
              height: 200,
              resize: "vertical",
            }}
            value={personData.description}
            onChange={(e) => {
              setPersonData({
                ...personData,
                description: e.target.value,
              });
            }}
          />
        </div>
      </div>
      <hr
        style={{
          width: width,
          borderTop: "2px solid black",
          padding: 0,
          margin: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          height: 50 - 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          style={{
            font: "700 15px 'Yu Gothic",
            height: 40,
            width: 120,
            marginRight: 10,
            alignItems: "center",
            backgroundColor: "rgb(255, 255, 255)",
          }}
          onClick={window.electronAPI?.onEditorClose}
        >
          キャンセル
        </button>
        <button
          style={{
            font: "700 15px 'Yu Gothic",
            height: 40,
            width: 120,
            marginLeft: 10,
            backgroundColor: "rgb(255, 255, 255)",
          }}
          onClick={() => {
            if (personData.name.givenName !== "") {
              window.electronAPI?.onSendDataFromEditor(personData);
              window.electronAPI?.onEditorClose();
            }
          }}
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default PersonEditor;
