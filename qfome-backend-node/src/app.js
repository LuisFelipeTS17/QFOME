import express from 'express';

import { criarTransacao } from './config/banco.js';
import { criarCors } from './config/cors.js';
import { tratadorDeErros } from './config/tratadorDeErros.js';
import { criarActuatorController, ehEndpointDoActuator } from './controller/ActuatorController.js';
import { criarAdminController } from './controller/AdminController.js';
import { criarAuthController } from './controller/AuthController.js';
import { criarCarrinhoController } from './controller/CarrinhoController.js';
import { criarCategoriaController } from './controller/CategoriaController.js';
import { criarCheckoutController } from './controller/CheckoutController.js';
import { criarClienteController } from './controller/ClienteController.js';
import { criarPagamentoController } from './controller/pedido/PagamentoController.js';
import { criarPedidoAcompanhamentoController } from './controller/pedido/PedidoAcompanhamentoController.js';
import { criarProdutoController } from './controller/ProdutoController.js';
import { criarRelatorioController } from './controller/RelatorioController.js';
import { CarrinhoRepository } from './repository/CarrinhoRepository.js';
import { CategoriaRepository } from './repository/CategoriaRepository.js';
import { ExportacaoRepository } from './repository/ExportacaoRepository.js';
import { PedidoRepository } from './repository/PedidoRepository.js';
import { ProdutoRepository } from './repository/ProdutoRepository.js';
import { SessaoAdminRepository } from './repository/SessaoAdminRepository.js';
import { UsuarioRepository } from './repository/UsuarioRepository.js';
import { AdminService } from './service/AdminService.js';
import { CarrinhoService } from './service/CarrinhoService.js';
import { CategoriaService } from './service/CategoriaService.js';
import { CheckoutService } from './service/pedido/CheckoutService.js';
import { PagamentoService } from './service/pedido/PagamentoService.js';
import { PedidoAcompanhamentoService } from './service/pedido/PedidoAcompanhamentoService.js';
import { ProdutoService } from './service/ProdutoService.js';
import { RelatorioService } from './service/RelatorioService.js';
import { criarExigirAdmin } from './web/autenticacao.js';
import { rotaNaoEncontrada } from './web/rotas.js';

/** Monta a aplicacao (o que o Spring faz por injecao de dependencia) sobre um banco ja aberto. */
export function criarApp({ db, config }) {
  const transacao = criarTransacao(db);

  const usuarioRepository = new UsuarioRepository(db);
  const categoriaRepository = new CategoriaRepository(db);
  const produtoRepository = new ProdutoRepository(db);
  const carrinhoRepository = new CarrinhoRepository(db);
  const pedidoRepository = new PedidoRepository(db);
  const sessaoAdminRepository = new SessaoAdminRepository(db);
  const exportacaoRepository = new ExportacaoRepository(db);

  const categoriaService = new CategoriaService(categoriaRepository, transacao);
  const produtoService = new ProdutoService(produtoRepository, categoriaService, transacao);
  const carrinhoService = new CarrinhoService(carrinhoRepository, usuarioRepository, produtoService, transacao);
  const checkoutService = new CheckoutService(pedidoRepository, usuarioRepository, produtoService, transacao);
  const pedidoAcompanhamentoService = new PedidoAcompanhamentoService(pedidoRepository);
  const pagamentoService = new PagamentoService(pedidoRepository, usuarioRepository, config);
  const relatorioService = new RelatorioService(pedidoRepository, usuarioRepository, exportacaoRepository, config);
  const adminService = new AdminService(usuarioRepository, sessaoAdminRepository, config.admin);
  const exigirAdmin = criarExigirAdmin(adminService);

  const app = express();
  app.disable('x-powered-by');
  // O Spring nao gera ETag; com ele o navegador poderia receber 304 em vez dos dados.
  app.set('etag', false);

  // O CORS do WebMvcConfigurer nao vale para o actuator, que tem configuracao propria (vazia).
  // O preflight e respondido aqui; as demais requisicoes passam pelo CORS ao chegar na rota (web/rotas.js).
  const cors = criarCors(config.cors, { semCors: ehEndpointDoActuator });
  app.set('cors', cors.requisicao);
  app.use(cors.preflight);
  // Corpo cru: cada @RequestBody valida o Content-Type e le o JSON (web/requisicao.js).
  app.use(express.raw({ type: () => true, limit: '10mb' }));

  app.use(criarActuatorController(db, config.health));
  app.use(criarAuthController(usuarioRepository));
  app.use(criarAdminController(adminService, relatorioService, exigirAdmin));
  app.use(criarCategoriaController(categoriaService, exigirAdmin));
  app.use(criarProdutoController(produtoService, exigirAdmin));
  app.use(criarClienteController(usuarioRepository));
  app.use(criarCarrinhoController(carrinhoService));
  app.use(criarCheckoutController(checkoutService));
  app.use(criarPedidoAcompanhamentoController(pedidoAcompanhamentoService));
  app.use(criarPagamentoController(pagamentoService));
  app.use(criarRelatorioController(relatorioService));

  app.use(rotaNaoEncontrada);
  app.use(tratadorDeErros);

  return app;
}
