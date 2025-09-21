export const BACKEND_URL = 'https://folium-backend.onrender.com';

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

export async function register(name, email, password, confipassword) {
  return postData('/api/auth/register', { name, email, password, confipassword });
}

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

export async function confirmCode(code) {
  return postData('/api/auth/confirm', { code });
}

export async function logout() {
  localStorage.removeItem('accessToken'); // remove token
}

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


