"use server";

import { revalidatePath } from "next/cache";
import { parseWithZod } from "@conform-to/zod/v4";
import { grocyClient } from "@/lib/grocy";
import { BatteryChargeTrackingSchema } from "../action-form-schemas";
import { toActionState } from "@/lib/utils";

export async function batteryTrackSubmit(prevstate: unknown, formData: FormData) {
  const barcode = formData.get("barcode")?.valueOf();
  const batteryId = Number(formData.get("batteryId")?.valueOf());

  if (barcode === null || barcode === undefined) {
    console.error("no barcode from form?", barcode);
    return toActionState("Submission error", "error");
  }

  if (batteryId === null || batteryId === undefined || !batteryId) {
    console.error("no batteryId from form?", batteryId, formData);
    return toActionState("Submission error", "error");
  }

  //const battery = await fetchBattery(batteryId);

  const submission = parseWithZod(formData, { schema: BatteryChargeTrackingSchema });

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
    return toActionState("Submission error", "error");
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
    return toActionState("Grocy returned an error", "error");

  } else {
    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath(`/scan/${encodeURIComponent(barcode.toString())}`);
    return toActionState("Battery charge cycle recorded", "success");
  }
}
