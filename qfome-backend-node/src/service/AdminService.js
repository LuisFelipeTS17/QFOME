import { createHash, randomBytes } from 'node:crypto';

import { UsuarioDTO } from '../dto/UsuarioDTO.js';
import { Perfil } from '../model/enums/Perfil.js';
import { paraBanco, paraJson } from '../util/datas.js';
import { senhaConfere } from '../util/senha.js';
import { trim } from '../util/texto.js';
import { ResponseStatusError } from '../web/erros.js';

/**
 * Login administrativo. O token devolvido no login vai no cabecalho Authorization das rotas
 * protegidas; no banco fica so o hash dele, com a data de expiracao.
 */
export class AdminService {
  constructor(usuarioRepository, sessaoAdminRepository, { sessaoMinutos }) {
    this.usuarioRepository = usuarioRepository;
    this.sessaoAdminRepository = sessaoAdminRepository;
    this.sessaoMinutos = sessaoMinutos;
  }

  entrar(email, senha) {
    const usuario = this.usuarioRepository.findByEmail(trim(email).toLowerCase());
    if (!usuario || !senhaConfere(senha, usuario.senha)) {
      throw new ResponseStatusError(401, 'E-mail ou senha invalidos');
    }
    if (usuario.perfil !== Perfil.ADMIN) {
      throw new ResponseStatusError(403, 'Acesso restrito a administradores');
    }

    const agora = new Date();
    this.sessaoAdminRepository.deleteExpiradas(paraBanco(agora));

    const token = randomBytes(32).toString('base64url');
    const sessao = this.sessaoAdminRepository.save({
      usuarioId: usuario.id,
      tokenHash: hashDoToken(token),
      criadoEm: paraBanco(agora),
      expiraEm: paraBanco(new Date(agora.getTime() + this.sessaoMinutos * 60_000)),
    });
    return { token, expiraEm: paraJson(sessao.expiraEm), usuario: new UsuarioDTO(usuario) };
  }

  /** Confere o token de uma requisicao e devolve o administrador; senao, 401. */
  autenticar(token) {
    const sessao = token ? this.sessaoAdminRepository.findByTokenHash(hashDoToken(token)) : null;
    if (!sessao) throw new ResponseStatusError(401, 'Login administrativo necessario');

    if (sessao.expiraEm <= paraBanco(new Date())) {
      this.sessaoAdminRepository.deleteByTokenHash(sessao.tokenHash);
      throw new ResponseStatusError(401, 'Sessao expirada. Entre novamente.');
    }

    // O perfil e conferido de novo: ele pode ter mudado depois do login.
    const usuario = this.usuarioRepository.findById(sessao.usuarioId);
    if (usuario?.perfil !== Perfil.ADMIN) throw new ResponseStatusError(401, 'Login administrativo necessario');

    return { usuario, expiraEm: sessao.expiraEm };
  }

  sair(token) {
    if (token) this.sessaoAdminRepository.deleteByTokenHash(hashDoToken(token));
  }
}

function hashDoToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
