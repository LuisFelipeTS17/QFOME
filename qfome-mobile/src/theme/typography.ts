/**
 * Fontes do site: Bebas Neue (titulos `.font-display`) e Manrope (corpo).
 * No React Native cada peso e uma familia propria, entao expomos os nomes
 * exatos registrados em `src/app/_layout.tsx`.
 */
export const fonts = {
  display: "BebasNeue_400Regular",
  regular: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  extrabold: "Manrope_800ExtraBold",
} as const;

/** `tracking-[0.14em]` etc. do Tailwind viram letterSpacing em pontos. */
export const tracking = {
  eyebrow: 1.6,
  label: 1.3,
  button: 1.1,
  display: 1,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;
