const BASE_URL = 'http://localhost:5203/api';

// Salva o token após login
export const salvarToken = (token) => {
  localStorage.setItem('token', token);
};

export const getToken = () => localStorage.getItem('token');

export const removerToken = () => localStorage.removeItem('token');

// Toda chamada autenticada passa por aqui
export const apiFetch = async (rota, opcoes = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opcoes.headers,
  };

  const resposta = await fetch(`${BASE_URL}${rota}`, {
    ...opcoes,
    headers,
  });

  if (resposta.status === 401) {
    removerToken();
    window.location.href = '/'; // redireciona para login se token expirou
  }

  return resposta;
};