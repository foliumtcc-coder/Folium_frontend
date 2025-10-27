import { getUser, createProject } from './api.js';

// --- Função para mostrar notificações toast ---
function showToast(message, type = 'info') {
  console.log('[TOAST]', type, message);
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span style="font-size: 20px;">${icon}</span> ${message}`;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

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
      }
    } catch (err) {
      console.error('Erro ao buscar usuário logado:', err);
      showToast('Erro ao carregar informações do usuário.', 'error');
    }
  }

  fetchLoggedUser();

  // Submit do formulário
  if (projectForm && fileInput && typeSelect && membersInput) {
    projectForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('proj-name')?.value.trim() || '';
      const description = document.getElementById('proj-desc')?.value.trim() || '';
      const imageFile = fileInput.files[0];
      const tipo = typeSelect.value;

      // Limpa mensagem antiga
      if (messageDiv) {
        messageDiv.textContent = '';
      }

      // Validações
      if (!title || !description || !imageFile || !tipo) {
        showToast('Preencha todos os campos e selecione uma imagem.', 'error');
        return;
      }

      let currentMembers = membersInput.value
        .split(',')
        .map(m => m.trim())
        .filter(m => m !== '');

      currentMembers = [...new Set(currentMembers)];

      if (currentMembers.length > 10) {
        showToast('O projeto pode ter no máximo 10 membros.', 'error');
        return;
      }

      // Validação de formato de imagem
      const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validImageTypes.includes(imageFile.type)) {
        showToast('Por favor, selecione uma imagem válida (PNG, JPG ou JPEG).', 'error');
        return;
      }

      // Validação de tamanho (opcional - 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (imageFile.size > maxSize) {
        showToast('A imagem deve ter no máximo 5MB.', 'error');
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

      showToast('Criando projeto...', 'info');

      try {
        const createdProject = await createProject(formData);

        const message = createdProject.message || 'Projeto criado com sucesso!';
        showToast(message, 'success');

        // Redireciona para a página do projeto recém-criado
        if (createdProject.projeto && createdProject.projeto.id) {
          setTimeout(() => {
            window.location.href = `/project-page.html?id=${createdProject.projeto.id}`;
          }, 1000);
        }

        projectForm.reset();
        if (imagePreview) {
          imagePreview.innerHTML = '<i class="fa-solid fa-image"></i><span>Selecione uma imagem</span><small>PNG, JPG ou JPEG</small>';
          imagePreview.classList.remove('has-image');
        }

      } catch (err) {
        console.error('Erro ao criar projeto:', err);
        
        // Extrai mensagem de erro
        let errorMessage = 'Erro ao criar projeto.';
        
        if (err.message) {
          try {
            const parsed = JSON.parse(err.message);
            errorMessage = parsed.message || parsed.error || err.message;
          } catch (e) {
            errorMessage = err.message;
          }
        }
        
        showToast(errorMessage, 'error');
      }
    });
  }

  // Preview da imagem
  if (fileInput && imagePreview) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];

      if (file) {
        // Validação de formato
        const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validImageTypes.includes(file.type)) {
          showToast('Por favor, selecione uma imagem válida (PNG, JPG ou JPEG).', 'error');
          fileInput.value = '';
          return;
        }

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