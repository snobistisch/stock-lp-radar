function localized(value: number, digits = 2) {
  return value.toFixed(digits).replace(/\.0+$|(?<=\.[0-9])0+$/, "").replace(".", ",");
}

export const compactUsd = {
  format(value: number) {
    const absolute = Math.abs(value);
    if (absolute >= 1_000_000_000) return `US$ ${localized(value / 1_000_000_000)} mld.`;
    if (absolute >= 1_000_000) return `US$ ${localized(value / 1_000_000)} mln.`;
    if (absolute >= 1_000) return `US$ ${localized(value / 1_000)}K`;
    return `US$ ${Math.round(value)}`;
  },
};

export const integer = {
  format(value: number) {
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
};

export function percent(value: number) {
  return `${localized(value, 1)}%`;
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const hour = date.getUTCHours().toString().padStart(2, "0");
  const minute = date.getUTCMinutes().toString().padStart(2, "0");
  const second = date.getUTCSeconds().toString().padStart(2, "0");
  return `${day}-${month}-${date.getUTCFullYear()} ${hour}:${minute}:${second} UTC`;
}
