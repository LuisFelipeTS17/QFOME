import { Image, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/screen";
import { CatalogStatus } from "@/components/catalog-status";
import { ProductCard, toCardData } from "@/components/product-card";
import { BackButton, SurfaceCard } from "@/components/ui";
import { useCatalogo } from "@/lib/catalog";
import { categoryTones, colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

/** Pratos por categoria — equivale a `/categoria/[slug]` do site. */
export default function CategoriaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const catalogo = useCatalogo();
  const category = catalogo.categorias.find((item) => item.id === Number(id));
  const dishes = catalogo.produtos.filter((product) => product.categoriaId === Number(id));

  if (!category) {
    return (
      <Screen>
        <BackButton label="Voltar" />
        <SurfaceCard>
          {catalogo.carregado ? (
            <Text style={styles.notFound}>Categoria nao encontrada.</Text>
          ) : null}
          <CatalogStatus estado={catalogo} />
        </SurfaceCard>
      </Screen>
    );
  }

  const tone = categoryTones[category.slug] ?? [colors.brand, colors.brandDeep];

  return (
    <Screen>
      <BackButton label="Voltar" />

      <View style={styles.hero}>
        <Image source={{ uri: category.imagem }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[`${tone[0]}4d`, `${tone[1]}4d`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>EXPLORE SABORES</Text>
          <Text style={styles.heroTitle}>{category.nome}</Text>
          <Text style={styles.heroDescription}>{category.descricao}</Text>
        </View>
      </View>

      <View style={styles.headingBlock}>
        <Text style={styles.eyebrow}>CARDAPIO DA CATEGORIA</Text>
        <Text style={styles.sectionTitle}>{dishes.length} pratos em destaque</Text>
      </View>

      <CatalogStatus estado={catalogo} />

      <View style={styles.list}>
        {dishes.map((dish) => (
          <ProductCard key={dish.id} actionLabel="Ver pedido" product={toCardData(dish)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 230,
    borderRadius: radius.xxl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: 20,
    gap: 6,
  },
  heroEyebrow: {
    fontFamily: fonts.extrabold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.white,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 52,
    lineHeight: 50,
    color: colors.white,
    letterSpacing: tracking.display,
  },
  heroDescription: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.9)",
  },
  headingBlock: {
    gap: 4,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 38,
    color: colors.title,
    letterSpacing: tracking.display,
  },
  list: {
    gap: 12,
  },
  notFound: {
    fontFamily: fonts.semibold,
    fontSize: 14.5,
    color: "#7b473d",
    textAlign: "center",
  },
});
