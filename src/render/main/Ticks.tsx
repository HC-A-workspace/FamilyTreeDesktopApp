import React from "react";
import "./Ticks.css";

interface TicksProperties {
  top: number;
  left: number;
  width: number;
  height: number;
  ticks: { height: number; text: string }[];
  onWheel: (e: React.WheelEvent) => void;
}

const Ticks: React.FC<TicksProperties> = ({
  top,
  left,
  width,
  height,
  ticks,
  onWheel,
}) => {
  return (
    <div
      className="tick-panel"
      style={{
        top: top,
        left: left,
        width: width,
        height: height,
      }}
      onWheel={onWheel}
    >
      {ticks.map(({ height, text }, idx) => (
        <React.Fragment key={idx}>
          <div
            id="tick"
            style={{
              top: height - 10,
              left: 10,
              height: 20,
            }}
          >
            {text}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Ticks;
