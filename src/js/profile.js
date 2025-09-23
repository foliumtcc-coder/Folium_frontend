// src/js/profile.js
import { getUser, updateUserProfile, getUserProfile, BACKEND_URL } from './api.js';

function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u.id ?? u.user_id ?? null,
    name1: u.name1 ?? u.name ?? '',
    descricao: u.descricao ?? u.bio ?? '',
    imagem_perfil: u.imagem_perfil ?? u.avatarUrl ?? '',
    banner_fundo: u.banner_fundo ?? u.bannerUrl ?? '',
    instagram: u.instagram ?? '',
    linkedin: u.linkedin ?? '',
    github: u.github ?? ''
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const popup = document.getElementById('edit-profile-popup');
  const closePopupBtn = document.getElementById('close-popup');
  const editForm = popup.querySelector('.edit-profile-form');

  const nameElem = document.getElementById('name');
  const bioElem = document.getElementById('bio');
  const linksElem = document.getElementById('links');
  const projectsContainer = document.getElementById('projects');

  const avatarElem = document.getElementById('avatar');
  const bannerElem = document.getElementById('banner');

  const descricaoInput = document.getElementById('descricao');
  const instagramInput = document.getElementById('instagram');
  const linkedinInput = document.getElementById('linkedin');
  const githubInput = document.getElementById('github');

  const popupAvatar = document.getElementById('popup-avatar');
  const popupBanner = document.getElementById('popup-banner');
  const avatarInputPopup = document.getElementById('popup-avatar-input');
  const bannerInputPopup = document.getElementById('popup-banner-input');

  let loggedUser = null;
  let profileUser = null;

  const params = new URLSearchParams(window.location.search);
  const profileId = params.get('id');

  try {
    const res = await getUser();
    loggedUser = res.user || null;
    console.log('Usuário logado (getUser):', loggedUser);
  } catch (err) {
    console.error('Erro ao buscar usuário logado:', err);
    loggedUser = null;
  }

  function fillProfileUI(u) {
    if (!u) return;
    nameElem.textContent = u.name1 || 'Usuário';
    bioElem.textContent = u.descricao || '';
    avatarElem.src = u.imagem_perfil || './src/img/icons/profile-icon.jpg';
    bannerElem.src = u.banner_fundo || './src/img/standard-img.jpg';

    linksElem.innerHTML = '';
    const links = { instagram: u.instagram, linkedin: u.linkedin, github: u.github };
    for (const [platform, url] of Object.entries(links)) {
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = platform;
        linksElem.appendChild(a);
      }
    }
  }

  async function loadProfile() {
    try {
      const idToFetch = profileId ? profileId : (loggedUser?.id ?? null);
      if (!idToFetch) {
        console.error('Não há id para buscar o perfil.');
        return;
      }

      const data = await getUserProfile(idToFetch);
      const rawUser = data.user ?? data;
      profileUser = normalizeUser(rawUser);

      fillProfileUI(profileUser);

      // 🔹 Busca os projetos do usuário separado
      await loadUserProjects(idToFetch);

      if (loggedUser && profileUser && Number(loggedUser.id) === Number(profileUser.id)) {
        editProfileBtn.classList.remove('hidden');
      } else {
        editProfileBtn.classList.add('hidden');
      }

    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }

  await loadProfile();

  editProfileBtn.addEventListener('click', () => {
    if (!profileUser) return;
    popup.classList.remove('hidden');
    descricaoInput.value = profileUser.descricao || '';
    instagramInput.value = profileUser.instagram || '';
    linkedinInput.value = profileUser.linkedin || '';
    githubInput.value = profileUser.github || '';

    popupAvatar.src = profileUser.imagem_perfil || './src/img/icons/profile-icon.jpg';
    popupBanner.src = profileUser.banner_fundo || './src/img/standard-img.jpg';

    popup.querySelector('.popup-content')?.scrollTo(0, 0);
  });

  closePopupBtn.addEventListener('click', () => popup.classList.add('hidden'));
  popup.addEventListener('click', e => { if (e.target === popup) popup.classList.add('hidden'); });

  avatarInputPopup.addEventListener('change', () => {
    const file = avatarInputPopup.files[0];
    if (!file) return;
    popupAvatar.src = URL.createObjectURL(file);
  });

  bannerInputPopup.addEventListener('change', () => {
    const file = bannerInputPopup.files[0];
    if (!file) return;
    popupBanner.src = URL.createObjectURL(file);
  });

  editForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (!profileUser || !loggedUser || Number(profileUser.id) !== Number(loggedUser.id)) {
      alert('Você não tem permissão para editar este perfil.');
      return;
    }

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      alert('Sessão expirada. Faça login novamente.');
      return;
    }

    const formData = new FormData();
    formData.append('descricao', descricaoInput.value || '');
    formData.append('instagram', instagramInput.value.trim() || '');
    formData.append('linkedin', linkedinInput.value.trim() || '');
    formData.append('github', githubInput.value.trim() || '');
    if (avatarInputPopup.files[0]) formData.append('imagem_perfil', avatarInputPopup.files[0]);
    if (bannerInputPopup.files[0]) formData.append('banner_fundo', bannerInputPopup.files[0]);

    try {
      const result = await updateUserProfile(formData);
      console.log('Resposta updateUserProfile:', result);

      const savedRawUser = result.user ?? result;
      profileUser = normalizeUser(savedRawUser);
      fillProfileUI(profileUser);

      popup.classList.add('hidden');
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      const msg = (err && err.message) ? err.message : String(err);
      alert('Erro ao atualizar perfil: ' + msg);
    }
  });

  // 🔹 Função para buscar os projetos do usuário
  async function loadUserProjects(userId) {
    try {
      const response = await fetch(`${BACKEND_URL}/projects/user/${userId}`, {
        credentials: 'include'
      });
      const projects = await response.json();

      projectsContainer.innerHTML = '';
      projects.forEach(p => {
        const projectLink = document.createElement('a');
        const canAccess = Boolean(p.publico) || (loggedUser && Number(loggedUser.id) === Number(profileUser.id));
        projectLink.href = canAccess ? `project-page.html?id=${p.id}` : '#';
        projectLink.classList.add('project-block');

        const projectImgDiv = document.createElement('div');
        projectImgDiv.classList.add('project-img');
        const img = document.createElement('img');
        img.src = p.imagem || './src/img/icons/project-image2.png';
        img.alt = 'Capa do projeto';
        projectImgDiv.appendChild(img);

        const projectFooter = document.createElement('div');
        projectFooter.classList.add('project-footer');
        projectFooter.textContent = p.nome ?? p.titulo ?? 'Projeto sem nome';

        projectLink.appendChild(projectImgDiv);
        projectLink.appendChild(projectFooter);
        projectsContainer.appendChild(projectLink);
      });
    } catch (err) {
      console.error('Erro ao carregar projetos do usuário:', err);
    }
  }
});
