import React from "react";
import { Svg } from "@/app/types/Svg";

const Attacks: React.FC<Svg> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 19.55 19.55"
      className={className}
    >
      <g transform="translate(1.18 0)">
        <g>
          <g>
            <path
              fill="currentColor"
              d="M6.75,12.5,6,12.22v1.65H7.84v4.64H7.37v1H9.81v-1H9.34V13.87h1.85V12.22l-.75.28H9.77V5.65c0-1.17-.24-4.59-1.18-5.65-1,1-1.17,4.48-1.17,5.65V12.5Z"
            />
            <path
              fill="currentColor"
              d="M12.75,12.5,12,12.22v1.65h1.84v4.64h-.47v1h2.44v-1h-.47V13.87h1.85V12.22l-.75.28h-.67V5.65c0-1.17-.24-4.59-1.18-5.65-1,1-1.17,4.48-1.17,5.65V12.5Z"
            />
            <path
              fill="currentColor"
              d="M.75,12.5,0,12.22v1.65H1.84v4.64H1.37v1H3.81v-1H3.34V13.87H5.19V12.22l-.75.28H3.77V5.65c0-1.17-.24-4.59-1.18-5.65-1,1-1.17,4.48-1.17,5.65V12.5Z"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default Attacks;
