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
): Promise<ProductModel[]> {
  "use server";

  if (barcode === undefined) throw new Error("No barcode given");

  return await prisma.product.findMany({
    where: {
      barcodes: {
        some: {
          barcode: {
            equals: barcode,
          },
        },
      },
    },
  });
}
