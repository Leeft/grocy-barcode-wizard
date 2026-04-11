"use server";

import prisma from "@/lib/prisma";
import { ProductModel } from "@/generated/prisma/models";

export async function getProduct(id: number): Promise<ProductModel> {
  "use server";

  if (id === undefined) throw new Error("No productId given");

  const model = await prisma.product.findUnique({
    where: { id: id },
  });

  if (model === null) throw new Error("Product not found");

  return model;
}

export async function getProductByBarcode(
  barcode: string,
) {
  "use server";

  if (barcode === undefined) throw new Error("No barcode given");

  const result = await prisma.product.findMany({
    where: {},
    include: {
      barcodes: {
        where: {
          barcode: barcode,
          queued: true,
        },
      },
    },
  });

  if (result === null || result.length === 0) throw new Error("Product not found");

  return result;
}
