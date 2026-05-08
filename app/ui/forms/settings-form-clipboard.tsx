"use client";

import { Clipboard } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CopyToClipboardButton({ value }: { value: string }) {
  async function setClipboard(text: string) {
    const type = "text/plain";
    const clipboardItemData = {
      [type]: text,
    };
    const clipboardItem = new window.ClipboardItem(clipboardItemData);
    await navigator.clipboard.write([clipboardItem]);
    toast.success("Copied API key to clipboard");
  }

  return (
    <div className="flex w-auto shrink">
      <button
        className={"cursor-pointer rounded-lg border px-3 disabled:cursor-default disabled:opacity-50"}
        disabled={value === "on"}
        title="Copy API key to clipboard"
        onClick={(e) => {
          setClipboard(value);
          e.preventDefault();
        }}
      >
        <Clipboard className="w-3" />
      </button>
    </div>
  );
}
