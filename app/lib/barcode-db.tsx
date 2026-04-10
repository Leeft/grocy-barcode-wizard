import prisma from "@/lib/prisma";
import Barcode from "@/lib/barcode";
import { BarcodeModel } from "@/generated/prisma/models";

export async function writeBarcode(barcode: Barcode): Promise<BarcodeModel> {
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
