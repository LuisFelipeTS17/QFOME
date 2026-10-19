import { CategoriaRequestDTO } from '../dto/CategoriaRequestDTO.js';
import { parametroLong } from '../web/conversao.js';
import { corpoValidado } from '../web/requisicao.js';
import { criarRouter, metodoNaoSuportado } from '../web/rotas.js';

export function criarCategoriaController(categoriaService) {
  const router = criarRouter();

  router.route('/categorias')
    .get((req, res) => {
      res.json(categoriaService.listarTodas());
    })
    .post((req, res) => {
      const dto = corpoValidado(req, CategoriaRequestDTO);
      res.status(201).json(categoriaService.criar(dto));
    })
    .all(metodoNaoSuportado);

  router.route('/categorias/:id')
    .get((req, res) => {
      res.json(categoriaService.buscarPorId(parametroLong(req.params.id)));
    })
    .put((req, res) => {
      const id = parametroLong(req.params.id);
      const dto = corpoValidado(req, CategoriaRequestDTO);
      res.json(categoriaService.atualizar(id, dto));
    })
    .delete((req, res) => {
      categoriaService.deletar(parametroLong(req.params.id));
      res.status(204).end();
    })
    .all(metodoNaoSuportado);

  return router;
}
