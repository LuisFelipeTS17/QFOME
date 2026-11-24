import { StyleSheet, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";
import { Button } from "@/components/ui";
import { colors } from "@/theme/colors";
import { fonts, radius } from "@/theme/typography";

/**
 * Confirmacao antes de excluir um prato. Fica na propria tela porque o
 * `Alert.alert` do React Native nao funciona no navegador.
 */
export function ConfirmarExclusao({
  nome,
  ocupado,
  onConfirmar,
  onCancelar,
}: {
  nome: string;
  ocupado: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>
        Excluir &quot;{nome}&quot; do cardapio? Esta acao nao pode ser desfeita.
      </Text>
      <View style={styles.actions}>
        <Button
          label="Cancelar"
          variant="outline"
          onPress={onCancelar}
          disabled={ocupado}
          style={styles.action}
        />
        <Button
          label={ocupado ? "Excluindo..." : "Excluir"}
          icon={<Trash2 size={14} color={colors.white} />}
          onPress={onConfirmar}
          disabled={ocupado}
          style={styles.action}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.brand,
    backgroundColor: "#fff1ec",
    padding: 12,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.heading,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  action: {
    flex: 1,
  },
});
