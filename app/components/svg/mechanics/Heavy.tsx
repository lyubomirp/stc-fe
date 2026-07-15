import React from "react";
import { Svg } from "@/app/types/Svg";

const Heavy: React.FC<Svg> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 25.08 25.08"
      className={className}
    >
      <g transform="translate(0 0.27)">
        <g>
          <g>
            <polygon
              fill="currentColor"
              points="12.54 0 9.34 10.03 2.88 6.29 5.61 15.22 0 13.85 5.68 22.31 3.45 24.54 21.79 24.54 19.46 22.22 25.08 13.85 19.48 15.22 22.21 6.29 15.75 10.03 12.54 0"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default Heavy;
