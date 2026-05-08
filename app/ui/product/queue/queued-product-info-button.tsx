import { DueDateType, UnitSystem } from "@/generated/prisma/enums";
import { fetchLocations, fetchQuantityUnits } from "@/lib/grocy";
import {
  Beaker,
  FolderTree,
  Package,
  ShelvingUnit,
  Skull,
  Smile,
  Snowflake,
  TriangleAlert,
  Weight,
} from "lucide-react";
import DueDate from "@/ui/due-date";
import PackagingDate from "@/ui/packaging-date";
import Link from "next/link";
import { GetProduct, getProductPhoto } from "@/lib/product-db";
import { Suspense } from "react";
import { toLookup } from "@/lib/utils";

export async function QueuedProductInfoButton({ product }: { product: GetProduct }) {
  if (product === undefined) return <></>;

  const units = toLookup(await fetchQuantityUnits());
  const locations = toLookup(await fetchLocations());

  const unitSystem = new String(product.unitSystem.toString()).toLowerCase();
  const unitAmount = product.unitAmount.toString();
  const unitChosen =
    units[product.unitChosen.toString()]![Number(product.unitAmount) > 1 ? "name_plural" : "name"];

  const defaultLocation = locations[product.defaultLocation];
  const storageLocation = defaultLocation !== undefined ? defaultLocation.name : "???";

  let unitIcon;
  switch (product.unitSystem) {
    case UnitSystem.WEIGHT:
      unitIcon = <Weight size="15" className="relative top-[-2] inline" />;
      break;
    case UnitSystem.VOLUME:
      unitIcon = <Beaker size="15" className="relative top-[-2] inline" />;
      break;
    case UnitSystem.ABSTRACT:
      unitIcon = <FolderTree size="15" className="relative top-[-2] inline" />;
      break;
  }

  let photo;
  if (product.productPhoto) {
    photo = await getProductPhoto(product.productPhoto.id);
  }

  return (
    <Link
      prefetch={false}
      href={`/queue/${product.barcodes[0]!.barcode}`}
      className="my-3 block w-full cursor-pointer rounded-lg border border-slate-400 bg-slate-700 px-3 py-2 text-left text-slate-300 hover:bg-slate-600"
      title={`Process queued product “${product.name}”`}
    >
      <div className="flex w-full flex-col">
        <div className="flex flex-col md:flex-row">
          <div className="w-full flex-3 flex-row">
            <div className="flex-1 pl-5 -indent-5 text-slate-50">
              <code className="text-queue-tile-barcode">{product.barcodes[0]?.barcode}</code> :{" "}
              <strong>{product.name}</strong>
            </div>

            <div className="flex-1">
              {unitIcon} Using <span className="lowercase">{unitSystem}</span> units:{" "}
              <em>
                <span>{unitAmount}</span> <span className="lowercase">{unitChosen}</span>
              </em>
            </div>

            <div className={`flex-1 ${defaultLocation!.is_freezer ? "text-is-freezer" : ""}`}>
              <ShelvingUnit size="15" className="relative top-[-2] inline" /> Stored by default in{" "}
              <em>{storageLocation}</em>
            </div>

            {product.dueDateType !== DueDateType.NO_EXPIRY && product.canBeFrozen && (
              <div className="text-is-freezer flex-1">
                <Snowflake size="15" className="relative top-[-2] inline" /> Product can be frozen
              </div>
            )}

            {product.dueDateType !== DueDateType.NO_EXPIRY &&
              product.canBeFrozen &&
              !defaultLocation!.is_freezer && (
                <div className="text-alert flex-1">
                  <>
                    <TriangleAlert size="15" className="relative top-[-2] inline" /> Default storage location
                    is not a freezer
                  </>
                </div>
              )}

            <div className="flex-1">
              {product.dueDateType !== DueDateType.NO_EXPIRY ? (
                <>
                  <Skull size="15" className="relative top-[-2] inline" />{" "}
                </>
              ) : (
                <>
                  <Smile size="15" className="relative top-[-2] inline" />{" "}
                </>
              )}
              <DueDate type={product.dueDateType} date={product.expiresAt!} />
            </div>

            {product.dueDateType !== DueDateType.NO_EXPIRY && product.packagingDate && (
              <div className="flex-1">
                <Package size="15" className="relative top-[-2] inline" />{" "}
                <PackagingDate type={product.dueDateType} date={product.packagingDate} />
              </div>
            )}
          </div>
          <Suspense>
            {photo && (
              <div className="flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,` + photo.data.toBase64()}
                  alt="Product photo"
                  className="float-right my-3 mr-2 block rounded-sm md:my-3 md:mt-2 md:ml-5 md:max-h-80 md:max-w-80"
                />
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </Link>
  );
}
