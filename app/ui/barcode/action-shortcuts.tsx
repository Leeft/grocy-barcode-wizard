import Barcode from "@/lib/barcode";
import clsx from "clsx";
import { ShoppingBasket, X, Trash2, PackageOpen, ShelvingUnit } from "lucide-react";
import Link from "next/link";

export default function ActionShortCuts({ barcode }: { barcode: Barcode }) {
  const actionLinkClasses = clsx(
    "border",
    "rounded-lg",
    "p-2",
    "w-auto",
    "uppercase",
    "font-bold",
    "tracking-wider",
    "text-center",
    "text-nowrap!",
    "flex-grow",
  );

  const iconClasses = clsx("inline", "size-7", "pr-2");

  return (
    <div className="mb-3 flex flex-row flex-wrap gap-3">
      <Link href={`/scan/${barcode.code}/add`} className={clsx(actionLinkClasses, "text-add", "border-add")}>
        <ShoppingBasket className={iconClasses} />
        Purchase ...
      </Link>
      <Link
        href={`/scan/${barcode.code}`}
        className={clsx(actionLinkClasses, "text-consume", "border-consume")}
      >
        <X className={iconClasses} />
        Consume ...
      </Link>
      <Link
        href={`/scan/${barcode.code}`}
        className={clsx(actionLinkClasses, "text-spoiled", "border-spoiled")}
      >
        <Trash2 className={iconClasses} />
        Spoiled ...
      </Link>
      <Link href={`/scan/${barcode.code}`} className={clsx(actionLinkClasses, "text-open", "border-open")}>
        <PackageOpen className={iconClasses} />
        Open ...
      </Link>
      <Link
        href={`/scan/${barcode.code}`}
        className={clsx(actionLinkClasses, "text-inventory", "border-inventory")}
      >
        <ShelvingUnit className={iconClasses} />
        Inventory ...
      </Link>
      <Link
        href={`/scan/${barcode.code}`}
        className={clsx(actionLinkClasses, "text-shopping-list", "border-shopping-list")}
      >
        <ShoppingBasket className={iconClasses} />
        Add to shopping list ...
      </Link>
    </div>
  );
}
