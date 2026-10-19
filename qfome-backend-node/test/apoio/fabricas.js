// Objetos de dominio prontos para os testes unitarios. Cada fabrica aceita sobrescrever campos.

import { Adicional } from '../../src/model/Adicional.js';
import { Categoria } from '../../src/model/Categoria.js';
import { Perfil } from '../../src/model/enums/Perfil.js';
import { Produto } from '../../src/model/Produto.js';
import { Usuario } from '../../src/model/Usuario.js';

/** Substitui o criarTransacao(db) nos services: so executa a funcao. */
export const transacaoDireta = (fn) => fn();

export function umaCategoria(dados = {}) {
  return new Categoria({ id: 1, nome: 'Caseira', ...dados });
}

export function umAdicional(dados = {}) {
  return new Adicional({ id: 1, produtoId: 1, nome: 'Farofa de bacon', preco: 4.0, ...dados });
}

export function umProduto(dados = {}) {
  return new Produto({
    id: 1,
    categoria: umaCategoria(),
    nome: 'Bowl Nordestino',
    descricao: 'Arroz cremoso, carne de sol e queijo coalho.',
    preco: 39.9,
    imagemUrl: 'https://img.qfome.com/bowl.jpg',
    tempoPreparoMin: 29,
    adicionais: [],
    ...dados,
  });
}

export function umUsuario(dados = {}) {
  return new Usuario({
    id: 1,
    nome: 'Ana Souza',
    email: 'ana@qfome.com',
    senha: '123456',
    perfil: Perfil.CLIENTE,
    ...dados,
  });
}

/** Serializa como a resposta HTTP: valores em dinheiro viram numeros e datas viram texto. */
export const comoJson = (valor) => JSON.parse(JSON.stringify(valor));
