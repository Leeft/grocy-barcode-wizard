"use server";

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/errors";

//

export async function getUser(userId: number) {
  "use server";

  if (userId === undefined) throw new Error("No userId given");

  if (!process.env.DATABASE_URL) {
    return {
      id: userId,
      username: "nodb",
      name: "No DB",
      email: "nodb@example.com",
      created: new Date(),
      settings: undefined,
    };
  }

  const model = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
    },
  });

  if (model === null) throw new NotFoundError("User not found");

  return model;
}

export type GetUser = Awaited<ReturnType<typeof getUser>>;

//

export async function getApiKeys(userId: number) {
  "use server";

  if (userId === undefined) throw new Error("No userId given");

  if (!process.env.DATABASE_URL) {
    return [
      {
        id: 1,
        userId: userId,
        apiKey: "nodb",
        created: new Date(),
      },
    ];
  }

  const model = await prisma.userApiKey.findMany({
    where: { userId: userId },
  });

  if (model === null) throw new NotFoundError("Api keys not found");

  return model;
}

export type GetApiKeys = Awaited<ReturnType<typeof getApiKeys>>;

//

export async function getApiKey(key: string) {
  "use server";

  return await prisma.userApiKey.findUnique({
    where: {
      apiKey: key,
    },
  });
}

export type GetApiKey = Awaited<ReturnType<typeof getApiKey>>;
