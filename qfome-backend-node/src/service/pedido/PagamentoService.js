import fs from 'node:fs';
import path from 'node:path';

import Big from 'big.js';

import * as Dinheiro from '../../dto/Dinheiro.js';
import { trim } from '../../util/texto.js';
import { ResponseStatusError } from '../../web/erros.js';

/**
 * Pagamento via Mercado Pago (Checkout Pro): cria uma preferencia de pagamento
 * para um pedido ja fechado e devolve o link (init_point) onde o cliente paga.
 *
 * Com MERCADOPAGO_ACCESS_TOKEN configurado (TEST-... para sandbox), a preferencia
 * e criada de verdade na API https://api.mercadopago.com/checkout/preferences.
 * Sem token, roda em modo simulado: devolve um link de demonstracao, para o app
 * funcionar em aula sem credenciais.
 *
 * Cada pagamento tambem grava um registro de compra em JSON (data/purchases/),
 * como trilha de auditoria — mesmo formato do projeto de referencia.
 */
export class PagamentoService {
  constructor(pedidoRepository, usuarioRepository, config, { fetchFn = fetch } = {}) {
    this.pedidoRepository = pedidoRepository;
    this.usuarioRepository = usuarioRepository;
    this.mercadoPago = config.mercadoPago;
    this.pastaCompras = path.join(config.dados.pasta, 'purchases');
    this.fetchFn = fetchFn;
  }

  async pagarComMercadoPago(codigo) {
    const pedido = this.pedidoRepository.findByCodigo(trim(codigo));
    if (!pedido) throw new ResponseStatusError(404, 'Pedido nao encontrado');
    const usuario = this.usuarioRepository.findById(pedido.usuarioId);

    const preferencia = this.mercadoPago.accessToken
      ? await this.criarPreferencia(pedido)
      : this.preferenciaSimulada(pedido);

    this.gravarRegistroDeCompra(pedido, usuario, preferencia);

    return {
      codigo: pedido.codigo,
      modo: preferencia.modo,
      preferenceId: preferencia.id,
      initPoint: preferencia.initPoint,
      total: Dinheiro.arredondar(pedido.total),
    };
  }

  /** POST /checkout/preferences na API do Mercado Pago, autenticado com o Access Token. */
  async criarPreferencia(pedido) {
    let resposta;
    try {
      resposta = await this.fetchFn(`${this.mercadoPago.urlApi}/checkout/preferences`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.mercadoPago.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: this.itensDaPreferencia(pedido),
          external_reference: pedido.codigo,
          statement_descriptor: 'QFOME',
          metadata: { pedido_id: pedido.id, codigo: pedido.codigo },
        }),
      });
    } catch {
      throw new ResponseStatusError(502, 'Sem conexao com o Mercado Pago');
    }

    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      throw new ResponseStatusError(502, `Mercado Pago recusou a preferencia: ${dados.message ?? `HTTP ${resposta.status}`}`);
    }

    const initPoint = dados.init_point ?? dados.sandbox_init_point;
    if (!initPoint) throw new ResponseStatusError(502, 'Mercado Pago nao retornou o link de pagamento');

    return { modo: 'mercadopago', id: dados.id ?? null, initPoint };
  }

  /**
   * Um item por linha do pedido, com o subtotal ja fechado (produto + adicionais)
   * e quantity 1, mais a taxa de entrega: o total cobrado no Mercado Pago bate
   * centavo a centavo com o total do pedido.
   */
  itensDaPreferencia(pedido) {
    const itens = pedido.itens.map((item) => ({
      id: String(item.produto.id),
      title: `${item.quantidade}x ${item.produto.nome}`,
      quantity: 1,
      currency_id: 'BRL',
      unit_price: Number(item.subtotal.toFixed(2)),
    }));

    if (new Big(pedido.taxaEntrega ?? 0).gt(0)) {
      itens.push({
        id: 'taxa-entrega',
        title: 'Taxa de entrega',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(new Big(pedido.taxaEntrega).toFixed(2)),
      });
    }
    return itens;
  }

  preferenciaSimulada(pedido) {
    const id = `demo_${Date.now()}_${pedido.codigo}`;
    return {
      modo: 'simulado',
      id,
      initPoint: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${id}`,
    };
  }

  /** Registro de auditoria da compra em data/purchases/compra_{usuarioId}_{timestamp}.json. */
  gravarRegistroDeCompra(pedido, usuario, preferencia) {
    const agora = new Date();
    const registro = {
      compraId: `COMPRA-${agora.getTime()}`,
      codigoPedido: pedido.codigo,
      dataHora: agora.toISOString(),
      dataHoraFormatada: agora.toLocaleString('pt-BR'),
      usuario: usuario ? { id: usuario.id, nome: usuario.nome, email: usuario.email } : null,
      produtos: pedido.itens.map((item) => ({
        produtoId: item.produto.id,
        nomeProduto: item.produto.nome,
        categoria: item.produto.categoria?.nome ?? null,
        quantidade: item.quantidade,
        precoUnitario: Number(new Big(item.precoUnitario).toFixed(2)),
        adicionais: item.adicionais.map((a) => ({ nome: a.adicional.nome, preco: Number(new Big(a.preco).toFixed(2)) })),
        subtotal: Number(item.subtotal.toFixed(2)),
      })),
      resumo: {
        totalItens: pedido.itens.length,
        quantidadeTotal: pedido.itens.reduce((soma, item) => soma + item.quantidade, 0),
        subtotal: Number(new Big(pedido.subtotal).toFixed(2)),
        taxaEntrega: Number(new Big(pedido.taxaEntrega).toFixed(2)),
        valorTotal: Number(new Big(pedido.total).toFixed(2)),
        valorTotalFormatado: `R$ ${new Big(pedido.total).toFixed(2)}`,
      },
      pagamento: {
        metodo: 'Mercado Pago',
        modo: preferencia.modo,
        status: 'pendente',
        preferenceId: preferencia.id,
      },
    };

    try {
      fs.mkdirSync(this.pastaCompras, { recursive: true });
      const arquivo = path.join(this.pastaCompras, `compra_${pedido.usuarioId}_${agora.getTime()}.json`);
      fs.writeFileSync(arquivo, `${JSON.stringify(registro, null, 2)}\n`, 'utf8');
    } catch (erro) {
      // O registro e trilha de auditoria: falha de disco nao deve impedir o pagamento.
      console.error('Nao foi possivel gravar o registro da compra', erro);
    }
  }
}
