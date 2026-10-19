import type { StatusPedido } from "./api";

export const calcularTaxaEntrega = (subtotal: number) => (subtotal > 0 && subtotal < 45 ? 6.9 : 0);

export const statusLabel: Record<StatusPedido, string> = {
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em preparo",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
};

export const statusEtapas: StatusPedido[] = ["RECEBIDO", "EM_PREPARO", "SAIU_PARA_ENTREGA", "ENTREGUE"];
