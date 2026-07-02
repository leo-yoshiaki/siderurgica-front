import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import Message from '../components/Message.jsx';
import { listarOrdens } from '../services/api.js';

const emptyFilters = {
  status: '',
  produto: '',
};

function normalizarResposta(data) {
  if (Array.isArray(data)) {
    return { ordens: data, totalPaginas: 1 };
  }

  return {
    ordens: data?.items || data?.content || data?.ordens || [],
    totalPaginas: data?.totalPages || data?.totalPaginas || 1,
  };
}

function OrdemLista() {
  const [ordens, setOrdens] = useState([]);
  const [filtros, setFiltros] = useState(emptyFilters);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function carregarOrdens() {
    setLoading(true);
    setErro('');

    try {
      const data = await listarOrdens({
        page: pagina,
        status: filtros.status || undefined,
        produto: filtros.produto || undefined,
      });
      const resposta = normalizarResposta(data);
      setOrdens(resposta.ordens);
      setTotalPaginas(resposta.totalPaginas);
    } catch (error) {
      setErro('Nao foi possivel carregar as ordens.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarOrdens();
  }, [pagina]);

  function atualizarFiltro(event) {
    const { name, value } = event.target;
    setFiltros((valores) => ({ ...valores, [name]: value }));
  }

  function aplicarFiltros(event) {
    event.preventDefault();
    setPagina(0);
    carregarOrdens();
  }

  function limparFiltros() {
    setFiltros(emptyFilters);
    setPagina(0);
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Ordens de Producao</h1>
          <p>Consulte, filtre e acompanhe as ordens cadastradas.</p>
        </div>
        <Link className="button primary" to="/ordens/nova">
          Nova Ordem
        </Link>
      </div>

      <form className="filters" onSubmit={aplicarFiltros}>
        <label>
          Status
          <select name="status" value={filtros.status} onChange={atualizarFiltro}>
            <option value="">Todos</option>
            <option value="ABERTA">Aberta</option>
            <option value="EM_PRODUCAO">Em producao</option>
            <option value="CONCLUIDA">Concluida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </label>

        <label>
          Produto
          <input
            name="produto"
            value={filtros.produto}
            onChange={atualizarFiltro}
            placeholder="Nome do produto"
          />
        </label>

        <div className="filter-actions">
          <button type="submit">Filtrar</button>
          <button type="button" onClick={limparFiltros}>
            Limpar
          </button>
        </div>
      </form>

      <Message type="error">{erro}</Message>
      {loading ? (
        <Loading />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Numero</th>
                <th>Produto</th>
                <th>Linha</th>
                <th>Prioridade</th>
                <th>Toneladas</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {ordens.length === 0 ? (
                <tr>
                  <td colSpan="8">Nenhuma ordem encontrada.</td>
                </tr>
              ) : (
                ordens.map((ordem) => (
                  <tr key={ordem.id}>
                    <td>{ordem.id}</td>
                    <td>{ordem.numeroOrdem || '-'}</td>
                    <td>{ordem.produto}</td>
                    <td>{ordem.linhaProducao || '-'}</td>
                    <td>{ordem.prioridade || '-'}</td>
                    <td>{ordem.quantidadeToneladas ?? ordem.quantidade}</td>
                    <td>{ordem.status}</td>
                    <td>
                      <Link to={`/ordens/${ordem.id}`}>Detalhes</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button type="button" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
          Anterior
        </button>
        <span>
          Pagina {pagina} de {totalPaginas}
        </span>
        <button
          type="button"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina(pagina + 1)}
        >
          Proxima
        </button>
      </div>
    </section>
  );
}

export default OrdemLista;
