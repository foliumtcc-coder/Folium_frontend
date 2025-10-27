import { getUser, logout } from './api.js';

const LoginManager = (() => {
  const profileMenuId = 'profile-dropdown-menu';
  const profileButtonId = 'profile-button';

  // 🔠 Função para capitalizar cada palavra do nome
  function capitalizeName(name) {
    if (!name) return 'Usuário';
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  async function fetchUser() {
    const profileMenu = document.getElementById(profileMenuId);
    if (!profileMenu) return;

    try {
      const { user } = await getUser();

      if (user) {
        // Certifique-se de usar o campo correto do usuário
        const formattedName = capitalizeName(user.name1 || 'Usuário');
        
        profileMenu.innerHTML = `
          <ul>
            <li><a href="profile-page.html?id=${user.id}"><strong>${formattedName}</strong></a></li>
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
              // Redireciona para a página inicial após logout
              window.location.href = 'index.html';
            } catch (err) {
              console.error('Erro no logout:', err);
              // Redireciona mesmo se houver erro
              window.location.href = 'index.html';
            }
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