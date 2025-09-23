import { getUserProfile } from './api.js';

// Função auxiliar para buscar usuário logado via token
async function getUser() {
  const token = localStorage.getItem('accessToken');
  if (!token) return { user: null };

  try {
    const res = await fetch('https://folium-backend.onrender.com/api/auth/user/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) return { user: null };

    const json = await res.json(); // { user: {...} }
    return { user: json.user || null };
  } catch (err) {
    console.error('Erro ao buscar usuário:', err);
    return { user: null };
  }
}

const profileForm = document.querySelector('.edit-profile-form');
const popup = document.getElementById('edit-profile-popup');
const openBtn = document.getElementById('edit-profile-btn');
const closeBtn = document.getElementById('close-popup');

// Controle do popup
if (openBtn && closeBtn && popup) {
  openBtn.addEventListener('click', () => popup.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => popup.classList.add('hidden'));
  popup.addEventListener('click', e => {
    if (e.target === popup) popup.classList.add('hidden');
  });
}

// ----------------- FUNÇÃO PARA CARREGAR PERFIL -----------------
async function loadProfile() {
  const { user } = await getUser();
  if (!user) return window.location.href = '/login.html';

  try {
    const data = await getUserProfile(user.id); // { user: {...}, projects: [...] }

    // Preencher campos do popup
    profileForm.descricao.value = data.user.bio || '';
    profileForm.instagram.value = data.user.instagram || '';
    profileForm.linkedin.value = data.user.linkedin || '';
    profileForm.github.value = data.user.github || '';

    document.querySelector('.profile-pic img').src = data.user.avatarUrl || '/default-avatar.png';
    document.querySelector('.header-image img').src = data.user.bannerUrl || '/default-banner.png';
    document.getElementById('name').textContent = data.user.name || '';

    // Links
    const linksDiv = document.getElementById('links');
    linksDiv.innerHTML = '';
    if (data.user.instagram) linksDiv.innerHTML += `<a href="${data.user.instagram}" target="_blank">Instagram</a> `;
    if (data.user.linkedin) linksDiv.innerHTML += `<a href="${data.user.linkedin}" target="_blank">LinkedIn</a> `;
    if (data.user.github) linksDiv.innerHTML += `<a href="${data.user.github}" target="_blank">GitHub</a>`;

    // Carregar projetos
    renderProjects(data.projects || []);
  } catch (err) {
    console.error('Erro ao carregar perfil:', err);
  }
}

// ----------------- FUNÇÃO PARA SALVAR ALTERAÇÕES DO PERFIL -----------------
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('accessToken');
  const formData = new FormData(profileForm);

  try {
    const res = await fetch('https://folium-backend.onrender.com/api/auth/profile/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const data = await res.json();
    if (data.error) return alert(data.error);

    alert('Perfil atualizado com sucesso!');
    popup.classList.add('hidden'); // Fecha o popup
    loadProfile(); // Recarrega os dados
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
  }
});

// ----------------- FUNÇÃO PARA RENDERIZAR PROJETOS -----------------
function renderProjects(projects) {
  const projectsContainer = document.getElementById('projects');
  projectsContainer.innerHTML = '';

  projects.forEach(project => {
    const projectName = project.name || project.nome || 'Projeto sem nome';
    const projectImage = project.image || project.imagem_capa || './src/img/icons/project-image2.png';

    const projectHTML = `
      <a href="project-page.html?id=${project.id}">
        <div class="project-block">
          <div class="project-img">
            <img src="${projectImage}" alt="">
          </div>
          <div class="project-footer">
            <div class="project-name">
              <span>${projectName}</span>
            </div>
            <button class="project-options"><span class="fa-solid fa-ellipsis-vertical"></span></button>
          </div>
        </div>
      </a>
    `;
    projectsContainer.insertAdjacentHTML('beforeend', projectHTML);
  });
}

// ----------------- INICIALIZAÇÃO -----------------
document.addEventListener('DOMContentLoaded', loadProfile);
