import { getUser, updateUserProfile, getUserProfile } from './api.js';

// --- Função para mostrar notificações toast ---
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span style="font-size: 20px;">${icon}</span> ${message}`;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function normalizeUser(u) {
  if (!u) return null;
  return {
    id: u.id ?? u.user_id ?? null,
    name1: u.name1 ?? u.name ?? '',
    descricao: u.descricao ?? u.bio ?? '',
    imagem_perfil: u.imagem_perfil ?? u.avatarUrl ?? '',
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

  const descricaoInput = document.getElementById('descricao');
  const instagramInput = document.getElementById('instagram');
  const linkedinInput = document.getElementById('linkedin');
  const githubInput = document.getElementById('github');

  const popupAvatar = document.getElementById('popup-avatar');
  const avatarInputPopup = document.getElementById('popup-avatar-input');

  let loggedUser = null;
  let profileUser = null;
  let profileProjects = [];

  const params = new URLSearchParams(window.location.search);
  const profileId = params.get('id');

  try {
    const res = await getUser();
    loggedUser = res.user || null;
  } catch (err) {
    console.error('Erro ao buscar usuário logado:', err);
    showToast('Erro ao carregar usuário logado.', 'error');
    loggedUser = null;
  }

  function fillProfileUI(u) {
    if (!u) return;
    nameElem.textContent = u.name1 || 'Usuário';
    bioElem.textContent = u.descricao || '';
    avatarElem.src = u.imagem_perfil || './src/img/icons/profile-icon.jpg';

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

  function fillProjectsUI(projects) {
    projectsContainer.innerHTML = '';
    if (!projects.length) {
      projectsContainer.innerHTML = '<p>Este usuário não possui projetos.</p>';
      return;
    }

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
      projectFooter.innerHTML = `<h3>${p.titulo ?? 'Projeto sem título'}</h3>`;

      projectLink.appendChild(projectImgDiv);
      projectLink.appendChild(projectFooter);
      projectsContainer.appendChild(projectLink);
    });
  }

  async function loadProfile() {
    try {
      const idToFetch = profileId ? profileId : (loggedUser?.id ?? null);
      if (!idToFetch) {
        showToast('ID do usuário não encontrado.', 'error');
        return;
      }

      const data = await getUserProfile(idToFetch);
      profileUser = normalizeUser(data.user ?? data);
      profileProjects = data.projects ?? [];

      fillProfileUI(profileUser);
      fillProjectsUI(profileProjects);

      if (loggedUser && profileUser && Number(loggedUser.id) === Number(profileUser.id)) {
        editProfileBtn.classList.remove('hidden');
      } else {
        editProfileBtn.classList.add('hidden');
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      showToast('Erro ao carregar perfil do usuário.', 'error');
    }
  }

  await loadProfile();

  // Popup de edição
  editProfileBtn.addEventListener('click', () => {
    if (!profileUser) return;
    popup.classList.remove('hidden');
    descricaoInput.value = profileUser.descricao || '';
    instagramInput.value = profileUser.instagram || '';
    linkedinInput.value = profileUser.linkedin || '';
    githubInput.value = profileUser.github || '';
    popupAvatar.src = profileUser.imagem_perfil || './src/img/icons/profile-icon.jpg';
  });

  closePopupBtn.addEventListener('click', () => popup.classList.add('hidden'));
  popup.addEventListener('click', e => { if (e.target === popup) popup.classList.add('hidden'); });

  avatarInputPopup.addEventListener('change', () => {
    const file = avatarInputPopup.files[0];
    if (!file) return;
    popupAvatar.src = URL.createObjectURL(file);
  });

  editForm.addEventListener('submit', async e => {
    e.preventDefault();

    if (!profileUser || !loggedUser || Number(profileUser.id) !== Number(loggedUser.id)) {
      showToast('Você não tem permissão para editar este perfil.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('descricao', descricaoInput.value || '');
    formData.append('instagram', instagramInput.value.trim() || '');
    formData.append('linkedin', linkedinInput.value.trim() || '');
    formData.append('github', githubInput.value.trim() || '');
    if (avatarInputPopup.files[0]) formData.append('imagem_perfil', avatarInputPopup.files[0]);

    try {
      const result = await updateUserProfile(formData);
      profileUser = normalizeUser(result.user ?? result);
      fillProfileUI(profileUser);
      popup.classList.add('hidden');
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      showToast('Erro ao atualizar perfil.', 'error');
    }
  });
});