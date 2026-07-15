import React from "react";
import { Svg } from "@/app/types/Svg";

const Melee: React.FC<Svg> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 7.35 7.35"
      className={className}
    >
      <g transform="translate(0 0.175)">
        <g>
          <g>
            <g>
              <path
                fill="currentColor"
                d="M3.81,5.85l-.13-.31-.53.54.53.53-.59.59-.41.41-.13-.14-.34.34.35.35.35.35.34-.34L3.12,8l.4-.41L4.11,7l.53.53L5.18,7l-.31-.13-.19-.19L6.24,5.16l.65-.65c.38-.38,2.25-2.39,2.32-3-.62.05-2.62,1.94-3,2.32l-.62.63L4,6Z"
                transform="translate(-2.21 -1.51)"
              />
              <path
                fill="currentColor"
                d="M6.9,6.91,6.6,7l.53.53L7.66,7l.59.59L8.66,8l-.14.13.34.34.35-.35.35-.35-.33-.34-.14.14L8.68,7.2l-.59-.59.53-.53-.53-.54L8,5.85,7.77,6,6.21,4.48l-.65-.65c-.38-.38-2.38-2.25-3-2.32.06.62,1.95,2.62,2.32,3,0,0,.31.3.63.63L7.1,6.72Z"
                transform="translate(-2.21 -1.51)"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default Melee;
