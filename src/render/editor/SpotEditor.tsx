import { useState } from "react";
import { Position } from "../../model/FundamentalData";
import { SpotData } from "../../model/Spot";

interface SpotEditorProperties {
  spot: SpotData;
  position: Position;
  onSave: (text: string) => void;
  onClose: () => void;
}

const SpotEditor: React.FC<SpotEditorProperties> = ({
  spot,
  position,
  onSave,
  onClose,
}) => {
  const [text, setText] = useState(spot.text);

  return (
    <div
      style={{
        border: "1px solid black",
        position: "absolute",
        top: position.y,
        left: position.x,
        backgroundColor: "rgb(255, 255, 255)",
        padding: 5,
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.46)",
        zIndex: 1,
        borderRadius: 9,
      }}
    >
      <div style={{ display: "flex", margin: 3 }}>
        <input
          type="text"
          placeholder="スポットの名前"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div style={{ display: "flex" }}>
        <button
          style={{ margin: 3 }}
          onClick={() => {
            if (text !== "") {
              onSave(text);
              onClose();
            }
          }}
        >
          保存
        </button>
        <button style={{ margin: 3 }} onClick={onClose}>
          キャンセル
        </button>
      </div>
    </div>
  );
};

export default SpotEditor;
