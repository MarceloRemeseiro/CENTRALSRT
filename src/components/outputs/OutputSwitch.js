import React from "react";

const OutputSwitch = ({ output, onToggle }) => {
  const getSwitchColor = () => {
    if (output.state === "failed") return "bg-red-500";
    if (output.state === "running") return "bg-green-500";
    return "bg-gray-300";
  };

  const switchStyle = `relative inline-flex h-6 w-11 items-center rounded-full transition ${getSwitchColor()}`;
  const circleStyle = `inline-block h-4 w-4 rounded-full bg-white transition transform ${
    output.state === "running" ? "translate-x-6" : "translate-x-1"
  }`;

  return (
    <div className={switchStyle} onClick={() => onToggle(output.id, output.state)}>
      <span className={circleStyle} />
    </div>
  );
};

export default OutputSwitch; 