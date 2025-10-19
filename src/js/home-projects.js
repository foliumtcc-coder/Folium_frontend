// home-projects.js
import { getUser, getUserProfile } from './api.js';

// Função para criar HTML de um projeto
function createProjectHTML(project) {
  const imageUrl = project.imagem || './src/img/icons/project-image.png';
  const visualizacoes = project.visualizacoes || 0;

  return `
    <a href="project-page.html?id=${project.id}">
      <div class="project-block">
        <div class="project-img">
          <img src="${imageUrl}" alt="${project.titulo}" onerror="this.src='./src/img/icons/project-image.png'">
        </div>
        <div class="project-footer">
          <div class="project-name">
            <span>${project.titulo || 'Projeto sem título'}</span>
          </div>
          <div class="project-stats">
            <span class="visualizacoes">
              <i class="fa-solid fa-eye"></i> ${visualizacoes}
            </span>
          </div>
          <button class="project-options" onclick="event.preventDefault(); event.stopPropagation(); showProjectOptions(${project.id})">
            <span class="fa-solid fa-ellipsis-vertical"></span>
          </button>
        </div>
      </div>
    </a>
  `;
}

// Função para preencher uma seção com projetos
function populateSection(sectionContainer, projects) {
  if (!sectionContainer) return;
  const projectsHTML = projects.slice(0, 5).map(createProjectHTML).join('');
  sectionContainer.innerHTML = projectsHTML;
}

// Buscar projetos recentes (todos públicos)
async function fetchRecentProjects() {
  try {
    const res = await fetch('/api/projects/recentes');
    if (!res.ok) throw new Error('Erro ao buscar projetos recentes');
    const projects = await res.json();
    return projects;
  } catch (error) {
    console.error('Erro ao carregar projetos recentes:', error);
    return [];
  }
}

// Buscar projetos em destaque (todos públicos)
async function fetchFeaturedProjects() {
  try {
    const res = await fetch('/api/projects/destaque');
    if (!res.ok) throw new Error('Erro ao buscar projetos em destaque');
    const projects = await res.json();
    return projects;
  } catch (error) {
    console.error('Erro ao carregar projetos em destaque:', error);
    return [];
  }
}

// Buscar projetos populares (todos públicos)
async function fetchPopularProjects() {
  try {
    const res = await fetch('/api/projects/populares');
    if (!res.ok) throw new Error('Erro ao buscar projetos populares');
    const projects = await res.json();
    return projects;
  } catch (error) {
    console.error('Erro ao carregar projetos populares:', error);
    return [];
  }
}

// Configura os botões de scroll dos carrosséis
function setupScrollButtons() {
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

    function updateButtonsVisibility() {
      const isAtStart = container.scrollLeft <= 0;
      const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;

      leftButton.style.opacity = isAtStart ? '0.5' : '1';
      rightButton.style.opacity = isAtEnd ? '0.5' : '1';
    }

    container.addEventListener('scroll', updateButtonsVisibility);
    updateButtonsVisibility();
  });
}

// Função para mostrar opções do projeto (placeholder)
window.showProjectOptions = function(projectId) {
  console.log('Mostrar opções para projeto:', projectId);
};

// Carrega todos os projetos nas seções
async function loadAllProjects() {
  try {
    const [recentProjects, featuredProjects, popularProjects] = await Promise.all([
      fetchRecentProjects(),
      fetchFeaturedProjects(),
      fetchPopularProjects()
    ]);

    const recentContainer = document.querySelector('.main-sub-section:nth-child(1) .section-blocks-container');
    const featuredContainer = document.querySelector('.main-sub-section:nth-child(2) .section-blocks-container');
    const popularContainer = document.querySelector('.main-sub-section:nth-child(3) .section-blocks-container');

    populateSection(recentContainer, recentProjects);
    populateSection(featuredContainer, featuredProjects);
    populateSection(popularContainer, popularProjects);

    setupScrollButtons();

    console.log('Projetos carregados na home:', {
      recentes: recentProjects.length,
      destaque: featuredProjects.length,
      populares: popularProjects.length
    });

  } catch (error) {
    console.error('Erro ao carregar projetos na home:', error);
    setupScrollButtons();
  }
}

// Atualiza projetos manualmente
export function refreshHomeProjects() {
  loadAllProjects();
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  loadAllProjects();
});

// Atualiza projetos a cada 30 segundos
setInterval(loadAllProjects, 30000);
