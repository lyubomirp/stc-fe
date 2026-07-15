import React from "react";
import { Svg } from "@/app/types/Svg";

const Assault: React.FC<Svg> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24.67 24.67"
      className={className}
    >
      <g transform="translate(0.85 0)">
        <g>
          <g>
            <polygon
              fill="currentColor"
              points="11.48 7.11 17.23 14.21 22.97 14.21 11.48 0 0 14.21 5.74 14.21 11.48 7.11"
            />
            <polygon
              fill="currentColor"
              points="11.48 17.56 17.23 24.67 22.97 24.67 11.48 10.46 0 24.67 5.74 24.67 11.48 17.56"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default Assault;
