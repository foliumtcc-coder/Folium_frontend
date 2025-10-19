import { apiGet } from './api.js';

// Função genérica para renderizar projetos em uma sessão
const renderProjects = (containerSelector, projects) => {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = '';

  projects.forEach(project => {
    const projectLink = document.createElement('a');
    projectLink.href = `project-page.html?id=${project.id}`;
    projectLink.innerHTML = `
      <div class="project-block">
        <div class="project-img">
          <img src="${project.capa_url || './src/img/icons/project-image.png'}" alt="${project.nome}" onerror="this.src='./src/img/icons/project-image.png'">
        </div>
        <div class="project-footer">
          <div class="project-name">
            <span>${project.nome || 'Projeto sem título'}</span>
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

// Configura botões de scroll dos carrosséis
const setupScrollButtons = () => {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const container = carousel.querySelector('.section-blocks-container');
    const leftButton = carousel.querySelector('.left-button');
    const rightButton = carousel.querySelector('.right-button');

    if (!container || !leftButton || !rightButton) return;

    leftButton.addEventListener('click', () => {
      container.scrollBy({ left: -320, behavior: 'smooth' });
    });

    rightButton.addEventListener('click', () => {
      container.scrollBy({ left: 320, behavior: 'smooth' });
    });

    const updateButtonsVisibility = () => {
      const isAtStart = container.scrollLeft <= 0;
      const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;

      leftButton.style.opacity = isAtStart ? '0.5' : '1';
      rightButton.style.opacity = isAtEnd ? '0.5' : '1';
    };

    container.addEventListener('scroll', updateButtonsVisibility);
    updateButtonsVisibility();
  });
};

// Função placeholder para mostrar opções do projeto
window.showProjectOptions = (projectId) => {
  console.log('Mostrar opções do projeto:', projectId);
};

// Carregar todas as seções da Home
const loadHomeProjects = async () => {
  try {
    const recentes = await apiGet('/home/recentes');
    renderProjects('.main-sub-section:nth-of-type(1) .section-blocks-container', recentes);

    const destaques = await apiGet('/home/destaques');
    renderProjects('.main-sub-section:nth-of-type(2) .section-blocks-container', destaques);

    const populares = await apiGet('/home/populares');
    renderProjects('.main-sub-section:nth-of-type(3) .section-blocks-container', populares);

    setupScrollButtons();

    console.log('Projetos carregados na home:', {
      recentes: recentes.length,
      destaques: destaques.length,
      populares: populares.length
    });
  } catch (err) {
    console.error('Erro ao carregar projetos da Home:', err);
    setupScrollButtons(); // Mantém scroll funcionando mesmo em caso de erro
  }
};

// Atualiza projetos manualmente
export const refreshHomeProjects = () => {
  loadHomeProjects();
};

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', loadHomeProjects);

// Atualiza automaticamente a cada 30 segundos
setInterval(loadHomeProjects, 30000);
