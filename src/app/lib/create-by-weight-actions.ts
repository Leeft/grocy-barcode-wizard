"use server";

import { z } from "zod";

const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Expecting at least 2 characters")
    .max(64, "Keep the product name under 64 characters"), // Grocy can handle longer though

  productGroup: z.coerce.number().gt(-1, { message: `Must be 0 or greater` }),

  mainQuantityId: z.coerce
    .number()
    .gt(0, { message: "Select a unit from the list" }),

  mainQuantity: z.coerce.number().gt(0, { message: `Must be above 0` }),

  parentProductId: z.coerce
    .number()
    .gt(-1, { message: "Parent product must be unset or greater than zero" }),

  defaultProductLocationId: z.coerce
    .number()
    .gt(0, { message: "Default product location must be set" }),

  defaultConsumeLocationId: z.coerce
    .number()
    .gt(-1, {
      message: "Consumption location must be unset or greater than zero",
    }),

  defaultShopLocationId: z.coerce
    .number()
    .gt(-1, {
      message: "Default shop location must be unset or greater than zero",
    }),

  dueOrExpiryDate: z.iso.date({ error: "Not a valid ISO-8601 date" }),

  dueDateType: z.enum(["best-before", "due-date", "no-expiry"], {
    message: "Due- or expiry-date type must be chosen",
  }),

  packagingDate: z.iso.date({ error: "Not a valid ISO-8601 date" }),

  shouldNotBeFrozen: z.coerce.boolean(),

  noStockCheck: z.coerce.boolean(),

  canNotOpen: z.coerce.boolean(),

  moveOnOpen: z.coerce.boolean(),

  hideFromStock: z.coerce.boolean(),

  defaultDueDays: z.coerce.number().gt(-1, { message: `Must be 0 or greater` }),

  defaultDueDaysAfterOpen: z.coerce
    .number()
    .gt(-1, { message: `Must be 0 or greater` }),

  defaultDueDaysAfterFreezing: z.coerce
    .number()
    .gt(-1, { message: `Must be 0 or greater` }),

  defaultDueDaysAfterThawing: z.coerce
    .number()
    .gt(-1, { message: `Must be 0 or greater` }),
});

export type AddProductForm = z.infer<typeof FormSchema>;

const CreateNewByWeightProduct = FormSchema.omit({
  // id: true, date: true
});

export type State = {
  formErrors: string[],
  fieldErrors: {
    name?: string[];
    productGroup?: string[];
    mainQuantityId?: string[];
    mainQuantity?: string[];
    parentProductId?: string[];
    defaultProductLocationId?: string[];
    defaultConsumeLocationId?: string[];
    defaultShopLocationId?: string[];
    dueOrExpiryDate?: string[];
    dueDateType?: string[];
    packagingDate?: string[];
    shouldNotBeFrozen?: string[];
    noStockCheck?: string[];
    canNotOpen?: string[];
    moveOnOpen?: string[];
    hideFromStock?: string[];
    defaultDueDays?: string[];
    defaultDueDaysAfterOpen?: string[];
    defaultDueDaysAfterFreezing?: string[];
    defaultDueDaysAfterThawing?: string[];
  }
};

export async function createByWeightProduct(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const rawFormDdata = Object.fromEntries(formData.entries());

  //console.log("raw form", rawFormDdata);
  const validation = CreateNewByWeightProduct.safeParse(rawFormDdata);
  
  if (!validation.success) {
    return z.flattenError(validation.error);
  } else {
    console.log("validated", validation.data);
  }

  // Prepare data for insertion into the database
  //const { mainQuantityId, mainQuantity } = validation.data;
  //const amountInCents = amount * 100;
  //const date = new Date().toISOString().split("T")[0];

  // Insert data into the database
  // try {
  //   await sql`
  //     INSERT INTO invoices (customer_id, amount, status, date)
  //     VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  //   `;
  // } catch (error) {
  //   // If a database error occurs, return a more specific error.
  //   return {
  //     message: "Database Error: Failed to Create Invoice.",
  //   };
  // }

  // Revalidate the cache for the invoices page and redirect the user.
  //revalidatePath("/dashboard/invoices");
  //redirect("/dashboard/invoices");
  return {
    formErrors: [],
    fieldErrors: {},
  };
}

// // Use Zod to update the expected types
// const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// export async function updateInvoice(id: string, prevState: State, formData: FormData) {
//   const validation = UpdateInvoice.safeParse({
//     customerId: formData.get('customerId'),
//     amount: formData.get('amount'),
//     status: formData.get('status'),
//   });

//   if (!validation.success) {
//     return {
//       errors: validation.error.flatten().fieldErrors,
//       message: 'Missing Fields. Failed to Update Invoice.',
//     };
//   }

//   const { customerId, amount, status } = validation.data;
//   const amountInCents = amount * 100;

//   try {
//     await sql`
//         UPDATE invoices
//         SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
//         WHERE id = ${id}
//       `;
//   } catch (error) {
//     // We'll also log the error to the console for now
//     console.error(error);
//     return { message: 'Database Error: Failed to Update Invoice.' };
//   }

//   revalidatePath('/dashboard/invoices');
//   redirect('/dashboard/invoices');
// }

// export async function deleteInvoice(id: string) {
//   await sql`DELETE FROM invoices WHERE id = ${id}`;
//   revalidatePath('/dashboard/invoices');
// }
