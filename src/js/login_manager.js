import { getUser, logout as apiLogout } from './api.js';

const LoginManager = (() => {
  const profileMenuId = 'profile-dropdown-menu';
  const profileButtonId = 'profile-button';

  async function fetchUser() {
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileMenu) return;

    try {
      const data = await getUser();
      if (data.user) {
        profileMenu.innerHTML = `
          <ul>
            <li><a href="profile-page.html?id=${data.user.id}"><strong>${data.user.name}</strong></a></li>
            <li><a href="#" id="logout-link">Sair</a></li>
          </ul>
        `;
        document.getElementById('logout-link').addEventListener('click', async e => {
          e.preventDefault();
          await apiLogout();
          window.location.href = 'index.html';
        });
      } else {
        profileMenu.innerHTML = `
          <ul>
            <li><a href="register-page.html">Registrar</a></li>
            <li><a href="index.html">Entrar</a></li>
          </ul>
        `;
      }
    } catch (err) {
      console.error(err);
    }
  }

  function setupDropdown() {
    const profileBtn = document.getElementById(profileButtonId);
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileBtn || !profileMenu) return;

    profileBtn.addEventListener('click', () => profileMenu.classList.toggle('hidden'));

    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.add('hidden');
      }
    });
  }

  function init() {
    fetchUser();
    setupDropdown();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  LoginManager.init();
});


