"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { prisma } from "@/lib/prisma";
import { DueDateType, UnitSystem } from "@/generated/prisma/enums";
import { dataURLtoFile } from "@/lib/utils";
import { dateToISODate } from "@/lib/date";
import { CreateProductFormSchema, EditProductFormSchema } from "@/forms/product-form-schema";

export async function productCreateSubmit(prevstate: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: CreateProductFormSchema });

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

  if (data.imageData != "" && data.imageData !== undefined) {
    const file = dataURLtoFile(data.imageData, "filename-not-used-yet");
    const arr = new Uint8Array(await file.arrayBuffer());
    await prisma.productPhoto.create({
      data: {
        userId: 1, // TODO: Actual users
        productId: queuedProduct.id,
        filename: `capture-${queuedProduct.id}-${Date.now()}.png`,
        tiletype: data.imageType,
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

export async function productUpdateSubmit(prevstate: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: EditProductFormSchema });
  // Send the submission back to the client if the status is not successful
  if (submission.status !== "success") {
    console.log("submission error:", submission);
    return submission.reply();
  }

  const data = submission.value;

  console.log("submit success:", data);

  function expiresOrNull<Type>(value: Type) {
    return data.dueDateType !== DueDateType.NO_EXPIRY ? value : null;
  }

  function aboveZeroOrNull(value: number) {
    return value > 0 ? value : null;
  }

  const queuedProduct = await prisma.product.update({
    where: {
      id: data.id,
    },
    data: {
      userId: 1, // TODO: Actual users
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
      productGroup: aboveZeroOrNull(data.productGroup),
      parentProductId: aboveZeroOrNull(data.parentProductId),
      consumeLocationId: data.defaultConsumeLocationId,
      cantOpen: data.cantOpen,
      dontShowOnStock: data.dontShowOnStock,
      disableStockChecking: data.disableStockChecking,
      enableTareWeight: data.enableTareWeight,
      moveOnOpen: data.moveOnOpen,
      purchasePriceType: data.purchasePriceType,
      tareWeight: data.tareWeight.toString(),
      energy: data.energy.toString(),
      openedAsOutOfStock: data.openedAsOutOfStock,
      accumulateSubProductsMinStock: data.accumulateSubProductsMinStock,
      quickConsumeAmount: data.quickConsumeAmount.toString(),
      quickOpenAmount: data.quickOpenAmount.toString(),
      defaultQuantityUnitPurchase: aboveZeroOrNull(data.defaultQuantityUnitPurchase),
      defaultQuantityUnitConsume: aboveZeroOrNull(data.defaultQuantityUnitConsume),
      quantityUnitPrices: aboveZeroOrNull(data.quantityUnitPrices),
      purchaseConversionFactor: data.purchaseConversionFactor.toString(),
      consumeConversionFactor: data.consumeConversionFactor.toString(),
      priceConversionFactor: data.priceConversionFactor.toString(),
    },
  });

  console.log("updated product is", queuedProduct);

  if (data.imageData != "" && data.imageData !== undefined) {
    const file = dataURLtoFile(data.imageData, "filename-not-used-yet");
    const arr = new Uint8Array(await file.arrayBuffer());
    await prisma.productPhoto.upsert({
      where: { productId: queuedProduct.id },
      update: {
        filename: `capture-${queuedProduct.id}-${Date.now()}.png`,
        data: arr,
      },
      create: {
        userId: 1, // TODO: Actual users
        filename: `capture-${queuedProduct.id}-${Date.now()}.png`,
        filetype: data.imageType,
        data: arr,
        productId: queuedProduct.id,
        grocyFileGroup: "productpictures",
      },
    });
  }

  // await prisma.barcode.update({
  //   where: { barcode: data.barcode },
  //   data: { productId: queuedProduct.id },
  // });

  // // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath(`/queue/[barcode]`, "page");
  redirect(`/queue/${data.barcode}`);
}
