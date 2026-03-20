"use client";

import Barcode from "@/app/lib/barcode";
import BarcodeActions from "@/app/ui/product/actions";
import BarcodeScanStatus from "@/app/ui/barcode/scan-status";
import { ExistingProductForm } from "@/app/ui/product/existing-product-form";
import { NewProductForm } from "@/app/components/new-product-form";
import React, { use, useContext, useEffect, useState } from "react";
import { QuantityUnitContext } from "@/app/providers/quantity-unit-context";
import { ProductLocation, ProductGroup, QuantityUnit, QuantityUnitConversion } from "@/interfaces/grocy";
import { QuantityUnitConversionContext } from "@/app/providers/quantity-unit-conversion-context";
import { LocationContext } from "@/app/providers/location-context";
import { ProductGroupContext } from "@/app/providers/product-group-context";

type ConnectionStatus = "connecting" | "connected" | "error";

export default function BarcodeScannerApp({}: {}) {
  const [editing, setEditing] = useState(false);
  const [barcode, setBarcode] = useState<Barcode | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [isFlashing, setIsFlashing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const locationsPromise: Promise<ProductLocation>[] | null = useContext(LocationContext);
  const productGroupPromise: Promise<ProductGroup>[] | null = useContext(ProductGroupContext);
  const quantityUnitPromise: Promise<QuantityUnit>[] | null = useContext(QuantityUnitContext);
  const quantityUnitConversionsPromise: Promise<QuantityUnitConversion>[] | null = useContext(
    QuantityUnitConversionContext,
  );

  const debug = true;

  useEffect(() => {
    const es = new EventSource("/api/product-barcode-stream");

    if (debug) console.log("Attempting to connect...");
    window.scrollTo(0, 0);

    es.onopen = () => {
      setStatus("connected");
      console.log(`Connected to product barcode stream ${es.url}`);
    };

    es.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (debug) console.log("Received barcode data:", data);
        setBarcode(Barcode.fromJSON(data));
        setIsFlashing(true);
        window.scrollTo(0, 0);
        setTimeout(() => setIsFlashing(false), 1500);
      } catch (err) {
        console.error("JSON Parse Error:", err, "from data", event.data);
      }
    };

    es.onerror = (err) => {
      console.error("EventSource failed:", err);
      setStatus("error");
      es.close();
    };

    // 4. Cleanup function
    return () => {
      console.log("Closing product barcode stream connection");
      es.close();
    };
  }, [retryCount]); // Only re-run if we manually trigger a retry

  // @ts-ignore
  const data = use(locationsPromise);

  return (
    <div className={`w-auto`}>
      <BarcodeScanStatus barcode={barcode} isFlashing={isFlashing} connectionStatus={status} />
      {barcode &&
        (barcode !== null && barcode?.product !== undefined ? (
          <>
            <ExistingProductForm barcode={barcode} />
            {/* <pre className="text-sm">{JSON.stringify(data,null,2)}</pre> */}
            <BarcodeActions barcode={barcode} className="w-auto" editing={editing} />
          </>
        ) : (
          <NewProductForm barcode={barcode} />
        ))}
    </div>
  );
}

function StatusBadge({ status, onRetry }: { status: ConnectionStatus; onRetry: () => void }) {
  if (status === "connecting")
    return <span className="text-amber-500 text-xs font-bold uppercase">● Connecting</span>;
  if (status === "error")
    return (
      <button onClick={onRetry} className="text-red-500 text-xs font-bold uppercase underline">
        ● Disconnected - Retry?
      </button>
    );
  return <span className="text-emerald-500 text-xs font-bold uppercase">● Live System</span>;
}
