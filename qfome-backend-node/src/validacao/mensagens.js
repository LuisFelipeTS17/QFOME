import { MENSAGENS_PADRAO } from './mensagensPadrao.js';

// Locale padrao da JVM onde o backend Spring rodava. Vale quando o cliente nao manda
// Accept-Language ou pede um idioma sem traducao.
const LOCALE_PADRAO = { idioma: 'pt', pais: 'BR' };

/**
 * Mensagem da restricao no idioma do cliente. Como no Spring, o idioma vem do Accept-Language
 * e a busca segue a do ResourceBundle do Java: pt_BR -> pt -> arquivo base (ingles).
 */
export function mensagemDe(restricao, acceptLanguage) {
  if (restricao.mensagem) return restricao.mensagem;
  const modelo = arquivosDoLocale(localeDaRequisicao(acceptLanguage))
    .map((arquivo) => MENSAGENS_PADRAO[arquivo][restricao.chave])
    .find((mensagem) => mensagem !== undefined);
  return modelo.replace(/\{(\w+)\}/g, (trecho, nome) => (nome in restricao.args ? String(restricao.args[nome]) : trecho));
}

// Request.getLocale() do Tomcat: o idioma de maior q (o primeiro, no empate).
function localeDaRequisicao(acceptLanguage) {
  const opcoes = (acceptLanguage ?? '')
    .split(',')
    .map((parte, ordem) => {
      const [tag, ...parametros] = parte.split(';').map((p) => p.trim());
      const q = parametros.find((p) => p.startsWith('q='));
      return { tag, q: q === undefined ? 1 : Number(q.slice(2)), ordem };
    })
    .filter(({ tag, q }) => tag && q > 0)
    .sort((a, b) => b.q - a.q || a.ordem - b.ordem);

  if (opcoes.length === 0) return LOCALE_PADRAO;
  const [idioma, ...subtags] = opcoes[0].tag.split('-');
  // Tag invalida (ou "*") vira o Locale.ROOT, sem idioma.
  if (!/^[a-z]{2,8}$/i.test(idioma)) return { idioma: '', pais: '' };
  const pais = subtags.slice(0, 2).find((subtag) => /^([a-z]{2}|\d{3})$/i.test(subtag)) ?? '';
  return { idioma: idioma.toLowerCase(), pais: pais.toUpperCase() };
}

// Arquivos de mensagens consultados, em ordem. Se o idioma nao tem traducao, o Java cai no
// locale padrao antes do arquivo base.
function arquivosDoLocale({ idioma, pais }) {
  const candidatos = [pais && `${idioma}_${pais}`, idioma].filter((arquivo) => arquivo && arquivo in MENSAGENS_PADRAO);
  if (candidatos.length > 0) return [...candidatos, ''];
  if (!idioma) return [''];
  return arquivosDoLocale(LOCALE_PADRAO);
}
