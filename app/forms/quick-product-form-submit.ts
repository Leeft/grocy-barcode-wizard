"use server";

import { DueDateType, UnitSystem } from "@/generated/prisma/enums";
import {
  ProductCreateInput,
  ProductPhotoUncheckedCreateInput,
} from "@/generated/prisma/models";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";
import { parseWithZod } from "@conform-to/zod/v4";
import prisma from "@/lib/prisma";
import { QuickProductFormSchema } from "@/forms/quick-product-form-schema";

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0]!.match(/:(.*?);/)![1];
  const bstr = atob(arr[arr.length - 1]!);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export async function quickProductFormSubmit(
  prevstate: unknown,
  formData: FormData,
) {
  const submission = parseWithZod(formData, { schema: QuickProductFormSchema });

  // Send the submission back to the client if the status is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  // validated {
  //   name: 'This is a product name',
  //   unitSystem: 'abstract',
  //   mainQuantityUnitId: 16,
  //   mainQuantity: 1,
  //   defaultProductLocationId: 14,
  //   dueDateType: 'expiry-date',
  //   dueOrExpiryDate: '2026-04-30',
  //   packagingDate: '2026-04-08',
  //   shouldNotBeFrozen: true,
  //   defaultDueDays: 22,
  //   defaultDueDaysAfterOpen: 0
  // }

  let dueDateType = "BEST_BEFORE";
  if (submission.value.dueDateType === "expiry-date")
    dueDateType = "EXPIRY_DATE";
  else if (submission.value.dueDateType === "no-expiry")
    dueDateType = "NO_EXPIRY";

  const canExpire = dueDateType !== DueDateType.NO_EXPIRY;
  const data = submission.value;

  const queuedProduct = await prisma.product.create({
    data: {
      name: data.name,
      pending: true,
      canBeFrozen: !data.shouldNotBeFrozen,
      unitSystem: data.unitSystem.toUpperCase() as UnitSystem,
      unitAmount: data.mainQuantity,
      unitChosen: data.mainQuantityUnitId,
      dueDateType: dueDateType as DueDateType,
      expiresAt: canExpire ? data.dueOrExpiryDate! : null,
      packagingDate: canExpire ? data.packagingDate! : null,
      defaultDueDays: canExpire ? data.defaultDueDays : null,
      defaultDueDaysAfterOpen: canExpire ? data.defaultDueDaysAfterOpen : null,
      defaultDueDaysAfterFreezing: canExpire
        ? data.defaultDueDaysAfterFreezing
        : null,
      defaultDueDaysAfterThawing: canExpire
        ? data.defaultDueDaysAfterThawing
        : null,
    } as ProductCreateInput,
  });

  console.log("queued product is", queuedProduct);

  if (data.image) {
    const file = dataURLtoFile(data.image, "filename-not-used-yet");
    const arr = new Uint8Array(await file.arrayBuffer());
    await prisma.productPhoto.create({
      data: {
        filename: `capture-${queuedProduct.id}-${Date.now()}.png`,
        data: arr,
        productId: queuedProduct.id,
        grocyFileGroup: "productpictures",
      } as ProductPhotoUncheckedCreateInput,
    });
  }

  await prisma.barcode.update({
    where: { barcode: data.barcode },
    data: { productId: queuedProduct.id },
  });

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/scan");
  redirect("/scan");
}
