import { ProdutoRequestDTO } from '../dto/ProdutoRequestDTO.js';
import { parametroLong, primeiroValor } from '../web/conversao.js';
import { corpoValidado } from '../web/requisicao.js';
import { criarRouter, metodoNaoSuportado } from '../web/rotas.js';

export function criarProdutoController(produtoService) {
  const router = criarRouter();

  router.route('/produtos')
    .get((req, res) => {
      // ?categoria={id} opcional
      const categoria = parametroLong(primeiroValor(req.query.categoria));
      res.json(produtoService.listar(categoria));
    })
    .post((req, res) => {
      const dto = corpoValidado(req, ProdutoRequestDTO);
      res.status(201).json(produtoService.criar(dto));
    })
    .all(metodoNaoSuportado);

  router.route('/produtos/:id')
    .get((req, res) => {
      res.json(produtoService.buscarPorId(parametroLong(req.params.id)));
    })
    .put((req, res) => {
      const id = parametroLong(req.params.id);
      const dto = corpoValidado(req, ProdutoRequestDTO);
      res.json(produtoService.atualizar(id, dto));
    })
    .delete((req, res) => {
      produtoService.deletar(parametroLong(req.params.id));
      res.status(204).end();
    })
    .all(metodoNaoSuportado);

  return router;
}
