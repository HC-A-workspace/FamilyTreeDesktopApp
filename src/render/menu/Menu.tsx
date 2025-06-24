import { useState } from "react";
import { Position } from "../../model/FundamentalData";
import "./Menu.css";

type SingleMenuProperties = {
  text: string;
  onClick: () => void;
  icon?: string;
  available?: boolean;
  onEntered?: () => void;
};

export type SingleMenu = SingleMenuProperties | undefined;

const SingleMenu: React.FC<SingleMenuProperties> = ({
  text,
  onClick,
  icon,
  available,
  onEntered,
}) => {
  const [isHoveredOn, setIsHoveredOn] = useState(false);
  const isAvailable = available ?? true;
  return (
    <div
      className="single-menu"
      style={{
        backgroundColor:
          isHoveredOn && isAvailable ? "rgb(233, 233, 233)" : "white",
        color: isAvailable ? "black" : "rgba(104, 104, 104, 0.75)",
      }}
      onClick={onClick}
      onMouseEnter={() => {
        setIsHoveredOn(true);
        onEntered?.();
      }}
      onMouseLeave={() => {
        setIsHoveredOn(false);
      }}
    >
      <div className="single-menu-icon">{icon ?? ""}</div>
      <div className="single-menu-text">{text}</div>
    </div>
  );
};

interface MenuProperties {
  position: Position;
  menus: SingleMenu[]; // undefuned は横線
}

const Menu: React.FC<MenuProperties> = ({ position, menus }) => {
  return (
    <div className="menu-panel" style={{ top: position.y, left: position.x }}>
      {menus.map((menu, key) => {
        if (menu === undefined) {
          return (
            <div key={key}>
              <hr />
            </div>
          );
        } else {
          return (
            <div key={key}>
              <SingleMenu
                text={menu.text}
                onClick={menu.onClick}
                available={menu.available}
                icon={menu.icon}
                onEntered={menu.onEntered}
              />
            </div>
          );
        }
      })}
    </div>
  );
};

export default Menu;
