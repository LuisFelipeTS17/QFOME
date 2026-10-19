import { randomInt } from 'node:crypto';

import Big from 'big.js';

import { PedidoDTO } from '../../dto/pedido/PedidoDTO.js';
import { FormaPagamento } from '../../model/enums/FormaPagamento.js';
import { StatusPedido } from '../../model/enums/StatusPedido.js';
import { ItemPedido } from '../../model/ItemPedido.js';
import { Pedido } from '../../model/Pedido.js';
import { isBlank, trim } from '../../util/texto.js';
import { ResponseStatusError } from '../../web/erros.js';

/** Mesma regra do site e do app: frete gratis a partir de R$ 45. */
export const FRETE_GRATIS_A_PARTIR_DE = new Big('45.00');
export const TAXA_ENTREGA = new Big('6.90');

export class CheckoutService {
  constructor(pedidoRepository, usuarioRepository, produtoService, transacao) {
    this.pedidoRepository = pedidoRepository;
    this.usuarioRepository = usuarioRepository;
    this.produtoService = produtoService;
    this.transacao = transacao;
  }

  fecharPedido(request) {
    return this.transacao(() => {
      const usuario = this.usuarioRepository.findById(request.usuarioId);
      if (!usuario) throw new ResponseStatusError(404, 'Usuario nao encontrado');
      const { endereco } = request;

      const pedido = new Pedido({
        codigo: this.gerarCodigoPedido(),
        usuarioId: usuario.id,
        status: StatusPedido.RECEBIDO,
        formaPagamento: mapearFormaPagamento(request.formaPagamento),
        cep: endereco.cepSomenteDigitos(),
        logradouro: trim(endereco.logradouro),
        numero: trim(endereco.numero),
        bairro: trim(endereco.bairro),
        cidade: trim(endereco.cidade),
      });

      for (const itemRequest of request.itens) {
        const produto = this.produtoService.buscarEntidade(itemRequest.produtoId);
        const item = new ItemPedido({
          produto,
          quantidade: itemRequest.quantidade,
          precoUnitario: produto.preco,
          observacao: normalizar(itemRequest.observacao),
        });
        for (const adicional of this.produtoService.adicionaisDoProduto(produto, itemRequest.adicionaisOuVazio())) {
          item.adicionarAdicional(adicional);
        }
        pedido.adicionarItem(item);
      }

      const subtotal = pedido.itens.reduce((soma, item) => soma.plus(item.subtotal), new Big(0));
      const taxaEntrega = calcularTaxaEntrega(subtotal);

      pedido.subtotal = subtotal;
      pedido.taxaEntrega = taxaEntrega;
      pedido.total = subtotal.plus(taxaEntrega);

      return new PedidoDTO(this.pedidoRepository.save(pedido));
    });
  }

  gerarCodigoPedido() {
    // Gera codigo QF-123456 unico
    for (let tentativa = 0; tentativa < 30; tentativa++) {
      const codigo = `QF-${randomInt(100000, 1000000)}`;
      if (!this.pedidoRepository.existsByCodigo(codigo)) {
        return codigo;
      }
    }
    throw new ResponseStatusError(500, 'Nao foi possivel gerar codigo do pedido');
  }
}

export function calcularTaxaEntrega(subtotal) {
  return subtotal.gte(FRETE_GRATIS_A_PARTIR_DE) ? new Big(0) : TAXA_ENTREGA;
}

function mapearFormaPagamento(formaPagamento) {
  const nome = trim(formaPagamento).toUpperCase();
  if (!Object.hasOwn(FormaPagamento, nome)) {
    throw new ResponseStatusError(400, 'Forma de pagamento invalida');
  }
  return FormaPagamento[nome];
}

function normalizar(observacao) {
  return observacao == null || isBlank(observacao) ? null : trim(observacao);
}
