"use client";

import { useState } from "react";
import BarcodeDetails from "@/app/components/barcode-details";
import BarcodeScanStream from "../components/barcode-scan-stream";
import { BarcodeHeader } from "../components/barcode-header";

export default function Page() {
  const [editing, setEditing] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);

  return (
    <div>
      <BarcodeDetails barcode={barcode} editing={editing} isFlashing={isFlashing}>
        <BarcodeScanStream
          barcode={barcode}
          editing={editing}
          changeBarcode={setBarcode}
          onShow={() => setIsFlashing(true)}
          debug={false}
        >
          {barcode !== null && <BarcodeHeader barcode={barcode} />}
        </BarcodeScanStream>
      </BarcodeDetails>
    </div>
  );
}
