"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod/v4";
import { prisma } from "@/lib/prisma";
import { SettingsFormSchema } from "./settings-form-schema";

export async function settingsSubmit(prevstate: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: SettingsFormSchema });

  if (submission.status !== "success") {
    console.log("Settings submit error:", submission);
    return submission.reply();
  }

  const data = submission.value;

  await prisma.settings.upsert({
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

  const toDelete = data.apiKeys
    .filter((key) => key.delete !== undefined && key.id !== undefined)
    .map((key) => Number(key.id));

  await prisma.userApiKey.deleteMany({
    where: {
      userId: 1, // TODO: Actual users
      id: { in: toDelete },
    },
  });

  const toCreate = data.apiKeys
    .filter((key) => key.delete === undefined && key.id === undefined)
    .map((key) => {
      return {
        userId: 1, // TODO: Actual users
        apiKey: key.apiKey,
        created: key.created!,
      };
    });

  await prisma.userApiKey.createMany({
    data: toCreate,
  });

  revalidatePath("/settings");
  redirect("/settings");
}
