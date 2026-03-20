"use client";

import Barcode from "../lib/barcode";
import { QuantityUnitsDropdown } from "../ui/product/quantity-units-dropdown";
import { QuantityUnitCalculation } from "./quantity-unit-calc";
import { useState } from "react";

import Image from "next/image";
import balanceWeightWhite from "@/../public/icons/balance-weight-white.svg";
import volumeWhite from "@/../public/icons/volume-white.svg";
import hierarchyWhite from "@/../public/icons/hierarchy-white.svg";

export function NewProductForm({ barcode }: { barcode: Barcode }) {
  const [selectedMode, setSelectedMode] = useState<number>(0);
  // const [selectedMode0Unit, setSelectedMode0Unit] = useState<number>(0);
  const [currentConversionId, setCurrentConversionId] = useState<number>(1);
  // const [unitMappings, setUnitMappings] = useState<Object>(0);
  // const [quantityUnits, setQuantityUnits] = useState<Object>(0);

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
            <div>
              <h1 className="text-slate-400 uppercase font-bold mt-3 mb-3">
                Unknown barcode; Create <em>"by weight"</em> product
              </h1>
              <p className="text-slate-400 mt-3 mb-3 pb-3">
                Use this option to create products where tracking the weight rather than the number
                of items packaged is most relevant to you, such as when you need things by weight in
                recipes. Examples are potatoes, wheat, quantities of meat or mince, carrots, pasta,
                noodles, or dairy products you use for cooking like types of cream or yoghurt.
              </p>
              <p className="text-slate-400 mt-3 mb-3 pb-3">
                Set the quantity + weight below to the unit you bought this product in using the
                largest quantity unit at which the amount still makes sense. E.g. "0.75kg of frozen
                vegetables", "0.3kg of frozen peas", or "30g of dodo feathers".
              </p>
              <div className="flex">
                <input
                  name="purchase_quantity"
                  type="number"
                  className="w-19 flex-none h-8 text-right text-lg mt-0.75 p-3 mr-4"
                  defaultValue={"1.0"}
                />
                <QuantityUnitsDropdown className="w-40 flex-2 mr-4" mode="weight-metric" />
                <QuantityUnitCalculation
                  selectedUnit={1}
                  factor={1.0}
                  className="flex-2 text-lg pt-1.5"
                />
              </div>
            </div>
          </>
        )}

        {selectedMode === 1 && (
          <>
            <div>
              <h1 className="text-slate-400 uppercase font-bold mt-3 mb-3">
                Unknown barcode; Create <em>"by volume"</em> product
              </h1>
              <p className="text-slate-400 mt-3 mb-3 pb-3">
                For some products like yoghurt, milk, vinegar or oil you'd likely use these in&nbsp;
                <em>volume quantities</em> in recipes (such as 1 decilitre, 1 cup, or 1 tablespoon)
                so you may want to use a volume measurement for these rather than weight. We'll
                employ some default handling to best fit volume rather than weight measurements.
              </p>
              <p className="text-slate-400 mt-3 mb-3 pb-3">
                That said, typical liquids used in a household should be very close to 1kg per litre
                in weight, so for bulk quantities you certainly can use weights instead if you want
                to. I'm just here to help provide opinionated defaults that should work for you.
              </p>
              <div>
                <QuantityUnitsDropdown className="w-70" mode="volume-metric" />
              </div>
            </div>
          </>
        )}

        {selectedMode === 2 && (
          <div>
            <h1 className="text-slate-400 uppercase font-bold mt-3 mb-3">
              Unknown barcode; Create <em>"abstract unit"</em> product
            </h1>
            <p className="text-slate-400 mt-3 mb-3 pb-3">
              Many products you use per item, per bundle, per serving, or per individually wrapped
              package. At the same time you are not likely paying much attention to the weight or
              volume of each (of course you should still consider calorific content -- something
              this app isn't yet able to help with). Specific examples are eggs, bags of crisps
              (chips), biscuits, mandarines, or bananas.
            </p>
            <p className="text-slate-400 mt-3 mb-3 pb-3">
              That box of biscuits ("cookies") you buy often might have 6 individual packs inside,
              which each pack having 3 biscuits. Which is where this option comes in as it allows
              you to readily create a product with these conversions set up for you so you can track
              your product stock.
            </p>
            <div>
              <QuantityUnitsDropdown className="w-70" mode="other" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewProductTypeChoiceButton({
  title,
  isSelected,
  setAsSelected,
  imageSource,
  imageDescription = "",
  imageWidth,
  imageHeight,
  imageClassName = "m-3 inline",
}: {
  title: string;
  isSelected: boolean;
  setAsSelected: Function;
  imageSource: string;
  imageDescription?: string;
  imageWidth: number;
  imageHeight?: number;
  imageClassName?: string;
}) {
  return (
    <button
      className={`flex-1 pd-5 m-1 border-1 text-lg cursor-pointer uppercase ${isSelected ? "bg-slate-600" : ""}`}
      onClick={() => {
        setAsSelected();
      }}
    >
      <div>
        <Image
          src={imageSource}
          alt={imageDescription}
          width={imageWidth}
          height={imageHeight}
          className={imageClassName}
        />{" "}
        {title}
      </div>
    </button>
  );
}

// function handleChangeQuantity( conversionId: number ) {
//   dispatch(

//   )
// }
