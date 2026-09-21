/**
 * Paleta QFOME portada de `src/app/globals.css` do site.
 * Os nomes seguem as variaveis CSS originais para facilitar a comparacao
 * lado a lado entre web e mobile.
 */
export const colors = {
  bg: "#f7ecdf",
  bgGlow: "#ffd69e",
  surface: "#fffaf3",
  ink: "#2a120b",
  muted: "#654037",
  brand: "#d72638",
  brandDeep: "#981b1e",
  accent: "#ffac39",
  outline: "#f2cfbf",

  // Tons de apoio usados nos cards claros do site
  white: "#ffffff",
  cardBorder: "#efcabc",
  cardBorderSoft: "#f4d2c6",
  cardTint: "#fff8f5",
  title: "#7d141e",
  titleSoft: "#66281f",
  heading: "#62261d",
  body: "#8a5b50",
  label: "#8f594b",
  eyebrow: "#9a5e52",
  price: "#bf1f34",
  chipBg: "#ffe9cc",
  chipBorder: "#f2b789",
  chipInk: "#7a2a1f",
  star: "#f5b340",
  success: "#2c8f54",
  successBg: "#eaf9ef",

  // Painel escuro (aside "combo"/"resumo do pedido")
  panelBg: "#321312",
  panelBgAlt: "#2e1211",
  panelCard: "#431f1b",
  panelCardAlt: "#3f1b18",
  panelBorder: "#75443a",
  panelBorderSoft: "#704339",
  panelEdge: "#e6b5aa",
  panelInk: "#ffe5d0",
  panelInkSoft: "#efcfbb",
  panelEyebrow: "#f6c699",
  panelGold: "#ffd08e",
  panelAction: "#ffb348",
  panelActionInk: "#4f220d",

  // Barra de topo promocional
  topbarBg: "#3b1916",
  topbarInk: "#ffe9d2",
} as const;

/** Gradientes lineares reutilizados nas telas. */
export const gradients = {
  /** radial-gradient(circle at top right, #ffd69e, #f7ecdf 32%) aproximado */
  appBackground: ["#ffd69e", "#f7ecdf", "#f7ecdf"] as const,
  brandLogo: ["#ffb34e", "#d85b2f"] as const,
  deliveryProgress: ["#d72638", "#ff8f3a"] as const,
  imageScrim: ["transparent", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.62)"] as const,
} as const;

/** Tons por categoria — equivalem ao `tone` (from-… to-…) do Tailwind. */
export const categoryTones: Record<string, readonly [string, string]> = {
  caseira: ["#ff8c3a", "#ff5a2d"],
  "fit-fresh": ["#46b97e", "#1f7c54"],
  grelhados: ["#e35a5a", "#9f2222"],
  peixes: ["#5db2f0", "#246ca4"],
  sopas: ["#f9ba4f", "#f06d2f"],
  sobremesas: ["#fc8cb3", "#d24d79"],
};
