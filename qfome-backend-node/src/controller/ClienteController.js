import { UsuarioDTO } from '../dto/UsuarioDTO.js';
import { UsuarioUpdateDTO } from '../dto/UsuarioUpdateDTO.js';
import { trim } from '../util/texto.js';
import { parametroLong } from '../web/conversao.js';
import { ResponseStatusError } from '../web/erros.js';
import { corpoValidado } from '../web/requisicao.js';
import { criarRouter, metodoNaoSuportado } from '../web/rotas.js';

export function criarClienteController(usuarioRepository) {
  const router = criarRouter();

  router.route('/clientes/:id')
    .get((req, res) => {
      const usuario = usuarioRepository.findById(parametroLong(req.params.id));
      if (!usuario) throw new ResponseStatusError(404, 'Usuario nao encontrado');
      res.json(new UsuarioDTO(usuario));
    })
    .put((req, res) => {
      const id = parametroLong(req.params.id);
      const dto = corpoValidado(req, UsuarioUpdateDTO);
      const usuario = usuarioRepository.findById(id);
      if (!usuario) throw new ResponseStatusError(404, 'Usuario nao encontrado');
      usuario.nome = trim(dto.nome);
      res.json(new UsuarioDTO(usuarioRepository.save(usuario)));
    })
    .delete((req, res) => {
      const id = parametroLong(req.params.id);
      if (!usuarioRepository.existsById(id)) {
        throw new ResponseStatusError(404, 'Usuario nao encontrado');
      }
      usuarioRepository.deleteById(id);
      res.status(204).end();
    })
    .all(metodoNaoSuportado);

  return router;
}
