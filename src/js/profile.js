import { getUser, updateUserProfile, getUserProfile } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Elementos principais
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

  // Inputs do popup
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

  // Carregar perfil e projetos
  async function loadProfile() {
    try {
      let data;
      if (profileId && parseInt(profileId) !== loggedUser?.id) {
        data = await getUserProfile(profileId);
      } else {
        data = await getUserProfile(loggedUser.id);
      }

      profileUser = data.user;
      const projects = data.projects || [];

      // Preencher informações
      nameElem.textContent = profileUser.name1 || 'Usuário';
      bioElem.textContent = profileUser.descricao || '';
      avatarElem.src = profileUser.imagem_perfil || './src/img/icons/profile-icon.jpg';
      bannerElem.src = profileUser.banner_fundo || './src/img/standard-img.jpg';

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
      projects.forEach(p => {
        const projectLink = document.createElement('a');
        projectLink.href = p.publico || loggedUser.id === profileUser.id ? `project-page.html?id=${p.id}` : '#';
        projectLink.classList.add('project-block');

        const projectImgDiv = document.createElement('div');
        projectImgDiv.classList.add('project-img');
        const img = document.createElement('img');
        img.src = p.imagem_capa || './src/img/icons/project-image2.png';
        projectImgDiv.appendChild(img);

        const projectFooter = document.createElement('div');
        projectFooter.classList.add('project-footer');
        projectFooter.textContent = p.nome || 'Projeto sem nome';

        projectLink.appendChild(projectImgDiv);
        projectLink.appendChild(projectFooter);
        projectsContainer.appendChild(projectLink);
      });

      // Mostrar botão de editar apenas se for o próprio usuário
      if (loggedUser?.id === profileUser.id) {
        editProfileBtn.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }

  await loadProfile();

  // Abrir popup
  editProfileBtn.addEventListener('click', () => {
    popup.classList.remove('hidden');
    descricaoInput.value = profileUser.descricao || '';
    instagramInput.value = profileUser.instagram || '';
    linkedinInput.value = profileUser.linkedin || '';
    githubInput.value = profileUser.github || '';

    popupAvatar.src = profileUser.imagem_perfil || './src/img/icons/profile-icon.jpg';
    popupBanner.src = profileUser.banner_fundo || './src/img/standard-img.jpg';
  });

  // Fechar popup
  closePopupBtn.addEventListener('click', () => popup.classList.add('hidden'));
  popup.addEventListener('click', e => {
    if (e.target === popup) popup.classList.add('hidden');
  });

  // Alterar avatar/banner no popup (preview)
  avatarInputPopup.addEventListener('change', () => {
    const file = avatarInputPopup.files[0];
    if (file) popupAvatar.src = URL.createObjectURL(file);
  });

  bannerInputPopup.addEventListener('change', () => {
    const file = bannerInputPopup.files[0];
    if (file) popupBanner.src = URL.createObjectURL(file);
  });

  // Salvar alterações
  editForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!profileUser || loggedUser.id !== profileUser.id) return;

    const formData = new FormData();
    formData.append('descricao', descricaoInput.value);
    formData.append('instagram', instagramInput.value.trim());
    formData.append('linkedin', linkedinInput.value.trim());
    formData.append('github', githubInput.value.trim());
    if (avatarInputPopup.files[0]) formData.append('imagem_perfil', avatarInputPopup.files[0]);
    if (bannerInputPopup.files[0]) formData.append('banner_fundo', bannerInputPopup.files[0]);

    try {
      const result = await updateUserProfile(formData);
      profileUser = result.user;

      // Atualizar elementos da página
      nameElem.textContent = profileUser.name1 || 'Usuário';
      bioElem.textContent = profileUser.descricao || '';
      avatarElem.src = profileUser.imagem_perfil || './src/img/icons/profile-icon.jpg';
      bannerElem.src = profileUser.banner_fundo || './src/img/standard-img.jpg';

      popup.classList.add('hidden');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      alert('Erro ao atualizar perfil.');
    }
  });
});
