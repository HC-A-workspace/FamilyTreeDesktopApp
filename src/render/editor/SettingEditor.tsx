import { useState } from "react";
import { FamilyTree, FamilyTreeSetting } from "../../model/FamilyTree";

type BooleanSettingKey = Extract<
  keyof FamilyTreeSetting,
  "isVertical" | "showBywords" | "showYears" | "showGrid" | "showSideYear"
>;

const booleanSettingLabels: { key: BooleanSettingKey; label: string }[] = [
  { key: "isVertical", label: "縦書き表示する" },
  { key: "showBywords", label: "称号を表示する" },
  { key: "showYears", label: "生没年を表示する" },
  { key: "showGrid", label: "格子を表示する" },
  { key: "showSideYear", label: "軸の年を表示する" },
];

const SettingEditor: React.FC = () => {
  const [setting, setSetting] = useState({
    ...FamilyTree.setting,
    nameFont: { ...FamilyTree.setting.nameFont },
    selectedNameFont: { ...FamilyTree.setting.selectedNameFont },
    bywordsFont: { ...FamilyTree.setting.bywordsFont },
    yearFont: { ...FamilyTree.setting.yearFont },
  });

  const checkboxStyle = {
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const numberInputStyle = {
    width: 60,
    padding: "4px 6px",
    fontSize: "14px",
    textAlign: "right" as const,
    borderRadius: 4,
    border: "1px solid #ccc",
    marginLeft: "auto",
  };

  const sectionStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        background: "#fff",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: 20 }}>設定</h3>

      {booleanSettingLabels.map(({ key, label }) => (
        <div style={checkboxStyle} key={key}>
          <input
            type="checkbox"
            checked={setting[key]}
            onChange={(e) =>
              setSetting({ ...setting, [key]: e.target.checked })
            }
          />
          <span>{label}</span>
        </div>
      ))}

      <div style={sectionStyle}>
        <label>名前のフォントサイズ</label>
        <input
          type="number"
          value={setting.nameFont.size}
          min={1}
          style={numberInputStyle}
          onChange={(e) => {
            const size = Number(e.target.value);
            setSetting({
              ...setting,
              nameFont: { ...setting.nameFont, size },
              selectedNameFont: { ...setting.selectedNameFont, size },
            });
          }}
        />
      </div>

      <div style={sectionStyle}>
        <label>称号のフォントサイズ</label>
        <input
          type="number"
          value={setting.bywordsFont.size}
          min={1}
          style={numberInputStyle}
          onChange={(e) => {
            setSetting({
              ...setting,
              bywordsFont: {
                ...setting.bywordsFont,
                size: Number(e.target.value),
              },
            });
          }}
        />
      </div>

      <div style={sectionStyle}>
        <label>生没年のフォントサイズ</label>
        <input
          type="number"
          value={setting.yearFont.size}
          min={1}
          style={numberInputStyle}
          onChange={(e) => {
            setSetting({
              ...setting,
              yearFont: {
                ...setting.yearFont,
                size: Number(e.target.value),
              },
            });
          }}
        />
      </div>

      <button
        style={{
          marginTop: 20,
          width: "100%",
          padding: "10px 0",
          backgroundColor: "#007bff",
          color: "white",
          fontWeight: "bold",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
        onClick={() => {
          window.electronAPI?.onSendSettingFromSettingEditor(setting);
          window.electronAPI?.onEditorClose();
        }}
      >
        適応して閉じる
      </button>
    </div>
  );
};

export default SettingEditor;
