import { useState } from "react";
import { Position } from "../../model/FundamentalData";
import { SpotData } from "../../model/Spot";
import "./SpotEditor.css";

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
      className="spot-editor"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="spot-editor-title">スポット</div>
      <input
        type="text"
        placeholder="スポットの名前"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="spot-editor-button-container">
        <button
          onClick={() => {
            if (text !== "") {
              onSave(text);
              onClose();
            }
          }}
        >
          保存
        </button>
        <button onClick={onClose}>キャンセル</button>
      </div>
    </div>
  );
};

export default SpotEditor;
