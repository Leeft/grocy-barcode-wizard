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
import DueDate from "../../due-date";
import PackagingDate from "../../packaging-date";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ProductInfo({ product }: { product: any }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const units = (await fetchQuantityUnits()).reduce((map: any, obj: any) => {
    map[obj.id] = obj;
    return map;
  }, {});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locations = (await fetchLocations()).reduce((map: any, obj: any) => {
    map[obj.id] = obj;
    return map;
  }, {});

  const unitSystem = new String(product.unitSystem.toString()).toLowerCase();
  const unitAmount = product.unitAmount.toString();
  const unitChosen =
    units[product.unitChosen.toString()][
      product.unitAmount > 1 ? "name_plural" : "name"
    ];

  const storageLocation = locations[product.defaultLocation].name;

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

  return (
    <button
      className="my-3 w-full cursor-pointer rounded-lg border border-slate-400 bg-slate-700 px-3 py-2 text-left text-slate-300 hover:bg-slate-600"
      title={`Process queued product “${product.name}”`}
    >
      <div className="flex w-full flex-col">
        <div className="flex flex-col md:flex-row">
          <div className="w-full flex-3 flex-row">
            <div className="flex-1 text-slate-50">
              <code className="text-green-500">
                {product.barcodes[0]?.barcode}
              </code>{" "}
              : <strong>{product.name}</strong>
            </div>

            <div className="flex-1">
              {unitIcon} Using <span className="lowercase">{unitSystem}</span>{" "}
              units:{" "}
              <em>
                <span className="">{unitAmount}</span>{" "}
                <span className="lowercase">{unitChosen}</span>
              </em>
            </div>

            <div
              className={`flex-1 ${locations[product.defaultLocation].is_freezer ? "text-blue-300" : ""}`}
            >
              <ShelvingUnit size="15" className="relative top-[-2] inline" />{" "}
              Stored by default in <em>{storageLocation}</em>
            </div>

            {product.dueDateType !== DueDateType.NO_EXPIRY &&
              product.canBeFrozen && (
                <div className="flex-1 text-blue-300">
                  <Snowflake size="15" className="relative top-[-2] inline" />{" "}
                  Product can be frozen
                </div>
              )}

            {product.dueDateType !== DueDateType.NO_EXPIRY &&
              product.canBeFrozen &&
              !locations[product.defaultLocation].is_freezer && (
                <div className="flex-1 text-amber-500">
                  <>
                    <TriangleAlert
                      size="15"
                      className="relative top-[-2] inline"
                    />{" "}
                    Default storage location is not a freezer
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
              <DueDate type={product.dueDateType} date={product.expiresAt} />
            </div>

            {product.dueDateType !== DueDateType.NO_EXPIRY &&
              product.packagingDate && (
                <div className="flex-1">
                  <Package size="15" className="relative top-[-2] inline" />{" "}
                  <PackagingDate
                    type={product.dueDateType}
                    date={product.packagingDate}
                  />
                </div>
              )}
          </div>
          {product.productPhoto && (
            <div className="flex-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  `data:image/png;base64,` +
                  product.productPhoto?.data.toBase64()
                }
                alt="Product photo"
                className="float-right my-3 mr-2 block rounded-sm md:my-3 md:mt-2 md:ml-5 md:max-h-80 md:max-w-80"
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
