import { register } from './api.js';

const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = e.target.name.value.trim();
  const email = e.target.email.value.trim();
  const password = e.target.password.value;
  const confipassword = e.target.confipassword.value;

  messageDiv.style.color = 'black';
  messageDiv.textContent = 'Registrando...';

  if (password !== confipassword) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'As senhas não coincidem.';
    return;
  }

  try {
    const responseText = await register(name, email, password, confipassword);
    messageDiv.style.color = 'green';
    messageDiv.innerHTML = `
      <div class="popup-overlay">
        <div class="popup">
          <h2>Registro concluído</h2>
          <p>${responseText}</p>
          <button onclick="window.location.href='../index.html'">Ir para Login</button>
        </div>
      </div>
    `;
  } catch (err) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = err.message || 'Erro ao conectar com o servidor.';
  }
});


