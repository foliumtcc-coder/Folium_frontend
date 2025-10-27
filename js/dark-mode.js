// Função para alternar o modo escuro
function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle("dark-mode");

  // Salva no localStorage
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");

  // Atualiza o ícone do botão, se existir
  const icon = document.querySelector("#dark-mode-toggle span, .dark-mode-toggle span");
  if (icon) {
    icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
}

// Mantém o modo noturno ao recarregar a página
window.addEventListener("DOMContentLoaded", () => {
  const darkMode = localStorage.getItem("darkMode");
  const icon = document.querySelector("#dark-mode-toggle span, .dark-mode-toggle span");
  const body = document.body;

  if (darkMode === "enabled") {
    body.classList.add("dark-mode");
    if (icon) icon.className = "fa-solid fa-sun";
  } else {
    if (icon) icon.className = "fa-solid fa-moon";
  }
});
