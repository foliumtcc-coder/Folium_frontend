import { getUser, updateUserProfile, getUserProfile } from './api.js';

function normalizeUser(u) {
  // Transforma formatos diferentes de resposta em um formato único usado pelo frontend
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
  // Elementos do perfil / popup
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

  // Inputs do popup (IDs do seu HTML)
  const descricaoInput = document.getElementById('descricao');
  const instagramInput = document.getElementById('instagram');
  const linkedinInput = document.getElementById('linkedin');
  const githubInput = document.getElementById('github');

  const popupAvatar = document.getElementById('popup-avatar');
  const popupBanner = document.getElementById('popup-banner');
  const avatarInputPopup = document.getElementById('popup-avatar-input');
  const bannerInputPopup = document.getElementById('popup-banner-input');

  let loggedUser = null;
  let profileUser = null; // normalized

  // Pegar ID da URL (se houver)
  const params = new URLSearchParams(window.location.search);
  const profileId = params.get('id');

  // buscar usuário logado
  try {
    const res = await getUser();
    loggedUser = res.user || null;
    console.log('Usuário logado (getUser):', loggedUser);
  } catch (err) {
    console.error('Erro ao buscar usuário logado:', err);
    loggedUser = null;
  }

  // Função para preencher a UI com um usuário normalizado
  function fillProfileUI(u) {
    if (!u) return;
    nameElem.textContent = u.name1 || 'Usuário';
    bioElem.textContent = u.descricao || '';
    avatarElem.src = u.imagem_perfil || './src/img/icons/profile-icon.jpg';
    bannerElem.src = u.banner_fundo || './src/img/standard-img.jpg';
    // Links
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

  // Carregar perfil e projetos
  async function loadProfile() {
    try {
      // precisa de token para getUserProfile — getUser já tentou recuperar token
      if (!loggedUser && !profileId) {
        console.warn('Nenhum usuário logado e nenhum profileId na URL — carregando view anônima possivelmente limitada.');
      }

      // Escolhe id para buscar: id da URL (outro usuário) ou id do logado
      const idToFetch = profileId ? profileId : (loggedUser?.id ?? null);
      if (!idToFetch) {
        console.error('Não há id para buscar o perfil.');
        return;
      }

      const data = await getUserProfile(idToFetch);
      const rawUser = data.user ?? data;
      const normalized = normalizeUser(rawUser);
      profileUser = normalized;

      // Preencher UI
      fillProfileUI(profileUser);

      // Projetos
      const projects = data.projects || [];
      projectsContainer.innerHTML = '';
      projects.forEach(p => {
        const projectLink = document.createElement('a');
        const canAccess = Boolean(p.publico) || (loggedUser && Number(loggedUser.id) === Number(profileUser.id));
        projectLink.href = canAccess ? `project-page.html?id=${p.id}` : '#';
        projectLink.classList.add('project-block');

        const projectImgDiv = document.createElement('div');
        projectImgDiv.classList.add('project-img');
        const img = document.createElement('img');
        img.src = p.imagem_capa || './src/img/icons/project-image2.png';
        projectImgDiv.appendChild(img);

        const projectFooter = document.createElement('div');
        projectFooter.classList.add('project-footer');

        // Correção do nome do projeto: tenta vários campos possíveis
        const projectName = p.nome ?? p.nome_projeto ?? p.titulo ?? p.name ?? 'Projeto sem nome';
        projectFooter.textContent = projectName;

        projectLink.appendChild(projectImgDiv);
        projectLink.appendChild(projectFooter);
        projectsContainer.appendChild(projectLink);
      });

      // Mostrar botão de editar apenas se for o próprio usuário
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

  // Abre popup para editar (preenche inputs)
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

  // Fecha popup
  closePopupBtn.addEventListener('click', () => popup.classList.add('hidden'));
  popup.addEventListener('click', e => {
    if (e.target === popup) popup.classList.add('hidden');
  });

  // Preview avatar/banner no popup
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

  // Submit - salvar alterações
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
      const normalizedSaved = normalizeUser(savedRawUser);

      profileUser = normalizedSaved;
      fillProfileUI(profileUser);

      popup.classList.add('hidden');
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      const msg = (err && err.message) ? err.message : String(err);
      alert('Erro ao atualizar perfil: ' + msg);
    }
  });
});
