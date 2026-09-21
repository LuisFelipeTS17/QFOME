import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/screen";
import { ProductCard } from "@/components/product-card";
import { SurfaceCard } from "@/components/ui";
import { menuCategories } from "@/data/menu-categories";
import { allMenuProducts } from "@/data/menu-products";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

const ALL = "todos";

/** Cardapio completo. O filtro por categoria e a versao mobile do menu lateral. */
export default function CardapioScreen() {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);

  const slugsByCategory = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    menuCategories.forEach((category) => {
      map[category.slug] = new Set(category.dishes.map((dish) => dish.slug));
    });
    return map;
  }, []);

  const products = useMemo(() => {
    if (activeCategory === ALL) {
      return allMenuProducts;
    }
    const allowed = slugsByCategory[activeCategory];
    return allMenuProducts.filter((product) => allowed?.has(product.slug));
  }, [activeCategory, slugsByCategory]);

  const filters = [{ slug: ALL, name: "Todos" }, ...menuCategories];

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
            const isActive = filter.slug === activeCategory;
            return (
              <Pressable
                key={filter.slug}
                onPress={() => setActiveCategory(filter.slug)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {filter.name.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.count}>
          {products.length} {products.length === 1 ? "prato" : "pratos"}
        </Text>

        <View style={styles.list}>
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={{
                slug: product.slug,
                name: product.name,
                description: product.shortDescription,
                price: product.price,
                prepTime: product.prepTime,
                rating: product.rating,
                tag: product.tag,
                image: product.image,
              }}
            />
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
