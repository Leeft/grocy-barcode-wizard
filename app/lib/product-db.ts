"use server";

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

//

export async function getProduct(id: number) {
  "use server";

  if (id === undefined) throw new Error("No productId given");

  const model = await prisma.product.findUnique({
    where: { id: id },
    include: {
      barcodes: true,
      productPhoto: {
        omit: {
          data: true,
        },
      },
    },
  });

  if (model === null) throw new NotFoundError("Product not found");

  return model;
}

export type GetProduct = Awaited<ReturnType<typeof getProduct>>;

//

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

//

export async function countPendingProducts() {
  "use server";
  if (process.env.DATABASE_URL === undefined) {
    return 0;
  }

  return await prisma.product.count({
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

export type CountPendingProducts = Awaited<ReturnType<typeof countPendingProducts>>;

//

export async function getCapturedProductsByBarcode(barcode: string) {
  "use server";

  if (barcode === undefined || barcode.trim() === "") throw new Error("No barcode given");

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

export type CapturedProductsByBarcode = Awaited<ReturnType<typeof getCapturedProductsByBarcode>>;

//

export async function getProductPhoto(id: number) {
  "use server";

  if (id === undefined) throw new Error("No productPhotoId given");

  const model = await prisma.productPhoto.findUnique({
    where: { id: id },
  });

  if (model === null && id > 0) throw new NotFoundError("Product photo not found");

  return model;
}

export type GetProductPhoto = Awaited<ReturnType<typeof getProductPhoto>>;

//

export async function deleteProductPhoto(id: number) {
  "use server";

  if (id === undefined) throw new Error("No productPhotoId given");

  return await prisma.productPhoto.delete({
    where: {
      id: Number(id),
    },
  });
}

export type DeleteProductPhoto = Awaited<ReturnType<typeof deleteProductPhoto>>;
