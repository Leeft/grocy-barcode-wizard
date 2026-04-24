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

export const toMap = <T>(map: Record<string, T>, obj: T): Record<string, T> => {
  // Aware they might be a better way, but I'm no TS expert [yet].
  // @ts-expect-error TS can't know it has an id, but it will have (where we use toMap).
  map[obj.id] = obj;
  return map;
};

export function toLookup<T extends { id?: string | number }>(
  array: T[]
): Record<string | number, T> {
  return array.reduce((acc, item) => {
    // Only add to the record if id exists
    if (item.id !== undefined && item.id !== null) {
      acc[item.id] = item;
    }
    return acc;
  }, {} as Record<string | number, T>);
}