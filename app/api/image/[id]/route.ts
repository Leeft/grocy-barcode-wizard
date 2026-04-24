import { prisma } from "@/lib/prisma";
import { getProductPhoto } from "@/lib/product-db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> => {
  const { id } = await params;

  if (id !== null && id !== undefined) {
    try {
      const photo = await getProductPhoto(Number(id));
      return new NextResponse(photo.data, {
        status: 200,
        headers: new Headers({
          // this optional header triggers a download in the browser
          "content-disposition": `attachment; filename=${photo.filename}`,
          "content-type": "image/png",
          "content-length": photo.data.length + "",
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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> => {
  const { id } = await params;

  try {
    await prisma.productPhoto.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({ message: `Photo ${id} deleted successfully` }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      {
        error: `Error while deleting photo ${id}:` + err.message!,
      },
      { status: 404 },
    );
  }
};
