import { login, getUser /*, confirmCode */ } from './api.js';

// --- Verifica se o usuário já está logado ---
async function checkIfLoggedIn() {
  try {
    const { user } = await getUser();
    if (user) {
      console.log('[AUTO-LOGIN] Usuário já está logado, redirecionando...');
      window.location.href = 'home.html';
    }
  } catch (err) {
    console.log('[AUTO-LOGIN] Usuário não está logado');
  }
}

// Executa verificação ao carregar a página
checkIfLoggedIn();

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

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

console.log('[INIT] Formulário de login encontrado:', loginForm);

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    console.log('[SUBMIT] Formulário de login enviado!');
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    console.log('[FORM DATA]', { email, password: '***' });

    // Limpa mensagens anteriores
    if (messageDiv) {
      messageDiv.textContent = '';
    }

    // Validações básicas
    if (!email || !password) {
      console.log('[VALIDATION] Campos vazios');
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('[VALIDATION] Email inválido');
      showToast('Por favor, insira um email válido.', 'error');
      return;
    }

    // Mostra loading
    console.log('[LOGIN] Iniciando login...');
    showToast('Entrando...', 'info');

    try {
      console.log('[API] Chamando função login...');
      const res = await login(email, password, false);
      console.log('[API] Resposta recebida:', res);

      const message = res.message || 'Login realizado com sucesso!';
      
      showToast(message, 'success');

      // Limpa o formulário
      loginForm.reset();

      // Redireciona para a home
      console.log('[REDIRECT] Redirecionando para home...');
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 1000);

    } catch (err) {
      console.error('[ERROR] Erro no login:', err);

      // Extrai mensagem de erro
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';

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

  console.log('[INIT] Event listener adicionado ao formulário de login');
} else {
  console.error('[INIT] ERRO: Formulário de login não encontrado!');
}

// --- Mantido de canto, mas não usado ---
// confirmBtn.addEventListener('click', async () => {
//   const code = document.getElementById('confirmCode').value;
//   showToast('Validando...', 'info');
//   try {
//     const msg = await confirmCode(code);
//     showToast(msg, 'success');
//     setTimeout(() => {
//       window.location.href = 'home.html';
//     }, 1500);
//   } catch (err) {
//     showToast(err.message || 'Erro ao validar código', 'error');
//   }
// });