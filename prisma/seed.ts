import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

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
    created: new Date(),
  },
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();
