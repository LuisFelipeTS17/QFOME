import { criarRouter, metodoNaoSuportado } from '../web/rotas.js';

export function criarRelatorioController(relatorioService) {
  const router = criarRouter();

  // Consulta usada pelo dashboard em Python quando o backend esta no ar.
  router.route('/relatorios/pedidos')
    .get((req, res) => {
      res.json(relatorioService.montarRelatorio());
    })
    .all(metodoNaoSuportado);

  // Botao "Exportar dados" do app: gera data/exports/pedidos.json no servidor.
  router.route('/relatorios/pedidos/exportar')
    .post((req, res) => {
      res.status(201).json(relatorioService.exportar());
    })
    .all(metodoNaoSuportado);

  return router;
}
