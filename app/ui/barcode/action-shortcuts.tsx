"use client";

import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import { ShoppingBasket, X, Trash2, PackageOpen, ShelvingUnit, MoveRight } from "lucide-react";
import { Product, StockEntry } from "@/interfaces/grocy";
import React from "react";
import { UrlObject } from "url";
import { RouteType } from "next/dist/lib/load-custom-routes";

export default function ActionShortCuts({
  barcode,
  product,
  hasStock,
}: {
  barcode: string;
  product: Product;
  hasStock: boolean;
}) {
  const iconClasses = clsx("inline", "size-7", "pr-2");

  return (
    <div className="mb-3 flex flex-row flex-wrap gap-3">
      <ActionLink href={`/scan/${barcode}/add`} className={"text-add border-add bg-add/10"}>
        <ShoppingBasket className={iconClasses} />
        Purchase ...
      </ActionLink>

      <ActionLink
        href={`/scan/${barcode}`}
        className={"text-consume border-consume bg-consume/10"}
        disabled={!hasStock ? true : false}
      >
        <X className={iconClasses} />
        Consume ...
      </ActionLink>

      <ActionLink
        href={`/scan/${barcode}`}
        className={"text-spoiled border-spoiled bg-spoiled/10"}
        disabled={!hasStock ? true : false}
      >
        <Trash2 className={iconClasses} />
        Spoiled ...
      </ActionLink>

      <ActionLink
        href={`/scan/${barcode}`}
        className={"text-open border-open bg-open/10"}
        disabled={product.disable_open || !hasStock ? true : false}
      >
        <PackageOpen className={iconClasses} />
        Open ...
      </ActionLink>

      <ActionLink
        href={`/scan/${barcode}`}
        className={"text-transfer border-transfer bg-transfer/10"}
        disabled={!hasStock ? true : false}
      >
        <MoveRight className={iconClasses} />
        Transfer ...
      </ActionLink>

      <ActionLink
        href={`/scan/${barcode}`}
        className={"text-inventory border-inventory bg-inventory/10"}
        disabled={!hasStock ? true : false}
      >
        <ShelvingUnit className={iconClasses} />
        Inventory ...
      </ActionLink>

      <ActionLink
        href={`/scan/${barcode}`}
        className={"text-shopping-list border-shopping-list bg-shopping-list/10"}
      >
        <ShoppingBasket className={iconClasses} />
        Add to shopping list ...
      </ActionLink>
    </div>
  );
}

interface ActionLinkProps extends Omit<LinkProps<RouteType>, "href" | "className"> {
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  href: UrlObject | __next_route_internal_types__.RouteImpl<RouteType> | string;
}

export const ActionLink: React.FC<ActionLinkProps> = ({
  disabled = false,
  children,
  className,
  href,
  ...rest
}) => {
  const classes = clsx(
    "border",
    "rounded-lg",
    "p-2",
    "w-auto",
    "uppercase",
    "font-bold",
    "tracking-wider",
    "text-center",
    "text-nowrap!",
    "flex-grow",
    "max-w-70",
    className,
    disabled ? clsx("cursor-default", "disabled", "opacity-40") : "",
  );

  return (
    <Link
      {...rest}
      href={href as UrlObject | __next_route_internal_types__.RouteImpl<RouteType>}
      className={classes}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
    >
      {children}
    </Link>
  );
};
