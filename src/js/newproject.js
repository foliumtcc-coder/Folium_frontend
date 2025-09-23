import { getUser, createProject } from './api.js';

const projectForm = document.getElementById('form-projeto');
const messageDiv = document.getElementById('message');
const fileInput = document.getElementById('proj-pic');
const fileNameSpan = document.getElementById('file-name');
const membersInput = document.getElementById('proj-members');
const typeSelect = document.getElementById('proj-type'); // novo

let loggedUserEmail = '';

// Busca usuário logado ao carregar a página
async function fetchLoggedUser() {
  try {
    const { user } = await getUser();
    if (user) {
      loggedUserEmail = user.email;
      membersInput.value = loggedUserEmail;
    }
  } catch (err) {
    console.error('Erro ao buscar usuário logado:', err);
  }
}

// Confirmação de arquivo selecionado
if (fileInput && fileNameSpan) {
  fileInput.addEventListener('change', () => {
    fileNameSpan.textContent =
      fileInput.files.length > 0 ? `Arquivo selecionado: ${fileInput.files[0].name}` : '';
  });
}

// Submit do formulário
if (projectForm) {
  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('proj-name').value.trim();
    const description = document.getElementById('proj-desc').value.trim();
    const imageFile = fileInput.files[0];
    const tipo = typeSelect.value; // pega o tipo (publico/privado)

    if (!title || !description || !imageFile || !tipo) {
      messageDiv.style.color = 'red';
      messageDiv.textContent = 'Preencha todos os campos e selecione uma imagem.';
      return;
    }

    let currentMembers = membersInput.value
      .split(',')
      .map(m => m.trim())
      .filter(m => m !== '');

    // Remove duplicatas
    currentMembers = [...new Set(currentMembers)];

    if (currentMembers.length > 10) {
      messageDiv.style.color = 'red';
      messageDiv.textContent = 'O projeto pode ter no máximo 10 membros.';
      return;
    }

    // Garante que o criador esteja na lista
    if (!currentMembers.includes(loggedUserEmail)) {
      currentMembers.push(loggedUserEmail);
    }

    membersInput.value = currentMembers.join(',');

    const formData = new FormData();
    formData.append('titulo', title);
    formData.append('descricao', description);
    formData.append('imagem', imageFile);
    formData.append('membros', membersInput.value);
    formData.append('criado_por', loggedUserEmail);
    formData.append('tipo', tipo); // envia tipo do projeto

    messageDiv.style.color = 'black';
    messageDiv.textContent = 'Criando projeto...';

    try {
      const responseText = await createProject(formData);
      messageDiv.style.color = 'green';
      messageDiv.textContent = responseText || 'Projeto criado com sucesso!';
      projectForm.reset();
      fileNameSpan.textContent = '';
    } catch (err) {
      console.error(err);
      messageDiv.style.color = 'red';
      messageDiv.textContent = err.message || 'Erro ao criar projeto.';
    }
  });
}

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', fetchLoggedUser);
