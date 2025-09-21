import { getUser, logout as apiLogout } from './api.js';

const LoginManager = (() => {
  const profileMenuId = 'profile-dropdown-menu';
  const profileButtonId = 'profile-button';

  // ===================== FETCH USER =====================
  async function fetchUser() {
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileMenu) return;

    try {
      const data = await getUser();
      const user = data.user; // sempre definido ou null

      if (user) {
        profileMenu.innerHTML = `
          <ul>
            <li><a href="profile-page.html?id=${user.id}"><strong>${user.name}</strong></a></li>
            <li><a href="#" id="logout-link">Sair</a></li>
          </ul>
        `;

        // logout atualiza o menu dinamicamente
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
          logoutLink.addEventListener('click', async e => {
            e.preventDefault();
            await apiLogout();
            fetchUser(); // atualiza menu após logout
          });
        }
      } else {
        profileMenu.innerHTML = `
          <ul>
            <li><a href="register-page.html">Registrar</a></li>
            <li><a href="index.html">Entrar</a></li>
          </ul>
        `;
      }
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      profileMenu.innerHTML = `
        <ul>
          <li><a href="register-page.html">Registrar</a></li>
          <li><a href="index.html">Entrar</a></li>
        </ul>
      `;
    }
  }

  // ===================== DROPDOWN =====================
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

  // ===================== INIT =====================
  function init() {
    fetchUser();
    setupDropdown();
  }

  return { init };
})();

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  LoginManager.init();
});
