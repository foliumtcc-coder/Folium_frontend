import { getUser, fetchNotifications as apiFetchNotifications, markNotificationAsRead, acceptInvite } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const notificationButton = document.getElementById('notification-button');
  const notificationContainer = notificationButton.parentElement;
  notificationContainer.style.position = 'relative';

  // Estiliza o botão
  notificationButton.style.width = '30px';
  notificationButton.style.height = '30px';
  notificationButton.style.borderRadius = '50%';
  notificationButton.style.display = 'inline-flex';
  notificationButton.style.justifyContent = 'center';
  notificationButton.style.alignItems = 'center';
  notificationButton.style.background = 'none';
  notificationButton.style.border = 'none';
  notificationButton.style.cursor = 'pointer';

  // Cria badge
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

  // Cria menu dropdown
  const notificationMenu = document.createElement('div');
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
  notificationMenu.style.display = 'none';
  notificationMenu.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  notificationContainer.appendChild(notificationMenu);

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
      item.style.background = n.lida ? '#fff' : '#f0f8ff';
      item.style.transition = 'background 0.2s';
      item.addEventListener('mouseenter', () => item.style.background = '#f5f5f5');
      item.addEventListener('mouseleave', () => item.style.background = n.lida ? '#fff' : '#f0f8ff');

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
        aceitarBtn.style.border = 'none';
        aceitarBtn.style.borderRadius = '4px';
        aceitarBtn.style.cursor = 'pointer';
        aceitarBtn.style.backgroundColor = '#4caf50';
        aceitarBtn.style.color = '#fff';
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
        recusarBtn.style.border = 'none';
        recusarBtn.style.borderRadius = '4px';
        recusarBtn.style.cursor = 'pointer';
        recusarBtn.style.backgroundColor = '#f44336';
        recusarBtn.style.color = '#fff';
        recusarBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          n.lida = true;
          renderNotifications();
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
    notificationMenu.style.display = notificationMenu.style.display === 'block' ? 'none' : 'block';
  });

  // Fecha dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    if (!notificationContainer.contains(e.target)) {
      notificationMenu.style.display = 'none';
    }
  });

  // Inicializa
  fetchNotifications();
  setInterval(fetchNotifications, 5000);
});
