import { AdminLoginRequestDTO } from '../dto/AdminLoginRequestDTO.js';
import { UsuarioDTO } from '../dto/UsuarioDTO.js';
import { paraJson } from '../util/datas.js';
import { tokenDaRequisicao } from '../web/autenticacao.js';
import { corpoValidado } from '../web/requisicao.js';
import { criarRouter, metodoNaoSuportado } from '../web/rotas.js';

/** Login administrativo e exportacao dos pedidos em JSON. O CRUD de pratos fica em /produtos. */
export function criarAdminController(adminService, relatorioService, exigirAdmin) {
  const router = criarRouter();

  router.route('/admin/login')
    .post((req, res) => {
      const { email, password } = corpoValidado(req, AdminLoginRequestDTO);
      res.set('Cache-Control', 'no-store').json(adminService.entrar(email, password));
    })
    .all(metodoNaoSuportado);

  router.route('/admin/sessao')
    .get(exigirAdmin, (req, res) => {
      const { usuario, expiraEm } = req.admin;
      res.json({ usuario: new UsuarioDTO(usuario), expiraEm: paraJson(expiraEm) });
    })
    .all(metodoNaoSuportado);

  router.route('/admin/logout')
    .post((req, res) => {
      adminService.sair(tokenDaRequisicao(req));
      res.status(204).end();
    })
    .all(metodoNaoSuportado);

  router.route('/admin/relatorios/pedidos/exportar')
    .post(exigirAdmin, (req, res) => {
      res.status(201).json(relatorioService.exportar({ usuarioId: req.admin.usuario.id, origem: 'ADMIN' }));
    })
    .all(metodoNaoSuportado);

  router.route('/admin/exportacoes')
    .get(exigirAdmin, (req, res) => {
      res.json(relatorioService.listarExportacoes());
    })
    .all(metodoNaoSuportado);

  return router;
}
