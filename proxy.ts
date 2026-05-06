import { isEnvironmentConfigured } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
  if (!isEnvironmentConfigured()) {
    return NextResponse.redirect(new URL("/system/config-error", req.nextUrl));
  }
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|system|.*\\.png$).*)"],
};
