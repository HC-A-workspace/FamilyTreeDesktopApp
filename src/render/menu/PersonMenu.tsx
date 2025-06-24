import { useEffect, useState } from "react";
import { State } from "../main/Canvas";
import { FamilyTree } from "../../model/FamilyTree";
import type { Position } from "../../model/FundamentalData";
import type { Person } from "../../model/Person";
import Menu, { SingleMenu } from "./Menu";

interface SelectRelationProps {
  position: Position;
  familyTree: FamilyTree;
  selectedPerson: Person;
  onSetState: (state: State) => void;
  onClose: () => void;
}

const SelectRelation: React.FC<SelectRelationProps> = ({
  position,
  familyTree,
  selectedPerson,
  onSetState,
  onClose,
}) => {
  const menus: SingleMenu[] = [
    {
      text: "配偶者を選択",
      onClick: () => {
        onSetState(State.SelectingSpouse);
        onClose();
      },
    },
    {
      text: "子を選択",
      onClick: () => {
        onSetState(State.SelectingChild);
        onClose();
      },
    },
    {
      text: "親を選択",
      onClick: () => {
        if (familyTree.findParents(selectedPerson.getId()).length < 2) {
          onSetState(State.SelectingParent);
          onClose();
        }
      },
      available: familyTree.findParents(selectedPerson.getId()).length < 2,
    },
    {
      text: "兄弟を選択",
      onClick: () => {
        onSetState(State.SelectingBrother);
        onClose();
      },
    },
    {
      text: "養子を選択",
      onClick: () => {
        onSetState(State.SelectingAdoptedChild);
        onClose();
      },
    },
    {
      text: "養親を選択",
      onClick: () => {
        if (familyTree.findAdoptedParents(selectedPerson.getId()).length < 2) {
          onSetState(State.SelectingAdoptedParent);
          onClose();
        }
      },
      available:
        familyTree.findAdoptedParents(selectedPerson.getId()).length < 2,
    },
  ];

  return <Menu position={position} menus={menus} />;
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
  const [selectRelationVisible, setSelectRelationVisible] = useState(false);
  const panelHeight = 208;
  const panelWidth = 170;
  const addRelationPos = 124;
  const overwrap = 20;
  const relationPanelHeight = 154;
  const relationPanelWidth = 131;

  const hasRelation = (() => {
    const data = selectedPerson.raw();
    if (data.parentMarriageId !== undefined) return true;
    if (data.marriageIds.length > 0) return true;
    if (data.adoptedParentMarriageId !== undefined) return true;
    return false;
  })();

  const top =
    position.y + panelHeight < canvasHeight
      ? position.y
      : position.y - panelHeight;
  const left =
    position.x + panelWidth < canvasWidth
      ? position.x
      : position.x - panelWidth;

  const relationTop =
    top + addRelationPos + relationPanelHeight < canvasHeight
      ? top + addRelationPos
      : canvasHeight - relationPanelHeight - overwrap;
  const relationLeft =
    left + panelWidth - overwrap + relationPanelWidth < canvasWidth
      ? left + panelWidth - overwrap
      : left - relationPanelWidth + overwrap;

  const menus: SingleMenu[] = [
    {
      text: "プロフィールを表示",
      onClick: () => {
        setSelectRelationVisible(false);
        onShowPerson();
        onClose();
      },
      onEntered: () => setSelectRelationVisible(false),
    },
    {
      text: "プロフィールを編集",
      onClick: () => {
        setSelectRelationVisible(false);
        onEditPerson();
        onClose();
      },
      onEntered: () => setSelectRelationVisible(false),
    },
    undefined,
    {
      text: "垂直方向を固定",
      icon: selectedPerson.getIsFixedVertically() ? "✓" : undefined,
      onClick: () => {
        onFixVertically();
        onClose();
      },
      onEntered: () => setSelectRelationVisible(false),
    },
    undefined,
    {
      text: "関係を追加...",
      onClick: () => {},
      onEntered: () => setSelectRelationVisible(true),
    },
    {
      text: "関係を削除",
      onClick: () => {
        if (hasRelation) {
          onSetState(State.CancellingRelation);
          setSelectRelationVisible(false);
          onClose();
        }
      },
      onEntered: () => setSelectRelationVisible(false),
      available: hasRelation,
    },
    undefined,
    {
      text: "人物を削除",
      onClick: () => {
        onDeletePerson();
        setSelectRelationVisible(false);
        onClose();
      },
      onEntered: () => setSelectRelationVisible(false),
    },
  ];

  return (
    <>
      <Menu position={{ x: left, y: top }} menus={menus} />
      {selectRelationVisible && (
        <SelectRelation
          onClose={() => {
            setSelectRelationVisible(false);
            onClose();
          }}
          onSetState={onSetState}
          position={{
            x: relationLeft,
            y: relationTop,
          }}
          familyTree={familyTree}
          selectedPerson={selectedPerson}
        />
      )}
    </>
  );
};

export default PersonMenu;
