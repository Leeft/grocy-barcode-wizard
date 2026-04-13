"use client";

import { DueDateType } from "@/generated/prisma/enums";

export default function PackagingDate({
  date,
  type,
}: {
  date: string;
  type: DueDateType;
}) {
  const packagingDate: string =
    type !== DueDateType.NO_EXPIRY ? new Date(date).toDateString() : "";

  return (
    <>
      Packaged at <em>{packagingDate}</em>
    </>
  );
}
