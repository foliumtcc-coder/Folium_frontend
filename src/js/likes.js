import { getUser } from './api.js'; // seu método que retorna o usuário logado

const BACKEND_URL = 'https://folium-backend.onrender.com'; // ajuste se necessário

// ✅ Verificar se o usuário já deu like
export async function fetchProjectLikes(projetoId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/likes/${projetoId}/count`);
    if (!res.ok) throw new Error('Erro ao buscar likes');
    return await res.json(); // { projeto_id, likes }
  } catch (err) {
    console.error(err);
    return { projeto_id: projetoId, likes: 0 };
  }
}

// ✅ Dar/remover like
export async function toggleLike(projetoId) {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Usuário não logado');

  try {
    const res = await fetch(`${BACKEND_URL}/api/likes/${projetoId}`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao dar/remover like');
    }

    return await res.json(); // { liked: true/false, message, inserted/deleted }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// ✅ Renderizar botão de like
export function initLikeButton(buttonSelector, likesCountSelector, projetoId) {
  const button = document.querySelector(buttonSelector);
  const likesCounter = document.querySelector(likesCountSelector);

  async function refreshLikes() {
    const { likes } = await fetchProjectLikes(projetoId);
    likesCounter.textContent = likes;
  }

  button.addEventListener('click', async () => {
    try {
      const result = await toggleLike(projetoId);

      // Atualiza visual do botão
      if (result.liked) {
        button.classList.add('liked');
      } else {
        button.classList.remove('liked');
      }

      // Atualiza contador
      await refreshLikes();
    } catch (err) {
      console.error('Erro ao atualizar like:', err);
    }
  });

  // Inicializa contador
  refreshLikes();
}
