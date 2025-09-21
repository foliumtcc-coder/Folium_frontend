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
  localStorage.removeItem('accessToken');
}


export async function getUser() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/user/me`, {
      credentials: 'include', // ✅ necessário para cookies
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


