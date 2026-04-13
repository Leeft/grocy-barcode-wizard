"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Barcode, Rows3, Settings } from "lucide-react";

export default function Navbar() {
  const iconClassName = "relative top-[-2] inline";
  const pathname = usePathname();
  const [/*clientPathname */, setClientPathname] = useState("");

  useEffect(() => {
    setClientPathname(pathname);
  }, [pathname]);

  return (
    <nav className="mb-3 text-slate-500">
      <div className="flex flex-wrap gap-x-2 pt-2 text-xs font-bold uppercase md:text-lg">
        <NavigationElement href="/" pathName={pathname}>
          <House size="15" className={iconClassName} /> Home
        </NavigationElement>
        <NavigationElement href="/scan" pathName={pathname}>
          <Barcode size="15" className={iconClassName} /> Scan
        </NavigationElement>
        <NavigationElement href="/queue" pathName={pathname}>
          <Rows3 size="15" className={iconClassName} /> Queue
        </NavigationElement>
        <NavigationElement href="/settings" pathName={pathname}>
          <Settings size="15" className={iconClassName} /> Settings
        </NavigationElement>
      </div>
    </nav>
  );
}

function NavigationElement({
  href,
  children,
  pathName,
}: {
  href: __next_route_internal_types__.RouteImpl<string>;
  children: React.ReactNode;
  pathName: string;
}) {
  return (
    <Link
      href={href}
      className={
        `cursor-pointer rounded-sm px-2 text-nowrap hover:bg-slate-500 hover:text-slate-200 ` +
        (href.toString() === pathName ? "text-amber-200" : "")
      }
    >
      {children}
    </Link>
  );
}
