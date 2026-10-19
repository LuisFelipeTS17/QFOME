import { Perfil } from '../model/enums/Perfil.js';
import { Usuario } from '../model/Usuario.js';
import { isBlank, trim } from '../util/texto.js';
import { comoObjeto, comoString } from '../web/conversao.js';
import { lerCorpoJson } from '../web/requisicao.js';
import { criarRouter, metodoNaoSuportado } from '../web/rotas.js';

export function criarAuthController(usuarioRepository) {
  const router = criarRouter();

  router.route('/auth/register')
    .post((req, res) => {
      const body = mapaDeTextos(lerCorpoJson(req));
      const nome = body.name;
      const email = body.email;
      const senha = body.password;

      if (nome == null || isBlank(nome) || email == null || isBlank(email) || senha == null || isBlank(senha)) {
        return responderTexto(req, res, 400, 'Nome, e-mail e senha sao obrigatorios');
      }

      const emailNormalizado = trim(email).toLowerCase();

      const usuario = new Usuario({
        nome: trim(nome),
        email: emailNormalizado,
        senha,
        perfil: Perfil.CLIENTE,
      });

      const violacao = usuario.violacao();
      if (violacao) {
        return responderTexto(req, res, 400, mensagemDeCadastroInvalido(violacao));
      }

      if (usuarioRepository.existsByEmail(emailNormalizado)) {
        return responderTexto(req, res, 409, 'E-mail ja cadastrado');
      }

      return res.json(resposta(usuarioRepository.save(usuario), 'Conta criada com sucesso'));
    })
    .all(metodoNaoSuportado);

  router.route('/auth/login')
    .post((req, res) => {
      const body = mapaDeTextos(lerCorpoJson(req));
      const email = body.email;
      const senha = body.password;

      if (email == null || isBlank(email) || senha == null || isBlank(senha)) {
        return responderTexto(req, res, 400, 'E-mail e senha sao obrigatorios');
      }

      const usuario = usuarioRepository.findByEmail(trim(email).toLowerCase());
      if (usuario && usuario.senha === senha) {
        return res.json(resposta(usuario, 'Login realizado com sucesso'));
      }
      return responderTexto(req, res, 401, 'Usuario ou senha invalidos');
    })
    .all(metodoNaoSuportado);

  return router;
}

const ROTULOS = { nome: 'Nome', email: 'E-mail', senha: 'Senha' };

// Mensagens no mesmo estilo das demais falhas do cadastro (texto puro, em portugues).
function mensagemDeCadastroInvalido({ campo, restricao }) {
  if (restricao.chave === 'Email') return 'E-mail invalido';
  if (restricao.chave === 'Size') return `${ROTULOS[campo]} deve ter no maximo ${restricao.args.max} caracteres`;
  return 'Nome, e-mail e senha sao obrigatorios';
}

// Chaves "name"/"email" mantidas para o site, que ja consome esse formato.
function resposta(usuario, mensagem) {
  return {
    id: usuario.id,
    name: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    message: mensagem,
  };
}

// @RequestBody Map<String, String>: todo valor tem que virar texto.
function mapaDeTextos(corpo) {
  return Object.fromEntries(Object.entries(comoObjeto(corpo)).map(([chave, valor]) => [chave, comoString(valor)]));
}

// Corpo String no Spring: sai como text/plain, ou como application/json (o texto puro) se o cliente preferir JSON.
function responderTexto(req, res, status, texto) {
  const tipo = req.accepts(['text/plain', 'application/json']) === 'application/json'
    ? 'application/json'
    : 'text/plain;charset=UTF-8';
  return res.status(status).type(tipo).send(texto);
}
