// login-manager.js
import { logout as apiLogout } from './api.js'; // importa função de logout
import { BACKEND_URL } from './api.js'; // opcional, caso precise da URL

const LoginManager = (() => {
  const profileMenuId = 'profile-dropdown-menu';
  const profileButtonId = 'profile-button';

  // Busca usuário logado e atualiza o dropdown
  async function fetchUser() {
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileMenu) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/user/me`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.user) {
        profileMenu.innerHTML = `
          <ul>
            <li><a href="profile-page.html?id=${data.user.id}"><strong>${data.user.name}</strong></a></li>
            <li><a href="#" id="logout-link">Sair</a></li>
          </ul>
        `;
        const logoutLink = document.getElementById('logout-link');
        logoutLink.addEventListener('click', logout);
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
    }
  }

  // Faz logout
  async function logout(e) {
    e.preventDefault();
    try {
      await apiLogout();
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
  }

  // Configura dropdown do perfil
  function setupDropdown() {
    const profileBtn = document.getElementById(profileButtonId);
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileBtn || !profileMenu) return;

    profileBtn.addEventListener('click', () => {
      profileMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
      if (!profileBtn.contains(event.target) && !profileMenu.contains(event.target)) {
        profileMenu.classList.add('hidden');
      }
    });
  }

  // Inicializa
  function init() {
    fetchUser();
    setupDropdown();
  }

  return { init };
})();

// Executa quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  LoginManager.init();
});
