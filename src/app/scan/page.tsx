'use client';

import { useState } from "react";
import BarcodeDetails from "@/app/components/barcode-details";
import BarcodeScanStream from "../components/barcode-scan-stream";

export default function Page() {
  const [editing, setEditing] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);

  return (
    <div>
      <BarcodeDetails barcode={barcode} editing={editing} isFlashing={isFlashing}>
        <BarcodeScanStream barcode={barcode} editing={editing} changeBarcode={setBarcode} onShow={() => setIsFlashing(true)} debug={false} />
      </BarcodeDetails>
    </div>
  );
}
