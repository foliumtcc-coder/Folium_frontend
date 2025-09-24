// src/js/api.js
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
  localStorage.setItem('accessToken', data.accessToken);
  return data.user;
}

// Confirmar código
export async function confirmCode(code) {
  return postData('/api/auth/confirm', { code });
}

// Logout
export function logout() {
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
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

  const res = await fetch(`${BACKEND_URL}/api/auth/projects/create`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text;
}

// Aceitar convite
export async function acceptInvite(projetoId) {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Usuário não logado');

  const res = await fetch(`${BACKEND_URL}/api/auth/projects/${projetoId}/accept`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Erro ao aceitar convite');
  }

  return res.json();
}

// Buscar notificações
export async function fetchNotifications() {
  const token = localStorage.getItem('accessToken');
  if (!token) return [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/notifications/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error('Erro ao buscar notificações');
    return await res.json();
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
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error('Erro ao marcar notificação como lida');
  } catch (err) {
    console.error(err);
  }
}

// Buscar perfil de usuário por id
export async function getUserProfile(id) {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Usuário não logado');

  const res = await fetch(`${BACKEND_URL}/api/auth/profile/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return await res.json(); // { user: {...}, projects: [...] }
}

// Buscar projeto completo por id
export async function getProjectById(id) {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Usuário não logado');

  const res = await fetch(`${BACKEND_URL}/api/auth/projects/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  return await res.json(); // { projeto: {...}, etapas: [...], membros: [...] }
}

// Atualizar projeto
export async function updateProject(projectId, formData) {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (!token) throw new Error('Usuário não autenticado');

  const res = await fetch(`${BACKEND_URL}/api/auth/projects/${projectId}`, {
    method: 'PUT', // <--- aqui deve ser PUT
    headers: {
      'Authorization': `Bearer ${token}`
      // NÃO setar Content-Type para FormData
    },
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Erro ao atualizar projeto');
  }

  return await res.json(); // { projeto: {...} }
}


// Atualizar perfil do usuário
export async function updateUserProfile(formData) {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Usuário não logado');

  const res = await fetch(`${BACKEND_URL}/api/auth/profile/me`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

if (!res.ok) {
  let errorMsg;
  try {
    const errJson = await res.json();
    errorMsg = errJson.error || JSON.stringify(errJson);
  } catch {
    errorMsg = await res.text();
  }
  throw new Error(errorMsg || 'Erro ao atualizar projeto');
}

  return await res.json(); // { message: "...", user: {...} }
}

// --- Deletar projeto (com etapas e arquivos em cascata) ---
export async function createEtapa(projetoId, nome, descricao, arquivos = []) {
  const { user } = await getUser();
  if (!user) throw new Error('Usuário não logado');

  const formData = new FormData();
  formData.append('projeto_id', projetoId);
  formData.append('nome_etapa', nome);
  formData.append('descricao_etapa', descricao);

  arquivos.forEach((arquivo) => {
    formData.append('arquivos', arquivo);
  });

  const res = await fetch(`${BACKEND_URL}/etapas/create`, { // ✅ URL corrigida
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Erro ao criar etapa');
  return await res.json();
}




// Buscar projetos de um usuário específico (perfil)
// Retorna os projetos de um usuário usando getUserProfile
export async function getUserProjects(userId) {
  if (!userId) throw new Error('ID do usuário não informado');

  try {
    const data = await getUserProfile(userId);
    return data.projects ?? [];
  } catch (err) {
    console.error('Erro ao buscar projetos do usuário:', err);
    throw err;
  }
}

// --- Criar etapa ---
export async function createEtapa(projetoId, nome, descricao, arquivos = []) {
  const { user } = await getUser();
  if (!user) throw new Error('Usuário não logado');

  const formData = new FormData();
  formData.append('projeto_id', projetoId);
  formData.append('nome_etapa', nome);
  formData.append('descricao_etapa', descricao);

  arquivos.forEach(arquivo => {
    formData.append('arquivos', arquivo); // <-- todos arquivos usam mesmo nome
  });

  const res = await fetch(`${BACKEND_URL}/etapas/create`, { // <-- endpoint correto
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Erro ao criar etapa');
  return await res.json();
}

// --- Listar etapas de um projeto ---
export async function getEtapasByProjeto(projetoId) {
  const res = await fetch(`${BACKEND_URL}/etapas/projeto/${projetoId}`);
  if (!res.ok) throw new Error('Erro ao listar etapas');
  return await res.json(); // Deve retornar array de etapas
}

// --- Editar etapa ---
export async function updateEtapa(etapaId, nome, descricao, arquivos = []) {
  const formData = new FormData();
  formData.append('nome_etapa', nome);
  formData.append('descricao_etapa', descricao);

  arquivos.forEach(arquivo => {
    formData.append('arquivos', arquivo); // <-- corrigido
  });

  const res = await fetch(`${BACKEND_URL}/etapas/update`, {
    method: 'PUT',
    body: formData,
  });

  if (!res.ok) throw new Error('Erro ao atualizar etapa');
  return await res.json();
}

// --- Deletar etapa ---
export async function deleteEtapa(etapaId) {
  const res = await fetch(`${BACKEND_URL}/etapas/delete/${etapaId}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Erro ao deletar etapa');
  return await res.json();
}

// --- Adicionar arquivos à etapa existente ---
export async function addArquivosEtapa(etapaId, arquivos = []) {
  const formData = new FormData();
  arquivos.forEach(arquivo => {
    formData.append('arquivos', arquivo); // <-- corrigido
  });

  const res = await fetch(`${BACKEND_URL}/etapas/${etapaId}/arquivos`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Erro ao adicionar arquivos');
  return await res.json();
}

// --- Deletar arquivo de uma etapa ---
export async function deleteArquivoEtapa(arquivoId) {
  const res = await fetch(`${BACKEND_URL}/etapa-arquivos/${arquivoId}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Erro ao deletar arquivo da etapa');
  return await res.json();
}

export async function deleteProject(projectId) {
  if (!projectId) throw new Error('ID do projeto não informado');

  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (!token) throw new Error('Usuário não autenticado');

  const res = await fetch(`${BACKEND_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Erro ao deletar projeto');
  }

  return await res.json();
}
