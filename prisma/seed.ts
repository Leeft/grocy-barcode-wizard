import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const apiKeys = [];
if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
  apiKeys.push({
    apiKey: "dBn5rdkuJ9w8KaxWpuSezWiaEK68TzyH",
    created: new Date(),
  });
}

const userData: Prisma.UserCreateInput[] = [
  {
    username: "nobody",
    name: "Nobody",
    email: "nobody@example.com",
    settings: {
      create: {
        openCameraByDefault: true,
      },
    },
    userApiKeys: {
      create: apiKeys,
    },
    created: new Date(),
  },
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();
