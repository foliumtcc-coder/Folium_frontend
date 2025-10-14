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
  div.setAttribute('draggable', 'true'); // ← ADICIONA ESTA LINHA

  const stepDate = new Date(etapa.criado_em || Date.now()).toLocaleDateString();

  div.innerHTML = `
    <div class="step-header">
      <div class="drag-handle" title="Arrastar para reordenar">
        <i class="fas fa-grip-vertical"></i>
      </div>
      <div class="step-header-content">
        <div class="step-header-text">
          <span class="step-name">${etapa.nome_etapa || 'Sem nome'}</span>
          <span class="step-date">${stepDate}</span>
        </div>
        <div class="step-header-people">
          <div class="step-actions">
            <button class="edit-step-btn">✎</button>
            <button class="delete-step-btn">🗑️</button>
          </div>
        </div>
      </div>
    </div>
    <div class="section-line"></div>
    <div class="step-main-content">${etapa.descricao_etapa || 'Espaço para texto.'}</div>
    <div class="section-line"></div>
    <div class="step-footer">
      ${etapa.arquivos?.map(file => {
        const url = file.caminho_arquivo || '#';
        const nome = file.nome_arquivo || 'arquivo.doc';
        return `
          <div class="step-docs">
            <span class="fa-solid fa-file file-icon"></span>
            <a href="${url}" target="_blank" class="file-text">${nome}</a>
          </div>
        `;
      }).join('') || ''}
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
    const headerContent = document.querySelector('.main-header-content');
    if (headerContent) {
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
        headerContent.appendChild(dropdownBtn);
      }

      const dropBtn = dropdownBtn.querySelector('.dropbtn');
      const dropdownContent = dropdownBtn.querySelector('.dropdown-content');

      dropBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
      });

      document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target)) {
          dropdownContent.style.display = 'none';
        }
      });

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

      try {
        // Busca todas as etapas do projeto
        const etapasData = await getEtapasByProjeto(projetoId);
        const etapas = Array.isArray(etapasData.etapas) ? etapasData.etapas : [];

        // Para cada etapa, busca os arquivos e renderiza
for (const etapa of etapas.sort((a, b) => a.numero_etapa - b.numero_etapa)) {
  try {
    // Faz a requisição para o endpoint do backend que retorna os arquivos da etapa
    const res = await fetch(`/api/etapas/arquivos/${etapa.id}`);
    const arquivosData = await res.json();

    // Garante que sempre seja um array
    etapa.arquivos = Array.isArray(arquivosData.arquivos) ? arquivosData.arquivos : [];
  } catch (err) {
    console.error(`Erro ao buscar arquivos da etapa ${etapa.id}:`, err);
    etapa.arquivos = [];
  }

  // Renderiza a etapa com os arquivos
  const el = renderStep(etapa);
  etapasContainer.appendChild(el);
}


      } catch (err) {
        console.error('Erro ao carregar etapas:', err);
        etapasContainer.innerHTML = '<p>Não foi possível carregar as etapas.</p>';
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

// Adicione este código ao seu arquivo project.js ou crie um novo arquivo drag-drop.js

function initializeDragAndDrop() {
  const stepsContainer = document.querySelector('.etapas-container, .project-steps');
  
  if (!stepsContainer) return;

  // Adiciona o botão de arrastar em cada etapa
  function addDragHandles() {
    const steps = stepsContainer.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
      // Verifica se já tem o handle
      if (step.querySelector('.drag-handle')) return;
      
      const stepHeader = step.querySelector('.step-header');
      if (!stepHeader) return;

      // Cria o wrapper para o conteúdo do header
      const headerContent = document.createElement('div');
      headerContent.className = 'step-header-content';
      
      // Move todo o conteúdo atual para dentro do wrapper
      while (stepHeader.firstChild) {
        headerContent.appendChild(stepHeader.firstChild);
      }

      // Cria o botão de arrastar
      const dragHandle = document.createElement('div');
      dragHandle.className = 'drag-handle';
      dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
      dragHandle.setAttribute('draggable', 'true');
      dragHandle.title = 'Arrastar para reordenar';

      // Adiciona o handle e o conteúdo de volta ao header
      stepHeader.appendChild(dragHandle);
      stepHeader.appendChild(headerContent);

      // Torna a etapa arrastável
      step.setAttribute('draggable', 'true');
      step.dataset.stepIndex = index;
    });
  }

  // Variável para guardar o elemento sendo arrastado
  let draggedElement = null;

  // Evento quando começa a arrastar
  stepsContainer.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('step')) {
      draggedElement = e.target;
      e.target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.target.innerHTML);
    }
  });

  // Evento quando termina de arrastar
  stepsContainer.addEventListener('dragend', (e) => {
    if (e.target.classList.contains('step')) {
      e.target.classList.remove('dragging');
      
      // Remove a classe drag-over de todos os elementos
      document.querySelectorAll('.step.drag-over').forEach(step => {
        step.classList.remove('drag-over');
      });
      
      draggedElement = null;
    }
  });

  // Evento quando passa por cima de outro elemento
  stepsContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    
    const targetStep = e.target.closest('.step');
    
    if (targetStep && targetStep !== draggedElement) {
      // Remove drag-over de todos
      document.querySelectorAll('.step.drag-over').forEach(step => {
        step.classList.remove('drag-over');
      });
      
      // Adiciona no elemento atual
      targetStep.classList.add('drag-over');
    }
  });

  // Evento quando entra em um elemento
  stepsContainer.addEventListener('dragenter', (e) => {
    e.preventDefault();
  });

  // Evento quando sai de um elemento
  stepsContainer.addEventListener('dragleave', (e) => {
    const targetStep = e.target.closest('.step');
    if (targetStep) {
      targetStep.classList.remove('drag-over');
    }
  });

  // Evento quando solta o elemento
  stepsContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const targetStep = e.target.closest('.step');
    
    if (targetStep && draggedElement && targetStep !== draggedElement) {
      // Remove a classe drag-over
      targetStep.classList.remove('drag-over');
      
      // Determina se deve inserir antes ou depois
      const rect = targetStep.getBoundingClientRect();
      const mouseY = e.clientY;
      const middle = rect.top + rect.height / 2;
      
      if (mouseY < middle) {
        // Insere antes
        stepsContainer.insertBefore(draggedElement, targetStep);
      } else {
        // Insere depois
        stepsContainer.insertBefore(draggedElement, targetStep.nextSibling);
      }
      
      // Atualiza os índices
      updateStepIndices();
      
      // Aqui você pode adicionar código para salvar a nova ordem no backend
      saveStepOrder();
    }
  });

  async function saveStepOrder() {
    const steps = stepsContainer.querySelectorAll('.step');
    const order = Array.from(steps).map((step, index) => ({
      etapaId: step.dataset.etapaId,
      numero_etapa: index + 1
    }));
    
    try {
      const response = await fetch('/api/auth/etapas/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projetoId: getProjetoIdFromURL(),
          ordem: order 
        })
      });
      
      if (!response.ok) {
        console.error('Erro ao salvar ordem das etapas');
        return;
      }
      
      console.log('Ordem das etapas salva com sucesso!');
    } catch (err) {
      console.error('Erro ao fazer requisição:', err);
    }
  }

  // Atualiza os índices das etapas após reordenar
  function updateStepIndices() {
    const steps = stepsContainer.querySelectorAll('.step');
    steps.forEach((step, index) => {
      step.dataset.stepIndex = index;
    });
  }

  // Inicializa os handles
  addDragHandles();
  
  // Se você adicionar etapas dinamicamente, chame addDragHandles() novamente
  // Exemplo: depois de carregar as etapas via AJAX
}

// Chama a função quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDragAndDrop);
} else {
  initializeDragAndDrop();
}

// Exporta a função se estiver usando modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initializeDragAndDrop };
}