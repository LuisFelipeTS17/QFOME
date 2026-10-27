import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { CatalogStatus } from "@/components/catalog-status";
import { ProductCard, toCardData } from "@/components/product-card";
import { SurfaceCard } from "@/components/ui";
import { useCatalogo } from "@/lib/catalog";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

const ALL = 0;

/** Cardapio completo. O filtro por categoria e a versao mobile do menu lateral. */
export default function CardapioScreen() {
  const catalogo = useCatalogo();
  const [activeCategory, setActiveCategory] = useState<number>(ALL);

  const products = useMemo(
    () =>
      activeCategory === ALL
        ? catalogo.produtos
        : catalogo.produtos.filter((product) => product.categoriaId === activeCategory),
    [activeCategory, catalogo.produtos],
  );

  const filters = [{ id: ALL, nome: "Todos" }, ...catalogo.categorias];

  return (
    <Screen bottomInset={24}>
      <SurfaceCard>
        <Text style={styles.eyebrow}>CARDAPIO COMPLETO</Text>
        <Text style={styles.title}>Todos os pratos</Text>
        <Text style={styles.lead}>
          Escolha um prato para ver detalhes e montar seu pedido.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => {
            const isActive = filter.id === activeCategory;
            return (
              <Pressable
                key={filter.id}
                onPress={() => setActiveCategory(filter.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {filter.nome.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <CatalogStatus estado={catalogo} />

        <Text style={styles.count}>
          {products.length} {products.length === 1 ? "prato" : "pratos"}
        </Text>

        <View style={styles.list}>
          {products.map((product) => (
            <ProductCard key={product.id} product={toCardData(product)} />
          ))}
        </View>
      </SurfaceCard>
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
    lineHeight: 44,
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
  filterRow: {
    gap: 8,
    paddingVertical: 16,
    paddingRight: 8,
  },
  filterChip: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  filterLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 10.5,
    letterSpacing: tracking.label,
    color: "#6f3e33",
  },
  filterLabelActive: {
    color: colors.white,
  },
  count: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: tracking.label,
    color: colors.label,
  },
  list: {
    gap: 12,
    marginTop: 12,
  },
});
