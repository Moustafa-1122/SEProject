export function formatDate(date: Date): string {
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // getUTCMonth()  0-11
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}