import { clsx } from "clsx";
import React from "react";

export function FieldSet({ children }: { children: React.ReactNode }) {
  return (
    <fieldset className="my-2 mt-5 flex flex-col gap-y-4 rounded-md border border-slate-500 px-4 pt-2 pb-5 tracking-[0.9]">
      {children}
    </fieldset>
  );
}

export function Legend({ children, className }: { children: React.ReactNode; className?: string }) {
  return <legend className={clsx(`mb-2 ml-1 px-2 font-bold uppercase`, className)}>{children}</legend>;
}
