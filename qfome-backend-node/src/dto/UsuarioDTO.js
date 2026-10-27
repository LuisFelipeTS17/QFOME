export class UsuarioDTO {
  constructor(usuario) {
    this.id = usuario.id;
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.perfil = usuario.perfil;
  }
}
