import { NotBlank } from '../../validacao/restricoes.js';
import { comoObjeto, comoString } from '../../web/conversao.js';

/** Pedido a pagar no Mercado Pago, identificado pelo codigo (QF-123456). */
export class PagamentoRequestDTO {
  constructor(codigo) {
    this.codigo = codigo;
  }

  static deJson(json) {
    const campos = comoObjeto(json);
    return new PagamentoRequestDTO(comoString(campos.codigo));
  }

  restricoes() {
    return [['codigo', this.codigo, NotBlank]];
  }
}
