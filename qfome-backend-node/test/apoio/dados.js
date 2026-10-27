import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

/** Itens do catalogo inicial (src/db/data.sql) usados nos testes de integracao. */
export const CATALOGO = Object.freeze({
  totalCategorias: 6,
  totalProdutos: 29,
  totalAdicionais: 87,
  caseira: { id: 1, nome: 'Caseira', totalProdutos: 5 },
  bowlNordestino: {
    id: 1,
    nome: 'Bowl Nordestino',
    preco: 39.90,
    tempoPreparoMin: 29,
    adicionais: {
      farofaDeBacon: { id: 1, nome: 'Farofa de bacon', preco: 4.00 },
      queijoGratinado: { id: 2, nome: 'Queijo gratinado', preco: 5.00 },
      molhoPicante: { id: 3, nome: 'Molho picante da casa', preco: 3.00 },
    },
  },
  frangoCrocante: {
    id: 2,
    nome: 'Frango Crocante Supreme',
    preco: 36.90,
    adicionais: { batataExtra: { id: 4, nome: 'Porcao extra de batata rustica', preco: 8.00 } },
  },
  mousseDeMaracuja: { id: 27, nome: 'Mousse de Maracuja', preco: 16.90 },
});

export const ENDERECO = Object.freeze({
  cep: '01310-100',
  logradouro: 'Avenida Paulista',
  numero: '1000',
  bairro: 'Bela Vista',
  cidade: 'Sao Paulo',
});

/** Texto com sufixo aleatorio, para nomes que nao podem repetir no mesmo banco. */
export const unico = (prefixo) => `${prefixo} ${randomUUID().slice(0, 8)}`;

export const emailUnico = () => `cliente-${randomUUID()}@qfome.com`;

export async function cadastrarCliente(api, { nome = 'Cliente Teste', email = emailUnico(), senha = '123456' } = {}) {
  const { status, corpo } = await api.post('/auth/register', { name: nome, email, password: senha });
  assert.equal(status, 200, `cadastro falhou: ${JSON.stringify(corpo)}`);
  return { ...corpo, senha };
}

export async function criarCategoria(api, nome = unico('Categoria')) {
  const { status, corpo } = await api.post('/categorias', { nome });
  assert.equal(status, 201, `criacao da categoria falhou: ${JSON.stringify(corpo)}`);
  return corpo;
}

/** Cria um produto (numa categoria nova, se categoriaId nao vier). */
export async function criarProduto(api, dados = {}) {
  const categoriaId = dados.categoriaId ?? (await criarCategoria(api)).id;
  const { status, corpo } = await api.post('/produtos', {
    nome: unico('Produto'),
    descricao: 'Produto criado pelo teste',
    preco: 20.00,
    imagemUrl: null,
    tempoPreparoMin: 10,
    ...dados,
    categoriaId,
  });
  assert.equal(status, 201, `criacao do produto falhou: ${JSON.stringify(corpo)}`);
  return corpo;
}

export function corpoDeCheckout(usuarioId, itens, extras = {}) {
  return { usuarioId, formaPagamento: 'pix', endereco: { ...ENDERECO }, itens, ...extras };
}

export async function fecharPedido(api, usuarioId, itens, extras) {
  const { status, corpo } = await api.post('/checkout', corpoDeCheckout(usuarioId, itens, extras));
  assert.equal(status, 201, `checkout falhou: ${JSON.stringify(corpo)}`);
  return corpo;
}
