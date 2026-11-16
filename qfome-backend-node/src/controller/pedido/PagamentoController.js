import { PagamentoRequestDTO } from '../../dto/pedido/PagamentoRequestDTO.js';
import { corpoValidado } from '../../web/requisicao.js';
import { criarRouter, metodoNaoSuportado } from '../../web/rotas.js';

export function criarPagamentoController(pagamentoService) {
  const router = criarRouter();

  router.route('/pagamentos/mercadopago')
    .post(async (req, res) => {
      const request = corpoValidado(req, PagamentoRequestDTO);
      res.status(201).json(await pagamentoService.pagarComMercadoPago(request.codigo));
    })
    .all(metodoNaoSuportado);

  return router;
}
