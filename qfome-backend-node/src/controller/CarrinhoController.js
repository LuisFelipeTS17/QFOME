import { ItemRequestDTO } from '../dto/ItemRequestDTO.js';
import { parametroInteger, parametroLong } from '../web/conversao.js';
import { corpoValidado, parametroObrigatorio } from '../web/requisicao.js';
import { criarRouter, metodoNaoSuportado } from '../web/rotas.js';

export function criarCarrinhoController(carrinhoService) {
  const router = criarRouter();

  router.route('/carrinho/:usuarioId')
    .get((req, res) => {
      res.json(carrinhoService.buscar(parametroLong(req.params.usuarioId)));
    })
    .all(metodoNaoSuportado);

  router.route('/carrinho/:usuarioId/itens')
    .post((req, res) => {
      const usuarioId = parametroLong(req.params.usuarioId);
      const dto = corpoValidado(req, ItemRequestDTO);
      res.json(carrinhoService.adicionarItem(usuarioId, dto));
    })
    .all(metodoNaoSuportado);

  router.route('/carrinho/:usuarioId/itens/:itemId')
    .patch((req, res) => {
      const usuarioId = parametroLong(req.params.usuarioId);
      const itemId = parametroLong(req.params.itemId);
      const quantidade = parametroObrigatorio(req, 'quantidade', parametroInteger);
      res.json(carrinhoService.atualizarItem(usuarioId, itemId, quantidade));
    })
    .delete((req, res) => {
      const usuarioId = parametroLong(req.params.usuarioId);
      const itemId = parametroLong(req.params.itemId);
      res.json(carrinhoService.removerItem(usuarioId, itemId));
    })
    .all(metodoNaoSuportado);

  router.route('/carrinho/:usuarioId/limpar')
    .delete((req, res) => {
      carrinhoService.limpar(parametroLong(req.params.usuarioId));
      res.status(204).end();
    })
    .all(metodoNaoSuportado);

  return router;
}
