"use server";

import { DueDateType, UnitSystem } from "@/generated/prisma/enums";
import {
  ProductCreateInput,
  ProductPhotoUncheckedCreateInput,
} from "@/generated/prisma/models";
import { dateToISODate } from "@/lib/date";
import prisma from "@/lib/prisma";
import { z } from "zod";

const FormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Expecting at least 2 characters")
      .max(64, "Keep the product name under 64 characters"), // Grocy can handle longer though

    // productGroup: z.coerce.number().gt(-1, { message: `Must be 0 or greater` }),

    unitSystem: z.enum(["weight", "volume", "abstract"], {
      message: "The unit system to use must be chosen",
    }),

    mainQuantityUnitId: z.coerce
      .number()
      .gt(0, { message: "Select a unit from the list" }),

    mainQuantity: z.coerce.number().gt(0, { message: `Must be above 0` }),

    // parentProductId: z.coerce
    //   .number()
    //   .gt(-1, { message: "Parent product must be unset or greater than zero" }),

    defaultProductLocationId: z.coerce
      .number()
      .gt(0, { message: "Default product location must be set" }),

    // defaultConsumeLocationId: z.coerce.number().gt(-1, {
    //   message: "Consumption location must be unset or greater than zero",
    // }),

    // defaultShopLocationId: z.coerce.number().gt(-1, {
    //   message: "Default shop location must be unset or greater than zero",
    // }),

    dueDateType: z.enum(["best-before", "expiry-date", "no-expiry"], {
      message: "Due- or expiry-date type must be chosen",
    }),

    dueOrExpiryDate: z.iso.date({ error: "Not a valid date" }).optional(),

    packagingDate: z.iso.date({ error: "Not a valid date" }).optional(),

    shouldNotBeFrozen: z.coerce.boolean(),

    // noStockCheck: z.coerce.boolean(),

    // canNotOpen: z.coerce.boolean(),

    // moveOnOpen: z.coerce.boolean(),

    // hideFromStock: z.coerce.boolean(),

    defaultDueDays: z.coerce
      .number()
      .gt(-1, { message: `Must be 0 or greater` })
      .optional(),

    defaultDueDaysAfterOpen: z.coerce
      .number()
      .gt(-1, { message: `Must be 0 or greater` })
      .optional(),

    defaultDueDaysAfterFreezing: z.coerce
      .number()
      .gt(-1, { message: `Must be 0 or greater` })
      .optional(),

    defaultDueDaysAfterThawing: z.coerce
      .number()
      .gt(-1, { message: `Must be 0 or greater` })
      .optional(),

    image: z.string().optional(),
  })
  .refine(
    ({ dueDateType, dueOrExpiryDate, packagingDate }) => {
      // No need to check anything for no-expiry
      if (dueDateType === "no-expiry") return true;
      if (!dueOrExpiryDate) return false;
      if (!packagingDate) return true;
      return packagingDate < dueOrExpiryDate;
    },
    {
      message: "Due date must be after packaging date",
      path: ["dueOrExpiryDate"],
    },
  )
  .refine(
    ({ dueDateType, packagingDate }) => {
      // No need to check anything for no-expiry
      if (dueDateType === "no-expiry") return true;
      if (!packagingDate) return true;
      const today = dateToISODate(new Date());
      return packagingDate <= today;
    },
    {
      message: "Packaging date must be in the past",
      path: ["packagingDate"],
    },
  );
export type AddProductFormData = z.infer<typeof FormSchema>;

export type QueueProductState = {
  message: string;
  form: {
    name: string;
    dueOrExpiryDate: string;
    packagingDate: string;
    [k: string]: FormDataEntryValue;
  };
  errors?: {
    name?: string[];
    mainQuantityUnitId?: string[];
    mainQuantity?: string[];
    parentProductId?: string[];
    defaultProductLocationId?: string[];
    defaultConsumeLocationId?: string[];
    defaultShopLocationId?: string[];
    dueOrExpiryDate?: string[];
    dueDateType?: string[];
    unitSystem?: string[];
    packagingDate?: string[];
    shouldNotBeFrozen?: string[];
    defaultDueDays?: string[];
    defaultDueDaysAfterOpen?: string[];
    defaultDueDaysAfterFreezing?: string[];
    defaultDueDaysAfterThawing?: string[];
  };
};

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0]!.match(/:(.*?);/)![1];
  const bstr = atob(arr[arr.length - 1]!);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export async function quickProductFormSubmit(
  _prev: QueueProductState,
  formData: FormData,
): Promise<QueueProductState> {
  const rawFormData = Object.fromEntries(formData.entries());
  const validation = FormSchema.safeParse(rawFormData);

  if (!validation.success) {
    // console.error(
    //   "form validation errors",
    //   validation.error.flatten().fieldErrors,
    // );
    //console.log("form data state", rawFormData);
    return {
      message: "",
      form: {
        name: "",
        dueOrExpiryDate: "",
        packagingDate: "",
        ...rawFormData,
      },
      errors: validation.error.flatten().fieldErrors,
    };
  } else {
    //console.log("validated", validation.data);
  }

  // validated {
  //   name: 'This is a product name',
  //   unitSystem: 'abstract',
  //   mainQuantityUnitId: 16,
  //   mainQuantity: 1,
  //   defaultProductLocationId: 14,
  //   dueDateType: 'expiry-date',
  //   dueOrExpiryDate: '2026-04-30',
  //   packagingDate: '2026-04-08',
  //   shouldNotBeFrozen: true,
  //   defaultDueDays: 22,
  //   defaultDueDaysAfterOpen: 0
  // }

  let dueDateType = "BEST_BEFORE";
  if (validation.data.dueDateType === "expiry-date")
    dueDateType = "EXPIRY_DATE";
  else if (validation.data.dueDateType === "no-expiry")
    dueDateType = "NO_EXPIRY";

  const canExpire = dueDateType !== DueDateType.NO_EXPIRY;
  const data = validation.data;

  const queuedProduct = await prisma.product.create({
    data: {
      name: data.name,
      pending: true,
      canBeFrozen: !data.shouldNotBeFrozen,
      unitSystem: data.unitSystem.toUpperCase() as UnitSystem,
      unitAmount: data.mainQuantity,
      unitChosen: data.mainQuantityUnitId,
      dueDateType: dueDateType as DueDateType,
      expiresAt: canExpire ? data.dueOrExpiryDate! : null,
      packagingDate: canExpire ? data.packagingDate! : null,
      defaultDueDays: canExpire ? data.defaultDueDays : null,
      defaultDueDaysAfterOpen: canExpire ? data.defaultDueDaysAfterOpen : null,
      defaultDueDaysAfterFreezing: canExpire
        ? data.defaultDueDaysAfterFreezing
        : null,
      defaultDueDaysAfterThawing: canExpire
        ? data.defaultDueDaysAfterThawing
        : null,
    } as ProductCreateInput,
  });

  console.log("queued product is", queuedProduct);

  if (data.image) {
    const file = dataURLtoFile(data.image, "filename-not-used-yet");
    const arr = new Uint8Array(await file.arrayBuffer());
    const queuedProductPhoto = await prisma.productPhoto.create({
      data: {
        filename: `capture-${queuedProduct.id}-${Date.now()}.png`,
        data: arr,
        productId: queuedProduct.id,
        grocyFileGroup: "productpictures",
      } as ProductPhotoUncheckedCreateInput,
    });
  }

  // Revalidate the cache for the invoices page and redirect the user.
  //revalidatePath("/dashboard/invoices");
  //redirect("/dashboard/invoices");

  return {
    message: "",
    form: {
      name: "",
      dueOrExpiryDate: "",
      packagingDate: "",
      ...rawFormData,
    },
  };
}
