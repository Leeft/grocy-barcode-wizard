"use server";

import prisma from "@/lib/prisma";
import { SimpleBarcodeObject } from "@/lib/barcode";
import { BarcodeModel } from "@/generated/prisma/models";

export async function writeBarcode(
  barcode: SimpleBarcodeObject,
): Promise<BarcodeModel> {
  "use server";

  const existingBarcode = await prisma.barcode.findUnique({
    where: { barcode: barcode.barcode },
  });

  if (existingBarcode === null) {
    return await prisma.barcode.create({
      data: {
        barcode: barcode.barcode,
        scannedAt: new Date().toISOString(),
      },
    });
  }

  return existingBarcode;
}

export async function queueBarcode(
  barcode: SimpleBarcodeObject,
): Promise<BarcodeModel> {
  "use server";

  await writeBarcode(barcode);

  return await prisma.barcode.update({
    where: { barcode: barcode.barcode, queued: false },
    data: {
      queued: true,
    },
  });
}
