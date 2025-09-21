import { login, confirmCode } from './api.js';

const loginForm = document.getElementById('loginForm');
const confirmBtn = document.getElementById('confirmBtn');
const messageDiv = document.getElementById('message');
const popupMsg = document.getElementById('popupMessage');
const confirmPopup = document.getElementById('confirmPopup');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;
  const rememberMe = e.target.rememberMe.checked;

  messageDiv.textContent = 'Enviando...';
  messageDiv.style.color = 'black';

  try {
    const msg = await login(email, password, rememberMe);
    messageDiv.style.color = 'green';
    messageDiv.textContent = msg;

    confirmPopup.style.display = 'flex';
  } catch (err) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = err.message;
  }
});

confirmBtn.addEventListener('click', async () => {
  const code = document.getElementById('confirmCode').value;

  popupMsg.textContent = 'Validando...';
  popupMsg.style.color = 'black';

  try {
    const msg = await confirmCode(code);
    popupMsg.style.color = 'green';
    popupMsg.textContent = msg;

    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1500);
  } catch (err) {
    popupMsg.style.color = 'red';
    popupMsg.textContent = err.message;
  }
});
