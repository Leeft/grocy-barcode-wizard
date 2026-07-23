"use server";

import { fetchConfig } from "@/lib/grocy";

export async function PrintLabel({ data }: { data: Record<string, string> }) {
  const grocyConfig = await fetchConfig();

  if (grocyConfig.LABEL_PRINTER_PARAMS === undefined) {
    console.error("LABEL_PRINTER_PARAMS not configured in Grocy");
    return;
  }

  if (grocyConfig.LABEL_PRINTER_WEBHOOK === undefined) {
    console.error("LABEL_PRINTER_WEBHOOK not configured in Grocy");
    return;
  }

  const formData = new FormData();

  Object.keys(grocyConfig.LABEL_PRINTER_PARAMS).forEach((key) => {
    if (
      typeof grocyConfig.LABEL_PRINTER_PARAMS![key] === "object" &&
      grocyConfig.LABEL_PRINTER_PARAMS![key] !== null
    ) {
      Object.keys(grocyConfig.LABEL_PRINTER_PARAMS![key]).forEach((nestedKey) => {
        formData.append(`${key}[${nestedKey}]`, grocyConfig.LABEL_PRINTER_PARAMS![key][nestedKey]);
      });
    } else {
      formData.append(key, grocyConfig.LABEL_PRINTER_PARAMS![key]);
    }
  });

  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "object" && data[key] !== null) {
      Object.keys(data[key]).forEach((nestedKey: string) => {
        // @ts-expect-error TS being funky again
        formData.append(`${key}[${nestedKey}]`, data![key!]![nestedKey]);
      });
    } else {
      formData.append(key, data[key]!);
    }
  });

  //console.log( formData );

  // formData.append("product", "Allroundkrydder 120g Santa-Maria"); // appel sin with a message that is tooo long");
  // formData.append("grocycode", "grcy:p:1");
  // formData.append("due_date", "DD: 2020-01-01");
  // formData.append("font_family", "Inter (Regular)");
  // formData.append("font_size", "34");
  // formData.append("label_size", "62");
  // formData.append("align", "left");
  // formData.append("orientation", "standard");
  // formData.append("margin_left", "10");
  // formData.append("margin_top", "0");
  // formData.append("margin_bottom", "0");

  const response = await fetch(grocyConfig.LABEL_PRINTER_WEBHOOK, {
    method: "POST",
    body: formData,
  });

  console.log( "Grocy print label response is", response );

  // const json = await response.json();
}
