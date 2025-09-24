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

  // Só adiciona o listener se ainda não estiver visível
  setTimeout(() => document.addEventListener('mousedown', onClickOutside), 0);

  popup.classList.remove('hidden');
  return popup;
}

// --- Carrega projeto ---
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
    const isMember = membros.some(m => m.usuario_id === user.id || m.usuarios?.id === user.id);

    // Header
    const header = document.querySelector('.main-header');
    const headerText = header.querySelector('.main-header-text');
    headerText.textContent = projeto.titulo;

    // Dropdown 3 pontos
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

    // Mostra opções conforme permissão
    document.getElementById('edit-project-option').style.display = isOwner ? 'block' : 'none';
    document.getElementById('add-step-option').style.display = (isOwner || isMember) ? 'block' : 'none';
    document.getElementById('delete-project-option').style.display = isOwner ? 'block' : 'none';

    if (isOwner) document.getElementById('edit-project-option').onclick = () => openEditPopup(projeto, membros);
    if (isOwner || isMember) document.getElementById('add-step-option').onclick = () => openAddStepPopup();
    if (isOwner) document.getElementById('delete-project-option').onclick = () => openDeletePopup(projeto);

    // Datas e descrição
    document.querySelector('.menu-header-date').innerHTML = `
      <span>Publicado em: ${new Date(projeto.criado_em).toLocaleDateString()}</span><br>
      <span>Atualizado por último em: ${projeto.atualizado_em ? new Date(projeto.atualizado_em).toLocaleDateString() : "Nunca"}</span>
    `;
    const menuDesc = document.querySelector('.menu-desc');
    menuDesc.innerHTML = `<h2>Descrição</h2><p>${projeto.descricao || 'Sem descrição'}</p>`;

    // Membros
    const sideMenu = document.querySelector('.menu-header-people');
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

  } catch (err) {
    console.error('Erro ao carregar projeto:', err);
    alert('Erro ao carregar projeto.');
  }
}

// --- Funções de popup (edit, add step, delete) ---
// Mantém a mesma lógica de antes, mas agora o clique fora do popup fecha corretamente

document.addEventListener('DOMContentLoaded', loadProject);
