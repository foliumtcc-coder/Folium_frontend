// src/js/profile.js
import { getUser, getUserProfile, updateUserProfile } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const nameElem = document.getElementById('name');
  const bioElem = document.getElementById('bio');
  const linksElem = document.getElementById('links');
  const avatarElem = document.getElementById('avatar');
  const bannerElem = document.getElementById('banner');
  const editBtn = document.getElementById('edit-profile-btn');
  const popup = document.getElementById('edit-profile-popup');
  const closePopupBtn = document.getElementById('close-popup-btn');
  const editForm = document.querySelector('.edit-profile-form');
  const avatarInput = document.getElementById('avatarInput');
  const bannerInput = document.getElementById('bannerInput');
  
  const projectsContainer = document.getElementById('projects');

  let loggedUser = null;
  let profileUser = null;

  // Pegar ID da URL
  const params = new URLSearchParams(window.location.search);
  const profileId = params.get('id');

  // Buscar usuário logado
  try {
    const res = await getUser();
    loggedUser = res.user;
  } catch (err) {
    console.error('Erro ao buscar usuário logado:', err);
  }

  // Carregar perfil
  async function loadProfile() {
    try {
      let data;
      if (profileId && parseInt(profileId) !== loggedUser?.id) {
        data = await getUserProfile(profileId); // perfil de outro usuário
      } else {
        data = await getUserProfile(loggedUser.id); // próprio perfil
      }

      profileUser = data.user;

      // Preencher dados do perfil
      nameElem.textContent = profileUser.name1;
      bioElem.textContent = profileUser.bio || '';
      avatarElem.src = profileUser.avatarUrl || './src/img/icons/profile-icon.jpg';
      bannerElem.src = profileUser.bannerUrl || './src/img/standard-img.jpg';

      // Links
      linksElem.innerHTML = '';
      const links = {
        instagram: profileUser.instagram,
        linkedin: profileUser.linkedin,
        github: profileUser.github
      };
      for (const [platform, url] of Object.entries(links)) {
        if (url) {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.textContent = platform;
          linksElem.appendChild(a);
        }
      }

      // Projetos
      projectsContainer.innerHTML = '';
      const projects = data.projects || [];
      projects.forEach(project => {
        const projectLink = document.createElement('a');
        projectLink.href = `project-page.html?id=${project.id}`;
        projectLink.classList.add('project-block');

        projectLink.innerHTML = `
          <div class="project-img">
            <img src="${project.imagem || './src/img/icons/project-image2.png'}" alt="${project.nome}">
          </div>
          <div class="project-footer">
            <span>${project.nome}</span>
          </div>
        `;

        projectsContainer.appendChild(projectLink);
      });

      // Mostrar botão de editar apenas para o próprio usuário
      if (loggedUser?.id === profileUser.id) {
        editBtn.classList.remove('hidden');
      }

    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }

  await loadProfile();

  // Abrir popup
  editBtn.addEventListener('click', () => {
    popup.classList.remove('hidden');
    editForm.descricao.value = profileUser.bio || '';
    editForm.instagram.value = profileUser.instagram || '';
    editForm.linkedin.value = profileUser.linkedin || '';
    editForm.github.value = profileUser.github || '';
  });

  // Fechar popup
  closePopupBtn.addEventListener('click', () => popup.classList.add('hidden'));

  // Atualizar preview de imagens
  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (file) avatarElem.src = URL.createObjectURL(file);
  });
  bannerInput.addEventListener('change', () => {
    const file = bannerInput.files[0];
    if (file) bannerElem.src = URL.createObjectURL(file);
  });

  // Salvar alterações
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!profileUser || loggedUser.id !== profileUser.id) return;

    const formData = new FormData();
    formData.append('descricao', editForm.descricao.value);
    formData.append('instagram', editForm.instagram.value.trim());
    formData.append('linkedin', editForm.linkedin.value.trim());
    formData.append('github', editForm.github.value.trim());
    if (avatarInput.files[0]) formData.append('imagem_perfil', avatarInput.files[0]);
    if (bannerInput.files[0]) formData.append('banner_fundo', bannerInput.files[0]);

    try {
      const updated = await updateUserProfile(formData);
      profileUser = updated.user;

      // Atualizar elementos da página
      nameElem.textContent = profileUser.name1;
      bioElem.textContent = profileUser.bio || '';
      avatarElem.src = profileUser.avatarUrl || './src/img/icons/profile-icon.jpg';
      bannerElem.src = profileUser.bannerUrl || './src/img/standard-img.jpg';

      popup.classList.add('hidden');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Erro ao atualizar perfil.');
    }
  });
});
