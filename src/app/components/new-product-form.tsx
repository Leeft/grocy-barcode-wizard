"use client";

import Barcode from "../lib/barcode";
import { useState } from "react";
import balanceWeightWhite from "@/../public/icons/balance-weight-white.svg";
import volumeWhite from "@/../public/icons/volume-white.svg";
import hierarchyWhite from "@/../public/icons/hierarchy-white.svg";
import { ChoseAbstractUnits, ChoseByVolume, ChoseByWeight } from "@/app/components/new-product-form-server";
import { NewProductTypeChoiceButton } from "../ui/product/product-choice";

export function NewProductForm({ barcode }: { barcode: Barcode }) {
  const [selectedMode, setSelectedMode] = useState<number>(0);

  return (
    <div>
      <div className="flex mt-3">
        <NewProductTypeChoiceButton
          title="By weight"
          isSelected={selectedMode == 0}
          setAsSelected={() => setSelectedMode(0)}
          imageSource={balanceWeightWhite}
          imageWidth={32}
        />
        <NewProductTypeChoiceButton
          title="By volume"
          isSelected={selectedMode == 1}
          setAsSelected={() => setSelectedMode(1)}
          imageSource={volumeWhite}
          imageWidth={32}
        />
        <NewProductTypeChoiceButton
          title="By abstract units"
          isSelected={selectedMode == 2}
          setAsSelected={() => setSelectedMode(2)}
          imageSource={hierarchyWhite}
          imageWidth={32}
        />
      </div>
      <div className="text-left pt-3">
        {selectedMode === 0 && (
          <>
            <ChoseByWeight />
          </>
        )}
        {selectedMode === 1 && (
          <>
            <ChoseByVolume />
          </>
        )}
        {selectedMode === 2 && (
          <>
            {/* <ChoseAbstractUnits /> */}
          </>
        )}
      </div>
    </div>
  );
}

