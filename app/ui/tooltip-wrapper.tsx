import { InformationCircleIcon } from "@heroicons/react/20/solid";
import React, { ReactNode } from "react";
import { Tooltip } from "react-tooltip";

interface TextWrapperProps {
  id: string;
  children: ReactNode;
}

const TooltipWrapper: React.FC<TextWrapperProps> = ({ id, children }) => {
  return (
    <div className="static inline-block h-1.25 w-1.25">
      <span className="h-1.25 w-1.25" onClick={(e) => e.preventDefault()}>
        <a
          className="relative top-0 inline-block w-10 cursor-help pl-1"
          data-tooltip-id={id}
        >
          &nbsp;
          <InformationCircleIcon className="inline size-5 text-slate-300" />
        </a>
        <Tooltip id={id} className="info-tooltip">
          {children}
        </Tooltip>
      </span>
    </div>
  );
};

export default TooltipWrapper;
