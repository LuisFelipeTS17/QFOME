import { NotBlank, Size } from '../validacao/restricoes.js';
import { comoObjeto, comoString } from '../web/conversao.js';

export class CategoriaRequestDTO {
  constructor(nome) {
    this.nome = nome;
  }

  static deJson(json) {
    const campos = comoObjeto(json);
    return new CategoriaRequestDTO(comoString(campos.nome));
  }

  restricoes() {
    return [['nome', this.nome, NotBlank, Size(60)]];
  }
}
