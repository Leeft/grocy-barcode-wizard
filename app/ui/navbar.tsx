"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Barcode, Rows3, Settings } from "lucide-react";

export default function Navbar() {
  const iconClassName = "relative top-[-2] inline";
  return (
    <nav className="mb-3 text-slate-500">
      <div className="flex flex-wrap gap-x-2 pt-2 text-xs font-bold uppercase md:text-lg">
        <NavigationElement href="/">
          <House size="15" className={iconClassName} /> Home
        </NavigationElement>
        <NavigationElement href="/scan">
          <Barcode size="15" className={iconClassName} /> Scan
        </NavigationElement>
        <NavigationElement href="/queue">
          <Rows3 size="15" className={iconClassName} /> Queue
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
        (active ? "text-amber-200" : "")
      }
    >
      {children}
    </Link>
  );
}
