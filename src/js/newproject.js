import { createProject } from './api.js';

const projectForm = document.getElementById('project-form');
const messageDiv = document.getElementById('message'); // div para feedback (crie no HTML se ainda não tiver)

if (projectForm) {
  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('proj-name').value.trim();
    const description = document.getElementById('proj-desc').value.trim();
    const imageFile = document.getElementById('proj-pic').files[0];

    if (!title || !description || !imageFile) {
      messageDiv.style.color = 'red';
      messageDiv.textContent = 'Preencha todos os campos e selecione uma imagem.';
      return;
    }

    const formData = new FormData();
    formData.append('titulo', title);
    formData.append('descricao', description);
    formData.append('imagem', imageFile);
    formData.append('criado_por', sessionStorage.getItem('userId')); // ou outro método para pegar o usuário logado

    messageDiv.style.color = 'black';
    messageDiv.textContent = 'Criando projeto...';

    try {
      const responseText = await createProject(formData);
      messageDiv.style.color = 'green';
      messageDiv.textContent = responseText || 'Projeto criado com sucesso!';
      projectForm.reset(); // limpa o formulário
    } catch (err) {
      messageDiv.style.color = 'red';
      messageDiv.textContent = err.message || 'Erro ao criar projeto.';
    }
  });
}
