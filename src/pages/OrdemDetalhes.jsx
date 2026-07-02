import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import Message from '../components/Message.jsx';
import {
  alterarStatusOrdem,
  buscarOrdem,
  cadastrarOcorrencia,
  listarHistoricoOrdem,
  listarOcorrenciasOrdem,
  resolverOcorrencia,
} from '../services/api.js';

const USUARIO_LOGADO = 'Usuario_logado';

const ocorrenciaInicial = {
  descricao: '',
  responsavel: '',
  tipo: '',
  severidade: '',
};

function normalizarLista(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.items || data?.content || data?.historico || data?.ocorrencias || [];
}

function OrdemDetalhes() {
  const { id } = useParams();
  const [ordem, setOrdem] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [statusForm, setStatusForm] = useState({
    novoStatus: '',
    justificativa: '',
  });
  const [ocorrencia, setOcorrencia] = useState(ocorrenciaInicial);
  const [loading, setLoading] = useState(true);
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [salvandoOcorrencia, setSalvandoOcorrencia] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  function montarMensagemErro(error, mensagemPadrao) {
    const fields = error.response?.data?.fields;

    if (Array.isArray(fields) && fields.length > 0) {
      return fields.map((item) => `${item.field}: ${item.message}`).join(' | ');
    }

    return mensagemPadrao;
  }

  async function carregarOrdem() {
    setLoading(true);
    setErro('');

    try {
      const [data, historicoData, ocorrenciasData] = await Promise.all([
        buscarOrdem(id),
        listarHistoricoOrdem(id),
        listarOcorrenciasOrdem(id),
      ]);

      setOrdem(data);
      setHistorico(normalizarLista(historicoData));
      setOcorrencias(normalizarLista(ocorrenciasData));
      setStatusForm((valores) => ({
        ...valores,
        novoStatus: data.status === 'ABERTA' ? 'EM_PRODUCAO' : data.status || '',
      }));
    } catch (error) {
      setErro('Nao foi possivel carregar a ordem.');
    } finally {
      setLoading(false);
    }
  }

  async function carregarHistoricoEOcorrencias() {
    const [historicoData, ocorrenciasData] = await Promise.all([
      listarHistoricoOrdem(id),
      listarOcorrenciasOrdem(id),
    ]);

    setHistorico(normalizarLista(historicoData));
    setOcorrencias(normalizarLista(ocorrenciasData));
  }

  useEffect(() => {
    carregarOrdem();
  }, [id]);

  async function salvarStatus(event) {
    event.preventDefault();
    setMensagem('');
    setErro('');

    if (!statusForm.novoStatus) {
      setErro('Selecione um status.');
      return;
    }

    if (statusForm.justificativa.length > 1000) {
      setErro('Justificativa deve ter no maximo 1000 caracteres.');
      return;
    }

    setSalvandoStatus(true);

    try {
      await alterarStatusOrdem(id, {
        novoStatus: statusForm.novoStatus,
        usuario: USUARIO_LOGADO,
        justificativa: statusForm.justificativa.trim() || undefined,
      });
      setMensagem('Status alterado com sucesso.');
      await carregarOrdem();
    } catch (error) {
      setErro(montarMensagemErro(error, 'Nao foi possivel alterar o status.'));
    } finally {
      setSalvandoStatus(false);
    }
  }

  async function salvarOcorrencia(event) {
    event.preventDefault();
    setMensagem('');
    setErro('');

    if (!ocorrencia.descricao.trim()) {
      setErro('Descreva a ocorrencia.');
      return;
    }

    if (!ocorrencia.responsavel.trim()) {
      setErro('Informe o responsavel.');
      return;
    }

    if (!ocorrencia.tipo.trim()) {
      setErro('Informe o tipo da ocorrencia.');
      return;
    }

    if (!ocorrencia.severidade) {
      setErro('Selecione a severidade.');
      return;
    }

    setSalvandoOcorrencia(true);

    try {
      await cadastrarOcorrencia(id, {
        descricao: ocorrencia.descricao.trim(),
        responsavel: ocorrencia.responsavel.trim(),
        tipo: ocorrencia.tipo.trim(),
        severidade: ocorrencia.severidade,
      });
      setOcorrencia(ocorrenciaInicial);
      setMensagem('Ocorrencia cadastrada com sucesso.');
      await carregarHistoricoEOcorrencias();
    } catch (error) {
      setErro(montarMensagemErro(error, 'Nao foi possivel cadastrar a ocorrencia.'));
    } finally {
      setSalvandoOcorrencia(false);
    }
  }

  async function resolver(idOcorrencia) {
    setMensagem('');
    setErro('');

    try {
      await resolverOcorrencia(idOcorrencia);
      setMensagem('Ocorrencia resolvida com sucesso.');
      await carregarHistoricoEOcorrencias();
    } catch (error) {
      setErro('Nao foi possivel resolver a ocorrencia.');
    }
  }

  if (loading) {
    return <Loading />;
  }

  if (!ordem) {
    return (
      <section>
        <Message type="error">{erro || 'Ordem nao encontrada.'}</Message>
        <Link to="/ordens">Voltar</Link>
      </section>
    );
  }

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Ordem #{ordem.id}</h1>
          <p>Detalhes, historico e ocorrencias da ordem.</p>
        </div>
        <Link className="button" to="/ordens">
          Voltar
        </Link>
      </div>

      <Message type="success">{mensagem}</Message>
      <Message type="error">{erro}</Message>

      <div className="details-grid">
        <div className="panel">
          <h2>Dados da ordem</h2>
          <dl>
            <dt>Numero</dt>
            <dd>{ordem.numeroOrdem || '-'}</dd>
            <dt>Produto</dt>
            <dd>{ordem.produto}</dd>
            <dt>Linha</dt>
            <dd>{ordem.linhaProducao || '-'}</dd>
            <dt>Prioridade</dt>
            <dd>{ordem.prioridade || '-'}</dd>
            <dt>Toneladas</dt>
            <dd>{ordem.quantidadeToneladas ?? ordem.quantidade}</dd>
            <dt>Status</dt>
            <dd>{ordem.status}</dd>
            <dt>Previsao</dt>
            <dd>{ordem.dataPrevisao || ordem.previsao || '-'}</dd>
            <dt>Observacao</dt>
            <dd>{ordem.observacao || '-'}</dd>
          </dl>
        </div>

        <form className="panel" onSubmit={salvarStatus}>
          <h2>Alterar status</h2>
          <label>
            Novo status
            <select
              value={statusForm.novoStatus}
              onChange={(event) =>
                setStatusForm((valores) => ({ ...valores, novoStatus: event.target.value }))
              }
            >
              <option value="">Selecione</option>
              <option value="EM_PRODUCAO">Em producao</option>
              <option value="CONCLUIDA">Concluida</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </label>
          <div className="readonly-field">
            <span>Usuario</span>
            <strong>{USUARIO_LOGADO}</strong>
          </div>
          <label>
            Justificativa
            <textarea
              maxLength="1000"
              value={statusForm.justificativa}
              onChange={(event) =>
                setStatusForm((valores) => ({ ...valores, justificativa: event.target.value }))
              }
            />
          </label>
          <button className="primary" type="submit" disabled={salvandoStatus}>
            {salvandoStatus ? 'Salvando...' : 'Alterar status'}
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Historico</h2>
        {historico.length === 0 ? (
          <p>Nenhum historico registrado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data alteracao</th>
                <th>Status anterior</th>
                <th>Status novo</th>
                <th>Usuario</th>
                <th>Justificativa</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((item) => (
                <tr key={item.id}>
                  <td>{item.dataAlteracao || '-'}</td>
                  <td>{item.statusAnterior || '-'}</td>
                  <td>{item.statusNovo || '-'}</td>
                  <td>{item.usuario || '-'}</td>
                  <td>{item.justificativa || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2>Ocorrencias</h2>
        <form className="occurrence-form" onSubmit={salvarOcorrencia}>
          <label>
            Descricao
            <input
              value={ocorrencia.descricao}
              onChange={(event) =>
                setOcorrencia((valores) => ({ ...valores, descricao: event.target.value }))
              }
            />
          </label>
          <label>
            Responsavel
            <input
              value={ocorrencia.responsavel}
              onChange={(event) =>
                setOcorrencia((valores) => ({ ...valores, responsavel: event.target.value }))
              }
            />
          </label>
          <label>
            Tipo
            <input
              value={ocorrencia.tipo}
              onChange={(event) =>
                setOcorrencia((valores) => ({ ...valores, tipo: event.target.value }))
              }
            />
          </label>
          <label>
            Severidade
            <select
              value={ocorrencia.severidade}
              onChange={(event) =>
                setOcorrencia((valores) => ({ ...valores, severidade: event.target.value }))
              }
            >
              <option value="">Selecione</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>
          </label>
          <button type="submit" disabled={salvandoOcorrencia}>
            {salvandoOcorrencia ? 'Salvando...' : 'Cadastrar'}
          </button>
        </form>

        {ocorrencias.length === 0 ? (
          <p>Nenhuma ocorrencia registrada.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Descricao</th>
                <th>Responsavel</th>
                <th>Tipo</th>
                <th>Severidade</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {ocorrencias.map((item) => (
                <tr key={item.id}>
                  <td>{item.descricao}</td>
                  <td>{item.responsavel || '-'}</td>
                  <td>{item.tipo || '-'}</td>
                  <td>{item.severidade || '-'}</td>
                  <td>{item.resolvida ? 'Resolvida' : 'Aberta'}</td>
                  <td>
                    {!item.resolvida && (
                      <button type="button" onClick={() => resolver(item.id)}>
                        Resolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default OrdemDetalhes;
