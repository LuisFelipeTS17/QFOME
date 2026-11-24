import { Perfil } from '../model/enums/Perfil.js';
import { Usuario } from '../model/Usuario.js';
import { gerarHashDaSenha } from '../util/senha.js';

/**
 * Cria o primeiro administrador quando o banco ainda nao tem nenhum, ja que o cadastro pelo app
 * sempre gera o perfil CLIENTE. Devolve o usuario criado, ou null se nada foi feito.
 */
export function garantirAdministrador(usuarioRepository, { email, senha }) {
  if (usuarioRepository.existsByPerfil(Perfil.ADMIN)) return null;

  const emailNormalizado = email.trim().toLowerCase();
  if (usuarioRepository.existsByEmail(emailNormalizado)) {
    // Nao promove uma conta de cliente: quem se cadastrou com esse e-mail viraria administrador.
    console.warn(`Administrador nao criado: ${emailNormalizado} ja e uma conta de cliente. Defina outro ADMIN_EMAIL.`);
    return null;
  }

  return usuarioRepository.save(new Usuario({
    nome: 'Administrador QFOME',
    email: emailNormalizado,
    senha: gerarHashDaSenha(senha),
    perfil: Perfil.ADMIN,
  }));
}
