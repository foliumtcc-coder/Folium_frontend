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

      // Duplica os itens (1x antes, 1x depois)
      items.forEach(item => {
        container.appendChild(item.cloneNode(true));
      });
      items.forEach(item => {
        container.insertBefore(item.cloneNode(true), container.firstChild);
      });

      // Centraliza na lista original
      const middle = container.scrollWidth / 3;
      container.scrollLeft = middle;

      let isTeleporting = false;

      function loopCheck() {
        if (isTeleporting) return;

        const maxScroll = container.scrollWidth;
        const tolerance = 5; // pequena margem pra evitar triggers falsos

        if (container.scrollLeft <= itemWidth + tolerance) {
          isTeleporting = true;
          const newPos = container.scrollLeft + items.length * itemWidth;
          container.scrollTo({ left: newPos, behavior: "auto" });
          requestAnimationFrame(() => (isTeleporting = false));
        } else if (container.scrollLeft + container.clientWidth >= maxScroll - itemWidth - tolerance) {
          isTeleporting = true;
          const newPos = container.scrollLeft - items.length * itemWidth;
          container.scrollTo({ left: newPos, behavior: "auto" });
          requestAnimationFrame(() => (isTeleporting = false));
        }
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
