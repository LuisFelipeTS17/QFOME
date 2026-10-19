import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getCategorias, getProdutos, type Categoria, type Produto } from "./api";
import { getDatabase } from "./database";
import { vitrineDaCategoria, vitrineDoProduto } from "./vitrine";


export type CategoriaCatalogo = {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  imagem: string;
};

export type ProdutoCatalogo = {
  id: number;
  categoriaId: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  tempoPreparo: string;
  tag: string;
  rating: number | null;
  includes: string[];
  destaque: boolean;
};

type ProdutoCacheRow = {
  id: number;
  categoriaId: number;
  nome: string;
  descricao: string | null;
  preco: number;
  imagemUrl: string | null;
  tempoPreparoMin: number | null;
};

const IMAGEM_PADRAO =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80";

const SELECT_PRODUTO = `
  SELECT id, categoria_id AS categoriaId, nome, descricao, preco,
         imagem_url AS imagemUrl, tempo_preparo_min AS tempoPreparoMin
  FROM produto_cache`;

function toCategoria(row: Categoria): CategoriaCatalogo {
  const vitrine = vitrineDaCategoria(row.nome);
  return {
    id: row.id,
    nome: row.nome,
    slug: vitrine.slug,
    descricao: vitrine.description ?? "",
    imagem: vitrine.image ?? IMAGEM_PADRAO,
  };
}

const itensDaDescricao = (descricao: string | null) =>
  (descricao ?? "")
    .split(/[,.]/)
    .map((parte) => parte.trim())
    .filter(Boolean)
    .slice(0, 3);

export function toProduto(row: ProdutoCacheRow): ProdutoCatalogo {
  const vitrine = vitrineDoProduto(row.nome);
  return {
    id: row.id,
    categoriaId: row.categoriaId,
    nome: row.nome,
    descricao: row.descricao ?? "",
    preco: row.preco,
    imagem: row.imagemUrl || vitrine.image || IMAGEM_PADRAO,
    tempoPreparo: row.tempoPreparoMin ? `${row.tempoPreparoMin} min` : "--",
    tag: vitrine.tag ?? "Novidade",
    rating: vitrine.rating,
    includes: vitrine.includes ?? itensDaDescricao(row.descricao),
    destaque: vitrine.destaque,
  };
}

export async function readCategorias(): Promise<CategoriaCatalogo[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Categoria>("SELECT id, nome FROM categoria_cache ORDER BY id");
  return rows.map(toCategoria);
}

export async function readProdutos(): Promise<ProdutoCatalogo[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProdutoCacheRow>(`${SELECT_PRODUTO} ORDER BY id`);
  return rows.map(toProduto);
}

async function substituirCache(categorias: Categoria[], produtos: Produto[]) {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM categoria_cache");
    for (const categoria of categorias) {
      await db.runAsync(
        "INSERT INTO categoria_cache (id, nome) VALUES (?, ?)",
        categoria.id,
        categoria.nome,
      );
    }

    await db.runAsync("DELETE FROM produto_cache");
    for (const produto of produtos) {
      await salvarProduto(produto);
    }
  });
}

async function salvarProduto(produto: Produto) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO produto_cache
       (id, categoria_id, nome, descricao, preco, imagem_url, tempo_preparo_min, atualizado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    produto.id,
    produto.categoriaId,
    produto.nome,
    produto.descricao,
    produto.preco,
    produto.imagemUrl,
    produto.tempoPreparoMin,
  );
}

export async function salvarProdutoNoCache(produto: Produto) {
  await salvarProduto(produto);
}

const INTERVALO_SYNC_MS = 60_000;
let ultimaSync = 0;
let syncEmAndamento: Promise<void> | null = null;

export function sincronizarCatalogo(forcar = false): Promise<void> {
  if (syncEmAndamento) {
    return syncEmAndamento;
  }
  if (!forcar && Date.now() - ultimaSync < INTERVALO_SYNC_MS) {
    return Promise.resolve();
  }

  syncEmAndamento = (async () => {
    const [categorias, produtos] = await Promise.all([getCategorias(), getProdutos()]);
    await substituirCache(categorias, produtos);
    ultimaSync = Date.now();
  })().finally(() => {
    syncEmAndamento = null;
  });

  return syncEmAndamento;
}

export type EstadoCatalogo = {
  categorias: CategoriaCatalogo[];
  produtos: ProdutoCatalogo[];
  carregado: boolean;
  /** Mensagem da ultima falha ao falar com o backend ("" quando sincronizou). */
  erroSync: string;
};

/**
 * Le o catalogo do SQLite (instantaneo, funciona offline) e depois sincroniza
 * com o backend, relendo o cache quando a copia nova chega.
 */
export function useCatalogo(): EstadoCatalogo {
  const [estado, setEstado] = useState<EstadoCatalogo>({
    categorias: [],
    produtos: [],
    carregado: false,
    erroSync: "",
  });

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      const lerCache = () => Promise.all([readCategorias(), readProdutos()]);

      (async () => {
        try {
          const [categoriasSalvas, produtosSalvos] = await lerCache();
          if (ativo && produtosSalvos.length > 0) {
            setEstado({ categorias: categoriasSalvas, produtos: produtosSalvos, carregado: true, erroSync: "" });
          }

          let erroSync = "";
          try {
            await sincronizarCatalogo();
          } catch (error) {
            erroSync = error instanceof Error ? error.message : "Falha ao sincronizar o cardapio.";
          }

          const [categorias, produtos] = await lerCache();
          if (ativo) {
            setEstado({ categorias, produtos, carregado: true, erroSync });
          }
        } catch {
          if (ativo) {
            setEstado((atual) => ({
              ...atual,
              carregado: true,
              erroSync: "Nao foi possivel abrir o banco local do app.",
            }));
          }
        }
      })();

      return () => {
        ativo = false;
      };
    }, []),
  );

  return estado;
}
