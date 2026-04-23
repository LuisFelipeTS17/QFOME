const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ${res.status}`);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

// --- Categorias ---
export function getCategorias() {
  return request<{ id: number; nome: string }[]>("/categorias");
}

// --- Produtos ---
export function getProdutos(categoria?: string) {
  const query = categoria ? `?categoria=${encodeURIComponent(categoria)}` : "";
  return request<ProdutoResumo[]>(`/produtos${query}`);
}

export function getProdutoPorSlug(slug: string) {
  return request<Produto>(`/produtos/${slug}`);
}

// --- Auth ---
export function login(email: string, password: string) {
  return request<UsuarioLogado>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string, phone?: string) {
  return request<UsuarioLogado>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, phone }),
  });
}

// --- Carrinho ---
export function getCarrinho(clienteId: number) {
  return request<Carrinho>(`/carrinho/${clienteId}`);
}

export function adicionarAoCarrinho(clienteId: number, produtoId: number, quantidade: number, observacao?: string) {
  return request<Carrinho>(`/carrinho/${clienteId}/itens`, {
    method: "POST",
    body: JSON.stringify({ produtoId, quantidade, observacao }),
  });
}

export function atualizarItemCarrinho(clienteId: number, itemId: number, quantidade: number) {
  return request<Carrinho>(`/carrinho/${clienteId}/itens/${itemId}?quantidade=${quantidade}`, {
    method: "PATCH",
  });
}

export function removerItemCarrinho(clienteId: number, itemId: number) {
  return request<Carrinho>(`/carrinho/${clienteId}/itens/${itemId}`, {
    method: "DELETE",
  });
}

// --- Checkout ---
export function realizarCheckout(clienteId: number, formaPagamento: string, total: number) {
  return request<PedidoResponse>("/checkout", {
    method: "POST",
    body: JSON.stringify({ clienteId, formaPagamento, total }),
  });
}

// --- Pedidos ---
export function rastrearPedido(codigo: string) {
  return request<PedidoStatus>(`/pedidos/acompanhar/${codigo}`);
}

export function getHistoricoPedidos(clienteId: number) {
  return request<PedidoStatus[]>(`/pedidos/cliente/${clienteId}`);
}

// --- Tipos ---
export type ProdutoResumo = {
  id: number;
  nome: string;
  preco: number;
  slug: string;
  categoriaNome: string;
};

export type Produto = {
  id: number;
  nome: string;
  preco: number;
  slug: string;
  categoria: { id: number; nome: string };
};

export type UsuarioLogado = {
  id: number;
  name: string;
  email: string;
  message: string;
};

export type Carrinho = {
  id: number;
  clienteId: number;
  status: string;
  total: number;
  itens: ItemCarrinho[];
};

export type ItemCarrinho = {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  observacao?: string;
};

export type PedidoResponse = {
  id: number;
  codigo: string;
  status: string;
  formaPagamento: string;
  dataCriacao: string;
  total: number;
  clienteId: number;
};

export type PedidoStatus = {
  id: number;
  codigo: string;
  status: string;
  total: number;
  dataCriacao: string;
};
