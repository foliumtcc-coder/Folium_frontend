// home-projects.js

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
          <img src="${project.capa_url || './src/img/icons/project-image.png'}" 
               alt="${project.nome || 'Projeto sem nome'}"
               onerror="this.src='./src/img/icons/project-image.png'">
        </div>
        <div class="project-footer">
          <div class="project-name">
            <span>${project.nome || 'Projeto sem nome'}</span>
          </div>
          <div class="project-views">
            <i class="fa-solid fa-eye"></i> ${project.visualizacoes || 0}
          </div>
          <button class="project-options">
            <span class="fa-solid fa-ellipsis-vertical"></span>
          </button>
        </div>
      </div>
    `;
    container.appendChild(projectLink);
  });
};

// Função auxiliar para buscar dados da API
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

// Funções específicas para cada tipo de projeto
const fetchRecentProjects = () => fetchProjects('/api/auth/home/recentes');
const fetchFeaturedProjects = () => fetchProjects('/api/auth/home/destaques');
const fetchPopularProjects = () => fetchProjects('/api/auth/home/populares');

// Configura os botões de scroll dos carrosséis
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

// Mostrar menu de opções do projeto (placeholder)
window.showProjectOptions = (projectId) => {
  console.log('Mostrar opções para projeto:', projectId);
};

// Carregar todos os projetos nas seções
const loadHomeProjects = async () => {
  try {
    const [recentes, destaques, populares] = await Promise.all([
      fetchRecentProjects(),
      fetchFeaturedProjects(),
      fetchPopularProjects()
    ]);

    renderProjects('.main-sub-section:nth-of-type(1) .section-blocks-container', recentes);
    renderProjects('.main-sub-section:nth-of-type(2) .section-blocks-container', destaques);
    renderProjects('.main-sub-section:nth-of-type(3) .section-blocks-container', populares);

    setupScrollButtons();

    console.log('Projetos carregados na home:', {
      recentes: recentes.length,
      destaques: destaques.length,
      populares: populares.length
    });
  } catch (err) {
    console.error('Erro ao carregar projetos da Home:', err);
  }
};

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', loadHomeProjects);

// Atualiza projetos a cada 30 segundos
setInterval(loadHomeProjects, 30000);
