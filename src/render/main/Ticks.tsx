import React from "react"

interface TicksProperties {
  top: number,
  left: number,
  width: number,
  height: number,
  ticks: {height: number, text: string}[],
  onWheel: (e: React.WheelEvent) => void
}

const Ticks: React.FC<TicksProperties> = ({
  top,
  left,
  width,
  height,
  ticks,
  onWheel
}) => {
  return (
    <div 
      style={{
        position: "absolute",
        top: top,
        left: left,
        width: width,
        height: height,
      }}          
      onWheel={onWheel}
    >
      {ticks.map(({height, text}, idx) => (
        <React.Fragment key={idx}>
          <div style={{position: "absolute", top: height - 10, left: 10, height: 20, display: "flex", alignItems: "center"}}>{text}</div>
        </React.Fragment>
      ))}
    </div>)
}

export default Ticks