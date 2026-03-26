import { NewProductTypeChoiceDescription } from "../ui/product/product-choice";
import { ByWeightApp } from "../ui/product/by-weight-app";
import { ByVolumeApp } from "../ui/product/by-volume-app";
import { ByAbstractUnitApp } from "../ui/product/by-abstract-unit-app";

export function ChoseByWeight() {
  return (
    <>
      <NewProductTypeChoiceDescription
        id="weight"
        title={
          <>
            <span className="hidden md:inline text-left!">Unknown barcode; </span>Creating{" "}
            <em>&quot;by weight&quot;</em> product
          </>
        }
      >
        <p>
          Use this option to create products where tracking the <em>weight</em> rather than the{" "}
          <em>volume</em> or the <em>number of items packaged</em> is most relevant to you, such as
          when you need things by weight in recipes. Examples are potatoes, wheat, quantities of
          meat or mince, carrots, pasta, noodles, or dairy products you use for cooking like types
          of cream or yoghurt.
        </p>
        <p>
          Set the quantity + weight below to the unit you bought this product in using the largest
          quantity unit at which a fractional amount still makes sense. E.g. &quot;0.75 kilograms of
          frozen vegetables&quot;, &quot;0.3kg of frozen peas&quot;, &quot;30 grams of dodo
          feathers&quot;, &quot;0.5 grams of fairy dust&quot;.
        </p>
      </NewProductTypeChoiceDescription>

      <ByWeightApp />
    </>
  );
}

export function ChoseByVolume() {
  return (
    <>
      <NewProductTypeChoiceDescription
        id="volume"
        title={
          <>
            <span className="hidden md:inline">Unknown barcode; </span>Creating{" "}
            <em>&quot;by volume&quot;</em> product
          </>
        }
      >
        <p>
          For some products like yoghurt, milk, vinegar or oil you&apos;d likely use these in{" "}
          <em>volume quantities</em> in recipes (such as 1 decilitre, 1 cup, or 1 tablespoon) so you
          may want to use a <em>volume measurement</em> for these rather than <em>weight</em>.
          We&apos;ll then employ default values which best fit volumetric type products such as when
          consuming amounts.
        </p>
      </NewProductTypeChoiceDescription>

      <ByVolumeApp />
    </>
  );
}

export function ChoseAbstractUnits() {
  return (
    <>
      <NewProductTypeChoiceDescription
        id="abstract"
        title={
          <>
            Unknown barcode; Creating <em>&quot;abstract unit&quot;</em> product
          </>
        }
      >
        <p>
          Many products you use per item, per bundle, per serving, or per individually wrapped
          package. At the same time you are not likely paying much attention to the weight or volume
          of each (of course you should still consider calorific content -- something this app
          isn&apos;t yet able to help with). Specific examples are eggs, bags of crisps (chips),
          biscuits, mandarines, or bananas.
        </p>
        <p>
          Let&apos;s say that box of biscuits (&quot;cookies&quot;) you bought has 6 individual
          packs inside, which each individual pack having 3 biscuits. Which is where this
          &quot;abstract unit&quot; choice comes in as it allows you to readily create a product
          with these conversions set up for you.
        </p>
      </NewProductTypeChoiceDescription>

      <ByAbstractUnitApp />
    </>
  );
}
