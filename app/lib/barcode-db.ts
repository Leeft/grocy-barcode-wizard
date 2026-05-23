"use server";

import { prisma } from "@/lib/prisma";
import { BarcodeModel } from "@/generated/prisma/models";
import { NotFoundError } from "@/lib/errors";
import { barcodeToType, stripBarcode } from "@/lib/barcode";
import { ProductBarcodeTypes } from "@/interfaces";

export async function ensureBarcodeExists(
  barcode: string,
): Promise<BarcodeModel> {
  "use server";

  const strippedCode = stripBarcode(barcode);

  if ( barcodeToType(strippedCode) !== ProductBarcodeTypes.PRODUCT ) {
    return { id: 0, barcode: strippedCode, productId: null, scannedAt: new Date(), queued: false };
  }

  const existingBarcode = await prisma.barcode.findUnique({
    where: { barcode: strippedCode },
  });

  if (existingBarcode === null) {
    return await prisma.barcode.create({
      data: {
        barcode: strippedCode,
        scannedAt: new Date().toISOString(),
      },
    });
  }

  return existingBarcode;
}

export async function getBarcode(barcode: string): Promise<BarcodeModel> {
  "use server";

  const model = await prisma.barcode.findUnique({
    where: { barcode: barcode },
  });

  if (model === null) throw new NotFoundError("Barcode not found");

  return model;
}

export async function queueBarcode(
  barcode: string,
  queuedProductId?: number,
): Promise<BarcodeModel> {
  "use server";

  return await prisma.barcode.upsert({
    where: { barcode: barcode },
    update: { queued: true, queuedProductId: queuedProductId },
    create: {
      barcode: barcode,
      scannedAt: new Date().toISOString(),
      queued: true,
      queuedProductId: queuedProductId,
    },
  });
}
