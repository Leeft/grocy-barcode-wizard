"use server";

import { prisma } from "@/lib/prisma";

export async function getSettings(userId: number) {
  "use server";

  if (userId === undefined) throw new Error("No userId given");

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
