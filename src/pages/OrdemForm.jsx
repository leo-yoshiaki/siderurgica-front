import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Message from '../components/Message.jsx';
import { criarOrdem } from '../services/api.js';

const initialForm = {
  numeroOrdem: '',
  produto: '',
  linhaProducao: '',
  prioridade: '',
  quantidadeToneladas: '',
  dataPrevisao: '',
  observacao: '',
};

function montarMensagemErro(error) {
  const fields = error.response?.data?.fields;

  if (Array.isArray(fields) && fields.length > 0) {
    return fields.map((item) => `${item.field}: ${item.message}`).join(' | ');
  }

  return 'Nao foi possivel criar a ordem.';
}

function OrdemForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [erroApi, setErroApi] = useState('');
  const [salvando, setSalvando] = useState(false);

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setForm((valores) => ({ ...valores, [name]: value }));
  }

  function validar() {
    const novosErros = {};

    if (!form.numeroOrdem.trim()) {
      novosErros.numeroOrdem = 'Numero da ordem e obrigatorio.';
    }

    if (!form.produto.trim()) {
      novosErros.produto = 'Produto e obrigatorio.';
    }

    if (!form.linhaProducao.trim()) {
      novosErros.linhaProducao = 'Linha de producao e obrigatoria.';
    }

    if (!form.prioridade) {
      novosErros.prioridade = 'Prioridade e obrigatoria.';
    }

    if (!form.quantidadeToneladas) {
      novosErros.quantidadeToneladas = 'Quantidade em toneladas e obrigatoria.';
    } else if (Number(form.quantidadeToneladas) <= 0) {
      novosErros.quantidadeToneladas = 'Quantidade em toneladas deve ser maior que zero.';
    }

    if (!form.dataPrevisao) {
      novosErros.dataPrevisao = 'Data de previsao e obrigatoria.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function salvar(event) {
    event.preventDefault();
    setMensagem('');
    setErroApi('');

    if (!validar()) {
      return;
    }

    setSalvando(true);

    try {
      const ordem = await criarOrdem({
        ...form,
        quantidadeToneladas: Number(form.quantidadeToneladas),
      });
      setMensagem('Ordem criada com sucesso.');
      setForm(initialForm);
      setTimeout(() => navigate(`/ordens/${ordem.id}`), 600);
    } catch (error) {
      setErroApi(montarMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="form-page">
      <h1>Nova Ordem</h1>
      <p>Informe os dados basicos da ordem de producao.</p>

      <Message type="success">{mensagem}</Message>
      <Message type="error">{erroApi}</Message>

      <form className="form" onSubmit={salvar}>
        <label>
          Numero da ordem *
          <input name="numeroOrdem" value={form.numeroOrdem} onChange={atualizarCampo} />
          {erros.numeroOrdem && <span className="field-error">{erros.numeroOrdem}</span>}
        </label>

        <label>
          Produto *
          <input name="produto" value={form.produto} onChange={atualizarCampo} />
          {erros.produto && <span className="field-error">{erros.produto}</span>}
        </label>

        <label>
          Linha de producao *
          <input name="linhaProducao" value={form.linhaProducao} onChange={atualizarCampo} />
          {erros.linhaProducao && <span className="field-error">{erros.linhaProducao}</span>}
        </label>

        <label>
          Prioridade *
          <select name="prioridade" value={form.prioridade} onChange={atualizarCampo}>
            <option value="">Selecione</option>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
          </select>
          {erros.prioridade && <span className="field-error">{erros.prioridade}</span>}
        </label>

        <label>
          Quantidade em toneladas *
          <input
            name="quantidadeToneladas"
            type="number"
            min="0.001"
            step="0.001"
            value={form.quantidadeToneladas}
            onChange={atualizarCampo}
          />
          {erros.quantidadeToneladas && (
            <span className="field-error">{erros.quantidadeToneladas}</span>
          )}
        </label>

        <label>
          Data de previsao *
          <input
            name="dataPrevisao"
            type="date"
            value={form.dataPrevisao}
            onChange={atualizarCampo}
          />
          {erros.dataPrevisao && <span className="field-error">{erros.dataPrevisao}</span>}
        </label>

        <label>
          Observacao
          <textarea name="observacao" value={form.observacao} onChange={atualizarCampo} />
        </label>

        <div className="actions">
          <button className="primary" type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate('/ordens')}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

export default OrdemForm;
