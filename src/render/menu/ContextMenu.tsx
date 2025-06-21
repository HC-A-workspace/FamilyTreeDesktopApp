import { useState } from "react";
import { type Position } from "../../model/FundamentalData";
import SingleMenu from "./SingleMenu";

export interface ContextMenuProps {
  position: Position;
  canvasWidth: number;
  canvasHeight: number;
  onClose: () => void;
  onAddPerson: () => void;
  onAddSpot: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  canvasWidth,
  canvasHeight,
  onClose,
  onAddPerson,
  onAddSpot,
}) => {
  const [hoveredOn, setHoveredOn] = useState<number | undefined>(undefined);
  const panelHeightWithOffset = 70;
  const panelWidthWithOffset = 165;
  const panelHeight = 60;
  const panelWidth = 160;

  return (
    <div
      style={{
        position: "absolute",
        top:
          position.y + panelHeightWithOffset < canvasHeight
            ? position.y
            : position.y - panelHeight,
        left:
          position.x + panelWidthWithOffset < canvasWidth
            ? position.x
            : position.x - panelWidth,
        backgroundColor: "white",
        borderColor: "black",
        paddingTop: 2,
        paddingBottom: 2,
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.46)",
        zIndex: 1,
        borderRadius: 9,
        paddingLeft: 8,
        paddingRight: 8,
      }}
      onMouseLeave={() => setHoveredOn(undefined)}
    >
      <SingleMenu
        id={0}
        text="人物を新規作成"
        onClick={() => {
          onAddPerson();
          onClose();
        }}
        available={true}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
      />
      <SingleMenu
        id={1}
        text="スポットを新規作成"
        onClick={() => {
          onAddSpot();
          onClose();
        }}
        available={true}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
      />
    </div>
  );
};

export default ContextMenu;
