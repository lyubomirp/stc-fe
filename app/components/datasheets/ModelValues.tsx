import React from "react";
import _ from "lodash";

const ModelValues: React.FC<{
  value: string;
  title: string;
  tooltipTitle?: string;
  className?: string;
  style?: any;
}> = ({ value, title, tooltipTitle, className, style }) => {
  return (
    <div
      className={`group flex flex-col min-w-16 h-16 justify-center border border-white rounded-full ${className}`}
      style={style}
    >
      {tooltipTitle && (
        <span
          className={
            "pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 " +
            "-translate-x-1/2 whitespace-nowrap rounded-sm bg-white px-1 " +
            "text-sm text-black opacity-0 transition-opacity group-hover:opacity-100"
          }
        >
          {_.capitalize(tooltipTitle)}
        </span>
      )}
      <span className={"self-center text-sm underline"}>
        {_.capitalize(title)}
      </span>
      <span className={"self-center text-2xl"}>{value}</span>
    </div>
  );
};

export default ModelValues;
