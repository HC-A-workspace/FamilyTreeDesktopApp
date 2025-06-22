import { useState } from "react";
import { State } from "../main/Canvas";
import { FamilyTree } from "../../model/FamilyTree";
import type { Position } from "../../model/FundamentalData";
import type { Person } from "../../model/Person";
import SingleMenu from "./SingleMenu";

interface SelectRelationProps {
  position: Position;
  familyTree: FamilyTree;
  selectedPerson: Person;
  canvasWidth: number;
  canvasHeight: number;
  menuId: number;
  menuWidth: number;
  onSetState: (state: State) => void;
  onClose: () => void;
  onSetMenuHoveredOn: (id: number | undefined) => void;
}

const SelectRelation: React.FC<SelectRelationProps> = ({
  position,
  familyTree,
  selectedPerson,
  canvasWidth,
  canvasHeight,
  menuWidth,
  menuId,
  onSetState,
  onClose,
  onSetMenuHoveredOn,
}) => {
  const [hoveredOn, setHoveredOn] = useState<number | undefined>(undefined);
  const panelHeightWithOffset = 180;
  const panelWidthWithOffset = 110;
  const panelHeight = 172;
  const panelWidth = 108;

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
            ? position.x - 2
            : position.x - panelWidth - menuWidth + 5,
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
      onMouseEnter={() => onSetMenuHoveredOn(menuId)}
      onMouseLeave={() => {
        setHoveredOn(undefined);
        onSetMenuHoveredOn(undefined);
      }}
    >
      <SingleMenu
        text="配偶者を選択"
        id={3}
        onClick={() => {
          onSetState(State.SelectingSpouse);
          onClose();
        }}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
        available={true}
      />
      <SingleMenu
        text="子を選択"
        id={4}
        onClick={() => {
          onSetState(State.SelectingChild);
          onClose();
        }}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
        available={true}
      />
      <SingleMenu
        text="親を選択"
        id={5}
        onClick={() => {
          if (familyTree.findParents(selectedPerson.getId()).length < 2) {
            onSetState(State.SelectingParent);
            onClose();
          }
        }}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
        available={familyTree.findParents(selectedPerson.getId()).length < 2}
      />
      <SingleMenu
        text="兄弟を選択"
        id={6}
        onClick={() => {
          onSetState(State.SelectingBrother);
          onClose();
        }}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
        available={true}
      />
      <SingleMenu
        text="養子を選択"
        id={7}
        onClick={() => {
          onSetState(State.SelectingAdoptedChild);
          onClose();
        }}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
        available={true}
      />
      <SingleMenu
        text="養親を選択"
        id={8}
        onClick={() => {
          if (
            familyTree.findAdoptedParents(selectedPerson.getId()).length < 2
          ) {
            onSetState(State.SelectingAdoptedParent);
            onClose();
          }
        }}
        hoveredOn={hoveredOn}
        setHoveredOn={setHoveredOn}
        available={
          familyTree.findAdoptedParents(selectedPerson.getId()).length < 2
        }
      />
    </div>
  );
};

interface PersonMenuProps {
  position: Position;
  familyTree: FamilyTree;
  selectedPerson: Person;
  canvasWidth: number;
  canvasHeight: number;
  onClose: () => void;
  onDeletePerson: () => void;
  onSetState: (state: State) => void;
  onEditPerson: () => void;
  onShowPerson: () => void;
  onFixVertically: () => void;
}

const PersonMenu: React.FC<PersonMenuProps> = ({
  position,
  familyTree,
  selectedPerson,
  canvasWidth,
  canvasHeight,
  onClose,
  onDeletePerson,
  onSetState,
  onEditPerson,
  onShowPerson,
  onFixVertically,
}) => {
  const [hoveredOn, setHoveredOn] = useState<number | undefined>(undefined);
  const [selectRelationVisible, setSelectRelationVisible] = useState(false);
  const panelHeightWithOffset = 240;
  const panelWidthWithOffset = 165;
  const panelHeight = 236;
  const panelWidth = 159;

  const hasRelation = () => {
    const data = selectedPerson.raw();
    if (data.parentMarriageId !== undefined) return true;
    if (data.marriageIds.length > 0) return true;
    if (data.adoptedParentMarriageId !== undefined) return true;
    return false;
  };

  const top =
    position.y + panelHeightWithOffset < canvasHeight
      ? position.y
      : position.y - panelHeight;
  const left =
    position.x + panelWidthWithOffset < canvasWidth
      ? position.x
      : position.x - panelWidth;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: top,
          left: left,
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
          text="プロフィールを表示"
          id={0}
          onClick={() => {
            setSelectRelationVisible(false);
            onShowPerson();
            onClose();
          }}
          available={true}
          hoveredOn={hoveredOn}
          setHoveredOn={setHoveredOn}
          onMouseEnter={() => setSelectRelationVisible(false)}
        />
        <SingleMenu
          text="プロフィールを編集"
          id={1}
          onClick={() => {
            setSelectRelationVisible(false);
            onEditPerson();
            onClose();
          }}
          available={true}
          hoveredOn={hoveredOn}
          setHoveredOn={setHoveredOn}
          onMouseEnter={() => setSelectRelationVisible(false)}
        />
        <hr />
        <SingleMenu
          text={
            selectedPerson.getIsFixedVertically()
              ? "水平方向を固定    ✓"
              : "水平方向を固定     "
          }
          id={2}
          onClick={() => {
            onFixVertically();
            onClose();
          }}
          available={true}
          hoveredOn={hoveredOn}
          setHoveredOn={setHoveredOn}
          onMouseEnter={() => setSelectRelationVisible(false)}
        />
        <hr />
        <SingleMenu
          text="人物を削除"
          id={3}
          onClick={() => {
            onDeletePerson();
            setSelectRelationVisible(false);
            onClose();
          }}
          available={true}
          hoveredOn={hoveredOn}
          setHoveredOn={setHoveredOn}
          onMouseEnter={() => setSelectRelationVisible(false)}
        />
        <hr />
        <SingleMenu
          text="関係を追加..."
          id={4}
          onClick={() => setSelectRelationVisible(true)}
          available={true}
          hoveredOn={hoveredOn}
          setHoveredOn={setHoveredOn}
          onMouseEnter={() => setSelectRelationVisible(true)}
        />
        <SingleMenu
          text="関係を削除"
          id={5}
          onClick={() => {
            if (hasRelation()) {
              onSetState(State.CancellingRelation);
              setSelectRelationVisible(false);
              onClose();
            }
          }}
          available={hasRelation()}
          hoveredOn={hoveredOn}
          setHoveredOn={setHoveredOn}
          onMouseEnter={() => setSelectRelationVisible(false)}
        />
        <SingleMenu
          text="Show PersonMap"
          id={6}
          onClick={() => {
            console.log(familyTree.getPersonMap());
            setSelectRelationVisible(false);
            onClose();
          }}
          available={true}
          hoveredOn={hoveredOn}
          setHoveredOn={setHoveredOn}
          onMouseEnter={() => setSelectRelationVisible(false)}
        />
        <SingleMenu
          text="Show MarriageMap"
          id={7}
          onClick={() => {
            console.log(familyTree.getMarriageMap());
            setSelectRelationVisible(false);
            onClose();
          }}
          available={true}
          hoveredOn={hoveredOn}
          setHoveredOn={setHoveredOn}
          onMouseEnter={() => setSelectRelationVisible(false)}
        />
      </div>
      {selectRelationVisible && (
        <SelectRelation
          canvasHeight={canvasHeight}
          canvasWidth={canvasWidth}
          menuWidth={panelWidth}
          menuId={4}
          onClose={() => {
            setSelectRelationVisible(false);
            onClose();
          }}
          onSetState={onSetState}
          position={{
            x: left + panelWidth,
            y: top + panelHeight * 0.55,
          }}
          onSetMenuHoveredOn={setHoveredOn}
          familyTree={familyTree}
          selectedPerson={selectedPerson}
        />
      )}
    </>
  );
};

export default PersonMenu;
