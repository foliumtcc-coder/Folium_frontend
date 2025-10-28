import { getUser, fetchNotifications as apiFetchNotifications, acceptInvite, rejectInvite } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const notificationButton = document.getElementById('notification-button');
  const notificationContainer = notificationButton.parentElement;
  notificationContainer.style.position = 'relative';

  const isDarkMode = () => document.body.classList.contains('dark-mode');

  const getColors = () => {
    if (isDarkMode()) {
      return {
        menuBg: '#2a2a2a',
        menuText: '#f0f0f0',
        menuBorder: '#444',
        itemBg: '#333',
        itemBgUnread: '#3a3a3a',
        itemHover: '#404040',
        shadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
        buttonAccept: '#7127d8',
        buttonReject: '#d32f2f'
      };
    }
    return {
      menuBg: '#fff',
      menuText: '#333',
      menuBorder: '#eee',
      itemBg: '#fff',
      itemBgUnread: '#f0f0f0ff',
      itemHover: '#f5f5f5',
      shadow: '0 2px 6px rgba(0,0,0,0.2)',
      buttonAccept: '#4caf50',
      buttonReject: '#f44336'
    };
  };

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
  let currentColors = getColors();
  notificationMenu.style.position = 'absolute';
  notificationMenu.style.right = '0';
  notificationMenu.style.top = '100%';
  notificationMenu.style.minWidth = '250px';
  notificationMenu.style.maxHeight = '400px';
  notificationMenu.style.overflowY = 'auto';
  notificationMenu.style.background = currentColors.menuBg;
  notificationMenu.style.color = currentColors.menuText;
  notificationMenu.style.boxShadow = currentColors.shadow;
  notificationMenu.style.borderRadius = '8px';
  notificationMenu.style.zIndex = '1000';
  notificationMenu.style.display = 'none';
  notificationMenu.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  notificationContainer.appendChild(notificationMenu);

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
    currentColors = getColors();
    notificationMenu.style.background = currentColors.menuBg;
    notificationMenu.style.color = currentColors.menuText;
    notificationMenu.style.boxShadow = currentColors.shadow;

    const unreadCount = notifications.filter(n => !n.lida).length;
    badge.style.display = unreadCount ? 'inline-block' : 'none';
    badge.textContent = unreadCount;

    if (!notifications.length) {
      const empty = document.createElement('div');
      empty.textContent = 'Nenhuma notificação';
      empty.style.padding = '10px';
      empty.style.color = currentColors.menuText;
      notificationMenu.appendChild(empty);
      return;
    }

    notifications.forEach(n => {
      const item = document.createElement('div');
      item.style.padding = '10px';
      item.style.borderBottom = `1px solid ${currentColors.menuBorder}`;
      item.style.display = 'flex';
      item.style.flexDirection = 'column';
      item.style.gap = '5px';
      item.style.background = n.lida ? currentColors.itemBg : currentColors.itemBgUnread;
      item.style.color = currentColors.menuText;
      item.style.transition = 'background 0.2s';
      item.addEventListener('mouseenter', () => item.style.background = currentColors.itemHover);
      item.addEventListener('mouseleave', () => item.style.background = n.lida ? currentColors.itemBg : currentColors.itemBgUnread);

      const mensagem = document.createElement('span');
      mensagem.textContent = n.mensagem;
      item.appendChild(mensagem);

      if (n.tipo === 'convite') {
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '5px';

        const aceitarBtn = document.createElement('button');
        aceitarBtn.textContent = 'Aceitar';
        aceitarBtn.style.padding = '2px 6px';
        aceitarBtn.style.border = 'none';
        aceitarBtn.style.borderRadius = '4px';
        aceitarBtn.style.cursor = 'pointer';
        aceitarBtn.style.backgroundColor = currentColors.buttonAccept;
        aceitarBtn.style.color = '#fff';
        aceitarBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            await acceptInvite(n.projeto_id); // chama backend
            notifications = notifications.filter(notif => notif.id !== n.id); // remove local
            renderNotifications();
          } catch (err) {
            console.error('Erro ao aceitar convite:', err);
          }
        });

        const recusarBtn = document.createElement('button');
        recusarBtn.textContent = 'Recusar';
        recusarBtn.style.padding = '2px 6px';
        recusarBtn.style.border = 'none';
        recusarBtn.style.borderRadius = '4px';
        recusarBtn.style.cursor = 'pointer';
        recusarBtn.style.backgroundColor = currentColors.buttonReject;
        recusarBtn.style.color = '#fff';
        recusarBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            await rejectInvite(n.projeto_id); // chama backend
            notifications = notifications.filter(notif => notif.id !== n.id); // remove local
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

  notificationButton.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationMenu.style.display = notificationMenu.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (!notificationContainer.contains(e.target)) {
      notificationMenu.style.display = 'none';
    }
  });

  const observer = new MutationObserver(() => {
    renderNotifications();
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  fetchNotifications();
  setInterval(fetchNotifications, 5000);
});
