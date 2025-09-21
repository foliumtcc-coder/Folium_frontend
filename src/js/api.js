export const BACKEND_URL = 'https://folium-backend.onrender.com';

async function postData(endpoint, data) {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include', // ESSENCIAL para manter sessão
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

export async function login(email, password, rememberMe) {
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  const data = await response.json();

  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken); // 🔑 salva token
  }

  return data;
}


export async function confirmCode(code) {
  return postData('/api/auth/confirm', { code });
}

export async function logout() {
  localStorage.removeItem('accessToken');
}


export async function getUser() {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return { user: null };

    const res = await fetch(`${BACKEND_URL}/api/auth/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) return { user: null };

    const json = await res.json();
    return { user: json.user || null };
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    return { user: null };
  }
}



