import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bike,
  CheckCircle2,
  CircleDashed,
  Clock3,
  CookingPot,
  House,
  Truck,
} from "lucide-react-native";
import { Screen } from "@/components/screen";
import { BrandText } from "@/components/brand-text";
import {
  BackButton,
  Button,
  DarkCard,
  DarkPanel,
  SummaryRow,
  SurfaceCard,
  WhiteCard,
} from "@/components/ui";
import { getHistoricoPedidos, rastrearPedido, type Pedido } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { statusEtapas } from "@/lib/pedido";
import { readSessao } from "@/lib/session";
import { colors, gradients } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

const timeline = [
  { key: "recebido", label: "Pedido recebido", Icon: CircleDashed },
  { key: "em_preparo", label: "Em preparo", Icon: CookingPot },
  { key: "saiu_para_entrega", label: "Saiu para entrega", Icon: Truck },
  { key: "entregue", label: "Entregue", Icon: CheckCircle2 },
] as const;

// Mesma estimativa que o checkout exibia: 20 min + 4 por item, entre 24 e 48.
const previsaoMinutos = (pedido: Pedido) =>
  Math.max(24, Math.min(48, 20 + pedido.itens.length * 4));

const deliveryStatusText = [
  "Pedido confirmado e fila da cozinha iniciada.",
  "Seu prato esta sendo preparado com carinho.",
  "Entregador em rota. Fique de olho no portao.",
  "Pedido entregue. Bom apetite!",
];

/** Timeline do pedido — equivale a `/acompanhar-pedido`. */
export default function AcompanharPedidoScreen() {
  const router = useRouter();
  const { codigo } = useLocalSearchParams<{ codigo?: string }>();
  const queryCode = typeof codigo === "string" ? codigo : "";
  const [order, setOrder] = useState<Pedido | null>(null);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          let pedido: Pedido | null = null;
          if (queryCode) {
            pedido = await rastrearPedido(queryCode);
          } else {
            // Sem codigo na rota: mostra o pedido mais recente do usuario logado.
            const sessao = await readSessao();
            if (sessao) {
              pedido = (await getHistoricoPedidos(sessao.usuarioId))[0] ?? null;
            }
          }
          if (active) {
            setOrder(pedido);
            setError("");
          }
        } catch (err) {
          if (active) {
            setOrder(null);
            setError(err instanceof Error ? err.message : "Nao foi possivel consultar o pedido.");
          }
        } finally {
          if (active) {
            setLoaded(true);
          }
        }
      })();

      return () => {
        active = false;
      };
    }, [queryCode]),
  );

  const activeStepIndex = order ? statusEtapas.indexOf(order.status) : -1;

  const deliveryProgress = useMemo(() => {
    if (activeStepIndex < 0) {
      return 12;
    }
    return Math.min(100, ((activeStepIndex + 1) / timeline.length) * 100);
  }, [activeStepIndex]);

  const isDelivered = activeStepIndex >= timeline.length - 1;
  const deliveryMessage =
    deliveryStatusText[Math.max(0, Math.min(activeStepIndex, timeline.length - 1))];

  if (!loaded) {
    return <Screen>{null}</Screen>;
  }

  if (!order) {
    return (
      <Screen>
        <BackButton label="Voltar" />
        <SurfaceCard style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {error || "Nao encontramos um pedido para acompanhar."}
          </Text>
          <Button label="Ir para area do cliente" onPress={() => router.push("/cliente")} />
        </SurfaceCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton label="Voltar" />

      <SurfaceCard>
        <Text style={styles.eyebrow}>ACOMPANHAMENTO EM TEMPO REAL</Text>
        <Text style={styles.title}>Pedido {order.codigo}</Text>
        <Text style={styles.lead}>Veja abaixo o status atualizado da entrega.</Text>

        {/* Trilha do entregador */}
        <WhiteCard style={styles.trackCard}>
          <Text style={styles.blockLabel}>ENTREGA EM MOVIMENTO</Text>
          <View style={styles.trackRow}>
            <View style={styles.trackEndpoint}>
              <CookingPot size={15} color={colors.brand} />
            </View>

            <View style={styles.track}>
              <LinearGradient
                colors={gradients.deliveryProgress}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.trackProgress, { width: `${deliveryProgress}%` }]}
              />
              <View style={[styles.rider, { left: `${deliveryProgress}%` }]}>
                {isDelivered ? (
                  <CheckCircle2 size={18} color="#2d995e" />
                ) : (
                  <Bike size={18} color={colors.brand} />
                )}
              </View>
            </View>

            <View style={styles.trackEndpoint}>
              <House size={15} color={colors.brand} />
            </View>
          </View>
          <Text style={styles.trackMessage}>{deliveryMessage}</Text>
        </WhiteCard>

        {/* Etapas */}
        <WhiteCard style={styles.stepsCard}>
          <Text style={styles.blockLabel}>ETAPAS DO PEDIDO</Text>
          <View style={styles.stepsList}>
            {timeline.map((step, index) => {
              const isDone = index <= activeStepIndex;
              return (
                <View key={step.key} style={[styles.stepRow, isDone && styles.stepRowDone]}>
                  <View style={[styles.stepIcon, isDone && styles.stepIconDone]}>
                    <step.Icon size={15} color={isDone ? colors.white : "#8e6458"} />
                  </View>
                  <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </WhiteCard>

        {/* Itens */}
        <WhiteCard style={styles.stepsCard}>
          <Text style={styles.blockLabel}>ITENS DO PEDIDO</Text>
          <View style={styles.itemsList}>
            {order.itens.map((item, index) => (
              <View key={`${item.produtoId}-${index}`} style={styles.itemRow}>
                <BrandText text={item.produtoNome} style={styles.itemName} />
                <Text style={styles.itemMeta}>Quantidade: {item.quantidade}</Text>
              </View>
            ))}
          </View>
        </WhiteCard>
      </SurfaceCard>

      {/* Dados da entrega */}
      <DarkPanel eyebrow="Dados da entrega" title="SEU PEDIDO">
        <DarkCard style={styles.panelBlock}>
          <SummaryRow label="Total" value={formatPrice(order.total)} dark />
          <SummaryRow
            label="Entrega"
            value={order.taxaEntrega > 0 ? formatPrice(order.taxaEntrega) : "Gratis"}
            dark
          />
          <View style={styles.etaRow}>
            <Text style={styles.etaLabel}>Previsao</Text>
            <View style={styles.etaValue}>
              <Clock3 size={14} color={colors.white} />
              <Text style={styles.etaText}>{previsaoMinutos(order)} min</Text>
            </View>
          </View>
        </DarkCard>

        <DarkCard style={styles.panelBlock}>
          <Text style={styles.panelLabel}>ENDERECO</Text>
          <Text style={styles.panelStrong}>
            {order.endereco.logradouro}, {order.endereco.numero}
          </Text>
          <Text style={styles.panelText}>
            {order.endereco.bairro} - {order.endereco.cidade}
          </Text>
          <Text style={styles.panelText}>CEP {order.endereco.cep}</Text>
        </DarkCard>

        <Button
          label="Fazer novo pedido"
          variant="gold"
          onPress={() => router.push("/cardapio")}
          style={styles.panelButton}
        />
      </DarkPanel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 26,
  },
  emptyText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    textAlign: "center",
    color: "#7b473d",
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 42,
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
  blockLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: colors.label,
  },
  trackCard: {
    marginTop: 18,
    gap: 12,
    borderRadius: radius.xl,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trackEndpoint: {
    height: 34,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: "#fff3e9",
  },
  track: {
    flex: 1,
    height: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: "#fff8f4",
    justifyContent: "center",
  },
  trackProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.pill,
  },
  rider: {
    position: "absolute",
    marginLeft: -9,
  },
  trackMessage: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: "#6f3a2e",
  },
  stepsCard: {
    marginTop: 14,
    gap: 10,
    borderRadius: radius.xl,
  },
  stepsList: {
    gap: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#f1dfd6",
    backgroundColor: "#fffdfa",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  stepRowDone: {
    borderColor: "#f0c39f",
    backgroundColor: "#fff3e9",
  },
  stepIcon: {
    height: 34,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: "#ead8d0",
  },
  stepIconDone: {
    backgroundColor: colors.brand,
  },
  stepLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#8c6257",
  },
  stepLabelDone: {
    color: "#6f2e23",
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#f2ddd4",
    backgroundColor: "#fff9f6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  itemName: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#652d23",
  },
  itemMeta: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    color: "#8a5d52",
  },
  panelBlock: {
    marginTop: 14,
  },
  panelLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: tracking.label,
    color: colors.panelInkSoft,
  },
  panelStrong: {
    fontFamily: fonts.bold,
    fontSize: 13.5,
    color: colors.panelInk,
    marginTop: 4,
  },
  panelText: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.panelInkSoft,
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#73463a",
    marginTop: 6,
    paddingTop: 8,
  },
  etaLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.white,
  },
  etaValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  etaText: {
    fontFamily: fonts.extrabold,
    fontSize: 13,
    color: colors.white,
  },
  panelButton: {
    marginTop: 14,
  },
});
