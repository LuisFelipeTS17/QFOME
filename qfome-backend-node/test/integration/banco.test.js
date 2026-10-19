import assert from 'node:assert/strict';
import fs from 'node:fs';
import { afterEach, beforeEach, describe, it } from 'node:test';

import { abrirBanco, criarTransacao } from '../../src/config/banco.js';
import { abrirBancoDeTeste, contarLinhas, criarPastaTemporaria } from '../apoio/banco.js';
import { CATALOGO } from '../apoio/dados.js';

describe('abrirBanco', () => {
  let temporaria;

  beforeEach(() => {
    temporaria = criarPastaTemporaria();
  });

  afterEach(() => temporaria.apagar());

  it('cria o arquivo e as pastas que ainda nao existem', () => {
    const arquivo = temporaria.caminho('dados', 'sqlite', 'qfome.db');

    abrirBanco({ arquivo, executarScripts: true }).close();

    assert.ok(fs.existsSync(arquivo));
  });

  it('cria as tabelas e carrega o catalogo inicial', () => {
    const db = abrirBanco({ arquivo: temporaria.caminho('qfome.db'), executarScripts: true });

    assert.equal(contarLinhas(db, 'categoria'), CATALOGO.totalCategorias);
    assert.equal(contarLinhas(db, 'produto'), CATALOGO.totalProdutos);
    assert.equal(contarLinhas(db, 'adicional'), CATALOGO.totalAdicionais);
    assert.equal(contarLinhas(db, 'usuario'), 0);
    db.close();
  });

  it('pode rodar os scripts de novo sem duplicar nem desfazer alteracoes', () => {
    const arquivo = temporaria.caminho('qfome.db');
    const primeiro = abrirBanco({ arquivo, executarScripts: true });
    primeiro.prepare("UPDATE categoria SET nome = 'Comida Caseira' WHERE id = 1").run();
    primeiro.close();

    const segundo = abrirBanco({ arquivo, executarScripts: true });

    assert.equal(contarLinhas(segundo, 'categoria'), CATALOGO.totalCategorias);
    assert.equal(contarLinhas(segundo, 'produto'), CATALOGO.totalProdutos);
    assert.equal(segundo.prepare('SELECT nome FROM categoria WHERE id = 1').get().nome, 'Comida Caseira');
    segundo.close();
  });

  it('nao cria tabelas quando os scripts estao desligados', () => {
    const db = abrirBanco({ arquivo: temporaria.caminho('qfome.db'), executarScripts: false });

    assert.equal(contarLinhas(db, 'sqlite_master', "type = 'table'"), 0);
    db.close();
  });
});

describe('restricoes do banco', () => {
  let banco;

  beforeEach(() => {
    banco = abrirBancoDeTeste();
  });

  afterEach(() => banco.fechar());

  it('liga as chaves estrangeiras', () => {
    assert.equal(banco.db.pragma('foreign_keys', { simple: true }), 1);
    assert.throws(
      () => banco.db.prepare("INSERT INTO produto (categoria_id, nome, preco) VALUES (999, 'Orfao', 10)").run(),
      { code: 'SQLITE_CONSTRAINT_FOREIGNKEY' },
    );
  });

  it('apaga os adicionais junto com o produto (ON DELETE CASCADE)', () => {
    const { lastInsertRowid: produtoId } = banco.db
      .prepare("INSERT INTO produto (categoria_id, nome, preco) VALUES (1, 'Novo', 10)").run();
    banco.db.prepare("INSERT INTO adicional (produto_id, nome, preco) VALUES (?, 'Extra', 2)").run(produtoId);

    banco.db.prepare('DELETE FROM produto WHERE id = ?').run(produtoId);

    assert.equal(contarLinhas(banco.db, 'adicional', 'produto_id = ?', produtoId), 0);
  });

  it('recusa preco zero, status e forma de pagamento desconhecidos (CHECK)', () => {
    assert.throws(
      () => banco.db.prepare("INSERT INTO produto (categoria_id, nome, preco) VALUES (1, 'Gratis', 0)").run(),
      { code: 'SQLITE_CONSTRAINT_CHECK' },
    );
    banco.db.prepare("INSERT INTO usuario (nome, email, senha) VALUES ('Ana', 'ana@qfome.com', 'x')").run();
    const inserirPedido = (status, forma) => banco.db.prepare(`
      INSERT INTO pedido (codigo, usuario_id, status, forma_pagamento, cep, logradouro, numero, bairro, cidade, subtotal, total)
      VALUES ('QF-1', 1, ?, ?, '01310100', 'Rua', '1', 'Centro', 'SP', 10, 10)`).run(status, forma);
    assert.throws(() => inserirPedido('CANCELADO', 'PIX'), { code: 'SQLITE_CONSTRAINT_CHECK' });
    assert.throws(() => inserirPedido('RECEBIDO', 'BOLETO'), { code: 'SQLITE_CONSTRAINT_CHECK' });
  });
});

describe('criarTransacao', () => {
  let banco;
  let transacao;
  const inserirCategoria = (nome) => banco.db.prepare('INSERT INTO categoria (nome) VALUES (?)').run(nome);

  beforeEach(() => {
    banco = abrirBancoDeTeste();
    transacao = criarTransacao(banco.db);
  });

  afterEach(() => banco.fechar());

  it('confirma as alteracoes e devolve o resultado da funcao', () => {
    const resultado = transacao(() => {
      inserirCategoria('Massas');
      inserirCategoria('Lanches');
      return 'ok';
    });

    assert.equal(resultado, 'ok');
    assert.equal(contarLinhas(banco.db, 'categoria'), CATALOGO.totalCategorias + 2);
  });

  it('desfaz todas as alteracoes quando a funcao lanca erro', () => {
    assert.throws(() => transacao(() => {
      inserirCategoria('Massas');
      throw new Error('falhou no meio');
    }), /falhou no meio/);

    assert.equal(contarLinhas(banco.db, 'categoria'), CATALOGO.totalCategorias);
  });
});
