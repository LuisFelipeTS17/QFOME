import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Beef,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Fish,
  Flame,
  IceCreamCone,
  Leaf,
  MapPin,
  Percent,
  Pizza,
  ShoppingBag,
  Soup,
  Sparkles,
  Star,
  UserRound,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react-native";
import { Screen } from "@/components/screen";
import { BrandText } from "@/components/brand-text";
import { HeroSearch } from "@/components/hero-search";
import { ProductCard } from "@/components/product-card";
import { Button, DarkCard, SurfaceCard, WhiteCard } from "@/components/ui";
import { menuCategories } from "@/data/menu-categories";
import { menuProducts } from "@/data/menu-products";
import { formatPrice } from "@/lib/format";
import { categoryTones, colors, gradients } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

const categoryIcons: Record<string, LucideIcon> = {
  caseira: UtensilsCrossed,
  "fit-fresh": Leaf,
  grelhados: Beef,
  peixes: Fish,
  sopas: Soup,
  sobremesas: IceCreamCone,
};

const spotlightDeals: {
  title: string;
  subtitle: string;
  discount: string;
  tone: readonly [string, string];
  href: Href;
  image: string;
}[] = [
  {
    title: "Almoco Express",
    subtitle: "2 pratos + 1 bebida",
    discount: "ate 30% OFF",
    tone: ["#d72638", "#8f1424"] as const,
    href: "/categoria/caseira",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Festival de Grelhados",
    subtitle: "Escolha 1 proteina + 3 acompanhamentos",
    discount: "frete gratis hoje",
    tone: ["#f29d35", "#cb5b1f"] as const,
    href: "/categoria/grelhados",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Noite QFome",
    subtitle: "Combo jantar para 2 pessoas",
    discount: "cupom QFOME10",
    tone: ["#3f2624", "#26120f"] as const,
    href: "/cardapio",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
  },
];

const comboItems = [
  "Frango ao molho rustico",
  "Suco natural 300 ml",
  "Mousse de chocolate",
];

const heroStats = [
  { label: "Entrega media", value: "29 min", Icon: Clock3 },
  { label: "Satisfacao", value: "4.9", Icon: Star },
  { label: "Alcance local", value: "18 bairros", Icon: MapPin },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen bottomInset={24}>
      {/* Faixa promocional do topo */}
      <View style={styles.topbar}>
        <Flame size={14} color={colors.topbarInk} />
        <Text style={styles.topbarText}>
          Frete gratis para pedidos acima de R$ 45. Valido hoje.
        </Text>
      </View>

      {/* Header com a marca e atalhos */}
      <View style={styles.nav}>
        <Pressable style={styles.brandRow} onPress={() => router.push("/")}>
          <LinearGradient colors={gradients.brandLogo} style={styles.logo}>
            <Pizza size={22} color={colors.white} />
          </LinearGradient>
          <View>
            <Text style={styles.brandWord}>QFOME</Text>
            <Text style={styles.brandTagline}>FOOD MARKET</Text>
          </View>
        </Pressable>

        <View style={styles.navActions}>
          <Pressable
            onPress={() => router.push("/entrar")}
            accessibilityLabel="Entrar na conta"
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <UserRound size={18} color="#7f2a20" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/pedido")}
            style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
          >
            <ShoppingBag size={15} color={colors.white} />
            <Text style={styles.cartLabel}>Pedido</Text>
          </Pressable>
        </View>
      </View>

      {/* Hero */}
      <SurfaceCard>
        <View style={styles.badge}>
          <Sparkles size={13} color="#a1512d" />
          <Text style={styles.badgeText}>DELIVERY RAPIDO</Text>
        </View>

        <Text style={styles.heroTitle}>MATOU A FOME,</Text>
        <Text style={styles.heroTitle}>
          CHAMOU <Text style={styles.heroBrand}>QFOME</Text>.
        </Text>

        <Text style={styles.heroLead}>
          O ecommerce de comida da sua cidade. Pratos artesanais, combos com preco justo e
          entrega rastreada em tempo real.
        </Text>

        <View style={styles.heroSearch}>
          <HeroSearch />
        </View>

        <View style={styles.statsRow}>
          {heroStats.map(({ label, value, Icon }) => (
            <WhiteCard key={label} style={styles.statCard}>
              <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
              <View style={styles.statValueRow}>
                <Icon
                  size={15}
                  color="#602519"
                  fill={label === "Satisfacao" ? colors.star : "transparent"}
                />
                <Text style={styles.statValue}>{value}</Text>
              </View>
            </WhiteCard>
          ))}
        </View>
      </SurfaceCard>

      {/* Oferta destaque — painel escuro */}
      <View style={styles.comboPanel}>
        <View style={styles.comboBadge}>
          <Text style={styles.comboBadgeText}>35% OFF</Text>
        </View>
        <Text style={styles.comboEyebrow}>OFERTA DESTAQUE</Text>
        <Text style={styles.comboTitle}>COMBO ALMOCO</Text>
        <Text style={styles.comboTitle}>DA CASA</Text>
        <Text style={styles.comboLead}>
          Prato principal + bebida + sobremesa. Oferta valida para pedidos feitos ate as 15h.
        </Text>

        <View style={styles.comboList}>
          {comboItems.map((item) => (
            <DarkCard key={item} style={styles.comboItem}>
              <View style={styles.comboItemLeft}>
                <CheckCircle2 size={15} color="#ffca6f" />
                <Text style={styles.comboItemText}>{item}</Text>
              </View>
              <Text style={styles.comboItemPrice}>R$ 0,00</Text>
            </DarkCard>
          ))}
        </View>

        <View style={styles.comboFooter}>
          <View>
            <Text style={styles.comboFooterLabel}>VALOR FINAL</Text>
            <Text style={styles.comboFooterValue}>R$ 47,90</Text>
          </View>
          <Button
            label="Fechar pedido"
            variant="gold"
            onPress={() => router.push("/pedido")}
            style={styles.comboFooterButton}
          />
        </View>
      </View>

      {/* Categorias */}
      <SurfaceCard>
        <Text style={styles.sectionEyebrow}>CATEGORIAS</Text>
        <Text style={styles.sectionTitle}>Explore sabores</Text>

        <View style={styles.categoryGrid}>
          {menuCategories.map((category) => {
            const Icon = categoryIcons[category.slug] ?? UtensilsCrossed;
            const tone = categoryTones[category.slug] ?? [colors.brand, colors.brandDeep];

            return (
              <Pressable
                key={category.slug}
                onPress={() => router.push(`/categoria/${category.slug}`)}
                style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
              >
                <View style={styles.categoryImageWrap}>
                  <Image
                    source={{ uri: category.image }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={[`${tone[0]}80`, `${tone[1]}80`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.categoryIcon}>
                    <Icon size={17} color={colors.white} />
                  </View>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription} numberOfLines={2}>
                  {category.description}
                </Text>
                <View style={styles.categoryLink}>
                  <Text style={styles.categoryLinkText}>
                    VER {category.dishes.length} PRATOS
                  </Text>
                  <ChevronRight size={13} color="#c12034" />
                </View>
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      {/* Ofertas */}
      <View style={styles.dealsBlock}>
        {spotlightDeals.map((deal) => (
          <Pressable
            key={deal.title}
            onPress={() => router.push(deal.href)}
            style={({ pressed }) => [styles.dealCard, pressed && styles.pressed]}
          >
            <Image source={{ uri: deal.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <LinearGradient
              colors={[`${deal.tone[0]}e6`, `${deal.tone[1]}e6`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.dealContent}>
              <View style={styles.dealChip}>
                <Percent size={11} color={colors.white} />
                <Text style={styles.dealChipText}>IMPERDIVEL</Text>
              </View>
              <BrandText text={deal.title} style={styles.dealTitle} />
              <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
              <BrandText text={deal.discount.toUpperCase()} style={styles.dealDiscount} />
              <View style={styles.dealCta}>
                <Text style={styles.dealCtaText}>Aproveitar</Text>
                <ChevronRight size={15} color={colors.white} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Cardapio em alta */}
      <SurfaceCard>
        <Text style={styles.sectionEyebrow}>CARDAPIO EM ALTA</Text>
        <Text style={styles.sectionTitle}>Pratos em destaque</Text>

        <View style={styles.productList}>
          {menuProducts.map((product) => (
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

        <Button
          label="Ver cardapio completo"
          variant="outline"
          onPress={() => router.push("/cardapio")}
          style={styles.sectionButton}
        />
      </SurfaceCard>

      {/* Combo do dia — atalho para o carrinho */}
      <SurfaceCard>
        <Text style={styles.sectionEyebrow}>COMBOS</Text>
        <Text style={styles.sectionTitle}>Monte seu combo</Text>
        <Text style={styles.sectionLead}>
          Escolha um prato, ajuste os adicionais e feche o pedido em poucos toques.
        </Text>

        <WhiteCard style={styles.comboShortcut}>
          <View style={styles.comboShortcutRow}>
            <Text style={styles.comboShortcutLabel}>Combo Street Burguer</Text>
            <Text style={styles.comboShortcutPrice}>{formatPrice(33.9)}</Text>
          </View>
          <Text style={styles.comboShortcutHint}>
            Burger artesanal, batata chips e refrigerante 350 ml.
          </Text>
          <Button
            label="Personalizar combo"
            onPress={() => router.push("/produto/combo-street-burguer")}
            style={styles.sectionButton}
          />
        </WhiteCard>
      </SurfaceCard>

      {/* Contato */}
      <SurfaceCard>
        <Text style={styles.sectionEyebrow}>CONTATO</Text>
        <BrandText text="Fale com a QFome" style={styles.sectionTitle} />
        <Text style={styles.sectionLead}>
          Atendimento todos os dias das 10h as 23h. Receba novidades da loja, promocoes
          relampago e cupons exclusivos.
        </Text>
        <Button
          label="Ir para contato"
          variant="outline"
          onPress={() => router.push("/contato")}
          style={styles.sectionButton}
        />
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
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
    color: colors.topbarInk,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    height: 44,
    width: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  brandWord: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 32,
    color: "#cc1f2f",
    letterSpacing: tracking.display,
  },
  brandTagline: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: tracking.eyebrow,
    color: "#794842",
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#f4c9ba",
    backgroundColor: colors.white,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  cartLabel: {
    fontFamily: fonts.bold,
    fontSize: 12.5,
    color: colors.white,
  },
  pressed: {
    opacity: 0.85,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: "#fff0d6",
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: "#a1512d",
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 46,
    lineHeight: 42,
    color: colors.title,
    letterSpacing: tracking.display,
    marginTop: 6,
  },
  heroBrand: {
    color: colors.brand,
  },
  heroLead: {
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.muted,
    marginTop: 12,
  },
  heroSearch: {
    marginTop: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 11,
    gap: 4,
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
    gap: 5,
  },
  statValue: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: "#602519",
  },
  comboPanel: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: "#e8b1a6",
    backgroundColor: colors.panelBgAlt,
    padding: 18,
    shadowColor: "#3d110e",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  comboBadge: {
    position: "absolute",
    right: 18,
    top: 18,
    borderRadius: radius.pill,
    backgroundColor: "#ffca6f",
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  comboBadgeText: {
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: "#7c380f",
  },
  comboEyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: tracking.eyebrow,
    color: "#f9c58f",
  },
  comboTitle: {
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 36,
    color: colors.white,
    letterSpacing: tracking.display,
    marginTop: 2,
  },
  comboLead: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: "#f0ccb2",
    marginTop: 10,
  },
  comboList: {
    gap: 8,
    marginTop: 16,
  },
  comboItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: "#784c43",
    backgroundColor: "#3e1d1a",
    paddingVertical: 10,
  },
  comboItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  comboItemText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.panelInk,
  },
  comboItemPrice: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.panelInk,
  },
  comboFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#6b3e38",
    marginTop: 16,
    paddingTop: 14,
    gap: 12,
  },
  comboFooterLabel: {
    fontFamily: fonts.medium,
    fontSize: 9.5,
    letterSpacing: tracking.label,
    color: "#d4ad97",
  },
  comboFooterValue: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    color: colors.white,
  },
  comboFooterButton: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sectionEyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 40,
    color: colors.title,
    letterSpacing: tracking.display,
    marginTop: 4,
  },
  sectionLead: {
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.body,
    marginTop: 8,
  },
  sectionButton: {
    marginTop: 14,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  categoryCard: {
    width: "48%",
    flexGrow: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "#f0cabc",
    backgroundColor: colors.white,
    padding: 10,
  },
  categoryImageWrap: {
    height: 84,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#ead8d0",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryIcon: {
    position: "absolute",
    left: 8,
    bottom: 8,
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  categoryName: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors.titleSoft,
    marginTop: 10,
  },
  categoryDescription: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: "#8f6056",
    marginTop: 3,
    minHeight: 32,
  },
  categoryLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 10,
  },
  categoryLinkText: {
    fontFamily: fonts.extrabold,
    fontSize: 9.5,
    letterSpacing: tracking.label,
    color: "#c12034",
  },
  dealsBlock: {
    gap: 12,
  },
  dealCard: {
    height: 178,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: colors.brandDeep,
  },
  dealContent: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
  },
  dealChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dealChipText: {
    fontFamily: fonts.extrabold,
    fontSize: 9.5,
    letterSpacing: tracking.label,
    color: colors.white,
  },
  dealTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 22,
    lineHeight: 26,
    color: colors.white,
    marginTop: 10,
  },
  dealSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 3,
  },
  dealDiscount: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    letterSpacing: tracking.label,
    color: "#ffe8c2",
    marginTop: 12,
  },
  dealCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  dealCtaText: {
    fontFamily: fonts.extrabold,
    fontSize: 13.5,
    color: colors.white,
  },
  productList: {
    gap: 12,
    marginTop: 16,
  },
  comboShortcut: {
    marginTop: 16,
    gap: 6,
  },
  comboShortcutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  comboShortcutLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors.heading,
  },
  comboShortcutPrice: {
    fontFamily: fonts.extrabold,
    fontSize: 18,
    color: colors.price,
  },
  comboShortcutHint: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.body,
  },
});
