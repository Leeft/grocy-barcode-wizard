"use server";

import prisma from "@/lib/prisma";
import { BarcodeModel } from "@/generated/prisma/models";
import { NotFoundError } from "@/lib/errors";

export async function writeBarcode(barcode: string): Promise<BarcodeModel> {
  "use server";

  const existingBarcode = await prisma.barcode.findUnique({
    where: { barcode: barcode },
  });

  if (existingBarcode === null) {
    return await prisma.barcode.create({
      data: {
        barcode: barcode,
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

export async function queueBarcode(barcode: string): Promise<BarcodeModel> {
  "use server";

  return await prisma.barcode.upsert({
    where: { barcode: barcode },
    update: { queued: true },
    create: {
      barcode: barcode,
      scannedAt: new Date().toISOString(),
      queued: true,
    },
  });
}
