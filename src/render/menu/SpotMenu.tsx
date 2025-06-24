import { type Position } from "../../model/FundamentalData";
import Menu, { SingleMenu } from "./Menu";

export interface SpotMenuProps {
  position: Position;
  canvasWidth: number;
  canvasHeight: number;
  onClose: () => void;
  onEditSpot: () => void;
  onDeleteSpot: () => void;
}

const SpotMenu: React.FC<SpotMenuProps> = ({
  position,
  canvasWidth,
  canvasHeight,
  onClose,
  onEditSpot,
  onDeleteSpot,
}) => {
  const panelHeight = 62;
  const panelWidth = 144;
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
      text: "スポットを編集",
      onClick: () => {
        onEditSpot();
        onClose();
      },
    },
    {
      text: "スポットを削除",
      onClick: () => {
        onDeleteSpot();
        onClose();
      },
    },
  ];

  return <Menu position={{ x: left, y: top }} menus={menus} />;
};

export default SpotMenu;
