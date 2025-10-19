import { BACKEND_URL } from './api.js';

// Função genérica para buscar projetos de uma categoria
async function fetchProjects(categoria) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/home/${categoria}`);
    if (!res.ok) throw new Error(`Erro ao buscar /api/auth/home/${categoria}`);
    const projects = await res.json();
    return projects;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Função para criar HTML de um projeto
function createProjectHTML(project) {
  const imageUrl = project.imagem || './src/img/icons/project-image.png';
  const visualizacoes = project.visualizacoes || 0;

  return `
    <a href="project-page.html?id=${project.id}">
      <div class="project-block">
        <div class="project-img">
          <img src="${imageUrl}" alt="${project.titulo || project.nome}" onerror="this.src='./src/img/icons/project-image.png'">
        </div>
        <div class="project-footer">
          <div class="project-name">
            <span>${project.titulo || project.nome || 'Projeto sem título'}</span>
          </div>
          <div class="project-views">
            <span><i class="fa-solid fa-eye"></i> ${visualizacoes}</span>
          </div>
        </div>
      </div>
    </a>
  `;
}

// Preenche a seção com projetos
function populateSection(selector, projects) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.innerHTML = projects.slice(0, 10).map(createProjectHTML).join('');
}

// Configura botões de scroll do carrossel
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
      leftButton.style.opacity = container.scrollLeft <= 0 ? '0.5' : '1';
      rightButton.style.opacity = container.scrollLeft >= container.scrollWidth - container.clientWidth ? '0.5' : '1';
    }

    container.addEventListener('scroll', updateButtonsVisibility);
    updateButtonsVisibility();
  });
}

// Carrega todos os projetos
async function loadHomeProjects() {
  try {
    const [recentes, populares, destaques] = await Promise.all([
      fetchProjects('recentes'),
      fetchProjects('populares'),
      fetchProjects('destaques')
    ]);

    populateSection('.main-sub-section:nth-of-type(1) .section-blocks-container', recentes);
    populateSection('.main-sub-section:nth-of-type(2) .section-blocks-container', destaques);
    populateSection('.main-sub-section:nth-of-type(3) .section-blocks-container', populares);

    setupScrollButtons();

    console.log('Projetos carregados:', {
      recentes: recentes.length,
      destaques: destaques.length,
      populares: populares.length
    });
  } catch (err) {
    console.error('Erro ao carregar projetos da home:', err);
    setupScrollButtons();
  }
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', loadHomeProjects);

// Atualiza automaticamente a cada 24h (ou menos se quiser testar)
setInterval(loadHomeProjects, 24 * 60 * 60 * 1000); // 24h
