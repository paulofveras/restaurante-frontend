import { salvarToken, removerToken } from '../api/api';

const BASE_URL = 'http://localhost:5203/api';

export const authService = {
  async login(email, password) {
    const resposta = await fetch(`${BASE_URL}/usuario/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        passwordHasher: password
      }),
    });

    if (!resposta.ok) throw new Error('Email ou senha incorretos.');

    const dados = await resposta.json();
    salvarToken(dados.token);

    // Salva os dados do usuário no localStorage também
    localStorage.setItem('usuario', JSON.stringify(dados.usuario));

    return dados;
  },

  logout() {
    removerToken();
    localStorage.removeItem('usuario');
  },

  getUsuarioLogado() {
    const dados = localStorage.getItem('usuario');
    return dados ? JSON.parse(dados) : null;
  },

  isAdmin() {
    const usuario = this.getUsuarioLogado();
    return usuario?.perfil === 'Administrador';
  },
};