import { NotBlank } from '../validacao/restricoes.js';
import { comoObjeto, comoString } from '../web/conversao.js';

/** Mesmas chaves do login do cliente (email e password). */
export class AdminLoginRequestDTO {
  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  static deJson(json) {
    const campos = comoObjeto(json);
    return new AdminLoginRequestDTO(comoString(campos.email), comoString(campos.password));
  }

  restricoes() {
    return [
      ['email', this.email, NotBlank],
      ['password', this.password, NotBlank],
    ];
  }
}
