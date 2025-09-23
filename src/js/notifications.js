import { getUser, fetchNotifications as apiFetchNotifications, markNotificationAsRead, acceptInvite } from './api.js';

const notificationButton = document.getElementById('notification-button');
const notificationContainer = notificationButton.parentElement;
notificationContainer.style.position = 'relative';

// Cria menu dropdown
const notificationMenu = document.createElement('div');
notificationMenu.classList.add('dropdown-menu', 'hidden');
notificationMenu.style.position = 'absolute';
notificationMenu.style.right = '0';
notificationMenu.style.top = '100%';
notificationMenu.style.minWidth = '250px';
notificationMenu.style.maxHeight = '400px';
notificationMenu.style.overflowY = 'auto';
notificationMenu.style.background = '#fff';
notificationMenu.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
notificationMenu.style.borderRadius = '8px';
notificationMenu.style.zIndex = '1000';
notificationContainer.appendChild(notificationMenu);

// Cria badge
const badge = document.createElement('span');
badge.id = 'notification-badge';
badge.style.position = 'absolute';
badge.style.top = '0';
badge.style.right = '0';
badge.style.background = 'red';
badge.style.color = '#fff';
badge.style.borderRadius = '50%';
badge.style.padding = '2px 6px';
badge.style.fontSize = '12px';
badge.style.fontWeight = 'bold';
badge.style.display = 'none';
notificationContainer.appendChild(badge);

let notifications = [];

// Buscar notificações
async function fetchNotifications() {
  try {
    const { user } = await getUser();
    if (!user) return;

    notifications = await apiFetchNotifications();
    renderNotifications();
  } catch (err) {
    console.error('Erro ao buscar notificações:', err);
    notifications = [];
    renderNotifications();
  }
}

// Renderiza notificações
function renderNotifications() {
  notificationMenu.innerHTML = '';

  const unreadCount = notifications.filter(n => !n.lida).length;
  badge.style.display = unreadCount ? 'inline-block' : 'none';
  badge.textContent = unreadCount;

  if (!notifications.length) {
    notificationMenu.innerHTML = '<div style="padding:10px;">Nenhuma notificação</div>';
    return;
  }

  notifications.forEach(n => {
    const item = document.createElement('div');
    item.style.padding = '10px';
    item.style.borderBottom = '1px solid #eee';
    item.style.background = n.lida ? '#fff' : '#f0f8ff';
    item.style.display = 'flex';
    item.style.flexDirection = 'column';
    item.style.gap = '5px';

    const mensagem = document.createElement('span');
    mensagem.textContent = n.mensagem;
    item.appendChild(mensagem);

    // Botões de convite
    if (n.tipo === 'convite') {
      const btnContainer = document.createElement('div');
      btnContainer.style.display = 'flex';
      btnContainer.style.gap = '5px';

      const aceitarBtn = document.createElement('button');
      aceitarBtn.textContent = 'Aceitar';
      aceitarBtn.style.padding = '2px 6px';
      aceitarBtn.style.background = '#4caf50';
      aceitarBtn.style.color = '#fff';
      aceitarBtn.style.border = 'none';
      aceitarBtn.style.borderRadius = '4px';
      aceitarBtn.style.cursor = 'pointer';
      aceitarBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await acceptInvite(n.projeto_id);
          n.lida = true;
          renderNotifications();
        } catch (err) {
          console.error('Erro ao aceitar convite:', err);
        }
      });

      const recusarBtn = document.createElement('button');
      recusarBtn.textContent = 'Recusar';
      recusarBtn.style.padding = '2px 6px';
      recusarBtn.style.background = '#f44336';
      recusarBtn.style.color = '#fff';
      recusarBtn.style.border = 'none';
      recusarBtn.style.borderRadius = '4px';
      recusarBtn.style.cursor = 'pointer';
      recusarBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          // Por enquanto só marca como lida; crie endpoint para recusar se quiser
          n.lida = true;
          renderNotifications();
        } catch (err) {
          console.error('Erro ao recusar convite:', err);
        }
      });

      btnContainer.appendChild(aceitarBtn);
      btnContainer.appendChild(recusarBtn);
      item.appendChild(btnContainer);
    }

    notificationMenu.appendChild(item);
  });
}

// Toggle do dropdown
notificationButton.addEventListener('click', (e) => {
  e.stopPropagation();
  notificationMenu.classList.toggle('hidden');
});

// Fecha dropdown ao clicar fora
document.addEventListener('click', () => {
  notificationMenu.classList.add('hidden');
});

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
  fetchNotifications();
  setInterval(fetchNotifications, 5000);
});
