import { ApiError, type Produto, type ProdutoPayload } from "./api";

/** Campos do formulario de prato, como o administrador digita. */
export type FormularioPrato = {
  categoriaId: number | null;
  nome: string;
  descricao: string;
  preco: string;
  imagemUrl: string;
  tempoPreparoMin: string;
};

export type ErrosPrato = Partial<Record<keyof FormularioPrato, string>>;

export const formularioVazio: FormularioPrato = {
  categoriaId: null,
  nome: "",
  descricao: "",
  preco: "",
  imagemUrl: "",
  tempoPreparoMin: "",
};

export function formularioDoProduto(produto: Produto): FormularioPrato {
  return {
    categoriaId: produto.categoriaId,
    nome: produto.nome,
    descricao: produto.descricao ?? "",
    preco: produto.preco.toFixed(2).replace(".", ","),
    imagemUrl: produto.imagemUrl ?? "",
    tempoPreparoMin: produto.tempoPreparoMin ? String(produto.tempoPreparoMin) : "",
  };
}

// 39 | 39,9 | 39,90 | 39.90
const FORMATO_PRECO = /^\d{1,6}([.,]\d{1,2})?$/;

/**
 * Valida e converte o formulario, com as mesmas regras do ProdutoRequestDTO do
 * backend. `payload` so vem preenchido quando nao ha erros.
 */
export function lerFormulario(form: FormularioPrato): {
  erros: ErrosPrato;
  payload: ProdutoPayload | null;
} {
  const erros: ErrosPrato = {};
  const nome = form.nome.trim();
  const descricao = form.descricao.trim();
  const imagemUrl = form.imagemUrl.trim();
  const precoTexto = form.preco.trim();
  const tempoTexto = form.tempoPreparoMin.trim();
  const preco = Number(precoTexto.replace(",", "."));
  const tempo = Number(tempoTexto);

  if (!nome) {
    erros.nome = "Informe o nome do prato.";
  } else if (nome.length > 100) {
    erros.nome = "O nome deve ter no maximo 100 caracteres.";
  }

  if (descricao.length > 500) {
    erros.descricao = "A descricao deve ter no maximo 500 caracteres.";
  }

  if (!FORMATO_PRECO.test(precoTexto)) {
    erros.preco = "Informe o preco em reais, por exemplo 39,90.";
  } else if (preco <= 0) {
    erros.preco = "O preco deve ser maior que zero.";
  }

  if (form.categoriaId === null) {
    erros.categoriaId = "Escolha a categoria do prato.";
  }

  if (imagemUrl && !/^https?:\/\/\S+$/i.test(imagemUrl)) {
    erros.imagemUrl = "Informe um endereco que comece com http:// ou https://.";
  } else if (imagemUrl.length > 255) {
    erros.imagemUrl = "O endereco da imagem deve ter no maximo 255 caracteres.";
  }

  if (tempoTexto && (!/^\d{1,4}$/.test(tempoTexto) || tempo < 1)) {
    erros.tempoPreparoMin = "Informe o tempo em minutos, com um numero a partir de 1.";
  }

  if (form.categoriaId === null || Object.keys(erros).length > 0) {
    return { erros, payload: null };
  }

  return {
    erros,
    payload: {
      categoriaId: form.categoriaId,
      nome,
      descricao: descricao || null,
      preco,
      imagemUrl: imagemUrl || null,
      tempoPreparoMin: tempoTexto ? tempo : null,
    },
  };
}

/** O banco recusa (409) apagar um prato que esta em um pedido ou em um carrinho. */
export function mensagemAoExcluir(error: unknown, nome: string) {
  if (error instanceof ApiError && error.status === 409) {
    return `"${nome}" ja esta em um pedido ou carrinho e nao pode ser excluido. Voce ainda pode alterar os dados do prato.`;
  }
  if (error instanceof ApiError && error.status === 404) {
    return `"${nome}" ja havia sido excluido.`;
  }
  return error instanceof Error ? error.message : "Nao foi possivel excluir o prato.";
}
