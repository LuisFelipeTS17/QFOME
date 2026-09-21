import type { ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

type FieldProps = TextInputProps & {
  /** Rotulo em caixa alta acima do campo (usado no checkout). */
  label?: string;
  /** Icone a esquerda dentro da caixa (usado em login/recuperar acesso). */
  icon?: ReactNode;
};

/**
 * Campo de formulario do site: caixa branca com borda `#efcabc`, rotulo
 * minusculo em caixa alta e o texto em vinho escuro.
 */
export function Field({ label, icon, style, ...inputProps }: FieldProps) {
  return (
    <View style={[styles.box, icon ? styles.boxWithIcon : null]}>
      {icon}
      <View style={styles.flex}>
        {label ? <Text style={styles.label}>{label.toUpperCase()}</Text> : null}
        <TextInput
          placeholderTextColor="#b98476"
          style={[styles.input, label ? styles.inputWithLabel : null, style]}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  boxWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  flex: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: colors.label,
  },
  input: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: "#542a24",
    paddingVertical: 8,
  },
  inputWithLabel: {
    paddingTop: 2,
    paddingBottom: 4,
  },
});
