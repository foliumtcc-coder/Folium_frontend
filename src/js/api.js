export const BACKEND_URL = 'https://folium-backend.onrender.com';

// Função auxiliar para POST com JSON
async function postData(endpoint, data) {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text);
  return text;
}

// Registro de usuário
export async function register(name, email, password, confipassword) {
  return postData('/api/auth/register', { name, email, password, confipassword });
}

// Login
export async function login(email, password) {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken); // salva o token
  return data.user;
}

// Confirmar código
export async function confirmCode(code) {
  return postData('/api/auth/confirm', { code });
}

// Logout
export async function logout() {
  try {
    // se tiver endpoint de logout no backend
    await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });

    // remove token do localStorage
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
  } catch (err) {
    console.error('Erro ao fazer logout:', err);
  }
}

// Buscar usuário logado
export async function getUser() {
  const token = localStorage.getItem('accessToken');
  if (!token) return { user: null };

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/user/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) return { user: null };

    const json = await res.json();
    return { user: json.user || null };
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    return { user: null };
  }
}

// Criar projeto
export async function createProject(formData) {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Usuário não logado');

  const res = await fetch(`${BACKEND_URL}/api/auth/projects/create`, { // rota corrigida
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}` // FormData não precisa de Content-Type
    },
    body: formData
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
}

// Buscar notificações do usuário logado
export async function fetchNotifications() {
  const token = localStorage.getItem('accessToken');
  if (!token) return [];

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/notifications/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Erro ao buscar notificações');

    const data = await res.json(); // [{id, mensagem, read}]
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Marcar notificação como lida
export async function markNotificationAsRead(id) {
  const token = localStorage.getItem('accessToken');
  if (!token) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/notifications/read/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Erro ao marcar notificação como lida');
  } catch (err) {
    console.error(err);
  }
}
