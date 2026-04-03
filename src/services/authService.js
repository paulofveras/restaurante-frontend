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

    // O backend serializa o enum como string por causa do JsonStringEnumConverter.
    // dados.usuario.perfil chega como "Usuario" ou "Administrador"
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

  // Verdadeiro apenas se o perfil for exatamente "Administrador"
  isAdmin() {
    const usuario = this.getUsuarioLogado();
    return usuario?.perfil === 'Administrador';
  },

  // Verdadeiro se for o perfil padrão de cliente ("Usuario" = enum 0)
  isCliente() {
    const usuario = this.getUsuarioLogado();
    return usuario?.perfil === 'Usuario';
  },

  isLogado() {
    return this.getUsuarioLogado() !== null;
  },
};