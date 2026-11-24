import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react-native";
import { AdminMenu, larguraAdmin } from "@/components/admin-menu";
import { useAdmin } from "@/components/admin-provider";
import { Screen } from "@/components/screen";
import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Field } from "@/components/field";
import { Button, EmptyState, FeedbackBox, SurfaceCard, WhiteCard } from "@/components/ui";
import { excluirProduto, getCategorias, getProdutos, type Categoria, type Produto } from "@/lib/api";
import { sincronizarCatalogo, toProduto } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { mensagemAoExcluir } from "@/lib/pratos";
import { normalizar } from "@/lib/vitrine";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

const TODAS = 0;

const AVISOS: Record<string, string> = {
  criado: "Prato cadastrado no cardapio.",
  alterado: "Alteracoes salvas no cardapio.",
  excluido: "Prato excluido do cardapio.",
};

/**
 * Pratos da area administrativa (US06): lista, busca, atalhos para editar e exclusao.
 * Le direto da API, sem o cache do SQLite, para o administrador ver sempre o que esta
 * no servidor.
 */
export default function AdminPratosScreen() {
  const router = useRouter();
  const { comSessao } = useAdmin();
  const { salvo } = useLocalSearchParams<{ salvo?: string }>();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");
  const [categoriaId, setCategoriaId] = useState(TODAS);

  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [feedback, setFeedback] = useState("");

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        try {
          const [listaCategorias, listaProdutos] = await Promise.all([getCategorias(), getProdutos()]);
          if (ativo) {
            setCategorias(listaCategorias);
            setProdutos(listaProdutos);
            setErro("");
          }
        } catch (error) {
          if (ativo) {
            setErro(error instanceof Error ? error.message : "Nao foi possivel carregar os pratos.");
          }
        } finally {
          if (ativo) {
            setCarregado(true);
          }
        }
      })();

      return () => {
        ativo = false;
      };
    }, []),
  );

  const filtrados = useMemo(() => {
    const termo = normalizar(busca);
    return produtos.filter(
      (produto) =>
        (categoriaId === TODAS || produto.categoriaId === categoriaId) &&
        (!termo || normalizar(`${produto.nome} ${produto.descricao ?? ""}`).includes(termo)),
    );
  }, [busca, categoriaId, produtos]);

  const excluir = async (produto: Produto) => {
    setExcluindo(true);
    setFeedback("");
    try {
      await comSessao((token) => excluirProduto(produto.id, token));
      setProdutos((atual) => atual.filter((item) => item.id !== produto.id));
      setFeedback(`"${produto.nome}" foi excluido do cardapio.`);
      // Atualiza o cache para o cardapio do app refletir a exclusao na hora.
      sincronizarCatalogo(true).catch(() => {});
    } catch (error) {
      setFeedback(mensagemAoExcluir(error, produto.nome));
    } finally {
      setExcluindo(false);
      setConfirmandoId(null);
    }
  };

  const filtros = [{ id: TODAS, nome: "Todas" }, ...categorias];

  return (
    <Screen contentStyle={larguraAdmin}>
      <AdminMenu ativo="pratos" />

      <SurfaceCard>
        <Text style={styles.eyebrow}>CARDAPIO</Text>
        <Text style={styles.title}>Gestao de pratos</Text>
        <Text style={styles.lead}>Use Editar ou Excluir em cada prato, ou cadastre um novo.</Text>

        <Button
          label="Novo prato"
          icon={<Plus size={15} color={colors.white} />}
          onPress={() => router.push("/admin/prato/novo")}
          style={styles.novo}
        />

        <View style={styles.feedbackSlot}>
          <FeedbackBox message={erro || feedback || AVISOS[salvo ?? ""] || ""} />
        </View>

        <Field
          icon={<Search size={16} color="#9f5c4b" />}
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar prato pelo nome ou descricao"
          accessibilityLabel="Buscar prato"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filtros.map((filtro) => {
            const ativo = filtro.id === categoriaId;
            return (
              <Pressable
                key={filtro.id}
                onPress={() => setCategoriaId(filtro.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                style={[styles.filterChip, ativo && styles.filterChipActive]}
              >
                <Text style={[styles.filterLabel, ativo && styles.filterLabelActive]}>
                  {filtro.nome.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!carregado ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.brand} />
          </View>
        ) : (
          <Text style={styles.count}>
            {filtrados.length} {filtrados.length === 1 ? "prato" : "pratos"}
          </Text>
        )}

        {carregado && !erro && filtrados.length === 0 ? (
          <EmptyState message="Nenhum prato encontrado com esse filtro." />
        ) : null}

        <View style={styles.list}>
          {filtrados.map((produto) => (
            <WhiteCard key={produto.id} style={styles.item}>
              <View style={styles.itemRow}>
                <Image source={{ uri: toProduto(produto).imagem }} style={styles.thumb} resizeMode="cover" />
                <View style={styles.itemText}>
                  <Text style={styles.itemName}>{produto.nome}</Text>
                  <Text style={styles.itemMeta}>
                    {produto.categoriaNome}
                    {produto.tempoPreparoMin ? ` - ${produto.tempoPreparoMin} min` : ""}
                  </Text>
                  <Text style={styles.itemPrice}>{formatPrice(produto.preco)}</Text>
                </View>
              </View>

              {confirmandoId === produto.id ? (
                <ConfirmarExclusao
                  nome={produto.nome}
                  ocupado={excluindo}
                  onConfirmar={() => excluir(produto)}
                  onCancelar={() => setConfirmandoId(null)}
                />
              ) : (
                <View style={styles.actions}>
                  <Button
                    label="Editar"
                    variant="outline"
                    icon={<Pencil size={13} color="#7a3f33" />}
                    onPress={() => router.push(`/admin/prato/${produto.id}`)}
                    style={styles.action}
                  />
                  <Button
                    label="Excluir"
                    variant="outline"
                    icon={<Trash2 size={13} color="#7a3f33" />}
                    onPress={() => {
                      setFeedback("");
                      setConfirmandoId(produto.id);
                    }}
                    disabled={excluindo}
                    style={styles.action}
                  />
                </View>
              )}
            </WhiteCard>
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
  novo: {
    marginTop: 16,
  },
  feedbackSlot: {
    marginVertical: 12,
  },
  filterRow: {
    gap: 8,
    paddingVertical: 14,
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
  loading: {
    paddingVertical: 24,
  },
  count: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: tracking.label,
    color: colors.label,
  },
  list: {
    gap: 10,
    marginTop: 12,
  },
  item: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    gap: 12,
  },
  thumb: {
    height: 72,
    width: 72,
    borderRadius: radius.md,
    backgroundColor: "#ead8d0",
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: fonts.extrabold,
    fontSize: 15,
    color: colors.heading,
  },
  itemMeta: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.body,
  },
  itemPrice: {
    fontFamily: fonts.extrabold,
    fontSize: 16,
    color: colors.price,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  action: {
    flex: 1,
  },
});
