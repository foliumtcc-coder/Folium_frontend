import { BACKEND_URL } from './api.js';

// Função genérica para renderizar projetos em qualquer container
function renderProjects(containerId, projects) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  projects.forEach(proj => {
    const projectLink = document.createElement('a');
    projectLink.href = `project-page.html?id=${proj.id}`;
    projectLink.className = 'project-link';
    projectLink.innerHTML = `
      <div class="project-block">
        <div class="project-img">
          <img src="${proj.imagem || './src/img/icons/project-image.png'}" alt="${proj.titulo}">
        </div>
        <div class="project-footer">
          <div class="project-name"><span>${proj.titulo}</span></div>
          <div class="project-views"><span><i class="fa-solid fa-eye"></i> ${proj.visualizacoes || 0}</span></div>
          <button class="project-options"><span class="fa-solid fa-ellipsis-vertical"></span></button>
        </div>
      </div>
    `;
    container.appendChild(projectLink);
  });
}

// Busca projetos via fetch
async function fetchProjects(endpoint) {
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`);
    if (!res.ok) throw new Error(`Erro ao buscar ${endpoint}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Carrega todas as seções
async function loadHomeProjects() {
  const [recentes, destaques, populares] = await Promise.all([
    fetchProjects('/api/auth/home/recentes'),
    fetchProjects('/api/auth/home/destaques'),
    fetchProjects('/api/auth/home/populares')
  ]);

  renderProjects('recentes-container', recentes);
  renderProjects('destaques-container', destaques);
  renderProjects('populares-container', populares);

  // Inicializa scroll das seções
  initCarousels();
}

// Scroll horizontal
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const container = carousel.querySelector('.section-blocks-container');
    const leftBtn = carousel.querySelector('.left-button');
    const rightBtn = carousel.querySelector('.right-button');

    leftBtn.addEventListener('click', () => container.scrollBy({ left: -300, behavior: 'smooth' }));
    rightBtn.addEventListener('click', () => container.scrollBy({ left: 300, behavior: 'smooth' }));
  });
}

document.addEventListener('DOMContentLoaded', loadHomeProjects);
