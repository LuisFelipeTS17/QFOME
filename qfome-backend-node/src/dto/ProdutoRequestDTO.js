import { DecimalMinExclusivo, Min, NotBlank, NotNull, Size } from '../validacao/restricoes.js';
import { comoDecimal, comoInteger, comoLong, comoObjeto, comoString } from '../web/conversao.js';

export class ProdutoRequestDTO {
  constructor(categoriaId, nome, descricao, preco, imagemUrl, tempoPreparoMin) {
    this.categoriaId = categoriaId;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.imagemUrl = imagemUrl;
    this.tempoPreparoMin = tempoPreparoMin;
  }

  static deJson(json) {
    const campos = comoObjeto(json);
    return new ProdutoRequestDTO(
      comoLong(campos.categoriaId),
      comoString(campos.nome),
      comoString(campos.descricao),
      comoDecimal(campos.preco),
      comoString(campos.imagemUrl),
      comoInteger(campos.tempoPreparoMin),
    );
  }

  restricoes() {
    return [
      ['categoriaId', this.categoriaId, NotNull],
      ['nome', this.nome, NotBlank, Size(100)],
      ['descricao', this.descricao, Size(500)],
      ['preco', this.preco, NotNull, DecimalMinExclusivo('0.0')],
      ['imagemUrl', this.imagemUrl, Size(255)],
      ['tempoPreparoMin', this.tempoPreparoMin, Min(1)],
    ];
  }
}
