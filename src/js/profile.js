import { getUser } from './api.js';

const profileForm = document.querySelector('.edit-profile-form');

async function loadProfile() {
  const token = localStorage.getItem('accessToken');
  const { user } = await getUser();
  if (!user) return window.location.href = '/login.html';

  const res = await fetch(`/api/auth/profile/${user.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (data.error) return alert(data.error);

  // Preencher campos
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
  loadProfile();
});

document.addEventListener('DOMContentLoaded', loadProfile);
