import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle2,
  Clock3,
  Flame,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Zap,
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
  Tag,
  WhiteCard,
} from "@/components/ui";
import { ApiError, getProduto, type Adicional, type Produto } from "@/lib/api";
import { salvarProdutoNoCache, toProduto, useCatalogo } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { addOrderItem } from "@/lib/storage";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

export default function ProdutoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const catalogo = useCatalogo();

  const [fresh, setFresh] = useState<Produto | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [extrasError, setExtrasError] = useState("");

  const [quantity, setQuantity] = useState(1);
  const [selectedExtraIds, setSelectedExtraIds] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    getProduto(productId)
      .then((produto) => {
        if (!active) {
          return;
        }
        setFresh(produto);
        setExtrasError("");
        salvarProdutoNoCache(produto).catch(() => {
          // cache e so otimizacao; a tela ja tem os dados
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else {
          setExtrasError("Adicionais indisponiveis sem conexao com o servidor.");
        }
      });
    return () => {
      active = false;
    };
  }, [productId]);

  const product = fresh
    ? toProduto(fresh)
    : catalogo.produtos.find((item) => item.id === productId);
  const extras: Adicional[] = fresh?.adicionais ?? [];

  const selectedExtras = useMemo(
    () => extras.filter((extra) => selectedExtraIds.includes(extra.id)),
    [extras, selectedExtraIds],
  );

  const extrasTotal = useMemo(
    () => selectedExtras.reduce((sum, extra) => sum + extra.preco, 0),
    [selectedExtras],
  );

  const totalPrice = ((product?.preco ?? 0) + extrasTotal) * quantity;

  const suggestions = useMemo(() => {
    if (!product) {
      return [];
    }
    const others = catalogo.produtos.filter((item) => item.id !== product.id);
    return [
      ...others.filter((item) => item.categoriaId === product.categoriaId),
      ...others.filter((item) => item.categoriaId !== product.categoriaId),
    ].slice(0, 4);
  }, [catalogo.produtos, product]);

  if (!product || notFound) {
    const loading = !notFound && !fresh && !catalogo.carregado;
    return (
      <Screen>
        <BackButton label="Voltar" />
        <SurfaceCard>
          <Text style={styles.notFound}>
            {loading ? "Carregando produto..." : "Produto nao encontrado."}
          </Text>
        </SurfaceCard>
      </Screen>
    );
  }

  const toggleExtra = (extraId: number) => {
    setSelectedExtraIds((current) =>
      current.includes(extraId)
        ? current.filter((selectedId) => selectedId !== extraId)
        : [...current, extraId],
    );
    setFeedback("");
  };

  const saveToOrder = async (action: "add" | "buy") => {
    await addOrderItem({
      productId: product.id,
      name: product.nome,
      quantity,
      unitPrice: product.preco,
      extras: selectedExtras.map(({ id: extraId, nome, preco }) => ({
        id: extraId,
        name: nome,
        price: preco,
      })),
      note: note.trim(),
      totalPrice,
      addedAt: new Date().toISOString(),
    });

    if (action === "buy") {
      router.push("/checkout");
      return;
    }

    setFeedback("Item adicionado ao pedido com sucesso.");
  };

  return (
    <Screen>
      <View style={styles.topbar}>
        <Flame size={14} color={colors.topbarInk} />
        <Text style={styles.topbarText}>Detalhes do produto e montagem do pedido.</Text>
      </View>

      <BackButton label="Voltar" />

      <SurfaceCard>
        <View style={styles.heroImageWrap}>
          <Image source={{ uri: product.imagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.5)"]}
            style={StyleSheet.absoluteFill}
          />
          <Tag label={product.tag} style={styles.heroTag} />
        </View>

        <BrandText text="Produto QFome" style={styles.eyebrow} />
        <BrandText text={product.nome} style={styles.title} />
        <BrandText text={product.descricao} style={styles.description} />

        <View style={styles.statsRow}>
          <WhiteCard style={styles.statCard}>
            <Text style={styles.statLabel}>PRECO BASE</Text>
            <Text style={styles.statPrice}>{formatPrice(product.preco)}</Text>
          </WhiteCard>
          <WhiteCard style={styles.statCard}>
            <Text style={styles.statLabel}>TEMPO MEDIO</Text>
            <View style={styles.statValueRow}>
              <Clock3 size={14} color="#5f2a20" />
              <Text style={styles.statValue}>{product.tempoPreparo}</Text>
            </View>
          </WhiteCard>
          <WhiteCard style={styles.statCard}>
            <Text style={styles.statLabel}>AVALIACAO</Text>
            <View style={styles.statValueRow}>
              <Star size={14} color={colors.star} fill={colors.star} />
              <Text style={styles.statValue}>{product.rating?.toFixed(1) ?? "--"}</Text>
            </View>
          </WhiteCard>
        </View>

        <WhiteCard style={styles.includesCard}>
          <Text style={styles.blockLabel}>O QUE VEM NO PRATO</Text>
          <View style={styles.includesList}>
            {product.includes.map((item) => (
              <View key={item} style={styles.includeRow}>
                <CheckCircle2 size={15} color="#cf2841" />
                <BrandText text={item} style={styles.includeText} />
              </View>
            ))}
          </View>
        </WhiteCard>
      </SurfaceCard>

      {/* Painel de montagem do pedido */}
      <DarkPanel eyebrow="Monte seu pedido" title="SEU COMBO">
        <DarkCard style={styles.panelBlock}>
          <Text style={styles.panelLabel}>QUANTIDADE</Text>
          <View style={styles.quantityRow}>
            <Pressable
              onPress={() => setQuantity((current) => Math.max(1, current - 1))}
              accessibilityLabel="Diminuir quantidade"
              style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}
            >
              <Minus size={16} color={colors.panelInk} />
            </Pressable>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <Pressable
              onPress={() => setQuantity((current) => current + 1)}
              accessibilityLabel="Aumentar quantidade"
              style={({ pressed }) => [styles.stepper, pressed && styles.pressed]}
            >
              <Plus size={16} color={colors.panelInk} />
            </Pressable>
          </View>
        </DarkCard>

        <DarkCard style={styles.panelBlock}>
          <Text style={styles.panelLabel}>ADICIONAIS</Text>
          <View style={styles.extrasList}>
            {extras.length === 0 ? (
              <Text style={styles.extraName}>
                {extrasError || (fresh ? "Este prato nao tem adicionais." : "Carregando adicionais...")}
              </Text>
            ) : null}
            {extras.map((extra) => {
              const isSelected = selectedExtraIds.includes(extra.id);
              return (
                <Pressable
                  key={extra.id}
                  onPress={() => toggleExtra(extra.id)}
                  style={[styles.extraRow, isSelected && styles.extraRowSelected]}
                >
                  <Text style={[styles.extraName, isSelected && styles.extraNameSelected]}>
                    {extra.nome}
                  </Text>
                  <Text style={styles.extraPrice}>+ {formatPrice(extra.preco)}</Text>
                </Pressable>
              );
            })}
          </View>
        </DarkCard>

        <DarkCard style={styles.panelBlock}>
          <Text style={styles.panelLabel}>OBSERVACAO</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            maxLength={160}
            placeholder="Ex.: sem pimenta, ponto da carne, trocar bebida..."
            placeholderTextColor="#d7a98f"
            style={styles.noteInput}
          />
        </DarkCard>

        <DarkCard style={styles.panelBlock}>
          <SummaryRow label="Preco base" value={formatPrice(product.preco)} dark />
          <SummaryRow label="Adicionais" value={formatPrice(extrasTotal)} dark />
          <SummaryRow label="Quantidade" value={String(quantity)} dark />
          <SummaryRow label="Total" value={formatPrice(totalPrice)} emphasis dark />
        </DarkCard>

        <View style={styles.panelActions}>
          <Button
            label="Adicionar ao pedido"
            variant="gold"
            icon={<ShoppingBag size={15} color={colors.panelActionInk} />}
            onPress={() => saveToOrder("add")}
          />
          <Button
            label="Comprar agora"
            variant="ghostDark"
            icon={<Zap size={15} color={colors.panelInk} />}
            onPress={() => saveToOrder("buy")}
          />
        </View>

        {feedback ? (
          <View style={styles.panelFeedback}>
            <Text style={styles.panelFeedbackText}>{feedback}</Text>
          </View>
        ) : null}
      </DarkPanel>

      {/* Sugestoes */}
      <SurfaceCard>
        <Text style={styles.eyebrow}>PRATOS SUGERIDOS</Text>
        <View style={styles.suggestionList}>
          {suggestions.map((dish) => (
            <Pressable
              key={dish.id}
              onPress={() => router.push(`/produto/${dish.id}`)}
              style={({ pressed }) => [styles.suggestionCard, pressed && styles.pressed]}
            >
              <Image source={{ uri: dish.imagem }} style={styles.suggestionImage} resizeMode="cover" />
              <View style={styles.suggestionBody}>
                <BrandText text={dish.nome} style={styles.suggestionName} numberOfLines={1} />
                <BrandText
                  text={dish.descricao}
                  style={styles.suggestionDescription}
                  numberOfLines={2}
                />
                <View style={styles.suggestionFooter}>
                  <Text style={styles.suggestionPrice}>{formatPrice(dish.preco)}</Text>
                  <Text style={styles.suggestionLink}>VER PRATO</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: colors.topbarBg,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  topbarText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.topbarInk,
  },
  heroImageWrap: {
    height: 240,
    borderRadius: radius.xl,
    overflow: "hidden",
    backgroundColor: "#ead8d0",
    marginBottom: 18,
  },
  heroTag: {
    position: "absolute",
    left: 14,
    top: 14,
  },
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
    marginTop: 6,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: "#73463d",
    marginTop: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 10,
    gap: 4,
    borderColor: colors.cardBorderSoft,
  },
  statLabel: {
    fontFamily: fonts.bold,
    fontSize: 8.5,
    letterSpacing: tracking.label,
    color: "#9a6052",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.extrabold,
    fontSize: 13,
    color: "#5f2a20",
  },
  statPrice: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors.price,
  },
  includesCard: {
    marginTop: 16,
    gap: 10,
    borderRadius: radius.xl,
  },
  blockLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: "#9a6254",
  },
  includesList: {
    gap: 8,
  },
  includeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#f2d3c8",
    backgroundColor: "#fff9f6",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  includeText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#623128",
  },
  panelBlock: {
    marginTop: 14,
    gap: 8,
    borderColor: "#75453a",
  },
  panelLabel: {
    fontFamily: fonts.semibold,
    fontSize: 9.5,
    letterSpacing: tracking.label,
    color: "#f0bfa4",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepper: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#8d5c4f",
    padding: 9,
  },
  pressed: {
    opacity: 0.8,
  },
  quantityValue: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    color: colors.white,
  },
  extrasList: {
    gap: 8,
  },
  extraRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#6e4035",
    backgroundColor: "#4a231f",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  extraRowSelected: {
    borderColor: "#ffb548",
    backgroundColor: "#5a2b24",
  },
  extraName: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "#f6d2bd",
  },
  extraNameSelected: {
    color: colors.white,
  },
  extraPrice: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#ffcb86",
  },
  noteInput: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#704034",
    backgroundColor: "#532924",
    padding: 10,
    minHeight: 72,
    textAlignVertical: "top",
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.white,
  },
  panelActions: {
    gap: 8,
    marginTop: 16,
  },
  panelFeedback: {
    marginTop: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#845348",
    backgroundColor: "#4a231e",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  panelFeedbackText: {
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: "#ffce95",
  },
  suggestionList: {
    gap: 10,
    marginTop: 14,
  },
  suggestionCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  suggestionImage: {
    width: 96,
    height: "100%",
    minHeight: 96,
    backgroundColor: "#ead8d0",
  },
  suggestionBody: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    gap: 3,
  },
  suggestionName: {
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    color: colors.heading,
  },
  suggestionDescription: {
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.body,
  },
  suggestionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  suggestionPrice: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
    color: colors.price,
  },
  suggestionLink: {
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: colors.brand,
  },
  notFound: {
    fontFamily: fonts.semibold,
    fontSize: 14.5,
    color: "#7b473d",
    textAlign: "center",
  },
});
