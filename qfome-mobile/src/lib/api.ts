/**
 * Cliente HTTP do backend Spring Boot.
 *
 * Defina EXPO_PUBLIC_API_URL no `.env`. Em celular fisico use o IP da maquina
 * na rede local, nao `localhost`:
 *   EXPO_PUBLIC_API_URL=http://192.168.0.10:8080
 * No emulador Android, `localhost` e o proprio emulador: use http://10.0.2.2:8080.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";
const TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Sem timeout, um IP errado deixa a requisicao pendurada por minutos.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      0,
      `Sem conexao com o servidor (${BASE_URL}). Confira se o backend esta rodando e o EXPO_PUBLIC_API_URL.`,
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await res.text();
  if (!res.ok) {
    throw new ApiError(res.status, extrairMensagem(text) || `Erro ${res.status}`);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

// O backend responde erros como texto puro ou como JSON { erro: "..." }.
function extrairMensagem(text: string) {
  try {
    const body = JSON.parse(text) as { erro?: string };
    return body.erro ?? text;
  } catch {
    return text;
  }
}

// --- Catalogo ---
export function getCategorias() {
  return request<Categoria[]>("/categorias");
}

export function getProdutos(categoriaId?: number) {
  const query = categoriaId ? `?categoria=${categoriaId}` : "";
  return request<Produto[]>(`/produtos${query}`);
}

export function getProduto(id: number) {
  return request<Produto>(`/produtos/${id}`);
}

// --- Auth ---
export function login(email: string, password: string) {
  return request<UsuarioLogado>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return request<UsuarioLogado>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// --- Pedidos ---
export function realizarCheckout(payload: CheckoutPayload) {
  return request<Pedido>("/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function rastrearPedido(codigo: string) {
  return request<Pedido>(`/pedidos/acompanhar/${encodeURIComponent(codigo)}`);
}

export function getHistoricoPedidos(usuarioId: number) {
  return request<Pedido[]>(`/pedidos/cliente/${usuarioId}`);
}

// --- Tipos (espelham os DTOs do backend) ---
export type Categoria = {
  id: number;
  nome: string;
};

export type Adicional = {
  id: number;
  nome: string;
  preco: number;
};

export type Produto = {
  id: number;
  categoriaId: number;
  categoriaNome: string;
  nome: string;
  descricao: string | null;
  preco: number;
  imagemUrl: string | null;
  tempoPreparoMin: number | null;
  adicionais: Adicional[];
};

export type UsuarioLogado = {
  id: number;
  name: string;
  email: string;
  perfil: string;
  message: string;
};

export type FormaPagamento = "PIX" | "CARTAO" | "DINHEIRO";

export type StatusPedido = "RECEBIDO" | "EM_PREPARO" | "SAIU_PARA_ENTREGA" | "ENTREGUE";

export type Endereco = {
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
};

export type CheckoutPayload = {
  usuarioId: number;
  formaPagamento: FormaPagamento;
  endereco: Endereco;
  itens: {
    produtoId: number;
    quantidade: number;
    observacao?: string;
    adicionais: number[];
  }[];
};

export type ItemPedido = {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  observacao: string | null;
  adicionais: Adicional[];
  subtotal: number;
};

export type Pedido = {
  id: number;
  codigo: string;
  usuarioId: number;
  status: StatusPedido;
  formaPagamento: FormaPagamento;
  endereco: Endereco;
  subtotal: number;
  taxaEntrega: number;
  total: number;
  criadoEm: string;
  itens: ItemPedido[];
};
