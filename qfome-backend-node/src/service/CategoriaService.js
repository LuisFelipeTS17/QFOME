import { CategoriaDTO } from '../dto/CategoriaDTO.js';
import { Categoria } from '../model/Categoria.js';
import { trim } from '../util/texto.js';
import { ResponseStatusError } from '../web/erros.js';

export class CategoriaService {
  constructor(categoriaRepository, transacao) {
    this.categoriaRepository = categoriaRepository;
    this.transacao = transacao;
  }

  listarTodas() {
    return this.categoriaRepository.findAllByOrderByIdAsc().map((categoria) => new CategoriaDTO(categoria));
  }

  buscarPorId(id) {
    return new CategoriaDTO(this.buscarEntidade(id));
  }

  criar(dto) {
    return this.transacao(() => {
      const nome = trim(dto.nome);
      if (this.categoriaRepository.existsByNomeIgnoreCase(nome)) {
        throw new ResponseStatusError(409, 'Ja existe uma categoria com esse nome');
      }
      return new CategoriaDTO(this.categoriaRepository.save(new Categoria({ nome })));
    });
  }

  atualizar(id, dto) {
    return this.transacao(() => {
      const categoria = this.buscarEntidade(id);
      categoria.nome = trim(dto.nome);
      return new CategoriaDTO(this.categoriaRepository.save(categoria));
    });
  }

  deletar(id) {
    this.transacao(() => this.categoriaRepository.delete(this.buscarEntidade(id)));
  }

  buscarEntidade(id) {
    const categoria = this.categoriaRepository.findById(id);
    if (!categoria) throw new ResponseStatusError(404, 'Categoria nao encontrada');
    return categoria;
  }
}
