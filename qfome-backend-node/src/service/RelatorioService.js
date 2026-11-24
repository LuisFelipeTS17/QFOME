import fs from 'node:fs';
import path from 'node:path';

import Big from 'big.js';

import { paraJson } from '../util/datas.js';

const MAXIMO_NO_HISTORICO = 20;

/**
 * Exportacao dos pedidos em JSON para o dashboard em Python (Analise de Dados
 * e Estatistica). O app chama POST /relatorios/pedidos/exportar pelo botao
 * "Exportar dados": o backend grava data/exports/pedidos.json e devolve o mesmo
 * conteudo na resposta, para o app tambem poder compartilhar o arquivo. Cada exportacao
 * fica registrada no banco (tabela exportacao).
 *
 * Valores saem como numeros (nao strings formatadas), prontos para o pandas.
 */
export class RelatorioService {
  constructor(pedidoRepository, usuarioRepository, exportacaoRepository, config) {
    this.pedidoRepository = pedidoRepository;
    this.usuarioRepository = usuarioRepository;
    this.exportacaoRepository = exportacaoRepository;
    this.pastaExportacoes = path.join(config.dados.pasta, 'exports');
  }

  montarRelatorio() {
    const pedidos = this.pedidoRepository.findAllOrderByCriadoEmDesc();
    const usuarios = new Map();
    const buscarUsuario = (id) => {
      if (!usuarios.has(id)) usuarios.set(id, this.usuarioRepository.findById(id));
      return usuarios.get(id);
    };

    const faturamento = pedidos.reduce((soma, pedido) => soma.plus(pedido.total), new Big(0));

    return {
      geradoEm: new Date().toISOString(),
      totalPedidos: pedidos.length,
      faturamentoTotal: Number(faturamento.toFixed(2)),
      pedidos: pedidos.map((pedido) => {
        const usuario = buscarUsuario(pedido.usuarioId);
        return {
          id: pedido.id,
          codigo: pedido.codigo,
          status: pedido.status,
          formaPagamento: pedido.formaPagamento,
          criadoEm: paraJson(pedido.criadoEm),
          cidade: pedido.cidade,
          bairro: pedido.bairro,
          usuario: usuario ? { id: usuario.id, nome: usuario.nome, email: usuario.email } : null,
          subtotal: Number(new Big(pedido.subtotal).toFixed(2)),
          taxaEntrega: Number(new Big(pedido.taxaEntrega).toFixed(2)),
          total: Number(new Big(pedido.total).toFixed(2)),
          itens: pedido.itens.map((item) => ({
            produtoId: item.produto.id,
            produtoNome: item.produto.nome,
            categoriaNome: item.produto.categoria?.nome ?? null,
            quantidade: item.quantidade,
            precoUnitario: Number(new Big(item.precoUnitario).toFixed(2)),
            adicionais: item.adicionais.map((a) => ({ nome: a.adicional.nome, preco: Number(new Big(a.preco).toFixed(2)) })),
            subtotal: Number(item.subtotal.toFixed(2)),
          })),
        };
      }),
    };
  }

  /** Grava data/exports/pedidos.json (sobrescrevendo a exportacao anterior), registra e devolve o conteudo. */
  exportar({ usuarioId = null, origem = 'CLIENTE' } = {}) {
    const relatorio = this.montarRelatorio();
    fs.mkdirSync(this.pastaExportacoes, { recursive: true });
    const arquivo = path.join(this.pastaExportacoes, 'pedidos.json');
    fs.writeFileSync(arquivo, `${JSON.stringify(relatorio, null, 2)}\n`, 'utf8');

    const exportacao = this.exportacaoRepository.save({
      usuarioId,
      origem,
      totalPedidos: relatorio.totalPedidos,
      faturamentoTotal: relatorio.faturamentoTotal,
      arquivo: path.resolve(arquivo),
    });
    return { exportacaoId: exportacao.id, arquivo: exportacao.arquivo, ...relatorio };
  }

  /** Ultimas exportacoes, da mais recente para a mais antiga. */
  listarExportacoes() {
    return this.exportacaoRepository.findRecentes(MAXIMO_NO_HISTORICO)
      .map((exportacao) => ({ ...exportacao, criadoEm: paraJson(exportacao.criadoEm) }));
  }
}
