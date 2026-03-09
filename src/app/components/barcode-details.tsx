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
  return (
    <div>
      {children}

      {barcode !== null && barcode != null ? (
        <div className="w-200">
          <BarcodeHeader barcode={barcode} />
          <br />
          <br />
          <div className="relative flex 200 flex-col rounded-lg border border-slate-500 bg-slate-300 shadow-sm">
            <nav className="flex min-w-[240px] flex-col gap-1 p-1.5">
              <BarcodeAction
                qr="sho:consume"
                qrBgColor="#ffffaa"
                title="Consume"
                barcode={barcode}
                description="Consume stock associated with the barcode"
                disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
              />
              <BarcodeAction
                qr="sho:useall"
                qrBgColor="hsl(24, 63%, 60%)"
                title="Consume all"
                barcode={barcode}
                description="Remove all remaining inventory as consumed"
                disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
              />
              <BarcodeAction
                qr="sho:spoiled"
                qrBgColor="hsl(345, 49%, 62%)"
                title="Consume spoiled"
                barcode={barcode}
                description="Remove remaining inventory and mark it as spoiled"
                disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
              />
              <BarcodeAction
                qr="sho:purchase"
                qrBgColor="hsl(121, 26%, 52%)"
                title="Purchase"
                barcode={barcode}
                description="Add the item to the inventory, and remove from shopping list if this is configured"
              />
              <BarcodeAction
                qr="sho:open"
                qrBgColor="hsl(171, 55%, 78%)"
                title="Open"
                barcode={barcode}
                description="Mark item as having been opened"
                disable={barcode.quantity === undefined || barcode.quantity <= 0 ? true : false}
              />
              <BarcodeAction
                qr="sho:inventory"
                qrBgColor="hsl(0, 0%, 93%)"
                title="Inventory"
                barcode={barcode}
                description="Refresh inventory information"
              />
              <BarcodeAction
                qr="sho:shop"
                qrBgColor="hsl(295, 39%, 74%)"
                title="Add to shopping list"
                barcode={barcode}
                description="Add the item to the shopping list for restocking"
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

function BarcodeHeader({ barcode }: { barcode: Barcode }) {
  if (barcode.barcode == "") {
    barcode.barcode = "-- waiting for barcode scan --";
  }

  let quantity: string = "0";
  let className: string = "";

  if (barcode.quantity !== undefined && barcode.quantity >= 0) {
    quantity = barcode.quantity.toString();
  }

  if (barcode.id !== undefined && barcode.id > 0 && quantity === "0") {
    quantity = "-- not in stock --";
    className = "text-amber-500";
  }

  return (
    <div>
      <div className="px-4 sm:px-0">
        <h1 className="text-slate-0 font-bold uppercase">
          Barcode &nbsp;&nbsp;
          <strong>
            <code className="text-lg text-amber-500">{barcode.barcode}</code>
          </strong>
        </h1>
      </div>
      <div className="mt-2 border-t border-white/10">
        <BarcodeInfoRow heading="Name" description={barcode.name} />
        {/* <BarcodeInfoRow
          heading="Product"
          description={barcode.productId?.toString()}
        /> */}
        {barcode.quantity !== undefined && barcode.quantity > 0 && (
          <BarcodeInfoRow heading="Location" description={barcode.location?.name?.toString()} />
        )}
        {barcode.name !== undefined && barcode.name.length > 0 && (
          <BarcodeInfoRow heading="Quantity" description={quantity} className={className} />
        )}
      </div>
    </div>
  );
}

function BarcodeInfoRow({
  heading,
  description,
  className,
}: {
  heading: string;
  description?: string;
  className?: string;
}) {
  if (description === undefined) {
    description = "";
  }

  return (
    <dl className="divide-y divide-white/10 px-3">
      <div className="px-4 py-0 sm:grid sm:grid-cols-[140_1_600] sm:gap-2 sm:px-0">
        <dt className="text-sm/6 font-medium text-gray-100">{heading}</dt>
        <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
          <div className={className !== undefined ? className : ""}>{description}</div>
        </dd>
      </div>
    </dl>
  );
}
