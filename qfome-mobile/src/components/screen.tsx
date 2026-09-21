import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, gradients } from "@/theme/colors";

type ScreenProps = {
  children: ReactNode;
  /** Sem scroll quando a tela controla a propria lista. */
  scroll?: boolean;
  contentStyle?: ViewStyle;
  /** Espaco extra no fim para nao colidir com a tab bar. */
  bottomInset?: number;
};

/**
 * Equivalente ao `.qfome-shell` do site: fundo creme com o brilho quente
 * no canto superior direito. O gradiente linear diagonal aproxima o
 * `radial-gradient(circle at top right, ...)` original.
 */
export function Screen({ children, scroll = true, contentStyle, bottomInset = 28 }: ScreenProps) {
  const insets = useSafeAreaInsets();

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: bottomInset + insets.bottom },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: bottomInset + insets.bottom },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradients.appBackground}
        locations={[0, 0.32, 1]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Veu diagonal vermelho/ambar do ::before do .qfome-shell */}
      <LinearGradient
        colors={["rgba(215,38,56,0.12)", "rgba(255,172,57,0.08)", "transparent"]}
        locations={[0, 0.56, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
});
