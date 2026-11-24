import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Download, LayoutDashboard, LogOut, Plus, UtensilsCrossed, type LucideIcon } from "lucide-react-native";
import { useAdmin } from "@/components/admin-provider";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

export type ItemAdmin = "painel" | "pratos" | "novo" | "exportar";

const ITENS: { id: ItemAdmin; rotulo: string; href: Href; Icon: LucideIcon }[] = [
  { id: "painel", rotulo: "Painel", href: "/admin", Icon: LayoutDashboard },
  { id: "pratos", rotulo: "Pratos", href: "/admin/pratos", Icon: UtensilsCrossed },
  { id: "novo", rotulo: "Novo prato", href: "/admin/prato/novo", Icon: Plus },
  { id: "exportar", rotulo: "Exportar", href: "/admin/exportar", Icon: Download },
];

/** Menu fixo da area administrativa: as mesmas opcoes em todas as telas dela. */
export function AdminMenu({ ativo }: { ativo?: ItemAdmin }) {
  const router = useRouter();
  const { admin, sair } = useAdmin();

  return (
    <View style={styles.bar}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>AREA ADMINISTRATIVA</Text>
          <Text style={styles.user} numberOfLines={1}>
            {admin?.nome}
          </Text>
        </View>
        <Pressable
          onPress={sair}
          accessibilityRole="button"
          style={({ pressed }) => [styles.logout, pressed && styles.pressed]}
        >
          <LogOut size={14} color={colors.panelInk} />
          <Text style={styles.logoutLabel}>Sair</Text>
        </Pressable>
      </View>

      <View style={styles.items}>
        {ITENS.map(({ id, rotulo, href, Icon }) => {
          const selecionado = id === ativo;
          const cor = selecionado ? colors.panelActionInk : colors.panelInk;
          return (
            <Pressable
              key={id}
              // dismissTo nao empilha telas repetidas ao alternar pelo menu.
              onPress={() => router.dismissTo(href)}
              accessibilityRole="link"
              accessibilityLabel={`Menu: ${rotulo}`}
              accessibilityState={{ selected: selecionado }}
              style={({ pressed }) => [
                styles.item,
                selecionado && styles.itemActive,
                pressed && styles.pressed,
              ]}
            >
              <Icon size={15} color={cor} />
              <Text style={[styles.itemLabel, { color: cor }]}>{rotulo}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bar: {
    gap: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.panelEdge,
    backgroundColor: colors.panelBg,
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.panelEyebrow,
  },
  user: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors.white,
    marginTop: 2,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#8f5c50",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.panelInk,
  },
  // Duas colunas no celular e uma linha em telas largas: todos os itens sempre visiveis.
  items: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  item: {
    flexGrow: 1,
    flexBasis: 130,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    backgroundColor: colors.panelCard,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  itemActive: {
    borderColor: colors.panelAction,
    backgroundColor: colors.panelAction,
  },
  itemLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 12.5,
  },
  pressed: {
    opacity: 0.82,
  },
});

/** Largura confortavel da area administrativa em telas grandes (navegador). */
export const larguraAdmin = { width: "100%", maxWidth: 820, alignSelf: "center" } as const;
