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
    document.body.appendChild(popup);
  }

  popup.innerHTML = innerHTML;

  const content = popup.querySelector('.popup-content');

  // Fecha ao clicar no botão de fechar
  const closeBtn = popup.querySelector('.close-popup');
  if (closeBtn) closeBtn.addEventListener('click', () => popup.classList.add('hidden'));

  // Fecha ao clicar fora do conteúdo
  const onClickOutside = e => {
    if (!content.contains(e.target)) {
      popup.classList.add('hidden');
      document.removeEventListener('mousedown', onClickOutside);
    }
  };

  // Delay para não disparar imediatamente
  setTimeout(() => {
    document.addEventListener('mousedown', onClickOutside);
  }, 0);

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

// --- Popup Editar Projeto ---
function openEditPopup(projeto, membros) {
  const innerHTML = `
    <div class="popup-content">
      <button class="close-popup">&times;</button>
      <form id="edit-project-form" enctype="multipart/form-data">
        <label>Título:</label>
        <input type="text" id="edit-title" value="${projeto.titulo}" required>

        <label>Descrição:</label>
        <textarea id="edit-desc" required>${projeto.descricao || ""}</textarea>

        <label>Membros (emails separados por vírgula):</label>
        <input type="text" id="edit-members" value="${membros.map(m => m.usuarios?.email).filter(Boolean).join(", ")}">

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

  // Preview da imagem
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

  // Submit
  const form = document.getElementById('edit-project-form');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', document.getElementById('edit-title').value.trim());
    formData.append('descricao', document.getElementById('edit-desc').value.trim());
    formData.append('membros', document.getElementById('edit-members').value.trim());
    formData.append('publico', document.getElementById('edit-publico').checked);
    if (imageInput.files[0]) formData.append('imagem', imageInput.files[0]);

    try {
      await updateProject(projetoId, formData);
      alert('Projeto atualizado com sucesso!');
      popup.classList.add('hidden');
      loadProject();
    } catch (err) {
      console.error('Erro ao atualizar projeto:', err);
      alert('Erro ao atualizar projeto.');
    }
  });
}

// --- Popup Adicionar Etapa ---
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

// --- Popup Deletar Projeto ---
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

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', loadProject);
