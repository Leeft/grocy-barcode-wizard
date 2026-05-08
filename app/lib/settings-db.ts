"use server";

import { prisma } from "@/lib/prisma";

export async function getSettings(userId: number) {
  "use server";

  if (userId === undefined) throw new Error("No userId given");

  if (!process.env.DATABASE_URL) {
    return {
      userId: userId,
      openCameraByDefault: false,
      playSoundOnScan: false,
    };
  }

  const model = await prisma.settings.findUnique({
    where: { userId: userId },
  });

  if (model === null) {
    return await prisma.settings.create({
      data: {
        userId: userId,
      },
    });
  }

  return model;
}

export type GetSettings = Awaited<ReturnType<typeof getSettings>>;
