import React from "react";
import { Svg } from "@/app/types/Svg";

const Move: React.FC<Svg> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 21.91 21.91"
      className={className}
    >
      <g transform="translate(5.18 0)">
        <g>
          <g>
            <path
              fill="currentColor"
              d="M9.37,7.9l2.18,2.19V0H1.47L3.71,2.24c-5.32,6-4.91,13.59,1.17,19.67l5.64-5.65A8.18,8.18,0,0,1,8,11.8,5.09,5.09,0,0,1,9.37,7.9"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default Move;
