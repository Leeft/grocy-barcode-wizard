"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { prisma } from "@/lib/prisma";
import { SettingsFormSchema } from "./settings-form-schema";

export async function settingsSubmit(prevstate: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: SettingsFormSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = submission.value;

  const settings = await prisma.settings.upsert({
    where: { userId: 1 }, // TODO: Actual users
    update: {
      openCameraByDefault: data.openCameraByDefault,
      playSoundOnScan: data.playSoundOnScan,
    },
    create: {
      userId: 1, // TODO: Actual users
      openCameraByDefault: data.openCameraByDefault,
      playSoundOnScan: data.playSoundOnScan,
    },
  });

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/settings");
  redirect("/settings");
}
