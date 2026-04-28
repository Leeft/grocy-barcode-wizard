"use client";

import { createContext } from "react";
import { GetUser } from "@/lib/user-db";

export const UserContext = createContext<Promise<GetUser> | null>(null);

export default function UserProvider({
  children,
  promise,
}: {
  children: React.ReactNode;
  promise: Promise<GetUser> | null;
}) {
  return <UserContext value={promise}>{children}</UserContext>;
}
