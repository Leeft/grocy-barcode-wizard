"use server";

import prisma from "@/lib/prisma";
import { ProductModel } from "@/generated/prisma/models";

export async function getProduct(id: number): Promise<ProductModel> {
  "use server";

  if (id === undefined) throw new Error("No productId given");

  const model = await prisma.product.findUnique({
    where: { id: id },
    include: {
      barcodes: true,
      productPhoto: true,
    },
  });

  if (model === null) throw new Error("Product not found");

  return model;
}

export type GetProduct = Awaited<ReturnType<typeof getProduct>>;


export async function getPendingProducts() {
  "use server";

  return await prisma.product.findMany({
    include: {
      barcodes: true,
      productPhoto: true,
    },
    where: {
      grocyProductId: {
        equals: null,
      },
      barcodes: {
        some: {
          queued: {
            equals: true,
          },
        },
      },
    },
  });
}

export type PendingProducts = Awaited<ReturnType<typeof getPendingProducts>>;


export async function getProductsByBarcode(
  barcode: string,
) {
  "use server";

  if (barcode === undefined || barcode.trim() === '') throw new Error("No barcode given");

  return await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      grocyProductId: true,
    },
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

export type ProductsByBarcode = Awaited<ReturnType<typeof getProductsByBarcode>>;
