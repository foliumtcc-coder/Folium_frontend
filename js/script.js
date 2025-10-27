// ===================== CAROUSELS =====================
const carousels = document.querySelectorAll(".carousel");

carousels.forEach((carousel) => {
  const blockContainer = carousel.querySelector(".section-blocks-container");
  const leftBtn = carousel.querySelector(".scroll-button.left-button");
  const rightBtn = carousel.querySelector(".scroll-button.right-button");
  const scrollAmount = 800;

  if (!blockContainer) return; // se não existir, pula este carousel

  const originalItems = [...blockContainer.children]; // salve os originais

  function cloneMoreIfNeeded() {
    const nearEnd =
      blockContainer.scrollLeft + blockContainer.clientWidth >=
      blockContainer.scrollWidth - 50;

    if (nearEnd) {
      originalItems.forEach((item) => {
        const clone = item.cloneNode(true);
        blockContainer.appendChild(clone);
      });
    }
  }

  // Botões de scroll, se existirem
  if (leftBtn) {
    leftBtn.addEventListener("click", () => {
      blockContainer.scrollLeft -= scrollAmount;
    });
  }

  if (rightBtn) {
    rightBtn.addEventListener("click", () => {
      blockContainer.scrollLeft += scrollAmount;
      cloneMoreIfNeeded();
    });
  }

  // Também verifica ao scrollar manualmente
  blockContainer.addEventListener("scroll", cloneMoreIfNeeded);
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
