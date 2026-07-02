import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

export async function listarOrdens(params) {
  const response = await api.get('/api/ordens', { params });
  return response.data;
}

export async function buscarOrdem(id) {
  const response = await api.get(`/api/ordens/${id}`);
  return response.data;
}

export async function listarHistoricoOrdem(id) {
  const response = await api.get(`/api/ordens/${id}/historico`);
  return response.data;
}

export async function listarOcorrenciasOrdem(id) {
  const response = await api.get(`/api/ordens/${id}/ocorrencias`);
  return response.data;
}

export async function criarOrdem(dados) {
  const response = await api.post('/api/ordens', dados);
  return response.data;
}

export async function alterarStatusOrdem(id, dados) {
  const response = await api.put(`/api/ordens/${id}/status`, dados);
  return response.data;
}

export async function cadastrarOcorrencia(id, dados) {
  const response = await api.post(`/api/ordens/${id}/ocorrencias`, dados);
  return response.data;
}

export async function resolverOcorrencia(id) {
  const response = await api.put(`/api/ocorrencias/${id}/resolver`);
  return response.data;
}

export default api;
