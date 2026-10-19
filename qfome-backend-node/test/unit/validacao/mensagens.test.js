import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mensagemDe } from '../../../src/validacao/mensagens.js';
import { DecimalMinExclusivo, Min, NotBlank, Pattern, Size } from '../../../src/validacao/restricoes.js';

describe('mensagemDe', () => {
  describe('idioma da mensagem', () => {
    it('usa portugues do Brasil quando o cliente nao informa o idioma', () => {
      assert.equal(mensagemDe(NotBlank, undefined), 'não deve estar em branco');
      assert.equal(mensagemDe(NotBlank, ''), 'não deve estar em branco');
    });

    it('usa a traducao especifica do pais antes da do idioma', () => {
      assert.equal(mensagemDe(Min(1), 'pt-BR'), 'deve ser maior que ou igual à 1');
      assert.equal(mensagemDe(Size(60), 'pt-PT'), 'tamanho deve estar entre 0 e 60');
    });

    it('cai na traducao do idioma quando o pais nao tem a mensagem', () => {
      assert.equal(mensagemDe(NotBlank, 'pt-PT'), 'não deve estar em branco');
    });

    it('usa o idioma pedido pelo cliente', () => {
      assert.equal(mensagemDe(NotBlank, 'en-US'), 'must not be blank');
      assert.equal(mensagemDe(NotBlank, 'es'), 'no debe estar vacío');
      assert.equal(mensagemDe(NotBlank, 'fr-CA'), 'ne doit pas être vide');
    });

    it('cai em portugues do Brasil quando o idioma nao tem traducao', () => {
      assert.equal(mensagemDe(NotBlank, 'xx'), 'não deve estar em branco');
    });

    it('usa o arquivo base (ingles) para o curinga *', () => {
      assert.equal(mensagemDe(NotBlank, '*'), 'must not be blank');
    });
  });

  describe('preferencia no Accept-Language', () => {
    it('escolhe o idioma de maior peso (q)', () => {
      assert.equal(mensagemDe(NotBlank, 'en;q=0.5, es;q=0.9'), 'no debe estar vacío');
    });

    it('no empate, escolhe o primeiro da lista', () => {
      assert.equal(mensagemDe(NotBlank, 'es, en'), 'no debe estar vacío');
    });

    it('ignora idiomas com peso zero', () => {
      assert.equal(mensagemDe(NotBlank, 'es;q=0, en'), 'must not be blank');
    });
  });

  describe('argumentos da mensagem', () => {
    it('preenche os limites do Size', () => {
      assert.equal(mensagemDe(Size(100), 'en'), 'size must be between 0 and 100');
    });

    it('preenche o valor minimo do DecimalMin', () => {
      assert.equal(mensagemDe(DecimalMinExclusivo('0.0'), 'pt-BR'), 'deve ser maior que 0.0');
    });
  });

  it('usa a mensagem propria da restricao, sem traduzir', () => {
    const cep = Pattern(/^\d{8}$/, 'deve ter 8 digitos');
    assert.equal(mensagemDe(cep, 'en'), 'deve ter 8 digitos');
  });
});
