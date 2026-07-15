import React from "react";
import { Svg } from "@/app/types/Svg";

const BallisticSkill: React.FC<Svg> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 21.28 21.28"
      className={className}
    >
      <g transform="translate(0.025 0)">
        <g>
          <g>
            <path
              fill="currentColor"
              d="M16.7,10.14l.59,1.06H16l-.13-.46A7.63,7.63,0,0,0,10.5,5.38L10,5.25V4l1.05.58L11.68,0l2,4.12L16.78.81l-.84,4.48,4.48-.84L17.11,7.59l4.12,2Z"
            />
            <path
              fill="currentColor"
              d="M6.63,6V7.67a5.4,5.4,0,0,0-2,1.26,5.31,5.31,0,0,0-1.25,2H1.77A7,7,0,0,1,3.55,7.83,6.89,6.89,0,0,1,6.63,6"
            />
            <path
              fill="currentColor"
              d="M15.18,10.92H13.55a5.28,5.28,0,0,0-1.25-2h0a5.4,5.4,0,0,0-2-1.26V6a6.91,6.91,0,0,1,4.86,4.88"
            />
            <rect fill="currentColor" x="12.3" y="11.89" />
            <rect fill="currentColor" x="7.6" y="4.26" />
            <path
              fill="currentColor"
              d="M15.18,14.61a6.88,6.88,0,0,1-1.78,3.1,7,7,0,0,1-3.08,1.79V17.86a5.25,5.25,0,0,0,2-1.25,5.47,5.47,0,0,0,1.26-2Z"
            />
            <rect fill="currentColor" y="11.89" />
            <rect fill="currentColor" x="7.6" y="16.61" />
            <path
              fill="currentColor"
              d="M6.63,17.86V19.5a6.9,6.9,0,0,1-4.86-4.89H3.4a5.43,5.43,0,0,0,1.25,2,5.25,5.25,0,0,0,2,1.25"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default BallisticSkill;
