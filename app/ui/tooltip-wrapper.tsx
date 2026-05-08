import { Info } from "lucide-react";
import React, { ReactNode } from "react";
import { Tooltip } from "react-tooltip";

interface TextWrapperProps {
  id: string;
  className?: string;
  children: ReactNode;
}

const TooltipWrapper: React.FC<TextWrapperProps> = ({ id, children, className }) => {
  return (
    <div className={`static inline-block h-1.25 w-1.25 ${className}`}>
      <span className="h-1.25 w-1.25" onClick={(e) => e.preventDefault()}>
        <a className="relative top-0 inline-block w-10 cursor-help pl-1" data-tooltip-id={id}>
          &nbsp;
          <Info className="inline size-5 text-form-label/50 mt-[-2]" />
        </a>
        <Tooltip id={id} className="info-tooltip">
          {children}
        </Tooltip>
      </span>
    </div>
  );
};

export default TooltipWrapper;
