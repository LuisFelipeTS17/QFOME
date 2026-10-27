import { CheckoutRequestDTO } from '../dto/pedido/CheckoutRequestDTO.js';
import { corpoValidado } from '../web/requisicao.js';
import { criarRouter, metodoNaoSuportado } from '../web/rotas.js';

export function criarCheckoutController(checkoutService) {
  const router = criarRouter();

  router.route('/checkout')
    .post((req, res) => {
      const request = corpoValidado(req, CheckoutRequestDTO);
      res.status(201).json(checkoutService.fecharPedido(request));
    })
    .all(metodoNaoSuportado);

  return router;
}
