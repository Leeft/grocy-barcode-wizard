"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { fetchBattery, grocyClient } from "@/lib/grocy";
import { BatteryChargeTrackingSchema } from "../action-form-schemas";

export async function batteryTrackSubmit(prevstate: unknown, formData: FormData) {
  const barcode = formData.get("barcode")?.valueOf();
  const batteryId = Number(formData.get("batteryId")?.valueOf());

  if (barcode === null || barcode === undefined) {
    console.error("no barcode from form?", barcode);
    return;
  }

  if (batteryId === null || batteryId === undefined || !batteryId) {
    console.error("no batteryId from form?", batteryId, formData);
    return;
  }

  const battery = await fetchBattery(batteryId);

  const submission = parseWithZod(formData, { schema: BatteryChargeTrackingSchema });

  if (submission.status !== "success") {
    const err = submission.error;
    console.log("submission errors:", err);
    return submission.reply();
  }

  const data = submission.value;

  // console.log("data is", data);

  const { data: tracked, error } = await grocyClient.POST("/batteries/{batteryId}/charge", {
    params: { path: { batteryId: batteryId } },
    body: {
      tracked_time: data.chargeDate!.toISOString(),
    },
  });

  // @ts-expect-error Shut up already
  if (error || tracked.error_message!) {
    console.log("Error updating charge tracking:", error);
  } else {
    console.log("Updated charge tracking:", tracked);

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath(`/scan/${encodeURIComponent(barcode.toString())}`);
    redirect(`/scan/${encodeURIComponent(barcode.toString())}`);
  }
}
