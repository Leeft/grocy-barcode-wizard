"use client";

import React, { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Barcode, Rows3, Settings } from "lucide-react";
import { CountPendingProducts } from "@/lib/product-db";

export default function Navbar({ promise }: { promise: Promise<CountPendingProducts> }) {
  const iconClassName = "relative top-[-2] inline";
  const count = use(promise);
  return (
    <nav className="mb-3 text-slate-500">
      <div className="flex flex-wrap gap-x-0.5 md:gap-x-2 pt-2 text-xs font-bold uppercase md:text-lg tracking-tight md:tracking-normal">
        <NavigationElement href="/">
          <House size="15" className={iconClassName} /> Home
        </NavigationElement>
        <NavigationElement href="/scan">
          <Barcode size="15" className={iconClassName} /> Scan
        </NavigationElement>
        <NavigationElement href="/queue">
          <Rows3 size="15" className={iconClassName} /> Queue <span className="brightness-150">({count})</span>
        </NavigationElement>
        <NavigationElement href="/settings">
          <Settings size="15" className={iconClassName} /> Settings
        </NavigationElement>
      </div>
    </nav>
  );
}

function NavigationElement({
  href,
  children,
}: {
  href: __next_route_internal_types__.RouteImpl<string>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const stripRegexp = new RegExp("^/(scan|queue|settings)?(/.*)$");
  const simplePath = pathname.replace(stripRegexp, "/$1");
  const active = href.toString() === simplePath;

  return (
    <Link
      href={href}
      className={
        `cursor-pointer rounded-sm px-2 text-nowrap hover:bg-slate-500 hover:text-slate-200 ` +
        (active ? "text-menu-active" : "")
      }
    >
      {children}
    </Link>
  );
}
