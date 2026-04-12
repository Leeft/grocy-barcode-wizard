import { InformationCircleIcon } from "@heroicons/react/20/solid";
import React, { ReactNode } from "react";
import { Tooltip } from "react-tooltip";

interface TextWrapperProps {
  id: string;
  children: ReactNode;
}

const TooltipWrapper: React.FC<TextWrapperProps> = ({ id, children }) => {
  return (
    <span onClick={(e) => e.preventDefault()}>
      <a
        className="relative top-[-3] inline-block w-10 cursor-help pl-1"
        data-tooltip-id={id}
      >
        &nbsp;
        <InformationCircleIcon className="inline size-5 text-slate-300" />
      </a>
      <Tooltip id={id} className="info-tooltip">
        {children}
      </Tooltip>
    </span>
  );
};

export default TooltipWrapper;
