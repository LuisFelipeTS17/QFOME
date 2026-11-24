import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import { ChevronRight, Download, Pencil, Plus, UtensilsCrossed, type LucideIcon } from "lucide-react-native";
import { AdminMenu, larguraAdmin } from "@/components/admin-menu";
import { Screen } from "@/components/screen";
import { SurfaceCard } from "@/components/ui";
import { getCategorias, getProdutos } from "@/lib/api";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

/** Painel da area administrativa: primeira tela depois do login, com tudo o que da para fazer. */
export default function AdminPainelScreen() {
  const [totais, setTotais] = useState("");

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      Promise.all([getProdutos(), getCategorias()])
        .then(([produtos, categorias]) => {
          if (ativo) {
            setTotais(`${produtos.length} pratos em ${categorias.length} categorias. `);
          }
        })
        .catch(() => {
          // O total e so informativo; as opcoes continuam disponiveis.
        });
      return () => {
        ativo = false;
      };
    }, []),
  );

  return (
    <Screen contentStyle={larguraAdmin}>
      <AdminMenu ativo="painel" />

      <SurfaceCard>
        <Text style={styles.eyebrow}>PAINEL</Text>
        <Text style={styles.title}>O que voce quer fazer?</Text>

        <View style={styles.list}>
          <Opcao
            Icon={Plus}
            titulo="Cadastrar prato"
            texto="Inclua um novo prato no cardapio."
            href="/admin/prato/novo"
            destaque
          />
          <Opcao
            Icon={Pencil}
            titulo="Editar ou excluir pratos"
            texto={`${totais}Busque, altere e exclua.`}
            href="/admin/pratos"
            destaque
          />
          <Opcao
            Icon={Download}
            titulo="Exportar dados (JSON)"
            texto="Gere o arquivo dos pedidos para o dashboard e veja o historico."
            href="/admin/exportar"
          />
          <Opcao
            Icon={UtensilsCrossed}
            titulo="Ver o cardapio do cliente"
            texto="Confira como os pratos aparecem no aplicativo."
            href="/cardapio"
          />
        </View>
      </SurfaceCard>
    </Screen>
  );
}

function Opcao({
  Icon,
  titulo,
  texto,
  href,
  destaque = false,
}: {
  Icon: LucideIcon;
  titulo: string;
  texto: string;
  href: Href;
  destaque?: boolean;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="link"
      accessibilityLabel={titulo}
      style={({ pressed }) => [
        styles.option,
        destaque && styles.optionHighlight,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, destaque && styles.iconHighlight]}>
        <Icon size={22} color={destaque ? colors.brand : "#7a3f33"} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.optionTitle, destaque && styles.optionTitleHighlight]}>{titulo}</Text>
        <Text style={[styles.optionText, destaque && styles.optionTextHighlight]}>{texto}</Text>
      </View>
      <ChevronRight size={20} color={destaque ? colors.white : "#a3796c"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 10.5,
    letterSpacing: tracking.eyebrow,
    color: colors.eyebrow,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 42,
    color: colors.title,
    letterSpacing: tracking.display,
    marginTop: 4,
  },
  list: {
    gap: 10,
    marginTop: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    padding: 16,
  },
  optionHighlight: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  icon: {
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: "#fff1ec",
  },
  iconHighlight: {
    backgroundColor: colors.white,
  },
  optionTitle: {
    fontFamily: fonts.extrabold,
    fontSize: 16.5,
    color: colors.heading,
  },
  optionTitleHighlight: {
    color: colors.white,
  },
  optionText: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.body,
    marginTop: 2,
  },
  optionTextHighlight: {
    color: "#ffe9e4",
  },
  pressed: {
    opacity: 0.85,
  },
});
