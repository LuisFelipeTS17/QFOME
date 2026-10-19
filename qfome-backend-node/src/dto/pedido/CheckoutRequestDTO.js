import { NotBlank, NotEmpty, NotNull } from '../../validacao/restricoes.js';
import { comoLista, comoLong, comoObjeto, comoString } from '../../web/conversao.js';
import { ItemRequestDTO } from '../ItemRequestDTO.js';
import { EnderecoDTO } from './EnderecoDTO.js';

/**
 * Pedido enviado pelo app/site. Subtotal, taxa e total sao calculados no
 * servidor a partir dos precos do banco; o cliente nao manda valores.
 */
export class CheckoutRequestDTO {
  constructor(usuarioId, formaPagamento, endereco, itens) {
    this.usuarioId = usuarioId;
    this.formaPagamento = formaPagamento;
    this.endereco = endereco;
    this.itens = itens;
  }

  static deJson(json) {
    const campos = comoObjeto(json);
    // @JsonAlias("clienteId"): aceita os dois nomes; se vierem os dois, vale o ultimo.
    const chaveUsuario = Object.keys(campos).findLast((chave) => chave === 'usuarioId' || chave === 'clienteId');
    return new CheckoutRequestDTO(
      comoLong(chaveUsuario && campos[chaveUsuario]),
      comoString(campos.formaPagamento),
      EnderecoDTO.deJson(campos.endereco),
      comoLista(campos.itens, ItemRequestDTO.deJson),
    );
  }

  restricoes() {
    return [
      ['usuarioId', this.usuarioId, NotNull],
      ['formaPagamento', this.formaPagamento, NotBlank],
      ['endereco', this.endereco, NotNull],
      ...(this.endereco?.restricoes('endereco.') ?? []),
      ['itens', this.itens, NotEmpty],
      // List<@Valid ItemRequestDTO>: cada item e validado; um item null passa (e falha no service).
      ...(this.itens ?? []).flatMap((item, i) => item?.restricoes(`itens[${i}].`) ?? []),
    ];
  }
}
