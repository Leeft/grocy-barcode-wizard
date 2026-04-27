import { QuantityUnit } from "@/interfaces/grocy";

export function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0]!.match(/:(.*?);/)![1];
  const bstr = atob(arr[arr.length - 1]!);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function toLookup<T extends { id?: string | number }>(array: T[]): Record<string | number, T> {
  return array.reduce(
    (acc, item) => {
      // Only add to the record if id exists
      if (item.id !== undefined && item.id !== null) {
        acc[item.id] = item;
      }
      return acc;
    },
    {} as Record<string | number, T>,
  );
}

export const pluralUnit = (unit: QuantityUnit | undefined, amount: number | undefined): string => {
  if (unit === undefined || amount === undefined) return "";
  return amount === 1 ? (unit.name ?? "??") : (unit.name_plural ?? "???");
};
