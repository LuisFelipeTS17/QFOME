import { ActivityIndicator, StyleSheet, View } from "react-native";
import { FeedbackBox } from "@/components/ui";
import type { EstadoCatalogo } from "@/lib/catalog";
import { colors } from "@/theme/colors";

/**
 * Aviso do catalogo: carregando, sem conexao (mostrando a copia do SQLite) ou
 * sem dados nenhum (primeira abertura sem backend).
 */
export function CatalogStatus({ estado }: { estado: EstadoCatalogo }) {
  if (!estado.carregado) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!estado.erroSync) {
    return null;
  }

  return (
    <View style={styles.box}>
      <FeedbackBox
        message={
          estado.produtos.length > 0
            ? "Sem conexao com o servidor. Mostrando o cardapio salvo no aparelho."
            : estado.erroSync
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 24,
  },
  box: {
    marginVertical: 8,
  },
});
