import { login /*, confirmCode */ } from './api.js';

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  messageDiv.textContent = 'Enviando...';
  messageDiv.style.color = 'black';

  try {
    const res = await login(email, password, rememberMe); // res é objeto JSON
    messageDiv.style.color = 'green';
    messageDiv.textContent = res.message || 'Login realizado com sucesso!';

    // Redireciona direto para a home
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1000);

    // --- Código de confirmação mantido de canto ---
    // confirmPopup.style.display = 'flex';
  } catch (err) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = err.message || 'Erro no login';
  }
});

// --- Mantido de canto, mas não usado ---
// confirmBtn.addEventListener('click', async () => {
//   const code = document.getElementById('confirmCode').value;
//   popupMsg.textContent = 'Validando...';
//   popupMsg.style.color = 'black';
//   try {
//     const msg = await confirmCode(code);
//     popupMsg.style.color = 'green';
//     popupMsg.textContent = msg;
//     setTimeout(() => {
//       window.location.href = 'home.html';
//     }, 1500);
//   } catch (err) {
//     popupMsg.style.color = 'red';
//     popupMsg.textContent = err.message;
//   }
// });
