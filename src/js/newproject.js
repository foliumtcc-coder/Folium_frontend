import { getUser, createProject } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const projectForm = document.getElementById('form-projeto');
  const messageDiv = document.getElementById('message');
  const fileInput = document.getElementById('proj-pic');
  const membersInput = document.getElementById('proj-members');
  const typeSelect = document.getElementById('proj-type');
  const imagePreview = document.getElementById('image-preview');

  let loggedUserEmail = '';

  // Busca usuário logado ao carregar a página
  async function fetchLoggedUser() {
    try {
      const { user } = await getUser();
      if (user && membersInput) {
        loggedUserEmail = user.email;
        membersInput.value = loggedUserEmail;
      }
    } catch (err) {
      console.error('Erro ao buscar usuário logado:', err);
    }
  }

  fetchLoggedUser();

  // Submit do formulário
  if (projectForm && messageDiv && fileInput && typeSelect && membersInput) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('proj-name')?.value.trim() || '';
      const description = document.getElementById('proj-desc')?.value.trim() || '';
      const imageFile = fileInput.files[0];
      const tipo = typeSelect.value;

      if (!title || !description || !imageFile || !tipo) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'Preencha todos os campos e selecione uma imagem.';
        return;
      }

      let currentMembers = membersInput.value
        .split(',')
        .map(m => m.trim())
        .filter(m => m !== '');

      currentMembers = [...new Set(currentMembers)];

      if (!currentMembers.includes(loggedUserEmail)) {
        currentMembers.push(loggedUserEmail);
      }

      if (currentMembers.length > 10) {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'O projeto pode ter no máximo 10 membros.';
        return;
      }

      membersInput.value = currentMembers.join(',');

      const formData = new FormData();
      formData.append('titulo', title);
      formData.append('descricao', description);
      formData.append('imagem', imageFile);
      formData.append('membros', membersInput.value);
      formData.append('criado_por', loggedUserEmail);
      formData.append('tipo', tipo);

      messageDiv.style.color = 'black';
      messageDiv.textContent = 'Criando projeto...';

      try {
        const createdProject = await createProject(formData);

        messageDiv.style.color = 'green';
        messageDiv.textContent = createdProject.message || 'Projeto criado com sucesso!';

        // Redireciona para a página do projeto recém-criado
        if (createdProject.projeto && createdProject.projeto.id) {
          window.location.href = `/project-page.html?id=${createdProject.projeto.id}`;
        }

        projectForm.reset();
        if (imagePreview) {
          imagePreview.innerHTML = '<i class="fa-solid fa-image"></i><span>Selecione uma imagem</span><small>PNG, JPG ou JPEG</small>';
          imagePreview.classList.remove('has-image');
        }

      } catch (err) {
        console.error(err);
        messageDiv.style.color = 'red';
        messageDiv.textContent = err.message || 'Erro ao criar projeto.';
      }
    });
  }

  // Preview da imagem
  if (fileInput && imagePreview) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.classList.add('has-image');
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.innerHTML = '<i class="fa-solid fa-image"></i><span>Selecione uma imagem</span><small>PNG, JPG ou JPEG</small>';
        imagePreview.classList.remove('has-image');
      }
    });
  }
});
