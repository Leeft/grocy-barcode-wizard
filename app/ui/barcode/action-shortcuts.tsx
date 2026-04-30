"use client";

import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import { ShoppingBasket, X, Trash2, PackageOpen, ShelvingUnit, MoveRight, List } from "lucide-react";
import { Product, StockEntry } from "@/interfaces/grocy";
import React, { use, useContext } from "react";
import { UrlObject } from "url";
import { RouteType } from "next/dist/lib/load-custom-routes";
import { GrocyProductContext } from "@/providers/grocy-product-context";
import { ProductStockContext } from "@/providers/product-stock-context";

export default function ActionShortCuts({ code }: { code: string }) {
  const product = use(useContext(GrocyProductContext) as Promise<Product>);
  const stock = use(useContext(ProductStockContext) as Promise<StockEntry[]>);

  if (product.active === 0) return <></>;

  const hasStock = stock.length > 0;
  const iconClasses = clsx("inline", "size-7", "pr-2");

  return (
    <fieldset className="my-2 mt-5 flex flex-col gap-y-4 rounded-md border border-slate-500 px-4 pt-2 pb-5 tracking-[0.9]">
      <legend className="text-gray-200 mb-1 ml-1 px-2 font-bold uppercase">Product actions</legend>
      <div className="mb-1 flex flex-row flex-wrap gap-3">
        <ActionLink href={`/scan/${code}/add`} className={"text-add border-add bg-add/10"}>
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
          href={`/scan/${code}/open`}
          className={"text-open border-open bg-open/10"}
          disabled={product.disable_open || !hasStock ? true : false}
        >
          <PackageOpen className={iconClasses} />
          Open ...
        </ActionLink>

        <ActionLink
          href={`/scan/${code}`}
          className={"text-transfer border-transfer bg-transfer/10"}
          disabled={!hasStock ? true : false}
        >
          <MoveRight className={iconClasses} />
          Transfer ...
        </ActionLink>

        <ActionLink
          href={`/scan/${code}`}
          className={"text-inventory border-inventory bg-inventory/10"}
          disabled={!hasStock ? true : false}
        >
          <ShelvingUnit className={iconClasses} />
          Inventory ...
        </ActionLink>

        <ActionLink
          href={`/scan/${code}`}
          className={"text-shopping-list border-shopping-list bg-shopping-list/10"}
        >
          <List className={iconClasses} />
          Add to shopping list ...
        </ActionLink>
      </div>{" "}
    </fieldset>
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
  // temporary (yeah, right) way to disable urls that point to self as these pages
  // are being implemented
  const re = new RegExp(/^\/scan\/[^\/]+$/);
  if (re.test(href.toString())) {
    disabled = true;
  }

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
