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
  return postData('/api/auth/login', { email, password, rememberMe });
}

export async function confirmCode(code) {
  return postData('/api/auth/confirm', { code });
}

export async function logout() {
  return postData('/api/auth/logout', {});
}

export async function getUser() {
  const res = await fetch(`${BACKEND_URL}/api/auth/user/me`, {
    credentials: 'include'
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Erro ao buscar usuário');
  return json;
}
