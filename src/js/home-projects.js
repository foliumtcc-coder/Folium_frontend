// src/js/home-projects.js

// Função genérica para renderizar projetos em uma sessão
const renderProjects = (containerSelector, projects) => {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = '';

  projects.forEach(project => {
    const projectLink = document.createElement('a');
    projectLink.href = `project-page.html?id=${project.id}`;
    projectLink.className = 'project-link';
    projectLink.innerHTML = `
      <div class="project-block">
        <div class="project-img">
          <img src="${project.capa_url || project.imagem || './src/img/icons/project-image.png'}" alt="${project.nome || project.titulo}" onerror="this.src='./src/img/icons/project-image.png'">
        </div>
        <div class="project-footer">
          <div class="project-name">
            <span>${project.nome || project.titulo || 'Projeto sem título'}</span>
          </div>
          <div class="project-views">
            <span><i class="fa-solid fa-eye"></i> ${project.visualizacoes || 0}</span>
          </div>
          <button class="project-options" onclick="event.preventDefault(); event.stopPropagation(); showProjectOptions(${project.id})">
            <span class="fa-solid fa-ellipsis-vertical"></span>
          </button>
        </div>
      </div>
    `;
    container.appendChild(projectLink);
  });
};

// Função genérica para buscar projetos
const fetchProjects = async (endpoint) => {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Erro ao buscar ${endpoint}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Carregar todas as seções da Home
const loadHomeProjects = async () => {
  const [recentes, destaques, populares] = await Promise.all([
    fetchProjects('/api/auth/home/recentes'),
    fetchProjects('/api/auth/home/destaques'),
    fetchProjects('/api/auth/home/populares')
  ]);

  renderProjects('.main-sub-section:nth-of-type(1) .section-blocks-container', recentes);
  renderProjects('.main-sub-section:nth-of-type(2) .section-blocks-container', destaques);
  renderProjects('.main-sub-section:nth-of-type(3) .section-blocks-container', populares);

  setupScrollButtons();
};

// Configura os botões de scroll dos carrosséis
const setupScrollButtons = () => {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const container = carousel.querySelector('.section-blocks-container');
    const leftButton = carousel.querySelector('.left-button');
    const rightButton = carousel.querySelector('.right-button');
    if (!container || !leftButton || !rightButton) return;

    leftButton.addEventListener('click', () => container.scrollBy({ left: -320, behavior: 'smooth' }));
    rightButton.addEventListener('click', () => container.scrollBy({ left: 320, behavior: 'smooth' }));

    const updateButtonsVisibility = () => {
      leftButton.style.opacity = container.scrollLeft <= 0 ? '0.5' : '1';
      rightButton.style.opacity = container.scrollLeft >= container.scrollWidth - container.clientWidth ? '0.5' : '1';
    };

    container.addEventListener('scroll', updateButtonsVisibility);
    updateButtonsVisibility();
  });
};

// Placeholder de menu de opções do projeto
window.showProjectOptions = (projectId) => {
  console.log('Mostrar opções para projeto:', projectId);
};

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', loadHomeProjects);

// Atualiza projetos a cada 30 segundos
setInterval(loadHomeProjects, 30000);
