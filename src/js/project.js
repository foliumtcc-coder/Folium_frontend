import { getUser, getProjectById, updateProject, deleteProject } from './api.js';

const urlParams = new URLSearchParams(window.location.search);
const projetoId = urlParams.get('id');

// --- Função genérica para criar e controlar popups ---
function setupPopup(popupId, innerHTML) {
  let popup = document.getElementById(popupId);

  if (!popup) {
    popup = document.createElement('div');
    popup.id = popupId;
    popup.className = 'popup hidden';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100%';
    popup.style.height = '100%';
    popup.style.background = 'rgba(0,0,0,0.5)';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.style.zIndex = '9999';
    document.body.appendChild(popup);
  }

  popup.innerHTML = innerHTML;
  const content = popup.querySelector('.popup-content');

  // Fecha ao clicar no botão de fechar
  const closeBtn = popup.querySelector('.close-popup');
  if (closeBtn) closeBtn.addEventListener('click', () => popup.classList.add('hidden'));

  // Fecha ao clicar fora do conteúdo
  function onClickOutside(e) {
    if (!content.contains(e.target)) {
      popup.classList.add('hidden');
      document.removeEventListener('mousedown', onClickOutside);
    }
  }
  setTimeout(() => document.addEventListener('mousedown', onClickOutside), 0);

  popup.classList.remove('hidden');
  return popup;
}

// --- Popups específicos ---
function openEditPopup(projeto, membros) {
  const innerHTML = `
    <div class="popup-content">
      <button class="close-popup">&times;</button>
      <form id="edit-project-form">
        <label>Título:</label>
        <input type="text" id="edit-title" value="${projeto.titulo}" required>

        <label>Descrição:</label>
        <textarea id="edit-desc">${projeto.descricao || ""}</textarea>

        <label>Membros (emails separados por vírgula):</label>
        <input type="text" id="edit-members" value="${membros.map(m => m.usuarios?.email).filter(Boolean).join(", ")}">

        <label>Projeto Público:</label>
        <input type="checkbox" id="edit-publico" ${projeto.publico ? "checked" : ""}>

        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  `;
  const popup = setupPopup('edit-project-popup', innerHTML);

  const form = document.getElementById('edit-project-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', document.getElementById('edit-title').value.trim());
    formData.append('descricao', document.getElementById('edit-desc').value.trim());
    formData.append('membros', document.getElementById('edit-members').value.trim());
    formData.append('publico', document.getElementById('edit-publico').checked);

    try {
      await updateProject(projetoId, formData);
      alert('Projeto atualizado com sucesso!');
      popup.classList.add('hidden');
      loadProject();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar projeto.');
    }
  });
}

function openAddStepPopup() {
  const innerHTML = `
    <div class="popup-content">
      <button class="close-popup">&times;</button>
      <form id="add-step-form">
        <label>Nome da Etapa:</label>
        <input type="text" id="step-name" required>
        <button type="submit">Adicionar Etapa</button>
      </form>
    </div>
  `;
  const popup = setupPopup('add-step-popup', innerHTML);

  document.getElementById('add-step-form').addEventListener('submit', e => {
    e.preventDefault();
    alert('Funcionalidade de adicionar etapa ainda precisa ser implementada.');
    popup.classList.add('hidden');
  });
}

function openDeletePopup(projeto) {
  const innerHTML = `
    <div class="popup-content">
      <button class="close-popup">&times;</button>
      <form id="delete-project-form">
        <p>Digite o nome completo do projeto para confirmar:</p>
        <strong>${projeto.titulo}</strong>
        <input type="text" id="confirm-project-name" required>
        <button type="submit">Deletar Projeto</button>
      </form>
    </div>
  `;
  const popup = setupPopup('delete-project-popup', innerHTML);

  document.getElementById('delete-project-form').addEventListener('submit', async e => {
    e.preventDefault();
    const confirmName = document.getElementById('confirm-project-name').value.trim();
    if (confirmName !== projeto.titulo) return alert('Nome do projeto não confere!');
    try {
      await deleteProject(projetoId);
      alert('Projeto deletado com sucesso!');
      window.location.href = '/home.html';
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar projeto.');
    }
  });
}

// --- Carrega projeto ---
async function loadProject() {
  try {
    const { user } = await getUser();
    if (!user) return window.location.href = '/login.html';

    const data = await getProjectById(projetoId);
    if (!data?.projeto) return alert('Projeto não encontrado.');

    const projeto = data.projeto;
    const membros = data.membros || [];

    const isOwner = Number(user.id) === Number(projeto.criado_por);
    const isMember = membros.some(m => m.usuario_id === user.id || m.usuarios?.id === user.id);

    document.querySelector('.main-header-text').textContent = projeto.titulo;

    // Dropdown
    const dropdownBtn = document.getElementById('project-dropdown-btn');
    if (dropdownBtn) {
      document.getElementById('edit-project-option').style.display = isOwner ? 'block' : 'none';
      document.getElementById('add-step-option').style.display = (isOwner || isMember) ? 'block' : 'none';
      document.getElementById('delete-project-option').style.display = isOwner ? 'block' : 'none';

      if (isOwner) document.getElementById('edit-project-option').onclick = () => openEditPopup(projeto, membros);
      if (isOwner || isMember) document.getElementById('add-step-option').onclick = openAddStepPopup;
      if (isOwner) document.getElementById('delete-project-option').onclick = () => openDeletePopup(projeto);
    }

  } catch (err) {
    console.error(err);
    alert('Erro ao carregar projeto.');
  }
}

document.addEventListener('DOMContentLoaded', loadProject);
