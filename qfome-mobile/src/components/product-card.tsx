import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Clock3, Star } from "lucide-react-native";
import { BrandText } from "@/components/brand-text";
import { Tag } from "@/components/ui";
import { colors, gradients } from "@/theme/colors";
import type { ProdutoCatalogo } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { fonts, radius, tracking } from "@/theme/typography";

export type ProductCardData = {
  id: number;
  name: string;
  description: string;
  price: number;
  prepTime: string;
  rating: number | null;
  tag: string;
  image: string;
};

export const toCardData = (produto: ProdutoCatalogo): ProductCardData => ({
  id: produto.id,
  name: produto.nome,
  description: produto.descricao,
  price: produto.preco,
  prepTime: produto.tempoPreparo,
  rating: produto.rating,
  tag: produto.tag,
  image: produto.imagem,
});

/**
 * Card de prato do site (home, cardapio e categoria usam o mesmo desenho):
 * imagem com scrim escuro + etiqueta, titulo, descricao, faixa de tempo/nota
 * e a linha de preco com o botao vermelho.
 */
export function ProductCard({
  product,
  actionLabel = "Ver produto",
}: {
  product: ProductCardData;
  actionLabel?: string;
}) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/produto/${product.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={gradients.imageScrim}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <Tag label={product.tag} style={styles.tag} />
      </View>

      <View style={styles.body}>
        <BrandText text={product.name} style={styles.name} numberOfLines={2} />
        <BrandText text={product.description} style={styles.description} numberOfLines={2} />

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock3 size={13} color="#71433a" />
            <Text style={styles.metaText}>{product.prepTime}</Text>
          </View>
          {product.rating !== null ? (
            <View style={styles.metaItem}>
              <Star size={13} color={colors.star} fill={colors.star} />
              <Text style={styles.metaText}>{product.rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <View style={styles.action}>
            <Text style={styles.actionLabel}>{actionLabel.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    overflow: "hidden",
    shadowColor: "#6c3526",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  imageWrapper: {
    height: 150,
    backgroundColor: "#ead8d0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  tag: {
    position: "absolute",
    left: 10,
    top: 10,
  },
  body: {
    padding: 14,
    gap: 8,
  },
  name: {
    fontFamily: fonts.extrabold,
    fontSize: 17,
    color: colors.heading,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.body,
    minHeight: 36,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorderSoft,
    backgroundColor: colors.cardTint,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: "#71433a",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  price: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    color: colors.price,
  },
  action: {
    borderRadius: radius.sm,
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  actionLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 11,
    letterSpacing: tracking.button,
    color: colors.white,
  },
});
