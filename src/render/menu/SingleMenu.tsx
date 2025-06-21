export interface SingleMenuProps {
  id: number;
  text: string;
  available: boolean;
  onClick: () => void;
  hoveredOn: number | undefined;
  setHoveredOn: (id: number | undefined) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const SingleMenu: React.FC<SingleMenuProps> = ({
  id,
  text,
  onClick,
  available,
  hoveredOn,
  setHoveredOn,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      style={{
        cursor: "pointer",
        backgroundColor:
          hoveredOn === id && available ? "rgb(233, 233, 233)" : "white",
        paddingTop: 2,
        paddingBottom: 2,
        zIndex: 1,
        color: available ? "black" : "rgba(104, 104, 104, 0.75)",
      }}
      onClick={onClick}
      onMouseEnter={() => {
        setHoveredOn(id);
        if (onMouseEnter !== undefined) {
          onMouseEnter();
        }
      }}
      onMouseLeave={onMouseLeave}
    >
      {text}
    </div>
  );
};

export default SingleMenu;
