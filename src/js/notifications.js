import { getUser } from './api.js';

const notificationButton = document.getElementById('notification-button');

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
notificationButton.parentElement.appendChild(notificationMenu);

// Cria badge
const badge = document.createElement('span');
badge.id = 'notification-badge';
badge.style.position = 'absolute';
badge.style.top = '5px';
badge.style.right = '5px';
badge.style.background = 'red';
badge.style.color = '#fff';
badge.style.borderRadius = '50%';
badge.style.padding = '2px 6px';
badge.style.fontSize = '12px';
badge.style.fontWeight = 'bold';
badge.style.display = 'none';
notificationButton.appendChild(badge);

let notifications = [];

// Busca notificações do usuário
async function fetchNotifications() {
  try {
    const { user } = await getUser();
    if (!user) return;

    const token = localStorage.getItem('accessToken');
    const res = await fetch(`https://folium-backend.onrender.com/api/notifications/${user.email}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Erro ao buscar notificações');

    notifications = await res.json(); // [{id, message, read}]
    renderNotifications();
  } catch (err) {
    console.error('Erro ao buscar notificações:', err);
  }
}

// Renderiza o dropdown
function renderNotifications() {
  notificationMenu.innerHTML = '';
  const unreadCount = notifications.filter(n => !n.read).length;
  badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  badge.textContent = unreadCount;

  if (notifications.length === 0) {
    notificationMenu.innerHTML = '<div style="padding:10px;">Nenhuma notificação</div>';
    return;
  }

  notifications.forEach(n => {
    const item = document.createElement('div');
    item.textContent = n.message;
    item.style.padding = '10px';
    item.style.cursor = 'pointer';
    item.style.borderBottom = '1px solid #eee';
    item.style.background = n.read ? '#fff' : '#f0f8ff';
    item.style.transition = 'background 0.2s';

    item.addEventListener('mouseenter', () => item.style.background = '#f5f5f5');
    item.addEventListener('mouseleave', () => item.style.background = n.read ? '#fff' : '#f0f8ff');

    // Marca como lida ao clicar
    item.addEventListener('click', async () => {
      await markAsRead(n.id);
      n.read = true;
      renderNotifications();
    });

    notificationMenu.appendChild(item);
  });
}

// Marca notificação como lida
async function markAsRead(notificationId) {
  const token = localStorage.getItem('accessToken');
  await fetch(`https://folium-backend.onrender.com/api/notifications/read/${notificationId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
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
  // Atualiza notificações a cada 5 segundos
  setInterval(fetchNotifications, 5000);
});

