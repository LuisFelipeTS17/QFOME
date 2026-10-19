import { NotBlank, Size } from '../validacao/restricoes.js';
import { comoObjeto, comoString } from '../web/conversao.js';

export class UsuarioUpdateDTO {
  constructor(nome) {
    this.nome = nome;
  }

  static deJson(json) {
    const campos = comoObjeto(json);
    return new UsuarioUpdateDTO(comoString(campos.nome));
  }

  restricoes() {
    return [['nome', this.nome, NotBlank, Size(100)]];
  }
}
