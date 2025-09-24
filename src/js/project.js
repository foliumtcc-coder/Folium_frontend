import { 
  getUser, 
  getProjectById, 
  updateProject, 
  deleteProject, 
  createEtapa, 
  updateEtapa, 
  deleteEtapa,
  getEtapasByProjeto
} from './api.js';

// --- Pega o projetoId da URL ---
function getProjetoIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// --- Setup genérico de popup ---
function setupPopup(popupId, innerHTML) {
  let popup = document.getElementById(popupId);
  if (!popup) {
    popup = document.createElement('div');
    popup.id = popupId;
    popup.className = 'popup hidden';
    document.body.appendChild(popup);
  }
  popup.innerHTML = innerHTML;

  const content = popup.querySelector('.popup-content');
  if (!content) return;

  const closePopup = () => {
    popup.classList.add('hidden');
    document.removeEventListener('mousedown', onClickOutside);
  };

  const closeBtn = popup.querySelector('.close-popup');
  if (closeBtn) closeBtn.addEventListener('click', closePopup);

  const onClickOutside = e => {
    if (!content.contains(e.target)) closePopup();
  };

  setTimeout(() => {
    if (!popup.classList.contains('hidden')) {
      document.addEventListener('mousedown', onClickOutside);
    }
  }, 0);

  popup.classList.remove('hidden');
  return popup;
}

// --- Renderiza uma etapa individual ---
function renderStep(etapa) {
  const div = document.createElement('div');
  div.className = 'step';
  div.dataset.etapaId = etapa.id;

  const stepDate = new Date(etapa.criado_em || Date.now()).toLocaleDateString();

  div.innerHTML = `
    <div class="step-header">
      <div class="step-header-text">
        <span class="step-name">${etapa.nome_etapa || 'Sem nome'}</span>
        <span class="step-date">${stepDate}</span>
      </div>
      <div class="step-actions">
        <button class="edit-step-btn">✎</button>
        <button class="delete-step-btn">🗑️</button>
      </div>
    </div>
    <div class="section-line"></div>
    <div class="step-main-content">${etapa.descricao_etapa || 'Espaço para texto.'}</div>
    <div class="section-line"></div>
<div class="step-footer">
  ${etapa.arquivos?.map(file => `
    <div class="step-docs">
      <span class="fa-solid fa-file file-icon"></span>
      <a href="${file.caminho_arquivo}" target="_blank" class="file-text">${file.nome_arquivo || 'arquivo.doc'}</a>
    </div>
  `).join('') || ''}
</div>
  `;

  // Botões de ação
  div.querySelector('.edit-step-btn')?.addEventListener('click', () => openEditStepPopup(etapa));
  div.querySelector('.delete-step-btn')?.addEventListener('click', async () => {
    if (confirm(`Deseja realmente deletar a etapa "${etapa.nome_etapa}"?`)) {
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

  return div;
}

// --- Carrega projeto completo ---
async function loadProject() {
  try {
    const projetoId = getProjetoIdFromURL();
    if (!projetoId) return alert('ID do projeto não encontrado na URL.');

    const { user } = await getUser();
    if (!user) return window.location.href = '/login.html';

    const data = await getProjectById(projetoId);
    if (!data || !data.projeto) return alert('Projeto não encontrado.');

    const projeto = data.projeto;
    const membros = Array.isArray(data.membros) ? data.membros : [];
    const isOwner = Number(user.id) === Number(projeto.criado_por);
    const isMember = membros.some(m => m.usuario_id === user.id || m.usuarios?.id === user.id);

    // Header
    const headerText = document.querySelector('.main-header-text');
    if (headerText) headerText.textContent = projeto.titulo;

    // Dropdown 3 pontos
    const header = document.querySelector('.main-header');
    if (header) {
      let dropdownBtn = document.getElementById('project-dropdown-btn');
      if (!dropdownBtn) {
        dropdownBtn = document.createElement('div');
        dropdownBtn.id = 'project-dropdown-btn';
        dropdownBtn.className = 'dropdown';
        dropdownBtn.innerHTML = `
          <button class="dropbtn">⋮</button>
          <div class="dropdown-content">
            <a href="#" id="edit-project-option">Editar Projeto</a>
            <a href="#" id="add-step-option">Adicionar Etapa</a>
            <a href="#" id="delete-project-option">Deletar Projeto</a>
          </div>
        `;
        header.appendChild(dropdownBtn);
      }

      const editOpt = document.getElementById('edit-project-option');
      const addStepOpt = document.getElementById('add-step-option');
      const deleteOpt = document.getElementById('delete-project-option');

      if (editOpt) {
        editOpt.style.display = isOwner ? 'block' : 'none';
        if (isOwner) editOpt.onclick = () => openEditPopup(projeto, membros);
      }
      if (addStepOpt) {
        addStepOpt.style.display = (isOwner || isMember) ? 'block' : 'none';
        if (isOwner || isMember) addStepOpt.onclick = () => openAddStepPopup();
      }
      if (deleteOpt) {
        deleteOpt.style.display = isOwner ? 'block' : 'none';
        if (isOwner) deleteOpt.onclick = () => openDeletePopup(projeto);
      }
    }

    // Datas e descrição
    const menuDate = document.querySelector('.menu-header-date');
    if (menuDate) menuDate.innerHTML = `
      <span>Publicado em: ${new Date(projeto.criado_em).toLocaleDateString()}</span><br>
      <span>Atualizado por último em: ${projeto.atualizado_em ? new Date(projeto.atualizado_em).toLocaleDateString() : "Nunca"}</span>
    `;

    const menuDesc = document.querySelector('.menu-desc');
    if (menuDesc) menuDesc.innerHTML = `<h2>Descrição</h2><p>${projeto.descricao || 'Sem descrição'}</p>`;

    // Membros
    const sideMenu = document.querySelector('.menu-header-people');
    if (sideMenu) {
      sideMenu.innerHTML = `<h2>Membros</h2>`;
      membros.forEach(m => {
        const userId = m.usuario_id || m.usuarios?.id;
        const userName = m.usuarios?.name1 || "Sem nome";
        if (!userId) return;
        const a = document.createElement('a');
        a.href = `/profile-page.html?id=${userId}`;
        a.innerHTML = `<span class="fa-solid fa-circle-user"></span> ${userName}`;
        sideMenu.appendChild(a);
      });
    }

    // --- Carrega e renderiza etapas com arquivos ---
    const etapasContainer = document.querySelector('.etapas-container');
    if (etapasContainer) {
      etapasContainer.innerHTML = '';

 const etapasData = await getEtapasByProjeto(projetoId);
const etapas = Array.isArray(etapasData.etapas) ? etapasData.etapas : [];

for (const etapa of etapas.sort((a, b) => a.numero_etapa - b.numero_etapa)) {
  const el = renderStep(etapa);
  etapasContainer.appendChild(el);
}

    }

  } catch (err) {
    console.error('Erro ao carregar projeto:', err);
    alert('Erro ao carregar projeto.');
  }
}
// --- POPUPS ---

// Editar projeto
function openEditPopup(projeto, membros) {
  const innerHTML = `
    <div class="popup-content">
      <button class="close-popup">&times;</button>
      <form id="edit-project-form" enctype="multipart/form-data">
        <label>Título:</label>
        <input type="text" id="edit-title" value="${projeto.titulo}" required>
        <label>Descrição:</label>
        <textarea id="edit-desc" required>${projeto.descricao || ""}</textarea>
        <label>Membros:</label>
        <div id="members-list" style="margin-bottom:10px;">
          ${membros.map(m => m.usuarios?.email ? `<div class="member-item" data-email="${m.usuarios.email}">${m.usuarios.email} <button type="button" class="remove-member-btn">&times;</button></div>` : '').join('')}
        </div>
        <input type="text" id="new-member-email" placeholder="Adicionar email" style="width:70%;">
        <button type="button" id="add-member-btn">Adicionar</button>
        <label>Projeto Público:</label>
        <input type="checkbox" id="edit-publico" ${projeto.publico ? "checked" : ""}>
        <label>Imagem do Projeto:</label>
        <input type="file" id="edit-image" accept="image/*">
        <img id="image-preview" src="${projeto.imagem || './src/img/icons/project-image2.png'}" style="max-width:100%; margin-top:10px; display:block;" />
        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  `;
  const popup = setupPopup('edit-project-popup', innerHTML);

  const membersList = document.getElementById('members-list');
  const newMemberInput = document.getElementById('new-member-email');
  const addMemberBtn = document.getElementById('add-member-btn');

  function createMemberItem(email) {
    const div = document.createElement('div');
    div.className = 'member-item';
    div.dataset.email = email;
    div.innerHTML = `${email} <button type="button" class="remove-member-btn">&times;</button>`;
    div.querySelector('.remove-member-btn').addEventListener('click', () => div.remove());
    return div;
  }

  addMemberBtn.addEventListener('click', () => {
    const email = newMemberInput.value.trim();
    if (!email) return;
    if ([...membersList.children].some(c => c.dataset.email === email)) {
      alert('Email já está na lista!');
      return;
    }
    membersList.appendChild(createMemberItem(email));
    newMemberInput.value = '';
  });

  const imageInput = document.getElementById('edit-image');
  const imagePreview = document.getElementById('image-preview');
  imageInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => imagePreview.src = reader.result;
      reader.readAsDataURL(file);
    }
  });

  const form = document.getElementById('edit-project-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', document.getElementById('edit-title').value.trim());
    formData.append('descricao', document.getElementById('edit-desc').value.trim());
    formData.append('membros', [...membersList.children].map(c=>c.dataset.email).join(','));
    formData.append('publico', document.getElementById('edit-publico').checked);
    if (imageInput.files[0]) formData.append('imagem', imageInput.files[0]);
    try {
      await updateProject(getProjetoIdFromURL(), formData);
      alert('Projeto atualizado com sucesso!');
      popup.classList.add('hidden');
      loadProject();
    } catch (err) {
      console.error('Erro ao atualizar projeto:', err);
      alert('Erro ao atualizar projeto.');
    }
  });
}

// Adicionar etapa
function openAddStepPopup() {
  const innerHTML = `
    <div class="popup-content">
      <button class="close-popup">&times;</button>
      <form id="add-step-form" enctype="multipart/form-data">
        <label>Nome da Etapa:</label>
        <input type="text" id="step-name" required>
        <label>Descrição:</label>
        <textarea id="step-desc"></textarea>
        <label>Arquivos (imagens, docs, apresentações):</label>
        <input type="file" id="step-files" accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" multiple>
        <button type="submit">Adicionar Etapa</button>
      </form>
    </div>
  `;
  const popup = setupPopup('add-step-popup', innerHTML);

  const form = document.getElementById('add-step-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const projetoId = getProjetoIdFromURL();
    const nome = document.getElementById('step-name').value.trim();
    const descricao = document.getElementById('step-desc').value.trim();
    const filesInput = document.getElementById('step-files');
    const files = Array.from(filesInput.files);

    if (!nome) {
      alert('O nome da etapa é obrigatório!');
      return;
    }

    try {
      const novaEtapa = await createEtapa(projetoId, nome, descricao, files);
      const el = renderStep(novaEtapa);
      document.querySelector('.etapas-container')?.appendChild(el);
      alert('Etapa criada com sucesso!');
      popup.classList.add('hidden');
    } catch(err) {
      console.error(err);
      alert('Erro ao criar etapa');
    }
  });
}

// Editar etapa
function openEditStepPopup(etapa) {
  const innerHTML = `
    <div class="popup-content">
      <button class="close-popup">&times;</button>
      <form id="edit-step-form">
        <label>Nome da Etapa:</label>
        <input type="text" id="edit-step-name" value="${etapa.nome_etapa}" required>
        <label>Descrição:</label>
        <textarea id="edit-step-desc">${etapa.descricao_etapa || ''}</textarea>
        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  `;
  const popup = setupPopup('edit-step-popup', innerHTML);

  const form = document.getElementById('edit-step-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nome = document.getElementById('edit-step-name').value.trim();
    const descricao = document.getElementById('edit-step-desc').value.trim();
    try {
      await updateEtapa(etapa.id, nome, descricao);
      alert('Etapa atualizada com sucesso!');
      popup.classList.add('hidden');
      loadProject();
    } catch(err) {
      console.error(err);
      alert('Erro ao atualizar etapa');
    }
  });
}

// Deletar projeto
function openDeletePopup(projeto) {
  const innerHTML = `
    <div class="popup-content">
      <button class="close-popup">&times;</button>
      <form id="delete-project-form">
        <p>Para confirmar, digite o nome completo do projeto:</p>
        <strong>${projeto.titulo}</strong>
        <input type="text" id="confirm-project-name" required>
        <button type="submit">Deletar Projeto</button>
      </form>
    </div>
  `;
  const popup = setupPopup('delete-project-popup', innerHTML);

  const form = document.getElementById('delete-project-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const confirmName = document.getElementById('confirm-project-name').value.trim();
    if (confirmName !== projeto.titulo) {
      alert('Nome do projeto não confere!');
      return;
    }
    try {
      await deleteProject(getProjetoIdFromURL());
      alert('Projeto deletado com sucesso!');
      window.location.href = '/home.html';
    } catch (err) {
      console.error('Erro ao deletar projeto:', err);
      alert('Erro ao deletar projeto.');
    }
  });
}

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', loadProject);
