import { NotBlank, Pattern, Size } from '../../validacao/restricoes.js';
import { comoObjeto, comoString } from '../../web/conversao.js';

export class EnderecoDTO {
  constructor(cep, logradouro, numero, bairro, cidade) {
    this.cep = cep;
    this.logradouro = logradouro;
    this.numero = numero;
    this.bairro = bairro;
    this.cidade = cidade;
  }

  static de(pedido) {
    return new EnderecoDTO(pedido.cep, pedido.logradouro, pedido.numero, pedido.bairro, pedido.cidade);
  }

  static deJson(json) {
    const campos = comoObjeto(json);
    if (campos == null) return null;
    return new EnderecoDTO(
      comoString(campos.cep),
      comoString(campos.logradouro),
      comoString(campos.numero),
      comoString(campos.bairro),
      comoString(campos.cidade),
    );
  }

  restricoes(prefixo = '') {
    return [
      [`${prefixo}cep`, this.cep, NotBlank, Pattern(/^\d{5}-?\d{3}$/, 'deve ter 8 digitos')],
      [`${prefixo}logradouro`, this.logradouro, NotBlank, Size(150)],
      [`${prefixo}numero`, this.numero, NotBlank, Size(10)],
      [`${prefixo}bairro`, this.bairro, NotBlank, Size(80)],
      [`${prefixo}cidade`, this.cidade, NotBlank, Size(80)],
    ];
  }

  /** CEP como gravado no banco: CHAR(8), so digitos. */
  cepSomenteDigitos() {
    return this.cep.replace(/\D/g, '');
  }
}
