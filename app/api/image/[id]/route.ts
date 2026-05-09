import { getProductPhoto } from "@/lib/product-db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/image/[id]'>) {
  const { id } = await ctx.params

  if (id !== null && id !== undefined) {
    try {
      const photo = await getProductPhoto(Number(id));
      return new NextResponse(photo.data, {
        status: 200,
        headers: new Headers({
          // this optional header triggers a download in the browser
          //"content-disposition": `attachment; filename=${photo.filename}`,
          "content-type": "image/png",
          "content-length": photo.data.length + "",
          "cache-control": "no-cache",
        }),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      return NextResponse.json(
        {
          error: "Error while serving the file: " + err.message!,
        },
        { status: 404 },
      );
    }
  }

  return NextResponse.json(
    {
      error: "Bad request",
    },
    { status: 400 },
  );
};
