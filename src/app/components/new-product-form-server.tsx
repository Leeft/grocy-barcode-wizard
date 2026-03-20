import React from "react";
//import { QuantityUnitConversionContext } from "../providers/quantity-unit-conversion-context";
//import { QuantityUnit, QuantityUnitConversion } from "@/interfaces/grocy";
import { NewProductTypeChoiceDescription } from "../ui/product/product-choice";
import { ByWeightApp } from "../ui/product/by-weight";
import { ByVolumeApp } from "../ui/product/by-volume";
//import { fetchQuantityUnitConversions, fetchQuantityUnits } from "../lib/grocy";

export function ChoseByWeight() {
  // const units: QuantityUnit[] = await fetchQuantityUnits();
  // // @ts-expect-error
  // const conversions: QuantityUnitConversion[] = await fetchQuantityUnitConversions();

  return (
    <>
      <NewProductTypeChoiceDescription>
        <h1>
          Unknown barcode; Creating <em>"by weight"</em> product
        </h1>
        <p>
          Use this option to create products where tracking the <em>weight</em> rather than the{" "}
          <em>volume</em> or the <em>number of items packaged</em> is most relevant to you, such as
          when you need things by weight in recipes. Examples are potatoes, wheat, quantities of
          meat or mince, carrots, pasta, noodles, or dairy products you use for cooking like types
          of cream or yoghurt.
        </p>
        <p>
          Set the quantity + weight below to the unit you bought this product in using the largest
          quantity unit at which a fractional amount still makes sense. E.g. "0.75 kilograms of
          frozen vegetables", "0.3kg of frozen peas", "30 grams of dodo feathers", "0.5 grams of
          fairy dust".
        </p>
      </NewProductTypeChoiceDescription>

      <ByWeightApp />
    </>
  );
}

export function ChoseByVolume() {
  //const [selectedId, setSelectedId] = useState<number>(0);
  return (
    <>
      <NewProductTypeChoiceDescription>
        <h1>
          Unknown barcode; Creating <em>"by volume"</em> product
        </h1>
        <p>
          For some products like yoghurt, milk, vinegar or oil you'd likely use these in{" "}
          <em>volume quantities</em> in recipes (such as 1 decilitre, 1 cup, or 1 tablespoon) so you
          may want to use a <em>volume measurement</em> for these rather than <em>weight</em>. We'll
          then employ default values which best fit volumetric type products such as when consuming
          amounts.
        </p>
        <p>
          That said, typical liquids used in a household should be very close to 1kg per litre in
          weight, so for bulk quantities you certainly can use weights instead if you want to. I'm
          just here to help provide some opinionated defaults that should work great for you.
        </p>
      </NewProductTypeChoiceDescription>

      <ByVolumeApp />
    </>
  );
}

export function ChoseAbstractUnits({ children }: { children?: React.ReactNode }) {
  //const [selectedId, setSelectedId] = useState<number>(0);
  return (
    <>
      <NewProductTypeChoiceDescription>
        <h1>
          Unknown barcode; Creating <em>"abstract unit"</em> product
        </h1>
        <p>
          Many products you use per item, per bundle, per serving, or per individually wrapped
          package. At the same time you are not likely paying much attention to the weight or volume
          of each (of course you should still consider calorific content -- something this app isn't
          yet able to help with). Specific examples are eggs, bags of crisps (chips), biscuits,
          mandarines, or bananas.
        </p>
        <p>
          Let's say that box of biscuits ("cookies") you bought has 6 individual packs inside, which
          each individual pack having 3 biscuits. Which is where this "abstract unit" choice comes
          in as it allows you to readily create a product with these conversions set up for you.
        </p>
      </NewProductTypeChoiceDescription>

      {/* <div className="pt-3">
        <QuantityUnitsDropdown selectedId={selectedId}
          setSelectedId={setSelectedId} className="w-70" mode="other" />
      </div> */}
    </>
  );
}
