"use client";

import { Button } from "../button";
import Barcode from "@/lib/barcode";

export default function QueuedProduct({
  barcode,
}: {
  barcode: Barcode;
}) {
  return (
    <>
      <h1 className="mb-3 inline-block text-lg font-bold text-slate-400">
        Barcode <code>{barcode.barcode}</code> is already queued
      </h1>
      <p className="pb-5 text-slate-500">
        When you&apos;re ready to process your queued entries you can edit these
        queued entries to refine with any missing information and send the
        complete data to Grocy. In the meantime, I&apos;ll hold on to these entries
        for you.
      </p>
      <div className="flex w-full pt-3 pb-15">
        <div className="flex-3.5">
          <Button type="button" className="min-h-12 cursor-pointer text-left">
            Edit queued entry and send to grocy
          </Button>
        </div>
      </div>
    </>
  );
}
