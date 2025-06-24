import { type Position } from "../../model/FundamentalData";
import Menu, { SingleMenu } from "./Menu";
// import SingleMenu from "./SingleMenu";

interface ContextMenuProps {
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
  const panelHeight = 62;
  const panelWidth = 170;
  const top =
    position.y + panelHeight < canvasHeight
      ? position.y
      : position.y - panelHeight;
  const left =
    position.x + panelWidth < canvasWidth
      ? position.x
      : position.x - panelWidth;

  const menus: SingleMenu[] = [
    {
      text: "人物を新規作成",
      onClick: () => {
        onAddPerson();
        onClose();
      },
    },
    {
      text: "スポットを新規作成",
      onClick: () => {
        onAddSpot();
        onClose();
      },
    },
  ];
  return <Menu position={{ x: left, y: top }} menus={menus} />;
};

export default ContextMenu;
