"use client";

import BarcodeAction from "./barcode-action";
import { Barcode } from "@/interfaces";
import React, { useEffect, useState } from "react";

export default function BarcodeDetails({
  barcode,
  editing,
  isFlashing,
  children,
}: {
  barcode: Barcode | null;
  editing: boolean;
  isFlashing: boolean;
  children: React.ReactNode;
}) {

  const logoWidth: number = 135*0.75;
  const logoHeight: number = 135*0.45;

  return (
    <div className="max-w-240">

      {children}

      {barcode !== null && barcode != null ? (
        <div>

          <div className="relative flex 200 flex-col rounded-lg bg-slate-800 shadow-sm">
            <nav className="flex min-w-[240px] flex-col gap-1 p-1.5">
              <BarcodeAction
                qr="sho:c"
                qrBgColor="#61e6d0"
                logoImage={"http://192.168.10.48:3000/icons/consume.png"}
                logoWidth={logoWidth}
                logoHeight={logoHeight}
                title="Consume"
                barcode={barcode}
                description="Consume stock associated with the barcode"
                disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
                ecLevel={"H"}
              />
              <BarcodeAction
                qr="sho:ca"
                qrBgColor="hsl(24, 63%, 60%)"
                logoImage="/icons/consume_all.png"
                logoWidth={logoWidth}
                logoHeight={logoHeight}
                title="Consume all"
                barcode={barcode}
                description="Remove all remaining inventory as consumed"
                disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
                ecLevel={"H"}
              />
              <BarcodeAction
                qr="sho:cs"
                qrBgColor="hsl(345, 25%, 65%)"
                logoImage="/icons/spoiled.png"
                logoWidth={logoWidth*0.8}
                logoHeight={logoHeight*0.8}
                title="Consume spoiled"
                barcode={barcode}
                description="Remove remaining inventory and mark it as spoiled"
                disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
                ecLevel={"Q"}
              />
              <BarcodeAction
                qr="sho:p"
                qrBgColor="hsl(121, 24%, 56%)"
                logoImage="/icons/purchased.png"
                logoWidth={logoWidth*0.8}
                logoHeight={logoHeight*0.8}
                title="Purchase"
                barcode={barcode}
                description="Add the item to the inventory, and remove from shopping list if this is configured"
                ecLevel={"H"}
              />
              <BarcodeAction
                qr="sho:o"
                qrBgColor="hsl(171, 55%, 78%)"
                logoImage="/icons/open.png"
                logoWidth={logoWidth*0.9}
                logoHeight={logoHeight*0.9}
                title="Open"
                barcode={barcode}
                description="Mark item as having been opened"
                disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
                ecLevel={"H"}
              />
              <BarcodeAction
                qr="sho:i"
                qrBgColor="hsl(281, 46%, 66%)"
                logoImage="/icons/inventory.png"
                logoWidth={logoWidth*0.9}
                logoHeight={logoHeight*0.9}
                title="Inventory"
                barcode={barcode}
                description="Refresh inventory information"
                ecLevel={"H"}
              />
              <BarcodeAction
                qr="sho:as"
                qrBgColor="hsl(219, 37%, 58%)"
                logoImage="/icons/shopping_list.png"
                logoWidth={logoWidth*0.9}
                logoHeight={logoHeight*0.9}
                title="Add to shopping list"
                barcode={barcode}
                description="Add the item to the shopping list for restocking"
                ecLevel={"H"}
              />
            </nav>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

