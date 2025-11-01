// ===================== CAROUSELS — LOOP INFINITO ESTILO NETFLIX =====================
function initInfiniteCarousels() {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    const container = carousel.querySelector(".section-blocks-container");
    const leftBtn = carousel.querySelector(".scroll-button.left-button");
    const rightBtn = carousel.querySelector(".scroll-button.right-button");
    if (!container) return;

    // Espera os itens carregarem antes de configurar
    const observer = new MutationObserver(() => {
      if (container.children.length > 0) {
        setupCarousel();
        observer.disconnect();
      }
    });

    observer.observe(container, { childList: true });

    function setupCarousel() {
      const items = Array.from(container.children);
      const itemWidth = items[0]?.offsetWidth + 20 || 300; // 20 = gap

      // Clona apenas uma vez (no final), mantendo a ordem correta
      items.forEach(item => {
        container.appendChild(item.cloneNode(true));
      });

      // Define o ponto inicial no começo da lista original
      container.scrollLeft = 0;

      let isTeleporting = false;

      // Checa e faz o loop quando atinge o fim
      function loopCheck() {
        if (isTeleporting) return;

        const totalWidth = itemWidth * items.length;
        const maxScroll = container.scrollWidth;
        const tolerance = 5;

        if (container.scrollLeft >= totalWidth - tolerance) {
          // voltou pro início suavemente
          isTeleporting = true;
          const newPos = container.scrollLeft - totalWidth;
          container.scrollTo({ left: newPos, behavior: "auto" });
          requestAnimationFrame(() => (isTeleporting = false));
        }
      }

      // Aplica o loop ao rolar manualmente
      container.addEventListener("scroll", loopCheck);

      // Botões de navegação (opcional)
      if (leftBtn) {
        leftBtn.addEventListener("click", () => {
          container.scrollBy({ left: -itemWidth * 2, behavior: "smooth" });
        });
      }
      if (rightBtn) {
        rightBtn.addEventListener("click", () => {
          container.scrollBy({ left: itemWidth * 2, behavior: "smooth" });
        });
      }
    }
  });
}


// Executa quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", initInfiniteCarousels);

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
