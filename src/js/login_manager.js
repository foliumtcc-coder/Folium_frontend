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
        // Certifique-se de usar o campo correto do usuário
        profileMenu.innerHTML = `
          <ul>
            <li><a href="profile-page.html?id=${user.id}"><strong>${user.name1 || 'Usuário'}</strong></a></li>
            <li><a href="#" id="logout-link">Sair</a></li>
          </ul>
        `;

        // Configura logout
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
          logoutLink.addEventListener('click', async e => {
            e.preventDefault();
            try {
              await logout(); // remove token
            } catch (err) {
              console.error('Erro no logout:', err);
            }
            updateMenuAfterLogout();
          });
        }
      } else {
        updateMenuAfterLogout();
      }
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      updateMenuAfterLogout();
    }
  }

  function updateMenuAfterLogout() {
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileMenu) return;

    profileMenu.innerHTML = `
      <ul>
        <li><a href="register.html">Registrar</a></li>
        <li><a href="index.html">Entrar</a></li>
      </ul>
    `;
  }

  function setupDropdown() {
    const profileBtn = document.getElementById(profileButtonId);
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileBtn || !profileMenu) return;

    profileBtn.addEventListener('click', e => {
      e.stopPropagation(); // evita fechar imediatamente
      profileMenu.classList.toggle('hidden');
    });

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
