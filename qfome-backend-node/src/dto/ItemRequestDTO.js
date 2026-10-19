import { Min, NotNull, Size } from '../validacao/restricoes.js';
import { comoInteger, comoLista, comoLong, comoObjeto, comoString } from '../web/conversao.js';

/** Item enviado ao carrinho ou ao checkout: produto, quantidade e ids dos adicionais. */
export class ItemRequestDTO {
  constructor(produtoId, quantidade, observacao, adicionais) {
    this.produtoId = produtoId;
    this.quantidade = quantidade;
    this.observacao = observacao;
    this.adicionais = adicionais;
  }

  static deJson(json) {
    const campos = comoObjeto(json);
    if (campos == null) return null;
    return new ItemRequestDTO(
      comoLong(campos.produtoId),
      comoInteger(campos.quantidade),
      comoString(campos.observacao),
      comoLista(campos.adicionais, comoLong),
    );
  }

  restricoes(prefixo = '') {
    return [
      [`${prefixo}produtoId`, this.produtoId, NotNull],
      [`${prefixo}quantidade`, this.quantidade, NotNull, Min(1)],
      [`${prefixo}observacao`, this.observacao, Size(255)],
    ];
  }

  adicionaisOuVazio() {
    return this.adicionais ?? [];
  }
}
