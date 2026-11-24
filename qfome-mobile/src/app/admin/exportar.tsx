import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { AdminMenu, larguraAdmin } from "@/components/admin-menu";
import { useAdmin } from "@/components/admin-provider";
import { PainelExportacao } from "@/components/painel-exportacao";
import { Screen } from "@/components/screen";
import { FeedbackBox, SurfaceCard, WhiteCard } from "@/components/ui";
import { exportarRelatorioComoAdmin, getExportacoes, type Exportacao } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/format";
import { colors } from "@/theme/colors";
import { fonts, tracking } from "@/theme/typography";

/** Exportacao em JSON pela area administrativa, com o historico gravado no banco. */
export default function AdminExportarScreen() {
  const { comSessao } = useAdmin();
  const [exportacoes, setExportacoes] = useState<Exportacao[]>([]);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      setExportacoes(await comSessao(getExportacoes));
      setErro("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Nao foi possivel carregar o historico.");
    }
  }, [comSessao]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return (
    <Screen contentStyle={larguraAdmin}>
      <AdminMenu ativo="exportar" />

      <PainelExportacao
        exportar={() => comSessao(exportarRelatorioComoAdmin)}
        aoExportar={carregar}
      />

      <SurfaceCard>
        <Text style={styles.eyebrow}>HISTORICO</Text>
        <Text style={styles.title}>Exportacoes</Text>

        {erro ? (
          <View style={styles.slot}>
            <FeedbackBox message={erro} />
          </View>
        ) : null}

        <View style={styles.list}>
          {exportacoes.length === 0 && !erro ? (
            <Text style={styles.meta}>Nenhuma exportacao registrada ainda.</Text>
          ) : null}
          {exportacoes.map((exportacao) => (
            <WhiteCard key={exportacao.id} style={styles.item}>
              <View style={styles.flex}>
                <Text style={styles.strong}>{formatDateTime(exportacao.criadoEm)}</Text>
                <Text style={styles.meta}>
                  {exportacao.origem === "ADMIN"
                    ? (exportacao.usuarioNome ?? "Administrador")
                    : "Area do cliente"}
                </Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.value}>{formatPrice(exportacao.faturamentoTotal)}</Text>
                <Text style={styles.meta}>
                  {exportacao.totalPedidos} {exportacao.totalPedidos === 1 ? "pedido" : "pedidos"}
                </Text>
              </View>
            </WhiteCard>
          ))}
        </View>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 36,
    color: colors.title,
    letterSpacing: tracking.display,
    marginTop: 4,
  },
  slot: {
    marginTop: 12,
  },
  list: {
    gap: 8,
    marginTop: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  right: {
    alignItems: "flex-end",
  },
  strong: {
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    color: "#5b2c24",
  },
  value: {
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    color: colors.price,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.body,
  },
});
