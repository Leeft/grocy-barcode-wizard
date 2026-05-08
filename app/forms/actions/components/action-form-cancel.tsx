import { inputCommonStyles } from "@/lib/product-form-shared";
import { FormColumn } from "@/ui/forms/form-utils";
import { clsx } from "clsx";
import Link from "next/link";
import React, { MouseEventHandler } from "react";

export function ActionFormCancel({
  code,
  onClick,
  children,
}: {
  code: string;
  onClick: MouseEventHandler<HTMLAnchorElement>;
  children: React.ReactNode;
}) {
  return (
    <FormColumn className="pt-5.5">
      <Link
        prefetch={false}
        href={`/scan/${code}`}
        onClick={onClick}
        className={clsx(
          inputCommonStyles,
          "cursor-pointer",
          "p-2.5!",
          "rounded-lg",
          "bg-form-cancel-button/30!",
          "border-form-cancel-button/70!",
        )}
      >
        {children}
      </Link>
    </FormColumn>
  );
}
