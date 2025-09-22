import { createProject, getUser } from './api.js';

const projectForm = document.getElementById('form-projeto');
const messageDiv = document.getElementById('message'); // div para feedback
const fileInput = document.getElementById('proj-pic');
const fileNameSpan = document.getElementById('file-name'); // span para mostrar nome do arquivo
const membersInput = document.getElementById('proj-members'); // input de membros

let loggedUserEmail = ''; // vai guardar o email do usuário logado

// Busca usuário logado ao carregar a página
async function fetchLoggedUser() {
  try {
    const { user } = await getUser();
    if (user) {
      loggedUserEmail = user.email; // identifica pelo email
      // Adiciona automaticamente no input de membros
      membersInput.value = loggedUserEmail;
    }
  } catch (err) {
    console.error('Erro ao buscar usuário logado:', err);
  }
}

// Confirmação de arquivo selecionado
if (fileInput && fileNameSpan) {
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      fileNameSpan.textContent = `Arquivo selecionado: ${fileInput.files[0].name}`;
    } else {
      fileNameSpan.textContent = '';
    }
  });
}

// Submit do formulário
if (projectForm) {
  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('proj-name').value.trim();
    const description = document.getElementById('proj-desc').value.trim();
    const imageFile = fileInput.files[0];

    if (!title || !description || !imageFile) {
      messageDiv.style.color = 'red';
      messageDiv.textContent = 'Preencha todos os campos e selecione uma imagem.';
      return;
    }

    // Garante que o usuário logado está incluído nos membros
    let currentMembers = membersInput.value
      .split(',')
      .map(m => m.trim())
      .filter(m => m !== '');

    // Remove duplicados
    currentMembers = [...new Set(currentMembers)];

    // Limita a 10 membros
    if (currentMembers.length > 10) {
      messageDiv.style.color = 'red';
      messageDiv.textContent = 'O projeto pode ter no máximo 10 membros.';
      return;
    }

    // Inclui automaticamente o usuário logado
    if (!currentMembers.includes(loggedUserEmail)) {
      currentMembers.push(loggedUserEmail);
    }

    membersInput.value = currentMembers.join(',');

    // Cria FormData
    const formData = new FormData();
    formData.append('titulo', title);
    formData.append('descricao', description);
    formData.append('imagem', imageFile);
    formData.append('membros', membersInput.value); // emails separados por vírgula
    formData.append('criado_por', loggedUserEmail);

    messageDiv.style.color = 'black';
    messageDiv.textContent = 'Criando projeto...';

    try {
      const responseText = await createProject(formData);
      messageDiv.style.color = 'green';
      messageDiv.textContent = responseText || 'Projeto criado com sucesso!';
      projectForm.reset();
      fileNameSpan.textContent = ''; // limpa nome do arquivo
    } catch (err) {
      messageDiv.style.color = 'red';
      messageDiv.textContent = err.message || 'Erro ao criar projeto.';
    }
  });
}

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', () => {
  fetchLoggedUser();
});

