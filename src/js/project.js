// src/js/project.js
import { getUser, getProjectById, updateProject } from './api.js';

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
    const imagens = Array.isArray(data.imagens) ? data.imagens : [];

    // --- Verifica se usuário logado é dono ---
    const isOwner = Number(user.id) === Number(projeto.criado_por);

    // --- Preenche header ---
    const header = document.querySelector('.main-header');
    const headerText = header.querySelector('.main-header-text');
    headerText.textContent = projeto.titulo;

    // --- Botão de editar dentro do header ---
    let editButton = document.getElementById('edit-project-btn');
    if (!editButton) {
      editButton = document.createElement('button');
      editButton.id = 'edit-project-btn';
      editButton.textContent = 'Editar Projeto';
      editButton.className = 'def-btn';
      editButton.style.marginLeft = '20px';
      header.appendChild(editButton);
    }
    editButton.style.display = isOwner ? 'inline-block' : 'none';
    if (isOwner) editButton.onclick = () => openEditPopup(projeto, membros);

    // --- Datas e descrição ---
    document.querySelector('.menu-header-date').innerHTML = `
      <span>Publicado em: ${new Date(projeto.criado_em).toLocaleDateString()}</span><br>
      <span>Atualizado por último em: ${new Date(projeto.atualizado_em).toLocaleDateString()}</span>
    `;
    document.querySelector('.menu-desc').textContent = projeto.descricao || 'Sem descrição';

    // --- Preenche membros no menu lateral ---
    const sideMenu = document.querySelector('.menu-header-people');
    sideMenu.innerHTML = '';
    membros.forEach(m => {
      const userId = m.usuario_id || m.id || m.usuarios?.id;
      const userName = m.name1 || m.usuario?.name1 || 'Sem nome';
      if (!userId) return;
      const a = document.createElement('a');
      a.href = `/profile.html?id=${userId}`;
      a.innerHTML = `<span class="fa-solid fa-circle-user"></span> ${userName}`;
      sideMenu.appendChild(a);
    });

    // --- Preenche etapas ---
    const stepsContainer = document.querySelector('.project-steps');
    stepsContainer.innerHTML = '';
    etapas.forEach(etapa => {
      const step = document.createElement('div');
      step.classList.add('step');

      const membrosHTML = (etapa.usuarios || []).map(u => {
        const id = u.usuario_id || u.id || u.usuarios?.id;
        const name = u.name1 || u.usuario?.name1 || 'Sem nome';
        if (!id) return '';
        return `<a href="/profile.html?id=${id}"><span class="fa-solid fa-circle-user"></span> ${name}</a>`;
      }).join('');

      const arquivosHTML = (etapa.arquivos || []).map(f => `
        <div class="step-docs">
          <span class="fa-solid fa-file file-icon"></span>
          <span class="file-text">${f.nome}</span>
        </div>
      `).join('');

      step.innerHTML = `
        <div class="step-header">
          <div class="step-header-text">
            <span class="step-name">${etapa.titulo}</span>
            <span class="step-date">${new Date(etapa.criada_em).toLocaleDateString()}</span>
          </div>
          <div class="step-header-people">${membrosHTML}</div>
        </div>
        <div class="section-line"></div>
        <div class="step-main-content">${etapa.descricao}</div>
        <div class="section-line"></div>
        <div class="step-footer">${arquivosHTML}</div>
      `;
      stepsContainer.appendChild(step);
    });

    // --- Preenche imagens ---
    const mediaContainer = document.querySelector('.menu-media-display');
    mediaContainer.innerHTML = '';
    imagens.forEach((url, i) => {
      const div = document.createElement('div');
      div.className = 'menu-media';
      if (i === 0) div.style.borderRadius = '15px 0 0 15px';
      if (i === imagens.length - 1) div.style.borderRadius = '0 15px 15px 0';

      const img = document.createElement('img');
      img.src = url;
      img.alt = `Imagem ${i + 1}`;
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openImageModal(i));

      div.appendChild(img);
      mediaContainer.appendChild(div);
    });

    // Bloco "+" para futuras adições
    const addDiv = document.createElement('div');
    addDiv.className = 'menu-media menu-media-right';
    addDiv.style.borderRadius = '0 15px 15px 0';
    addDiv.innerHTML = `<span class="fa-solid fa-plus"></span>`;
    mediaContainer.appendChild(addDiv);

    createImageModal(imagens);

  } catch (err) {
    console.error('Erro ao carregar projeto:', err);
    alert('Erro ao carregar projeto.');
  }
}

// --- Modal de imagens ---
function createImageModal(imagens) {
  const modal = document.createElement('div');
  modal.id = 'image-modal';
  modal.style.cssText = `
    display: none;
    position: fixed;
    z-index: 9999;
    left: 0; top: 0;
    width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.8);
    justify-content: center;
    align-items: center;
  `;
  const img = document.createElement('img');
  img.id = 'modal-img';
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  modal.appendChild(img);

  const prev = document.createElement('span');
  prev.innerHTML = '&#10094;';
  prev.style.cssText = `position: absolute; top: 50%; left: 30px; font-size: 3rem; color: white; cursor: pointer;`;
  const next = document.createElement('span');
  next.innerHTML = '&#10095;';
  next.style.cssText = `position: absolute; top: 50%; right: 30px; font-size: 3rem; color: white; cursor: pointer;`;
  modal.appendChild(prev);
  modal.appendChild(next);
  document.body.appendChild(modal);

  let currentIndex = 0;
  window.openImageModal = function(index) {
    currentIndex = index;
    img.src = imagens[currentIndex];
    modal.style.display = 'flex';
  };

  prev.addEventListener('click', e => { e.stopPropagation(); currentIndex = (currentIndex - 1 + imagens.length) % imagens.length; img.src = imagens[currentIndex]; });
  next.addEventListener('click', e => { e.stopPropagation(); currentIndex = (currentIndex + 1) % imagens.length; img.src = imagens[currentIndex]; });
  modal.addEventListener('click', () => modal.style.display = 'none');
}

// --- Popup de edição ---
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
          <textarea id="edit-desc" required>${projeto.descricao}</textarea>
          <label>Imagem de Capa:</label>
          <input type="file" id="edit-image">
          <label>Adicionar Membros (IDs separados por vírgula):</label>
          <input type="text" id="edit-members" placeholder="1,2,3">
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
      const formData = new FormData();
      formData.append('titulo', document.getElementById('edit-title').value.trim());
      formData.append('descricao', document.getElementById('edit-desc').value.trim());
      const imageFile = document.getElementById('edit-image').files[0];
      if (imageFile) formData.append('imagem', imageFile);
      const memberIds = document.getElementById('edit-members').value.split(',').map(id => id.trim()).filter(Boolean);
      formData.append('membros', JSON.stringify(memberIds));

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
  popup.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', loadProject);
