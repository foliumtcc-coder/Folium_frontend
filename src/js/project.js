import { 
  getUser, 
  getProjectById, 
  updateProject, 
  deleteProject, 
  createEtapa, 
  updateEtapa, 
  deleteEtapa 
} from './api.js';

const urlParams = new URLSearchParams(window.location.search);
const projetoId = urlParams.get('id');

// --- Função genérica para criar e controlar popups ---
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
    const headerText = document.querySelector('.main-header-text');
    if (headerText) headerText.textContent = projeto.titulo;

    // Datas
    const menuDates = document.getElementById('project-dates');
    if (menuDates) {
      menuDates.innerHTML = `
        <span>Publicado em: ${new Date(projeto.criado_em).toLocaleDateString()}</span><br>
        <span>Atualizado por último em: ${projeto.atualizado_em ? new Date(projeto.atualizado_em).toLocaleDateString() : "Nunca"}</span>
      `;
    }

    // Descrição
    const menuDesc = document.getElementById('project-description');
    if (menuDesc) menuDesc.innerHTML = `<h2>Descrição</h2><p>${projeto.descricao || 'Sem descrição'}</p>`;

    // Membros
    const membersContainer = document.getElementById('project-members');
    if (membersContainer) {
      membersContainer.innerHTML = '<h2>Membros</h2>';
      membros.forEach(m => {
        const userId = m.usuario_id || m.usuarios?.id;
        const userName = m.usuarios?.name1 || "Sem nome";
        if (!userId) return;
        const a = document.createElement('a');
        a.href = `/profile-page.html?id=${userId}`;
        a.innerHTML = `<span class="fa-solid fa-circle-user"></span> ${userName}`;
        membersContainer.appendChild(a);
      });
    }

    // Container das etapas
    const etapasContainer = document.getElementById('project-steps');
    if (!etapasContainer) return;
    etapasContainer.innerHTML = '';
    etapas.sort((a,b)=> a.numero_etapa - b.numero_etapa).forEach(etapa => {
      const div = document.createElement('div');
      div.className = 'etapa-item';
      div.dataset.etapaId = etapa.id;
      div.innerHTML = `
        <div class="etapa-header">
          <span>${etapa.numero_etapa}. ${etapa.nome_etapa}</span>
          <div class="etapa-options">
            <button class="etapa-dropdown-btn">⋮</button>
            <div class="etapa-dropdown-content hidden">
              <a href="#" class="edit-etapa-btn">Editar</a>
              <a href="#" class="delete-etapa-btn">Deletar</a>
            </div>
          </div>
        </div>
        <p>${etapa.descricao_etapa || ''}</p>
      `;
      etapasContainer.appendChild(div);

      const dropdownBtn = div.querySelector('.etapa-dropdown-btn');
      const dropdownContent = div.querySelector('.etapa-dropdown-content');
      dropdownBtn.addEventListener('click', () => dropdownContent.classList.toggle('hidden'));

      div.querySelector('.edit-etapa-btn').addEventListener('click', () => openEditStepPopup(etapa));
      div.querySelector('.delete-etapa-btn').addEventListener('click', async () => {
        if (confirm('Deseja realmente deletar esta etapa?')) {
          await deleteEtapa(etapa.id);
          loadProject();
        }
      });
    });

  } catch (err) {
    console.error('Erro ao carregar projeto:', err);
    alert('Erro ao carregar projeto.');
  }
}

// --- Popups ---
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

function openAddStepPopup() {
  const innerHTML = `
    <div class="popup-content">
      <button class="close-popup">&times;</button>
      <form id="add-step-form">
        <label>Nome da Etapa:</label>
        <input type="text" id="step-name" required>
        <label>Descrição:</label>
        <textarea id="step-desc"></textarea>
        <button type="submit">Adicionar Etapa</button>
      </form>
    </div>
  `;
  const popup = setupPopup('add-step-popup', innerHTML);

  document.getElementById('add-step-form').addEventListener('submit', async e => {
    e.preventDefault();
    const nome = document.getElementById('step-name').value.trim();
    const descricao = document.getElementById('step-desc').value.trim();
    try {
      await createEtapa(projetoId, nome, descricao);
      alert('Etapa criada com sucesso!');
      popup.classList.add('hidden');
      loadProject();
    } catch(err) {
      console.error(err);
      alert('Erro ao criar etapa');
    }
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', loadProject);
