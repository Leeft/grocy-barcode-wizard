"use server";

import { DueDateType, UnitSystem } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import prisma from "@/lib/prisma";
import { QuickProductFormSchema } from "@/forms/quick-product-form-schema";
import { dataURLtoFile } from "@/lib/utils";
import { dateToISODate } from "@/lib/date";

export async function quickProductFormSubmit(
  prevstate: unknown,
  formData: FormData,
) {
  const submission = parseWithZod(formData, { schema: QuickProductFormSchema });

  // Send the submission back to the client if the status is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = submission.value;

  function expiresOrNull<Type>(value: Type) {
    return data.dueDateType !== DueDateType.NO_EXPIRY ? value : null;
  }

  const queuedProduct = await prisma.product.create({
    data: {
      userId: 1, // TODO: Actual users
      createdAt: new Date().toISOString(),
      name: data.name,
      pending: true,
      canBeFrozen: !data.shouldNotBeFrozen,
      unitSystem: data.unitSystem.toUpperCase() as UnitSystem,
      unitAmount: data.unitAmount.toString(),
      unitChosen: data.unitId,
      defaultLocation: data.defaultLocationId,
      dueDateType: data.dueDateType,
      expiresAt: expiresOrNull(dateToISODate(data.dueOrExpiryDate!)),
      packagingDate: expiresOrNull(dateToISODate(data.packagingDate!)),
      dueDays: expiresOrNull(data.dueDays),
      dueDaysAfterOpen: expiresOrNull(data.dueDaysAfterOpen),
      dueDaysAfterFreezing: expiresOrNull(data.dueDaysAfterFreezing),
      dueDaysAfterThawing: expiresOrNull(data.dueDaysAfterThawing),
    },
  });

  console.log("queued product is", queuedProduct);

  if (data.image) {
    const file = dataURLtoFile(data.image, "filename-not-used-yet");
    const arr = new Uint8Array(await file.arrayBuffer());
    await prisma.productPhoto.create({
      data: {
        userId: 1, // TODO: Actual users
        productId: queuedProduct.id,
        filename: `capture-${queuedProduct.id}-${Date.now()}.png`,
        data: arr,
        grocyFileGroup: "productpictures",
      },
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
