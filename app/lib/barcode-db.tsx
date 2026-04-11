"use server";

import prisma from "@/lib/prisma";
import { BasicBarcode } from "@/lib/barcode";
import { BarcodeModel } from "@/generated/prisma/models";

export async function writeBarcode(
  barcode: BasicBarcode,
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

export async function getBarcode(barcode: BasicBarcode): Promise<BarcodeModel> {
  "use server";

  const model = await prisma.barcode.findUnique({
    where: { barcode: barcode.barcode },
  });

  if (model === null) throw new Error("Barcode not found");

  return model;
}

export async function queueBarcode(
  barcode: BasicBarcode,
): Promise<BarcodeModel> {
  "use server";

  return await prisma.barcode.upsert({
    where: { barcode: barcode.barcode },
    update: { queued: true },
    create: {
      barcode: barcode.barcode,
      scannedAt: new Date().toISOString(),
      queued: true,
    },
  });
}
