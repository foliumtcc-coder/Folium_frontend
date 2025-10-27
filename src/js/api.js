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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  const data = await res.json(); // <-- transforma a resposta em JSON
  return data; // agora retorna { id: ..., titulo: ..., ... }
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

export async function createEtapa(projetoId, nome, descricao, arquivos) {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (!token) throw new Error('Usuário não autenticado');

  const formData = new FormData();
  formData.append('projeto_id', projetoId);
  formData.append('nome', nome);
  formData.append('descricao', descricao);

  if (arquivos && arquivos.length > 0) {
    arquivos.forEach(file => formData.append('arquivos', file));
  }

  const res = await fetch(`${BACKEND_URL}/api/auth/etapas/create`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Erro ao criar etapa');
  }

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

// --- Listar etapas de um projeto ---

export async function getEtapasByProjeto(projetoId) {
  if (!projetoId) throw new Error('ID do projeto não informado');

  try {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

    // Faz a requisição ao backend
    const res = await fetch(`${BACKEND_URL}/api/auth/etapas/projeto/${projetoId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erro ao listar etapas');
    }

    const data = await res.json();

    // Certifica que data.etapas existe e tem arquivos
    const etapas = Array.isArray(data.etapas) ? data.etapas : [];
    const etapasCompletas = etapas.map(etapa => ({
      ...etapa,
      arquivos: Array.isArray(etapa.arquivos) ? etapa.arquivos : []
    }));

    return { etapas: etapasCompletas };
  } catch (err) {
    console.error('[API] Erro ao buscar etapas:', err);
    throw err;
  }
}


// --- Editar etapa ---
export async function updateEtapa(etapaId, nome, descricao) {
  const formData = new FormData();
  formData.append('nome', nome);
  formData.append('descricao', descricao);

  const res = await fetch(`${BACKEND_URL}/api/auth/etapas/update/${etapaId}`, {
    method: 'PUT',
    body: formData
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erro ao atualizar etapa: ${text}`);
  }

  return await res.json();
}


// --- Deletar etapa ---
export async function deleteEtapa(etapaId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/etapas/delete/${etapaId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Erro ao deletar etapa');
    return await res.json();
  } catch(err) {
    console.error(err);
    throw err;
  }
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

  const res = await fetch(`${BACKEND_URL}/api/auth/projects/${projectId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Erro ao deletar projeto');
  }

  return await res.json();
}

function renderStep(etapa) {
  const div = document.createElement('div');
  div.className = 'step';
  div.dataset.etapaId = etapa.id;

  const stepDate = new Date(etapa.criado_em || Date.now()).toLocaleDateString();

  div.innerHTML = `
    <div class="step-header">
      <div class="step-header-text">
        <span class="step-name">${etapa.nome || 'Sem nome'}</span>
        <span class="step-date">${stepDate}</span>
      </div>
      <div class="step-actions">
        <button class="edit-step-btn">✎</button>
        <button class="delete-step-btn">🗑️</button>
      </div>
    </div>
    <div class="section-line"></div>
    <div class="step-main-content">${etapa.descricao || ''}</div>
    <div class="section-line"></div>
    <div class="step-footer">
      ${etapa.arquivos?.map(file => `
        <div class="step-docs">
          <span class="fa-solid fa-file file-icon"></span>
          <span class="file-text">${file.nome || file.name}</span>
        </div>
      `).join('') || ''}
    </div>
  `;

  // ações de editar/deletar
  div.querySelector('.edit-step-btn')?.addEventListener('click', () => openEditStepPopup(etapa));
  div.querySelector('.delete-step-btn')?.addEventListener('click', async () => {
    if (confirm(`Deseja realmente deletar a etapa "${etapa.nome || 'Sem nome'}"?`)) {
      try {
        await deleteEtapa(etapa.id);
        div.remove();
        alert('Etapa deletada com sucesso!');
      } catch(err) {
        console.error(err);
        alert('Erro ao deletar etapa.');
      }
    }
  });

  const etapasContainer = document.querySelector('.etapas-container');
  if (etapasContainer) etapasContainer.appendChild(div);

  return div;
}

// Função para baixar arquivo via backend
// api.js
export async function downloadFile(arquivoId, nomeArquivo) {
  try {
    // Remove verificação de token
    const res = await fetch(`${BACKEND_URL}/api/auth/download/${arquivoId}`);

    if (!res.ok) throw new Error(`Erro ao baixar arquivo: ${res.status}`);

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo || 'arquivo';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Erro ao baixar arquivo:', err);
    alert(err.message);
  }
}
