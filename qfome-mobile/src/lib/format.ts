export const formatPrice = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export const formatDateTime = (isoDate: string) => {
  const parsed = new Date(isoDate.replace(/(\.\d{3})\d+/, "$1"));
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleString("pt-BR");
};
