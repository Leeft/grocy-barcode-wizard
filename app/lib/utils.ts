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

export function addYears(_date: Date, years: number): Date {
  const date = new Date(_date);
  const day = date.getDate();
  const newDate = new Date(Date.UTC(date.getFullYear() + years, date.getMonth(), date.getDate(), 0));
  if (newDate.getDate() != day) newDate.setDate(0);
  return newDate;
}

export function dateToISODate(_date: Date): string {
  if (_date === undefined) return "";
  const str: string | undefined = _date.toISOString().split("T")[0];
  if (str === undefined) {
    return "";
  }
  return str;
}

export const getNodeText = (node: any): any => {
  if (["string", "number"].includes(typeof node)) return node;
  if (node instanceof Array) return node.map(getNodeText).join("");
  if (typeof node === "object" && node) return getNodeText(node.props.children);
};
