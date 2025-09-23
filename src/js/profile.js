// script.js
import { getUser } from './api.js';

const profileForm = document.querySelector('.edit-profile-form');
const popup = document.getElementById('edit-profile-popup');
const openBtn = document.getElementById('edit-profile-btn');
const closeBtn = document.getElementById('close-popup');

openBtn.addEventListener('click', () => popup.classList.remove('hidden'));
closeBtn.addEventListener('click', () => popup.classList.add('hidden'));
popup.addEventListener('click', e => {
  if (e.target === popup) popup.classList.add('hidden');
});

async function loadProfile() {
  const token = localStorage.getItem('accessToken');
  const { user } = await getUser();
  if (!user) return window.location.href = '/login.html';

  const res = await fetch(`/api/auth/profile/${user.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (data.error) return alert(data.error);

  // Preencher campos do popup
  profileForm.descricao.value = data.user.bio || '';
  profileForm.instagram.value = data.user.instagram || '';
  profileForm.linkedin.value = data.user.linkedin || '';
  profileForm.github.value = data.user.github || '';

  document.querySelector('.profile-pic img').src = data.user.avatarUrl || '/default-avatar.png';
  document.querySelector('.header-image img').src = data.user.bannerUrl || '/default-banner.png';

  // Links
  const linksDiv = document.getElementById('links');
  linksDiv.innerHTML = '';
  if (data.user.instagram) linksDiv.innerHTML += `<a href="${data.user.instagram}" target="_blank">Instagram</a> `;
  if (data.user.linkedin) linksDiv.innerHTML += `<a href="${data.user.linkedin}" target="_blank">LinkedIn</a> `;
  if (data.user.github) linksDiv.innerHTML += `<a href="${data.user.github}" target="_blank">GitHub</a>`;
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('accessToken');
  const formData = new FormData(profileForm);

  const res = await fetch('/api/auth/profile/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await res.json();
  if (data.error) return alert(data.error);

  alert('Perfil atualizado com sucesso!');
  popup.classList.add('hidden'); // Fecha o popup
  loadProfile(); // Recarrega os dados
});

// ----------------- NOVO: FUNÇÃO PARA CARREGAR PROJETOS -----------------
async function loadProjects() {
  const token = localStorage.getItem('accessToken');
  const { user } = await getUser();
  if (!user) return;

  const res = await fetch(`/api/projects/user/${user.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (data.error) return alert(data.error);

  const projectsContainer = document.getElementById('projects');
  projectsContainer.innerHTML = ''; // limpa antes de adicionar

  data.projects.forEach(project => {
    const projectHTML = `
      <a href="project-page.html?id=${project.id}">
        <div class="project-block">
          <div class="project-img">
            <img src="${project.image || './src/img/icons/project-image2.png'}" alt="">
          </div>
          <div class="project-footer">
            <div class="project-name">
              <span>${project.name}</span>
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
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
  loadProjects();
});
