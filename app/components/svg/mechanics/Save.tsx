import React from "react";
import { Svg } from "@/app/types/Svg";

const Save: React.FC<Svg> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18.64 18.64"
      className={className}
    >
      <g transform="translate(2.765 0)">
        <g>
          <g>
            <path
              fill="currentColor"
              d="M6.55,0H0V10.13c0,2.35,1.14,6.59,6.55,8.51,5.41-1.92,6.56-6.16,6.56-8.51V0Z"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default Save;
