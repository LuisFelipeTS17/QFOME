import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CategoriaRequestDTO } from '../../../src/dto/CategoriaRequestDTO.js';
import { ItemRequestDTO } from '../../../src/dto/ItemRequestDTO.js';
import { CheckoutRequestDTO } from '../../../src/dto/pedido/CheckoutRequestDTO.js';
import { EnderecoDTO } from '../../../src/dto/pedido/EnderecoDTO.js';
import { ProdutoRequestDTO } from '../../../src/dto/ProdutoRequestDTO.js';
import { UsuarioUpdateDTO } from '../../../src/dto/UsuarioUpdateDTO.js';
import { primeiraViolacao } from '../../../src/validacao/restricoes.js';
import { RequisicaoInvalidaError } from '../../../src/web/erros.js';

// DTOs de requisicao: conversao do JSON (deJson) e restricoes de validacao (restricoes()).

/** "campo: Restricao" da primeira violacao do DTO, ou null se ele for valido. */
function violacao(dto) {
  const encontrada = primeiraViolacao(dto.restricoes());
  return encontrada && `${encontrada.campo}: ${encontrada.restricao.chave}`;
}

const ENDERECO = { cep: '01310-100', logradouro: 'Avenida Paulista', numero: '1000', bairro: 'Bela Vista', cidade: 'Sao Paulo' };
const ITEM = { produtoId: 1, quantidade: 2, observacao: 'sem cebola', adicionais: [1, 2] };
const CHECKOUT = { usuarioId: 1, formaPagamento: 'pix', endereco: ENDERECO, itens: [ITEM] };
const { usuarioId: _, ...CHECKOUT_SEM_USUARIO } = CHECKOUT;
const PRODUTO = { categoriaId: 1, nome: 'Bowl', descricao: 'Bowl da casa', preco: 39.9, imagemUrl: null, tempoPreparoMin: 20 };

describe('CategoriaRequestDTO', () => {
  it('exige nome com ate 60 caracteres', () => {
    assert.equal(violacao(CategoriaRequestDTO.deJson({ nome: 'Massas' })), null);
    assert.equal(violacao(CategoriaRequestDTO.deJson({})), 'nome: NotBlank');
    assert.equal(violacao(CategoriaRequestDTO.deJson({ nome: 'x'.repeat(61) })), 'nome: Size');
  });
});

describe('UsuarioUpdateDTO', () => {
  it('exige nome com ate 100 caracteres', () => {
    assert.equal(violacao(UsuarioUpdateDTO.deJson({ nome: 'Ana' })), null);
    assert.equal(violacao(UsuarioUpdateDTO.deJson({ nome: ' ' })), 'nome: NotBlank');
    assert.equal(violacao(UsuarioUpdateDTO.deJson({ nome: 'x'.repeat(101) })), 'nome: Size');
  });
});

describe('ProdutoRequestDTO', () => {
  it('converte os campos do JSON', () => {
    const dto = ProdutoRequestDTO.deJson({ ...PRODUTO, categoriaId: '3', preco: '39.90', tempoPreparoMin: 25.9 });

    assert.equal(dto.categoriaId, 3);
    assert.equal(dto.preco.toFixed(2), '39.90');
    assert.equal(dto.tempoPreparoMin, 25);
    assert.equal(violacao(dto), null);
  });

  it('aceita descricao, imagem e tempo de preparo ausentes', () => {
    const dto = ProdutoRequestDTO.deJson({ categoriaId: 1, nome: 'Bowl', preco: 10 });
    assert.equal(violacao(dto), null);
  });

  const invalidos = [
    ['sem categoria', { categoriaId: null }, 'categoriaId: NotNull'],
    ['nome em branco', { nome: '  ' }, 'nome: NotBlank'],
    ['nome longo', { nome: 'x'.repeat(101) }, 'nome: Size'],
    ['descricao longa', { descricao: 'x'.repeat(501) }, 'descricao: Size'],
    ['sem preco', { preco: null }, 'preco: NotNull'],
    ['preco zero', { preco: 0 }, 'preco: DecimalMin'],
    ['preco negativo', { preco: -1 }, 'preco: DecimalMin'],
    ['url da imagem longa', { imagemUrl: 'x'.repeat(256) }, 'imagemUrl: Size'],
    ['tempo de preparo zero', { tempoPreparoMin: 0 }, 'tempoPreparoMin: Min'],
  ];
  for (const [caso, campos, esperada] of invalidos) {
    it(`recusa ${caso}`, () => {
      assert.equal(violacao(ProdutoRequestDTO.deJson({ ...PRODUTO, ...campos })), esperada);
    });
  }

  it('recusa preco que nao e numero', () => {
    assert.throws(() => ProdutoRequestDTO.deJson({ ...PRODUTO, preco: 'caro' }), RequisicaoInvalidaError);
  });
});

describe('ItemRequestDTO', () => {
  it('converte os campos do JSON', () => {
    const dto = ItemRequestDTO.deJson({ produtoId: '1', quantidade: 2, observacao: 'sem cebola', adicionais: [1, '2'] });
    assert.deepEqual({ ...dto }, { produtoId: 1, quantidade: 2, observacao: 'sem cebola', adicionais: [1, 2] });
  });

  it('trata adicionais ausentes como lista vazia', () => {
    assert.deepEqual(ItemRequestDTO.deJson({ produtoId: 1, quantidade: 1 }).adicionaisOuVazio(), []);
  });

  it('exige produto e quantidade de pelo menos 1, e limita a observacao', () => {
    assert.equal(violacao(ItemRequestDTO.deJson({ quantidade: 1 })), 'produtoId: NotNull');
    assert.equal(violacao(ItemRequestDTO.deJson({ produtoId: 1 })), 'quantidade: NotNull');
    assert.equal(violacao(ItemRequestDTO.deJson({ produtoId: 1, quantidade: 0 })), 'quantidade: Min');
    assert.equal(violacao(ItemRequestDTO.deJson({ ...ITEM, observacao: 'x'.repeat(256) })), 'observacao: Size');
  });

  it('recusa adicionais que nao sao lista de ids', () => {
    assert.throws(() => ItemRequestDTO.deJson({ ...ITEM, adicionais: 1 }), RequisicaoInvalidaError);
    assert.throws(() => ItemRequestDTO.deJson({ ...ITEM, adicionais: ['farofa'] }), RequisicaoInvalidaError);
  });
});

describe('EnderecoDTO', () => {
  it('aceita CEP com ou sem hifen', () => {
    assert.equal(violacao(EnderecoDTO.deJson({ ...ENDERECO, cep: '01310-100' })), null);
    assert.equal(violacao(EnderecoDTO.deJson({ ...ENDERECO, cep: '01310100' })), null);
  });

  it('recusa CEP que nao tem 8 digitos', () => {
    for (const cep of ['0131010', '013101000', 'abcde-fgh', '01.310-100']) {
      assert.equal(violacao(EnderecoDTO.deJson({ ...ENDERECO, cep })), 'cep: Pattern', cep);
    }
  });

  it('guarda o CEP so com digitos', () => {
    assert.equal(EnderecoDTO.deJson(ENDERECO).cepSomenteDigitos(), '01310100');
  });

  it('exige todos os campos, com tamanho limitado', () => {
    assert.equal(violacao(EnderecoDTO.deJson({ ...ENDERECO, logradouro: '' })), 'logradouro: NotBlank');
    assert.equal(violacao(EnderecoDTO.deJson({ ...ENDERECO, logradouro: 'x'.repeat(151) })), 'logradouro: Size');
    assert.equal(violacao(EnderecoDTO.deJson({ ...ENDERECO, numero: 'x'.repeat(11) })), 'numero: Size');
    assert.equal(violacao(EnderecoDTO.deJson({ ...ENDERECO, bairro: undefined })), 'bairro: NotBlank');
    assert.equal(violacao(EnderecoDTO.deJson({ ...ENDERECO, cidade: 'x'.repeat(81) })), 'cidade: Size');
  });
});

describe('CheckoutRequestDTO', () => {
  it('converte o pedido completo', () => {
    const dto = CheckoutRequestDTO.deJson(CHECKOUT);

    assert.equal(dto.usuarioId, 1);
    assert.equal(dto.formaPagamento, 'pix');
    assert.ok(dto.endereco instanceof EnderecoDTO);
    assert.ok(dto.itens[0] instanceof ItemRequestDTO);
    assert.equal(violacao(dto), null);
  });

  it('aceita clienteId no lugar de usuarioId', () => {
    assert.equal(CheckoutRequestDTO.deJson({ ...CHECKOUT_SEM_USUARIO, clienteId: 7 }).usuarioId, 7);
  });

  it('usa o ultimo campo quando vierem usuarioId e clienteId', () => {
    assert.equal(CheckoutRequestDTO.deJson({ usuarioId: 1, clienteId: 2, ...CHECKOUT_SEM_USUARIO }).usuarioId, 2);
    assert.equal(CheckoutRequestDTO.deJson({ clienteId: 2, usuarioId: 1, ...CHECKOUT_SEM_USUARIO }).usuarioId, 1);
  });

  const invalidos = [
    ['sem usuario', { usuarioId: null }, 'usuarioId: NotNull'],
    ['sem forma de pagamento', { formaPagamento: ' ' }, 'formaPagamento: NotBlank'],
    ['sem endereco', { endereco: null }, 'endereco: NotNull'],
    ['sem itens', { itens: null }, 'itens: NotEmpty'],
    ['com lista de itens vazia', { itens: [] }, 'itens: NotEmpty'],
  ];
  for (const [caso, campos, esperada] of invalidos) {
    it(`recusa pedido ${caso}`, () => {
      assert.equal(violacao(CheckoutRequestDTO.deJson({ ...CHECKOUT, ...campos })), esperada);
    });
  }

  it('indica o caminho do campo invalido no endereco', () => {
    const dto = CheckoutRequestDTO.deJson({ ...CHECKOUT, endereco: { ...ENDERECO, cep: '123' } });
    assert.equal(violacao(dto), 'endereco.cep: Pattern');
  });

  it('indica o indice do item invalido', () => {
    const dto = CheckoutRequestDTO.deJson({ ...CHECKOUT, itens: [ITEM, { ...ITEM, quantidade: 0 }] });
    assert.equal(violacao(dto), 'itens[1].quantidade: Min');
  });

  it('recusa itens que nao sao lista e ids que nao sao numeros', () => {
    assert.throws(() => CheckoutRequestDTO.deJson({ ...CHECKOUT, itens: ITEM }), RequisicaoInvalidaError);
    assert.throws(() => CheckoutRequestDTO.deJson({ ...CHECKOUT, usuarioId: 'ana' }), RequisicaoInvalidaError);
  });
});
