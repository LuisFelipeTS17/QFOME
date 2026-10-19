import { parametroLong } from '../../web/conversao.js';
import { criarRouter, metodoNaoSuportado } from '../../web/rotas.js';

export function criarPedidoAcompanhamentoController(pedidoAcompanhamentoService) {
  const router = criarRouter();

  router.route('/pedidos/cliente/:usuarioId')
    .get((req, res) => {
      res.json(pedidoAcompanhamentoService.buscarHistoricoPorUsuario(parametroLong(req.params.usuarioId)));
    })
    .all(metodoNaoSuportado);

  router.route('/pedidos/acompanhar/:codigo')
    .get((req, res) => {
      res.json(pedidoAcompanhamentoService.acompanharPedidoPorCodigo(req.params.codigo));
    })
    .all(metodoNaoSuportado);

  return router;
}
