import { getUser, logout } from './api.js';

const LoginManager = (() => {
  const profileMenuId = 'profile-dropdown-menu';
  const profileButtonId = 'profile-button';

  async function fetchUser() {
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileMenu) return;

    try {
      const { user } = await getUser();

      if (user) {
        // 🔹 Usuário logado: mostra o nome e logout
        profileMenu.innerHTML = `
          <ul>
            <li><a href="profile-page.html?id=${user.id}"><strong>${user.name1}</strong></a></li>
            <li><a href="#" id="logout-link">Sair</a></li>
          </ul>
        `;

        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
          logoutLink.addEventListener('click', async e => {
            e.preventDefault();
            await logout(); // remove token
            window.location.href = 'index.html';
          });
        }

      } else {
        // 🔹 Usuário não logado: mostra links de registro e login
        profileMenu.innerHTML = `
          <ul>
            <li><a href="register-page.html">Registrar</a></li>
            <li><a href="index.html">Entrar</a></li>
          </ul>
        `;
      }

    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
    }
  }

  function setupDropdown() {
    const profileBtn = document.getElementById(profileButtonId);
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileBtn || !profileMenu) return;

    profileBtn.addEventListener('click', () => profileMenu.classList.toggle('hidden'));
    document.addEventListener('click', e => {
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
