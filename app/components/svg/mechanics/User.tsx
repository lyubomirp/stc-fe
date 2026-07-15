import React from "react";
import { Svg } from "@/app/types/Svg";

const User: React.FC<Svg> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 6.52 6.52"
      className={className}
    >
      <g>
        <g>
          <path
            fill="currentColor"
            d="M0,3.26A3.26,3.26,0,1,1,3.26,6.52,3.26,3.26,0,0,1,0,3.26"
          />
          <polygon
            fill="#000"
            points="4.72 3.26 5.79 4.72 3.99 4.53 3.26 6.19 2.53 4.53 0.73 4.72 1.8 3.26 0.73 1.8 2.53 1.99 3.26 0.33 3.99 1.99 5.79 1.8 4.72 3.26"
          />
        </g>
      </g>
    </svg>
  );
};

export default User;
