import { getUser } from './api.js';

const urlParams = new URLSearchParams(window.location.search);
const projetoId = urlParams.get('id');

async function loadProject() {
  const token = localStorage.getItem('accessToken');
  if (!token) return window.location.href = '/login.html';

  try {
    const res = await fetch(`/api/projects/${projetoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const { projeto, etapas, membros } = data;

    // Preenche header
    document.querySelector('.main-header-text').textContent = projeto.titulo;

    // Preenche etapas
    const stepsContainer = document.querySelector('.project-steps');
    stepsContainer.innerHTML = '';
    etapas.forEach(etapa => {
      const step = document.createElement('div');
      step.classList.add('step');

      // membros da etapa
      const membrosHTML = (etapa.usuarios || []).map(u => `
        <a href="/profile?id=${u.usuario_id}">
          <span class="fa-solid fa-circle-user"></span>
          <span>${u.name1}</span>
        </a>
      `).join('');

      // arquivos da etapa
      const arquivosHTML = (etapa.arquivos || []).map(f => `
        <div class="step-docs">
          <span class="fa-solid fa-file file-icon"></span>
          <span class="file-text">${f.nome}</span>
        </div>
      `).join('');

      step.innerHTML = `
        <div class="step-header">
          <div class="step-header-text">
            <span class="step-name">${etapa.titulo}</span>
            <span class="step-date">${new Date(etapa.criada_em).toLocaleDateString()}</span>
          </div>
          <div class="step-header-people">${membrosHTML}</div>
        </div>
        <div class="section-line"></div>
        <div class="step-main-content">${etapa.descricao}</div>
        <div class="section-line"></div>
        <div class="step-footer">${arquivosHTML}</div>
      `;

      stepsContainer.appendChild(step);
    });

    // Preenche membros no menu lateral
    const sideMenu = document.querySelector('.menu-header-people');
    sideMenu.innerHTML = '';
    membros.forEach(m => {
      const a = document.createElement('a');
      a.href = `/profile?id=${m.usuario_id}`;
      a.innerHTML = `<span class="fa-solid fa-circle-user"></span><span>${m.name1}</span><br />`;
      sideMenu.appendChild(a);
    });

    // Data do projeto
    document.querySelector('.menu-header-date').innerHTML = `
      <span>Publicado em: ${new Date(projeto.criado_em).toLocaleDateString()}</span><br>
      <span>Atualizado por último em: ${new Date(projeto.atualizado_em).toLocaleDateString()}</span>
    `;

    // Descrição
    document.querySelector('.menu-desc').textContent = projeto.descricao;

  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadProject);
