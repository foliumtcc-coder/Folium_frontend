import { register } from './api.js';

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

// --- Função para mostrar popup de sucesso ---
function showSuccessPopup(message) {
  console.log('[SUCCESS POPUP]', message);
  
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

console.log('[INIT] Formulário encontrado:', registerForm);
console.log('[INIT] Message div encontrada:', messageDiv);

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    console.log('[SUBMIT] Formulário enviado!');
    e.preventDefault();

    const name = e.target.name.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const confipassword = e.target.confipassword.value;

    console.log('[FORM DATA]', { name, email, password: '***', confipassword: '***' });

    // Limpa mensagens anteriores
    if (messageDiv) {
      messageDiv.textContent = '';
    }

    // Validações básicas
    if (!name || !email || !password || !confipassword) {
      console.log('[VALIDATION] Campos vazios');
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    if (password !== confipassword) {
      console.log('[VALIDATION] Senhas não coincidem');
      showToast('As senhas não coincidem.', 'error');
      return;
    }

    if (password.length < 6) {
      console.log('[VALIDATION] Senha muito curta');
      showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    // Mostra loading
    console.log('[REGISTER] Iniciando registro...');
    showToast('Registrando...', 'info');

    try {
      console.log('[API] Chamando função register...');
      const responseText = await register(name, email, password, confipassword);
      console.log('[API] Resposta recebida:', responseText);
      
      // Mostra popup de sucesso
      showSuccessPopup(responseText);
      
      // Limpa o formulário
      registerForm.reset();
      
    } catch (err) {
      console.error('[ERROR] Erro no registro:', err);
      
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
      
      console.log('[ERROR MESSAGE]', errorMessage);
      showToast(errorMessage, 'error');
    }
  });
  
  console.log('[INIT] Event listener adicionado ao formulário');
} else {
  console.error('[INIT] ERRO: Formulário não encontrado!');
}