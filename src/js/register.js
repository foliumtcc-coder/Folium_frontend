import { register } from './api.js';

// --- Função para mostrar notificações toast ---
function showToast(message, type = 'info') {
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

// --- Função para mostrar popup de sucesso ---
function showSuccessPopup(message) {
  // Remove popup existente se houver
  const existingPopup = document.querySelector('.success-popup-overlay');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Extrai a mensagem do JSON se necessário
  let displayMessage = message;
  try {
    const parsed = JSON.parse(message);
    displayMessage = parsed.message || message;
  } catch (e) {
    // Se não for JSON, usa a mensagem como está
    displayMessage = message;
  }

  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'success-popup-overlay';
  
  popupOverlay.innerHTML = `
    <div class="success-popup">
      <div class="success-icon">✓</div>
      <h2>Registro Concluído!</h2>
      <p>${displayMessage}</p>
      <button class="success-btn" id="go-to-login">Ir para Login</button>
    </div>
  `;
  
  document.body.appendChild(popupOverlay);
  
  // Ativa animação
  setTimeout(() => popupOverlay.classList.add('active'), 10);
  
  // Evento do botão
  document.getElementById('go-to-login').addEventListener('click', () => {
    window.location.href = '../index.html';
  });
}

const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = e.target.name.value.trim();
  const email = e.target.email.value.trim();
  const password = e.target.password.value;
  const confipassword = e.target.confipassword.value;

  // Limpa mensagens anteriores
  if (messageDiv) {
    messageDiv.textContent = '';
  }

  // Validações básicas
  if (!name || !email || !password || !confipassword) {
    showToast('Por favor, preencha todos os campos.', 'error');
    return;
  }

  if (password !== confipassword) {
    showToast('As senhas não coincidem.', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
    return;
  }

  // Mostra loading
  showToast('Registrando...', 'info');

  try {
    const responseText = await register(name, email, password, confipassword);
    
    // Mostra popup de sucesso
    showSuccessPopup(responseText);
    
    // Limpa o formulário
    registerForm.reset();
    
  } catch (err) {
    console.error('Erro no registro:', err);
    
    // Extrai mensagem de erro se vier em JSON
    let errorMessage = 'Erro ao conectar com o servidor.';
    
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