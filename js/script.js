// ===================== CAROUSELS (INFINITE NETFLIX STYLE) =====================
const carousels = document.querySelectorAll(".carousel");

carousels.forEach((carousel) => {
  const container = carousel.querySelector(".section-blocks-container");
  const leftBtn = carousel.querySelector(".scroll-button.left-button");
  const rightBtn = carousel.querySelector(".scroll-button.right-button");
  if (!container) return;

  const scrollStep = 800;
  const items = [...container.children];

  // DUPLICA os itens antes e depois para simular loop infinito
  const prependClone = items.map(item => {
    const clone = item.cloneNode(true);
    container.insertBefore(clone, container.firstChild);
    return clone;
  });
  const appendClone = items.map(item => {
    const clone = item.cloneNode(true);
    container.appendChild(clone);
    return clone;
  });

  // Centraliza o scroll no conjunto original (entre os clones)
  const startPosition = container.scrollWidth / 3;
  container.scrollLeft = startPosition;

  // Função de rolagem
  function scrollByAmount(amount) {
    container.scrollBy({ left: amount, behavior: 'smooth' });
  }

  // Corrige posição quando chega muito perto das extremidades
  function checkLoop() {
    const maxScroll = container.scrollWidth;
    if (container.scrollLeft <= items.length * 300) {
      // muito à esquerda → reposiciona para o meio
      container.scrollLeft += items.length * 300;
    } else if (container.scrollLeft + container.clientWidth >= maxScroll - items.length * 300) {
      // muito à direita → reposiciona para o meio
      container.scrollLeft -= items.length * 300;
    }
  }

  // Botões de rolagem
  rightBtn?.addEventListener("click", () => {
    scrollByAmount(scrollStep);
  });

  leftBtn?.addEventListener("click", () => {
    scrollByAmount(-scrollStep);
  });

  // Verifica constantemente se precisa reposicionar
  container.addEventListener("scroll", checkLoop);
});

// ===================== MENU DROPDOWN PROFILE =====================
const profileButton = document.getElementById("profile-button");
const profileDropdown = document.getElementById("profile-dropdown-menu");

if (profileButton && profileDropdown) {
  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.style.display =
      profileDropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    profileDropdown.style.display = "none";
  });
}

// ===================== MENU DROPDOWN NOTIFICATION =====================
const notificationButton = document.getElementById("notification-button");
const notificationDropdown = document.getElementById("notification-dropdown-menu");

if (notificationButton && notificationDropdown) {
  notificationButton.addEventListener("click", (e) => {
    e.stopPropagation();
    notificationDropdown.style.display =
      notificationDropdown.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", () => {
    notificationDropdown.style.display = "none";
  });
}
