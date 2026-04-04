import { getToken } from '../api/api';

const BASE_URL = 'http://localhost:5203/api';

export const uploadService = {
  uploadImagemPrato: async (arquivo) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    const token = getToken();

    const res = await fetch(`${BASE_URL}/Upload/imagem-prato`, {
      method: 'POST',
      headers: {
        // NÃO coloca Content-Type aqui — o browser define automaticamente
        // com o boundary correto para multipart/form-data
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!res.ok) {
      const erro = await res.text();
      throw new Error(erro || 'Erro ao fazer upload.');
    }

    return res.json(); // retorna { url: "/img/pratos/prato-uuid.jpg" }
  },
};