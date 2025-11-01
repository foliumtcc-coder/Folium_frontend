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

// Adicione este código no seu arquivo JavaScript principal (ex: home.js)
function initInfiniteCarousel() {
  const carousels = document.querySelectorAll('.carousel');
  
  carousels.forEach(carousel => {
    const container = carousel.querySelector('.section-blocks-container');
    if (!container) return;
    
    const blocks = Array.from(container.children);
    if (blocks.length === 0) return;
    
    // Duplica os blocos para criar o efeito infinito
    blocks.forEach(block => {
      const clone = block.cloneNode(true);
      container.appendChild(clone);
    });
    
    // Adiciona duplicatas extras para scroll suave
    blocks.forEach(block => {
      const clone = block.cloneNode(true);
      container.appendChild(clone);
    });
    
    let isScrolling = false;
    
    container.addEventListener('scroll', () => {
      if (isScrolling) return;
      
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      // Calcula o tamanho de um conjunto completo
      const oneSetWidth = scrollWidth / 3;
      
      // Se chegou ao final, volta pro começo
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        isScrolling = true;
        container.scrollLeft = oneSetWidth;
        setTimeout(() => { isScrolling = false; }, 50);
      }
      
      // Se voltou muito pro início, pula pro final do primeiro set
      if (scrollLeft <= 10) {
        isScrolling = true;
        container.scrollLeft = oneSetWidth;
        setTimeout(() => { isScrolling = false; }, 50);
      }
    });
    
    // Inicia no meio
    container.scrollLeft = container.scrollWidth / 3;
  });
}

// Chama a função quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  // Aguarda um pouco para garantir que os projetos foram carregados
  setTimeout(initInfiniteCarousel, 500);
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
