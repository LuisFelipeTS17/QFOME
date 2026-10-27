import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

/* ------------------------------------------------------------------ */
/* Cartao claro — equivale a `rounded-[2rem] border bg-[--qfome-surface]` */
/* ------------------------------------------------------------------ */
export function SurfaceCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.surfaceCard, style]}>{children}</View>;
}

/** Cartao branco interno — `rounded-2xl border border-[#efcabc] bg-white`. */
export function WhiteCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.whiteCard, style]}>{children}</View>;
}

/* ------------------------------------------------------------------ */
/* Painel escuro — o `aside` bordô usado em produto/checkout/cliente   */
/* ------------------------------------------------------------------ */
export function DarkPanel({
  eyebrow,
  title,
  children,
  style,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.darkPanel, style]}>
      <Text style={styles.darkEyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.darkTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function DarkCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.darkCard, style]}>{children}</View>;
}

/* ------------------------------------------------------------------ */
/* Cabecalho de secao — eyebrow + titulo display                       */
/* ------------------------------------------------------------------ */
export function SectionHeading({
  eyebrow,
  title,
  description,
  titleStyle,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  titleStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={styles.headingBlock}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={[styles.displayTitle, titleStyle]}>{title}</Text>
      {description ? <Text style={styles.bodyText}>{description}</Text> : null}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Botoes                                                              */
/* ------------------------------------------------------------------ */
type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  variant?: "brand" | "outline" | "gold" | "ghostDark";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function Button({
  label,
  onPress,
  icon,
  variant = "brand",
  style,
  disabled = false,
}: ButtonProps) {
  const variantStyle = buttonVariants[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.buttonBase,
        variantStyle.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.buttonLabel, variantStyle.label]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

const buttonVariants: Record<
  NonNullable<ButtonProps["variant"]>,
  { container: ViewStyle; label: TextStyle }
> = {
  brand: {
    container: { backgroundColor: colors.brand },
    label: { color: colors.white },
  },
  outline: {
    container: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    label: { color: "#7a3f33" },
  },
  gold: {
    container: { backgroundColor: colors.panelAction },
    label: { color: colors.panelActionInk },
  },
  ghostDark: {
    container: {
      borderWidth: 1,
      borderColor: "#8f5c50",
      backgroundColor: "transparent",
    },
    label: { color: colors.panelInk },
  },
};

/** Botao "Voltar" usado no topo das telas internas do site. */
export function BackButton({ label = "Voltar", href }: { label?: string; href?: Href }) {
  const router = useRouter();

  const goBack = () => {
    if (href) {
      router.push(href);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  };

  return (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <ArrowLeft size={16} color="#6a3b32" />
      <Text style={styles.backLabel}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Chips e etiquetas                                                   */
/* ------------------------------------------------------------------ */
export function Tag({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.tag, style]}>
      <Text style={styles.tagLabel} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

/** Linha "rotulo ................ valor" dos resumos de pedido. */
export function SummaryRow({
  label,
  value,
  emphasis = false,
  dark = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  dark?: boolean;
}) {
  return (
    <View style={[styles.summaryRow, emphasis && styles.summaryRowEmphasis, emphasis && dark && styles.summaryRowEmphasisDark]}>
      <Text
        style={[
          styles.summaryLabel,
          dark && { color: colors.panelInkSoft },
          emphasis && styles.summaryLabelEmphasis,
          emphasis && dark && { color: colors.white },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          dark && { color: colors.panelInkSoft },
          emphasis && styles.summaryValueEmphasis,
          emphasis && dark && { color: colors.white },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/** Estado vazio reutilizado em carrinho, acompanhamento e cliente. */
export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: ReactNode;
}) {
  return (
    <WhiteCard style={styles.emptyState}>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action}
    </WhiteCard>
  );
}

/** Caixa de feedback dos formularios (`bg-[#fff4ef]` no site). */
export function FeedbackBox({ message }: { message: string }) {
  if (!message) {
    return null;
  }
  return (
    <View style={styles.feedback}>
      <Text style={styles.feedbackText}>{message}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  surfaceCard: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    padding: 18,
    shadowColor: "#794222",
    shadowOpacity: 0.11,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  whiteCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    padding: 14,
  },
  darkPanel: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.panelEdge,
    backgroundColor: colors.panelBg,
    padding: 18,
    shadowColor: "#3c0f0c",
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  darkCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    backgroundColor: colors.panelCard,
    padding: 12,
  },
  darkEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: tracking.eyebrow,
    color: colors.panelEyebrow,
  },
  darkTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 36,
    color: colors.white,
    marginTop: 6,
    letterSpacing: tracking.display,
  },
  headingBlock: {
    gap: 6,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
  },
  displayTitle: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 44,
    color: colors.title,
    letterSpacing: tracking.display,
  },
  bodyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.body,
  },
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buttonLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    letterSpacing: tracking.button,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.55,
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#f0cabd",
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#6a3b32",
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.chipBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: colors.chipInk,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  summaryRowEmphasis: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f2d3c8",
  },
  summaryRowEmphasisDark: {
    borderTopColor: "#73463a",
  },
  summaryLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#78493e",
  },
  summaryLabelEmphasis: {
    fontFamily: fonts.bold,
    color: "#5c281f",
  },
  summaryValue: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: "#78493e",
  },
  summaryValueEmphasis: {
    fontFamily: fonts.extrabold,
    fontSize: 19,
    color: "#5c281f",
  },
  emptyState: {
    alignItems: "center",
    gap: 14,
    paddingVertical: 22,
  },
  emptyMessage: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    textAlign: "center",
    color: "#7e4a3d",
  },
  feedback: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: "#fff4ef",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  feedbackText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 17,
    color: "#7b3f34",
  },
});
