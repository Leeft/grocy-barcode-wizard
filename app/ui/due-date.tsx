"use client";

import { DueDateType } from "@/generated/prisma/enums";

export default function DueDate({
  date,
  type,
}: {
  date: string;
  type: DueDateType;
}) {
  let prefix: string;
  switch (type) {
    case DueDateType.BEST_BEFORE:
      prefix = "Best before";
      break;
    case DueDateType.EXPIRY_DATE:
      prefix = "Expires at";
      break;
    default:
      prefix = "No expiry";
      break;
  }

  const dueOrExpiryDate: string = (type !== DueDateType.NO_EXPIRY) ? new Date(date).toDateString() : '';

  return (
    <>
      {prefix}
      {type !== DueDateType.NO_EXPIRY && date && (
        <>
          {" "}
          <em>{dueOrExpiryDate}</em>
        </>
      )}
    </>
  );
}
