import { getUser, fetchNotifications as apiFetchNotifications, markNotificationAsRead } from './api.js';

const notificationButton = document.getElementById('notification-button');
const notificationContainer = notificationButton.parentElement;
notificationContainer.style.position = 'relative';

// Criar dropdown
const notificationMenu = document.createElement('div');
notificationMenu.style.position = 'absolute';
notificationMenu.style.top = '100%';
notificationMenu.style.right = '0';
notificationMenu.style.minWidth = '250px';
notificationMenu.style.maxHeight = '400px';
notificationMenu.style.overflowY = 'auto';
notificationMenu.style.background = '#fff';
notificationMenu.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
notificationMenu.style.borderRadius = '8px';
notificationMenu.style.zIndex = '1000';
notificationMenu.style.display = 'none';
notificationContainer.appendChild(notificationMenu);

// Criar badge
const badge = document.createElement('span');
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

// Renderiza dropdown
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
    item.textContent = n.mensagem;
    item.style.padding = '10px';
    item.style.cursor = 'pointer';
    item.style.borderBottom = '1px solid #eee';
    item.style.background = n.lida ? '#fff' : '#f0f8ff';

    item.addEventListener('mouseenter', () => item.style.background = '#f5f5f5');
    item.addEventListener('mouseleave', () => item.style.background = n.lida ? '#fff' : '#f0f8ff');
    item.addEventListener('click', async () => {
      if (!n.lida) {
        await markNotificationAsRead(n.id);
        n.lida = true;
        renderNotifications();
      }
    });

    notificationMenu.appendChild(item);
  });
}

// Buscar notificações
async function fetchNotifications() {
  const { user } = await getUser();
  if (!user) return;
  notifications = await apiFetchNotifications();
  renderNotifications();
}

// Toggle dropdown
notificationButton.addEventListener('click', (e) => {
  e.stopPropagation();
  notificationMenu.style.display = notificationMenu.style.display === 'none' ? 'block' : 'none';
});

// Fecha dropdown ao clicar fora
document.addEventListener('click', () => {
  notificationMenu.style.display = 'none';
});

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
  fetchNotifications();
  setInterval(fetchNotifications, 5000);
});
