import { fetchNotifications, acceptInvite, rejectInvite } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const notificationButton = document.getElementById('notification-button');
  const notificationContainer = notificationButton.parentElement;
  notificationContainer.style.position = 'relative';

  const badge = document.createElement('span');
  badge.id = 'notification-badge';
  badge.style.position = 'absolute';
  badge.style.top = '-5px';
  badge.style.right = '-5px';
  badge.style.background = 'red';
  badge.style.color = '#fff';
  badge.style.borderRadius = '50%';
  badge.style.padding = '2px 6px';
  badge.style.fontSize = '12px';
  badge.style.fontWeight = 'bold';
  badge.style.display = 'none';
  badge.style.pointerEvents = 'none';
  notificationContainer.appendChild(badge);

  const notificationMenu = document.createElement('div');
  notificationMenu.style.position = 'absolute';
  notificationMenu.style.right = '0';
  notificationMenu.style.top = '100%';
  notificationMenu.style.minWidth = '250px';
  notificationMenu.style.maxHeight = '400px';
  notificationMenu.style.overflowY = 'auto';
  notificationMenu.style.background = '#fff';
  notificationMenu.style.color = '#333';
  notificationMenu.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  notificationMenu.style.borderRadius = '8px';
  notificationMenu.style.zIndex = '1000';
  notificationMenu.style.display = 'none';
  notificationContainer.appendChild(notificationMenu);

  let notifications = [];

  async function loadNotifications() {
    notifications = await fetchNotifications();
    renderNotifications();
  }

  function renderNotifications() {
    notificationMenu.innerHTML = '';
    const unreadCount = notifications.filter(n => !n.lida).length;
    badge.style.display = unreadCount ? 'inline-block' : 'none';
    badge.textContent = unreadCount;

    if (!notifications.length) {
      const empty = document.createElement('div');
      empty.textContent = 'Nenhuma notificação';
      empty.style.padding = '10px';
      notificationMenu.appendChild(empty);
      return;
    }

    notifications.forEach(n => {
      const item = document.createElement('div');
      item.style.padding = '10px';
      item.style.borderBottom = '1px solid #eee';
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.gap = '5px';

      const mensagem = document.createElement('span');
      mensagem.textContent = n.mensagem;
      item.appendChild(mensagem);

      if (n.tipo === 'convite') {
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '5px';

        const aceitarBtn = document.createElement('button');
        aceitarBtn.textContent = 'Aceitar';
        aceitarBtn.style.backgroundColor = '#4caf50';
        aceitarBtn.style.color = '#fff';
        aceitarBtn.addEventListener('click', async () => {
          try {
            await acceptInvite(n.projeto_id);
            notifications = notifications.filter(notif => notif.id !== n.id);
            renderNotifications();
          } catch (err) {
            console.error(err);
          }
        });

        const recusarBtn = document.createElement('button');
        recusarBtn.textContent = 'Recusar';
        recusarBtn.style.backgroundColor = '#f44336';
        recusarBtn.style.color = '#fff';
        recusarBtn.addEventListener('click', async () => {
          try {
            await rejectInvite(n.projeto_id);
            notifications = notifications.filter(notif => notif.id !== n.id);
            renderNotifications();
          } catch (err) {
            console.error(err);
          }
        });

        btnContainer.appendChild(aceitarBtn);
        btnContainer.appendChild(recusarBtn);
        item.appendChild(btnContainer);
      }

      notificationMenu.appendChild(item);
    });
  }

  notificationButton.addEventListener('click', () => {
    notificationMenu.style.display = notificationMenu.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (!notificationContainer.contains(e.target)) {
      notificationMenu.style.display = 'none';
    }
  });

  loadNotifications();
  setInterval(loadNotifications, 5000);
});
