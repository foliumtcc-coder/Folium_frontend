import { apiGet } from './api.js';

// Função genérica para renderizar projetos em uma sessão
const renderProjects = (containerSelector, projects) => {
  const container = document.querySelector(containerSelector);
  container.innerHTML = '';

  projects.forEach(project => {
    const projectLink = document.createElement('a');
    projectLink.href = `project-page.html?id=${project.id}`;
    projectLink.innerHTML = `
      <div class="project-block">
        <div class="project-img">
          <img src="${project.capa_url || './src/img/icons/project-image.png'}" alt="${project.nome}">
        </div>
        <div class="project-footer">
          <div class="project-name">
            <span>${project.nome}</span>
          </div>
          <div class="project-views">
            <span><i class="fa-solid fa-eye"></i> ${project.visualizacoes || 0}</span>
          </div>
          <button class="project-options"><span class="fa-solid fa-ellipsis-vertical"></span></button>
        </div>
      </div>
    `;
    container.appendChild(projectLink);
  });
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
  } catch (err) {
    console.error('Erro ao carregar projetos da Home:', err);
  }
};

document.addEventListener('DOMContentLoaded', loadHomeProjects);
