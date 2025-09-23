// src/js/project.js
import { getUser, getProjectById, updateProject, deleteProject } from './api.js';

const urlParams = new URLSearchParams(window.location.search);
const projetoId = urlParams.get('id');

async function loadProject() {
  try {
    const { user } = await getUser();
    if (!user) return window.location.href = '/login.html';

    const data = await getProjectById(projetoId);
    if (!data || !data.projeto) {
      alert('Projeto não encontrado.');
      return;
    }

    const projeto = data.projeto;
    const etapas = Array.isArray(data.etapas) ? data.etapas : [];
    const membros = Array.isArray(data.membros) ? data.membros : [];

    const isOwner = Number(user.id) === Number(projeto.criado_por);

    // Header
    const header = document.querySelector('.main-header');
    const headerText = header.querySelector('.main-header-text');
    headerText.textContent = projeto.titulo;

    // Botão de 3 pontos
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
    dropdownBtn.style.display = isOwner ? 'inline-block' : 'none';

    // Eventos do dropdown
    document.getElementById('edit-project-option').onclick = () => openEditPopup(projeto, membros);
    document.getElementById('add-step-option').onclick = () => openAddStepPopup();
    document.getElementById('delete-project-option').onclick = () => openDeletePopup(projeto);

    // Datas e descrição
    document.querySelector('.menu-header-date').innerHTML = `
      <span>Publicado em: ${new Date(projeto.criado_em).toLocaleDateString()}</span><br>
      <span>Atualizado por último em: ${
        projeto.atualizado_em
          ? new Date(projeto.atualizado_em).toLocaleDateString()
          : "Nunca"
      }</span>
    `;

    const menuDesc = document.querySelector('.menu-desc');
    menuDesc.innerHTML = `<h4>Descrição</h4><p>${projeto.descricao || 'Sem descrição'}</p>`;

    // Membros
    const sideMenu = document.querySelector('.menu-header-people');
    sideMenu.innerHTML = `<h4>Membros</h4>`;
    membros.forEach(m => {
      const userId = m.usuario_id || m.usuarios?.id;
      const userName = m.usuarios?.name1 || "Sem nome";
      if (!userId) return;
      const a = document.createElement('a');
      a.href = `/profile-page.html?id=${userId}`;
      a.innerHTML = `<span class="fa-solid fa-circle-user"></span> ${userName}`;
      sideMenu.appendChild(a);
    });

  } catch (err) {
    console.error('Erro ao carregar projeto:', err);
    alert('Erro ao carregar projeto.');
  }
}

// --- Popup edição ---
function openEditPopup(projeto, membros) {
  let popup = document.getElementById('edit-project-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'edit-project-popup';
    popup.className = 'popup hidden';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.innerHTML = `
      <div class="popup-content">
        <button class="close-popup">&times;</button>
        <form id="edit-project-form">
          <label>Título:</label>
          <input type="text" id="edit-title" value="${projeto.titulo}" required>
          
          <label>Descrição:</label>
          <textarea id="edit-desc" required>${projeto.descricao || ""}</textarea>
          
          <label>Membros (emails separados por vírgula):</label>
          <input type="text" id="edit-members" value="${membros.map(m => m.usuarios?.email).filter(Boolean).join(", ")}">
          
          <label>Projeto Público:</label>
          <input type="checkbox" id="edit-publico" ${projeto.publico ? "checked" : ""}>
          
          <button type="submit">Salvar Alterações</button>
        </form>
      </div>
    `;
    document.body.appendChild(popup);

    popup.querySelector('.close-popup').addEventListener('click', () => popup.classList.add('hidden'));
    popup.addEventListener('click', e => { if (e.target === popup) popup.classList.add('hidden'); });

    const form = document.getElementById('edit-project-form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = {
        titulo: document.getElementById('edit-title').value.trim(),
        descricao: document.getElementById('edit-desc').value.trim(),
        membros: document.getElementById('edit-members').value.trim(),
        publico: document.getElementById('edit-publico').checked
      };
      try {
        await updateProject(projetoId, payload);
        alert('Projeto atualizado com sucesso!');
        popup.classList.add('hidden');
        loadProject();
      } catch (err) {
        console.error('Erro ao atualizar projeto:', err);
        alert('Erro ao atualizar projeto.');
      }
    });
  }
  popup.classList.remove('hidden');
}

// --- Popup adicionar etapa ---
function openAddStepPopup() {
  let popup = document.getElementById('add-step-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'add-step-popup';
    popup.className = 'popup hidden';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.innerHTML = `
      <div class="popup-content">
        <button class="close-popup">&times;</button>
        <form id="add-step-form">
          <label>Nome da Etapa:</label>
          <input type="text" id="step-name" required>
          <button type="submit">Adicionar Etapa</button>
        </form>
      </div>
    `;
    document.body.appendChild(popup);

    popup.querySelector('.close-popup').addEventListener('click', () => popup.classList.add('hidden'));
    popup.addEventListener('click', e => { if (e.target === popup) popup.classList.add('hidden'); });

    document.getElementById('add-step-form').addEventListener('submit', e => {
      e.preventDefault();
      alert('Funcionalidade de adicionar etapa ainda precisa ser implementada.');
      popup.classList.add('hidden');
    });
  }
  popup.classList.remove('hidden');
}

// --- Popup deletar projeto ---
function openDeletePopup(projeto) {
  let popup = document.getElementById('delete-project-popup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'delete-project-popup';
    popup.className = 'popup hidden';
    popup.style.display = 'flex';
    popup.style.justifyContent = 'center';
    popup.style.alignItems = 'center';
    popup.innerHTML = `
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
    document.body.appendChild(popup);

    popup.querySelector('.close-popup').addEventListener('click', () => popup.classList.add('hidden'));
    popup.addEventListener('click', e => { if (e.target === popup) popup.classList.add('hidden'); });

    document.getElementById('delete-project-form').addEventListener('submit', async e => {
      e.preventDefault();
      const confirmName = document.getElementById('confirm-project-name').value.trim();
      if (confirmName !== projeto.titulo) {
        alert('Nome do projeto não confere!');
        return;
      }
      try {
        await deleteProject(projetoId);
        alert('Projeto deletado com sucesso!');
        window.location.href = '/home.html';
      } catch (err) {
        console.error('Erro ao deletar projeto:', err);
        alert('Erro ao deletar projeto.');
      }
    });
  }
  popup.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', loadProject);
