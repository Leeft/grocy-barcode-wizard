"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { prisma } from "@/lib/prisma";
import { DueDateType, PurchasePriceType, UnitSystem } from "@/generated/prisma/enums";
import { dataURLtoFile, dateToISODate, toActionState } from "@/lib/utils";
import { CreateProductFormSchema, EditProductFormSchema } from "@/forms/product-form-schema";
import { apiKey, baseUrl, grocyClient } from "@/lib/grocy";
import {
  dueDateTypeToGrocy,
  labelTypeToGrocy,
  Product,
  ProductBarcode,
  purchasePriceTypeToGrocy,
  QuantityUnitConversion,
} from "@/interfaces/grocy";
import { getProduct, getProductPhoto } from "@/lib/product-db";
import { fetchQuantityUnitConversionsForProduct, updateQuantityUnitConversion } from "@/lib/grocy-fetch";

function normalisePrice(priceType: PurchasePriceType, price: number, amount: number): number {
  if (priceType === PurchasePriceType.UNIT_PRICE) {
    return price;
  }
  return price / amount;
}

function dueOrNoExpiryDate(dueDateType: DueDateType, dueDate: Date) {
  if (dueDateType === DueDateType.NO_EXPIRY) return new Date("2999-12-31");
  return dueDate;
}

export async function productCreateSubmit(prevstate: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: CreateProductFormSchema });

  if (submission.status !== "success") {
    const submissionErrors = submission.error;
    if (submissionErrors !== undefined && submissionErrors !== null) {
      const keys = Object.keys(submissionErrors);
      const errors: string[] = [];
      keys.forEach((key) => {
        if (submissionErrors[key]) errors.push(`${key}: ` + submissionErrors[key].join("; ") + "\n");
      });
      return toActionState("Form validation errors: " + errors.join("\n"), "error");
    }    
    return toActionState("Could not process submission", "error");
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
      quantity: data.quantity,
      purchasePriceType: data.purchasePriceType,
      purchasePrice: data.purchasePrice ? data.purchasePrice.toString() : "0",
    },
  });

  if (data.imageData != "" && data.imageData !== undefined) {
    const file = dataURLtoFile(data.imageData, "filename-not-used-yet");
    const arr = new Uint8Array(await file.arrayBuffer());
    await prisma.productPhoto.create({
      data: {
        userId: 1, // TODO: Actual users
        productId: queuedProduct.id,
        filename: `capture-${queuedProduct.id}-${Date.now()}.png`,
        filetype: data.imageType,
        data: arr,
        grocyFileGroup: "productpictures",
        lastChanged: Math.floor(Date.now() / 1000),
      },
    });
  }

  await prisma.barcode.update({
    where: { barcode: data.barcode },
    data: { productId: queuedProduct.id },
  });

  revalidatePath(`/scan/${data.barcode}`);
  return toActionState("Product capture queued", "success");
}

export async function productUpdateSubmit(prevstate: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: EditProductFormSchema });
  // Send the submission back to the client if the status is not successful
  if (submission.status !== "success") {
    console.log("submission error:", submission);
    return submission.reply();
  }

  const data = submission.value;

  // console.log("submit success:", data);

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
      quantity: data.quantity,
      purchasePriceType: data.purchasePriceType,
      purchasePrice: data.purchasePrice ? data.purchasePrice.toString() : "0",
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

  // console.log("updated product is", queuedProduct);

  if (data.imageData != "" && data.imageData !== undefined) {
    const file = dataURLtoFile(data.imageData, "filename-not-used-yet");
    const arr = new Uint8Array(await file.arrayBuffer());
    const productPhoto = await prisma.productPhoto.upsert({
      where: { productId: queuedProduct.id },
      update: {
        filename: `capture-${queuedProduct.id}-${Date.now()}.png`,
        data: arr,
        lastChanged: Math.floor(Date.now() / 1000),
      },
      create: {
        userId: 1, // TODO: Actual users
        filename: `capture-${queuedProduct.id}-${Date.now()}.png`,
        filetype: data.imageType,
        data: arr,
        productId: queuedProduct.id,
        grocyFileGroup: "productpictures",
        lastChanged: Math.floor(Date.now() / 1000),
      },
    });
    revalidatePath(`/api/image/${productPhoto.id}`, "page");
  }

  if (data.submitMode === "createInGrocy") {
    // TODO: notification
    await syncProductToGrocy(data.id, data.dueOrExpiryDate!);
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath(`/queue/[barcode]`, "page");
  redirect(`/queue/${data.barcode}`);
}

async function syncProductToGrocy(productId: number, dueDate: Date) {
  const product = await getProduct(productId);
  const photo = product.productPhoto ? await getProductPhoto(product.productPhoto.id) : null;

  const grocyApiHeaders = new Headers({
    "Content-Type": "application/json",
    Accept: "application/json",
    "GROCY-API-KEY": apiKey!,
  });

  const dueDayOrMinusZero = (dueDateType: DueDateType, dueDays: number | null) => {
    if (dueDays === null || dueDays === undefined) return 0;
    return dueDateType === DueDateType.NO_EXPIRY ? -1 : dueDays;
  };

  const createProduct: Product = {
    name: product.name,
    description: undefined,
    location_id: product.defaultLocation,
    qu_id_stock: product.unitChosen,
    qu_id_purchase: product.defaultQuantityUnitPurchase ?? undefined,
    qu_id_consume: product.defaultQuantityUnitConsume ?? undefined,
    qu_id_price: product.quantityUnitPrices ?? undefined,
    min_stock_amount: 0,
    default_best_before_days: dueDayOrMinusZero(product.dueDateType, product.dueDays),
    default_best_before_days_after_open: product.dueDaysAfterOpen ?? 0,
    default_best_before_days_after_freezing: dueDayOrMinusZero(
      product.dueDateType,
      product.dueDaysAfterFreezing,
    ),
    default_best_before_days_after_thawing: product.dueDaysAfterThawing ?? 0,
    product_group_id: product.productGroup ?? undefined,
    picture_file_name: photo ? photo.filename : undefined,
    enable_tare_weight_handling: product.enableTareWeight ? 1 : 0,
    tare_weight: Number(product.tareWeight),
    not_check_stock_fulfillment_for_recipes: product.disableStockChecking ? 1 : 0,
    shopping_location_id: product.defaultShop ?? undefined,
    should_not_be_frozen: product.canBeFrozen ? 0 : 1,
    default_consume_location_id: product.consumeLocationId ?? undefined,
    move_on_open: product.moveOnOpen ? 1 : 0,
    treat_opened_as_out_of_stock: 0,
    default_purchase_price_type: purchasePriceTypeToGrocy(product.purchasePriceType),
    calories: product.energy ? Number(product.energy) : undefined,
    parent_product_id: product.parentProductId ?? undefined,
    due_type: dueDateTypeToGrocy(product.dueDateType),
    quick_consume_amount: product.quickConsumeAmount ? Number(product.quickConsumeAmount) : 0,
    hide_on_stock_overview: product.dontShowOnStock ? 1 : 0,
    default_stock_label_type: labelTypeToGrocy(product.defaultStockLabelType),
    auto_reprint_stock_label: product.autoReprintStockLabel ? 1 : 0,
    quick_open_amount: product.quickOpenAmount ? Number(product.quickOpenAmount) : 0,
    disable_open: product.cantOpen ? 1 : 0,
  };

  const createProductRequest = new Request(`${baseUrl}objects/products`, {
    method: "POST",
    body: JSON.stringify(createProduct),
    headers: grocyApiHeaders,
  });

  let response = await fetch(createProductRequest);

  if (response.status === 200) {
    const body = JSON.parse(await response.text());
    const createdObjectId = body.created_object_id;
    console.log("created_object_id:", createdObjectId);

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        grocyProductId: Number(createdObjectId),
      },
    });

    const productBarcode: ProductBarcode = {
      product_id: body.created_object_id,
      barcode: product.barcodes[0]?.barcode,
      qu_id: product.unitChosen,
      shopping_location_id: product.defaultShop ?? 0,
      amount: Number(product.unitAmount),
      //last_price: ... // TODO
      note: "Added by Grocy Barcode Wizard",
    };

    const addBarcodeRequest = new Request(`${baseUrl}objects/product_barcodes`, {
      method: "POST",
      body: JSON.stringify(productBarcode),
      headers: grocyApiHeaders,
    });
    response = await fetch(addBarcodeRequest);
    if (response.status === 200) {
      const body = JSON.parse(await response.text());
      console.log("created barcode:", body);
      // => { created_object_id: '139' }
    } else {
      console.error("Error creating barcode for product", await response.text());
    }

    if (photo !== undefined && photo?.data !== undefined && photo?.data !== null) {
      const grocyApiFileHeaders = new Headers({
        "Content-Type": "application/octet-stream",
        Accept: "application/json",
        "GROCY-API-KEY": apiKey!,
      });

      const addPictureRequest = new Request(`${baseUrl}files/productpictures/${btoa(photo.filename)}`, {
        method: "PUT",
        body: photo.data,
        headers: grocyApiFileHeaders,
      });
      response = await fetch(addPictureRequest);
      if (response.status === 204) {
        console.log("created picture OK");

        await prisma.productPhoto.update({
          where: {
            id: photo.id,
          },
          data: {
            grocyFileGroup: "productpictures",
            grocyFileName: photo.filename,
          },
        });
        //
      } else {
        // Note: It might already exist ...
        console.error(
          "Error uploading picture for product:",
          response.status,
          response.statusText,
          await response.text(),
        );
        //
      }
    }

    // Update updated stock units

    const units = (await fetchQuantityUnitConversionsForProduct(createdObjectId))
      .data as QuantityUnitConversion[];

    units.forEach((qu) => {
      if (
        product.unitChosen !== product.defaultQuantityUnitPurchase &&
        product.purchaseConversionFactor !== product.unitAmount
      ) {
        const factor = Number(product.purchaseConversionFactor) / Number(product.unitAmount);

        if (qu.from_qu_id === product.unitChosen && qu.to_qu_id === product.defaultQuantityUnitPurchase) {
          updateQuantityUnitConversion(qu.id, factor);
        }

        if (qu.to_qu_id === product.unitChosen && qu.from_qu_id === product.defaultQuantityUnitPurchase) {
          updateQuantityUnitConversion(qu.id, 1 / factor);
        }
      }

      if (
        product.unitChosen !== product.defaultQuantityUnitConsume &&
        product.consumeConversionFactor !== product.unitAmount
      ) {
        const factor = Number(product.consumeConversionFactor) / Number(product.unitAmount);

        if (qu.from_qu_id === product.unitChosen && qu.to_qu_id === product.defaultQuantityUnitConsume) {
          updateQuantityUnitConversion(qu.id, factor);
        }

        if (qu.to_qu_id === product.unitChosen && qu.from_qu_id === product.defaultQuantityUnitConsume) {
          updateQuantityUnitConversion(qu.id, 1 / factor);
        }
      }

      if (
        product.unitChosen !== product.quantityUnitPrices &&
        product.priceConversionFactor !== product.unitAmount
      ) {
        const factor = Number(product.priceConversionFactor) / Number(product.unitAmount);

        if (qu.from_qu_id === product.unitChosen && qu.to_qu_id === product.quantityUnitPrices) {
          updateQuantityUnitConversion(qu.id, factor);
        }

        if (qu.to_qu_id === product.unitChosen && qu.from_qu_id === product.quantityUnitPrices) {
          updateQuantityUnitConversion(qu.id, 1 / factor);
        }
      }
    });

    // +-----+------------+--------+------------------+----------------+---------------+-------+------+-------------+-----------------------+-------------+----------------------+---------+
    // | id  | product_id | amount | best_before_date | purchased_date |   stock_id    | price | open | opened_date | row_created_timestamp | location_id | shopping_location_id |  note   |
    // +-----+------------+--------+------------------+----------------+---------------+-------+------+-------------+-----------------------+-------------+----------------------+---------+
    // | 247 | 188        | 2      | 2999-12-31       | 2026-04-26     | 69ee6a2f90994 | 12    | 0    |             | 2026-04-26 21:40:31   | 3           | 1                    | Bla bla |
    // +-----+------------+--------+------------------+----------------+---------------+-------+------+-------------+-----------------------+-------------+----------------------+---------+
    await grocyClient.POST("/stock/products/{productId}/add", {
      params: { path: { productId: createdObjectId } },
      body: {
        amount: product.quantity,
        best_before_date: dueOrNoExpiryDate(product.dueDateType, dueDate).toISOString(),
        //purchased_date: '',
        transaction_type: "purchase",
        price: normalisePrice(product.purchasePriceType, Number(product.purchasePrice!), product.quantity),
        //open: 0,
        //opened_date: '',
      },
    });
  } else {
    //console.log("request is", createProductRequest.text());
    console.error("Error response is", response, await response.text());
    // await prisma.barcode.update({
    //   where: { barcode: data.barcode },
    //   data: { productId: queuedProduct.id },
    // });
  }
}
