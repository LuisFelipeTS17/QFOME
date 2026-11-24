import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Save, Trash2 } from "lucide-react-native";
import { AdminMenu, larguraAdmin } from "@/components/admin-menu";
import { useAdmin } from "@/components/admin-provider";
import { Screen } from "@/components/screen";
import { ConfirmarExclusao } from "@/components/confirmar-exclusao";
import { Field } from "@/components/field";
import { Button, EmptyState, FeedbackBox, SurfaceCard } from "@/components/ui";
import {
  ApiError,
  atualizarProduto,
  criarProduto,
  excluirProduto,
  getCategorias,
  getProduto,
  type Categoria,
} from "@/lib/api";
import { sincronizarCatalogo } from "@/lib/catalog";
import {
  formularioDoProduto,
  formularioVazio,
  lerFormulario,
  mensagemAoExcluir,
  type ErrosPrato,
  type FormularioPrato,
} from "@/lib/pratos";
import { colors } from "@/theme/colors";
import { fonts, radius, tracking } from "@/theme/typography";

/**
 * Formulario de prato da area administrativa (US06).
 * `/admin/prato/novo` cadastra; `/admin/prato/{id}` altera ou exclui.
 */
export default function AdminPratoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // key: trocar de prato pelo menu comeca um formulario limpo.
  return <FormularioDePrato key={id} id={id} />;
}

function FormularioDePrato({ id }: { id: string }) {
  const router = useRouter();
  const { comSessao } = useAdmin();
  const novo = id === "novo";
  const produtoId = Number(id);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<FormularioPrato>(formularioVazio);
  const [erros, setErros] = useState<ErrosPrato>({});
  const [carregado, setCarregado] = useState(false);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const [listaCategorias, produto] = await Promise.all([
          getCategorias(),
          novo ? null : getProduto(produtoId),
        ]);
        if (ativo) {
          setCategorias(listaCategorias);
          setForm(produto ? formularioDoProduto(produto) : formularioVazio);
        }
      } catch (error) {
        if (!ativo) {
          return;
        }
        // 400: o id da URL nao e um numero; 404: o prato nao existe mais.
        if (!novo && error instanceof ApiError && (error.status === 404 || error.status === 400)) {
          setNaoEncontrado(true);
        } else {
          setFeedback(error instanceof Error ? error.message : "Nao foi possivel carregar o prato.");
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
  }, [novo, produtoId]);

  const alterar = <K extends keyof FormularioPrato>(campo: K, valor: FormularioPrato[K]) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
    setFeedback("");
  };

  const voltarParaLista = (salvo: "criado" | "alterado" | "excluido") => {
    // Atualiza o cache para o cardapio do app mostrar a mudanca na hora.
    sincronizarCatalogo(true).catch(() => {});
    router.dismissTo({ pathname: "/admin/pratos", params: { salvo } });
  };

  const salvar = async () => {
    const { erros: encontrados, payload } = lerFormulario(form);
    setErros(encontrados);
    if (!payload) {
      setFeedback("Confira os campos destacados.");
      return;
    }

    setSalvando(true);
    setFeedback("");
    try {
      if (novo) {
        await comSessao((token) => criarProduto(payload, token));
      } else {
        await comSessao((token) => atualizarProduto(produtoId, payload, token));
      }
      voltarParaLista(novo ? "criado" : "alterado");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel salvar o prato.");
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async () => {
    setExcluindo(true);
    setFeedback("");
    try {
      await comSessao((token) => excluirProduto(produtoId, token));
      voltarParaLista("excluido");
    } catch (error) {
      setFeedback(mensagemAoExcluir(error, form.nome));
    } finally {
      setExcluindo(false);
      setConfirmando(false);
    }
  };

  if (!carregado) {
    return (
      <Screen contentStyle={larguraAdmin}>
        <AdminMenu ativo={novo ? "novo" : "pratos"} />
        <ActivityIndicator color={colors.brand} />
      </Screen>
    );
  }

  if (naoEncontrado) {
    return (
      <Screen contentStyle={larguraAdmin}>
        <AdminMenu ativo={novo ? "novo" : "pratos"} />
        <EmptyState
          message="Prato nao encontrado."
          action={<Button label="Ver todos os pratos" onPress={() => router.dismissTo("/admin/pratos")} />}
        />
      </Screen>
    );
  }

  const ocupado = salvando || excluindo;
  const imagem = form.imagemUrl.trim();

  return (
    <Screen contentStyle={larguraAdmin}>
      <AdminMenu ativo={novo ? "novo" : "pratos"} />

      <SurfaceCard>
        <Text style={styles.eyebrow}>CARDAPIO</Text>
        <Text style={styles.title}>{novo ? "Novo prato" : "Editar prato"}</Text>
        <Text style={styles.lead}>Os campos com * sao obrigatorios.</Text>

        <View style={styles.form}>
          <View>
            <Field
              label="Nome *"
              value={form.nome}
              onChangeText={(valor) => alterar("nome", valor)}
              maxLength={100}
              accessibilityLabel="Nome do prato"
            />
            <MensagemDeErro texto={erros.nome} />
          </View>

          <View>
            <Field
              label="Descricao"
              value={form.descricao}
              onChangeText={(valor) => alterar("descricao", valor)}
              maxLength={500}
              multiline
              numberOfLines={3}
              style={styles.descricao}
              accessibilityLabel="Descricao do prato"
            />
            <MensagemDeErro texto={erros.descricao} />
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <Field
                label="Preco (R$) *"
                value={form.preco}
                onChangeText={(valor) => alterar("preco", valor)}
                keyboardType="decimal-pad"
                maxLength={9}
                placeholder="39,90"
                accessibilityLabel="Preco do prato"
              />
              <MensagemDeErro texto={erros.preco} />
            </View>
            <View style={styles.flex}>
              <Field
                label="Preparo (min)"
                value={form.tempoPreparoMin}
                onChangeText={(valor) => alterar("tempoPreparoMin", valor)}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="30"
                accessibilityLabel="Tempo de preparo em minutos"
              />
              <MensagemDeErro texto={erros.tempoPreparoMin} />
            </View>
          </View>

          <View>
            <Text style={styles.blockLabel}>CATEGORIA *</Text>
            <View style={styles.chips}>
              {categorias.map((categoria) => {
                const ativa = categoria.id === form.categoriaId;
                return (
                  <Pressable
                    key={categoria.id}
                    onPress={() => alterar("categoriaId", categoria.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativa }}
                    style={[styles.chip, ativa && styles.chipActive]}
                  >
                    <Text style={[styles.chipLabel, ativa && styles.chipLabelActive]}>
                      {categoria.nome.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <MensagemDeErro texto={erros.categoriaId} />
          </View>

          <View>
            <Field
              label="Endereco da imagem"
              value={form.imagemUrl}
              onChangeText={(valor) => alterar("imagemUrl", valor)}
              maxLength={255}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="https://..."
              accessibilityLabel="Endereco da imagem"
            />
            <MensagemDeErro texto={erros.imagemUrl} />
            {/^https?:\/\/\S+$/i.test(imagem) ? (
              <Image source={{ uri: imagem }} style={styles.preview} resizeMode="cover" />
            ) : null}
          </View>
        </View>

        <Button
          label={salvando ? "Salvando..." : novo ? "Cadastrar prato" : "Salvar alteracoes"}
          icon={<Save size={15} color={colors.white} />}
          onPress={salvar}
          disabled={ocupado}
          style={styles.submit}
        />

        {novo ? null : (
          <View style={styles.deleteSlot}>
            {confirmando ? (
              <ConfirmarExclusao
                nome={form.nome}
                ocupado={excluindo}
                onConfirmar={excluir}
                onCancelar={() => setConfirmando(false)}
              />
            ) : (
              <Button
                label="Excluir prato"
                variant="outline"
                icon={<Trash2 size={14} color="#7a3f33" />}
                onPress={() => setConfirmando(true)}
                disabled={ocupado}
              />
            )}
          </View>
        )}

        <View style={styles.feedbackSlot}>
          <FeedbackBox message={feedback} />
        </View>
      </SurfaceCard>
    </Screen>
  );
}

function MensagemDeErro({ texto }: { texto?: string }) {
  return texto ? <Text style={styles.erro}>{texto}</Text> : null;
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
  form: {
    gap: 10,
    marginTop: 18,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  descricao: {
    minHeight: 66,
    textAlignVertical: "top",
  },
  blockLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: tracking.label,
    color: colors.label,
    marginBottom: 8,
    marginTop: 4,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  chipLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 10.5,
    letterSpacing: tracking.label,
    color: "#6f3e33",
  },
  chipLabelActive: {
    color: colors.white,
  },
  preview: {
    height: 150,
    borderRadius: radius.lg,
    backgroundColor: "#ead8d0",
    marginTop: 8,
  },
  erro: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.brandDeep,
    marginTop: 4,
    marginLeft: 4,
  },
  submit: {
    marginTop: 18,
  },
  deleteSlot: {
    marginTop: 10,
  },
  feedbackSlot: {
    marginTop: 12,
  },
});
