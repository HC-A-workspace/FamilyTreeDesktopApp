import { useState } from "react";
import { type Position } from "../model/FundamentalData";
import type { FamilyTree } from "../model/FamilyTree";
import { saveFamilyTree } from "./saveData";
import SingleMenu from "./SingleMenu";

export interface ContextMenuProps {
  position: Position;
  familyTree: FamilyTree;
  canvasWidth: number;
  canvasHeight: number;
  onClose: () => void;
  onAddPerson: () => void;
  onLoadData: (isLoadData: boolean) => void;
  onBack: () => void;
  onForword: () => void;
  canBack: boolean;
  canForword: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  familyTree,
  canvasWidth,
  canvasHeight,
  onClose,
  onAddPerson,
  onLoadData,
  onBack,
  onForword,
  canBack,
  canForword,
}) => {
  const [hoveredOn, setHoveredOn] = useState<number | undefined>(undefined);
  const panelHeightWithOffset = 210;
  const panelWidthWithOffset = 185;
  const panelHeight = 208;
  const panelWidth = 180;

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
        id={5}
        text="戻る"
        onClick={() => {
          if (canBack) {
            onBack();
            onClose();
          }
        }}
        available={canBack}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
      />
      <SingleMenu
        id={6}
        text="進む"
        onClick={() => {
          if (canForword) {
            onForword();
            onClose();
          }
        }}
        available={canForword}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
      />
      <hr />
      <SingleMenu
        id={4}
        text="人物を新規作成"
        onClick={() => {
          onAddPerson();
          onClose();
        }}
        available={true}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
      />
      <hr />
      <SingleMenu
        id={0}
        text="家系図を保存"
        onClick={() => {
          if (familyTree.getTitle() !== "") {
            saveFamilyTree(familyTree);
            onClose();
          }
        }}
        available={familyTree.getTitle() !== ""}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
      />
      <SingleMenu
        id={2}
        text="家系図を読み込む"
        onClick={() => {
          onLoadData(true);
          onClose();
        }}
        available={true}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
      />
      <SingleMenu
        id={3}
        text="家系図を読み込んで追加"
        onClick={() => {
          onLoadData(false);
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
