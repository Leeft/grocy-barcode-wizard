import React from "react";
import { clsx } from "clsx";
import { inputCommonStyles } from "@/lib/product-form-shared";
import { Button } from "@/ui/button";
import { FormColumn } from "@/ui/forms/form-utils";

export function ActionFormSubmit({
  children,
  pending,
  className,
}: {
  children: React.ReactNode;
  pending: boolean;
  className: string;
}) {
  return (
    <FormColumn className="pt-3">
      <Button
        type="submit"
        className={clsx(inputCommonStyles, "cursor-pointer", className)}
        disabled={pending}
      >
        {children}
      </Button>
    </FormColumn>
  );
}
