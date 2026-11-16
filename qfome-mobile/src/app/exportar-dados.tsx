import { useState } from "react";
import { Share, StyleSheet, Text, View } from "react-native";
import { BarChart3, Download, Share2 } from "lucide-react-native";
import { Screen } from "@/components/screen";
import { BackButton, Button, DarkCard, DarkPanel, FeedbackBox, SurfaceCard, WhiteCard } from "@/components/ui";
import { exportarRelatorioPedidos, type RelatorioExportado } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/format";
import { colors } from "@/theme/colors";
import { fonts, tracking } from "@/theme/typography";

/**
 * Exportacao dos pedidos em JSON (item 2.2 do roteiro): o botao pede ao backend
 * para gerar data/exports/pedidos.json, que alimenta o dashboard em Python
 * (pasta qfome-dashboard). O JSON tambem pode ser compartilhado daqui.
 */
export default function ExportarDadosScreen() {
  const [relatorio, setRelatorio] = useState<RelatorioExportado | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const gerarJson = async () => {
    setLoading(true);
    setFeedback("");
    try {
      setRelatorio(await exportarRelatorioPedidos());
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel exportar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const compartilharJson = async () => {
    if (!relatorio) {
      return;
    }
    // O arquivo e um caminho do servidor; o compartilhamento envia o JSON em si.
    const { arquivo, ...dados } = relatorio;
    try {
      await Share.share({ title: "pedidos.json", message: JSON.stringify(dados, null, 2) });
    } catch {
      setFeedback("Nao foi possivel abrir o compartilhamento neste dispositivo.");
    }
  };

  return (
    <Screen>
      <BackButton label="Voltar" />

      <SurfaceCard>
        <Text style={styles.eyebrow}>ANALISE DE DADOS</Text>
        <Text style={styles.title}>Exportar dados</Text>
        <Text style={styles.lead}>
          Gere os pedidos em formato JSON para alimentar o dashboard em Python. O arquivo
          pedidos.json e gravado no servidor e tambem pode ser compartilhado daqui.
        </Text>

        <Button
          label={loading ? "Gerando JSON..." : "Gerar JSON dos pedidos"}
          icon={<Download size={15} color={colors.white} />}
          onPress={gerarJson}
          disabled={loading}
          style={styles.action}
        />

        {relatorio ? (
          <View style={styles.resultBlock}>
            <View style={styles.statsRow}>
              <WhiteCard style={styles.statCard}>
                <Text style={styles.statLabel}>PEDIDOS</Text>
                <Text style={styles.statValue}>{relatorio.totalPedidos}</Text>
              </WhiteCard>
              <WhiteCard style={styles.statCard}>
                <Text style={styles.statLabel}>FATURAMENTO</Text>
                <Text style={styles.statValue}>{formatPrice(relatorio.faturamentoTotal)}</Text>
              </WhiteCard>
            </View>

            <WhiteCard style={styles.fileCard}>
              <Text style={styles.statLabel}>GERADO EM</Text>
              <Text style={styles.fileValue}>{formatDateTime(relatorio.geradoEm)}</Text>
              <Text style={[styles.statLabel, styles.fileLabelSpacing]}>ARQUIVO NO SERVIDOR</Text>
              <Text style={styles.filePath}>{relatorio.arquivo}</Text>
            </WhiteCard>

            <Button
              label="Compartilhar JSON"
              variant="outline"
              icon={<Share2 size={15} color="#7a3f33" />}
              onPress={compartilharJson}
            />
          </View>
        ) : null}

        <View style={styles.feedbackSlot}>
          <FeedbackBox message={feedback} />
        </View>
      </SurfaceCard>

      <DarkPanel eyebrow="Proximo passo" title="DASHBOARD">
        <DarkCard style={styles.panelCard}>
          <View style={styles.panelHeader}>
            <BarChart3 size={16} color="#ffcd88" />
            <Text style={styles.panelStrong}>Dashboard em Python</Text>
          </View>
          <Text style={styles.panelText}>
            O dashboard (pasta qfome-dashboard) le o pedidos.json exportado aqui e mostra
            faturamento por dia, categorias mais vendidas, formas de pagamento e top produtos.
          </Text>
          <Text style={styles.panelCode}>streamlit run app.py</Text>
        </DarkCard>
      </DarkPanel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 42,
    color: colors.title,
    letterSpacing: tracking.display,
    marginTop: 4,
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.body,
    marginTop: 8,
  },
  action: {
    marginTop: 16,
  },
  resultBlock: {
    gap: 8,
    marginTop: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    gap: 3,
  },
  statLabel: {
    fontFamily: fonts.bold,
    fontSize: 9.5,
    letterSpacing: tracking.label,
    color: colors.label,
  },
  statValue: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
    color: colors.price,
  },
  fileCard: {
    gap: 3,
  },
  fileValue: {
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    color: "#5b2c24",
  },
  fileLabelSpacing: {
    marginTop: 8,
  },
  filePath: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.body,
  },
  feedbackSlot: {
    marginTop: 12,
  },
  panelCard: {
    marginTop: 14,
    gap: 6,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  panelStrong: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.white,
  },
  panelText: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.panelInkSoft,
  },
  panelCode: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: "#ffcd88",
    marginTop: 4,
  },
});
