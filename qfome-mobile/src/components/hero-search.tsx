import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ChevronRight, Search } from "lucide-react-native";
import { BrandText } from "@/components/brand-text";
import type { CategoriaCatalogo, ProdutoCatalogo } from "@/lib/catalog";
import { normalizar } from "@/lib/vitrine";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  href: Href;
  kind: "prato" | "categoria";
};

function createSearchItems(
  categorias: CategoriaCatalogo[],
  produtos: ProdutoCatalogo[],
): SearchItem[] {
  return [
    ...produtos.map((product) => ({
      id: `product-${product.id}`,
      title: product.nome,
      subtitle: product.descricao,
      href: `/produto/${product.id}` as const,
      kind: "prato" as const,
    })),
    ...categorias.map((category) => ({
      id: `category-${category.id}`,
      title: category.nome,
      subtitle: `Categoria: ${category.descricao}`,
      href: `/categoria/${category.id}` as const,
      kind: "categoria" as const,
    })),
  ];
}

/** Busca da home, com a lista de sugestoes logo abaixo do campo. */
export function HeroSearch({
  categorias,
  produtos,
}: {
  categorias: CategoriaCatalogo[];
  produtos: ProdutoCatalogo[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const searchItems = useMemo(
    () => createSearchItems(categorias, produtos),
    [categorias, produtos],
  );

  const results = useMemo(() => {
    const term = normalizar(query);
    if (!term) {
      return [];
    }

    return searchItems
      .filter((item) => normalizar(`${item.title} ${item.subtitle}`).includes(term))
      .slice(0, 6);
  }, [query, searchItems]);

  const goTo = (href: Href) => {
    setQuery("");
    router.push(href);
  };

  const submitSearch = () => {
    if (results[0]) {
      goTo(results[0].href);
      return;
    }
    router.push("/cardapio");
  };

  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputBox}>
        <Search size={18} color="#9f5c4b" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="O que voce quer comer hoje?"
          placeholderTextColor="#b98476"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={submitSearch}
        />
      </View>

      {hasQuery ? (
        <View style={styles.dropdown}>
          {results.length > 0 ? (
            <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {results.map((result) => (
                <Pressable
                  key={result.id}
                  onPress={() => goTo(result.href)}
                  style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
                >
                  <View style={styles.resultText}>
                    <BrandText text={result.title} style={styles.resultTitle} numberOfLines={1} />
                    <BrandText
                      text={result.subtitle}
                      style={styles.resultSubtitle}
                      numberOfLines={1}
                    />
                  </View>
                  <View style={styles.kindChip}>
                    <Text style={styles.kindLabel}>{result.kind.toUpperCase()}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noResults}>Nenhum resultado encontrado. Tente outro termo.</Text>
          )}
        </View>
      ) : null}

      <Pressable
        onPress={submitSearch}
        accessibilityRole="button"
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaLabel}>Ver cardapio</Text>
        <ChevronRight size={18} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#f4ccbd",
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: "#542a24",
    paddingVertical: 12,
  },
  dropdown: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#f1cbbc",
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resultRowPressed: {
    backgroundColor: "#fff2eb",
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 13,
    color: "#5e281e",
  },
  resultSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: "#8c5d52",
  },
  kindChip: {
    borderRadius: radius.pill,
    backgroundColor: "#fde7dd",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  kindLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 9,
    letterSpacing: tracking.label,
    color: "#b5392f",
  },
  noResults: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: "#8c5d52",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    paddingVertical: 14,
    shadowColor: "#c2313d",
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  ctaPressed: {
    backgroundColor: colors.brandDeep,
  },
  ctaLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: colors.white,
  },
});
