import { getUser, fetchNotifications as apiFetchNotifications, markNotificationAsRead } from './api.js';

const notificationButton = document.getElementById('notification-button');
const notificationContainer = notificationButton.parentElement; // div.notification-button
notificationContainer.style.position = 'relative';

// Cria menu dropdown
const notificationMenu = document.createElement('div');
notificationMenu.classList.add('dropdown-menu', 'hidden');
Object.assign(notificationMenu.style, {
  position: 'absolute',
  right: '0',
  top: '100%',
  minWidth: '250px',
  maxHeight: '400px',
  overflowY: 'auto',
  background: '#fff',
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  borderRadius: '8px',
  zIndex: '1000',
});
notificationContainer.appendChild(notificationMenu);

// Cria badge
const badge = document.createElement('span');
badge.id = 'notification-badge';
Object.assign(badge.style, {
  position: 'absolute',
  top: '0',
  right: '0',
  background: 'red',
  color: '#fff',
  borderRadius: '50%',
  padding: '2px 6px',
  fontSize: '12px',
  fontWeight: 'bold',
  display: 'none',
});
notificationContainer.appendChild(badge);

let notifications = [];

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

function renderNotifications() {
  notificationMenu.innerHTML = '';

  const unreadCount = notifications.filter(n => !n.lida).length;
  badge.style.display = unreadCount ? 'inline-block' : 'none';
  badge.textContent = unreadCount;

  if (!notifications.length) {
    // Permite abrir dropdown mesmo sem notificações
    notificationMenu.innerHTML = '<div style="padding:10px;">Nenhuma notificação</div>';
  } else {
    notifications.forEach(n => {
      const item = document.createElement('div');
      item.textContent = n.mensagem;
      Object.assign(item.style, {
        padding: '10px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
        background: n.lida ? '#fff' : '#f0f8ff',
        transition: 'background 0.2s',
      });

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
}

// Toggle dropdown
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
