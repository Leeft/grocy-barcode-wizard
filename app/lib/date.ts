export function addYears(_date: Date, years: number): Date {
  const date = new Date(_date);
  const day = date.getDate();
  const newDate = new Date(
    Date.UTC(date.getFullYear() + years, date.getMonth(), date.getDate(), 0),
  );
  if (newDate.getDate() != day) newDate.setDate(0);
  return newDate;
}

export function dateToISODate(_date: Date): string {
  if ( _date === undefined ) return '';
  const str: string | undefined = _date.toISOString().split("T")[0];
  if (str === undefined) {
    return "";
  }
  return str;
}
