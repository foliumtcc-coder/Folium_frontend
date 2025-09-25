// home-projects.js
import { getUser, getUserProfile } from './api.js';

// Função para buscar todos os projetos públicos de todos os usuários
async function fetchAllPublicProjects() {
  try {
    // Vamos buscar projetos através dos perfis dos usuários
    // Como você não tem um endpoint específico para todos os projetos públicos,
    // vamos adaptar usando a estrutura existente
    
    const { user: loggedUser } = await getUser();
    
    // Por enquanto, vamos usar os projetos do próprio usuário como exemplo
    // Você pode expandir isso para buscar de múltiplos usuários
    if (loggedUser) {
      const profileData = await getUserProfile(loggedUser.id);
      const allProjects = profileData.projects || [];
      
      // Filtra apenas projetos públicos
      return allProjects.filter(project => project.publico);
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao carregar projetos públicos:', error);
    return [];
  }
}

// Função para simular projetos recentes (últimos criados)
async function fetchRecentProjects() {
  try {
    const allProjects = await fetchAllPublicProjects();
    
    // Ordena por ID (assumindo que IDs maiores = mais recentes)
    // ou você pode ordenar por data se tiver esse campo
    return allProjects
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);
  } catch (error) {
    console.error('Erro ao carregar projetos recentes:', error);
    return [];
  }
}

// Função para simular projetos em destaque
async function fetchFeaturedProjects() {
  try {
    const allProjects = await fetchAllPublicProjects();
    
    // Por enquanto, embaralha os projetos para simular "destaque"
    return allProjects
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
  } catch (error) {
    console.error('Erro ao carregar projetos em destaque:', error);
    return [];
  }
}

// Função para criar HTML de um projeto (seguindo estrutura do perfil)
function createProjectHTML(project) {
  const imageUrl = project.imagem || './src/img/icons/project-image.png';
  
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
  
  const projectsHTML = projects.slice(0, 5).map(project => createProjectHTML(project)).join('');
  sectionContainer.innerHTML = projectsHTML;
}

// Função para carregar todos os projetos nas seções
async function loadAllProjects() {
  try {
    // Busca os diferentes tipos de projetos
    const [recentProjects, featuredProjects, allPublicProjects] = await Promise.all([
      fetchRecentProjects(),
      fetchFeaturedProjects(),
      fetchAllPublicProjects()
    ]);

    // Seleciona os containers das seções
    const recentContainer = document.querySelector('.main-sub-section:nth-child(1) .section-blocks-container');
    const featuredContainer = document.querySelector('.main-sub-section:nth-child(2) .section-blocks-container');
    const popularContainer = document.querySelector('.main-sub-section:nth-child(3) .section-blocks-container');

    // Preenche cada seção
    populateSection(recentContainer, recentProjects);
    populateSection(featuredContainer, featuredProjects);
    
    // Para "Mais populares", embaralha os projetos públicos
    const shuffledProjects = allPublicProjects.sort(() => Math.random() - 0.5);
    populateSection(popularContainer, shuffledProjects);

    // Configura os botões de scroll após carregar os projetos
    setupScrollButtons();

    console.log('Projetos carregados na home:', {
      recentes: recentProjects.length,
      destaque: featuredProjects.length,
      populares: shuffledProjects.length
    });

  } catch (error) {
    console.error('Erro ao carregar projetos na home:', error);
    // Em caso de erro, mantém os projetos estáticos do HTML
    setupScrollButtons(); // Ainda configura os botões mesmo com erro
  }
}

// Função para configurar botões de scroll dos carrosséis
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
    
    // Atualiza visibilidade dos botões baseado no scroll
    function updateButtonsVisibility() {
      const isAtStart = container.scrollLeft <= 0;
      const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth;
      
      leftButton.style.opacity = isAtStart ? '0.5' : '1';
      rightButton.style.opacity = isAtEnd ? '0.5' : '1';
    }
    
    container.addEventListener('scroll', updateButtonsVisibility);
    updateButtonsVisibility(); // Executa uma vez no início
  });
}

// Função para mostrar opções do projeto (placeholder)
window.showProjectOptions = function(projectId) {
  // Implementar menu de opções do projeto
  console.log('Mostrar opções para projeto:', projectId);
};

// Função para atualizar projetos manualmente (se necessário)
export function refreshHomeProjects() {
  loadAllProjects();
}

// Inicializa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  loadAllProjects();
});

// Atualiza projetos a cada 30 segundos para mostrar novos projetos
setInterval(loadAllProjects, 30000);