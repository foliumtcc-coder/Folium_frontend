import { getUser } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const popup = document.getElementById("edit-profile-popup");
  const closePopupBtn = document.getElementById("close-popup");
  const editForm = popup.querySelector(".edit-profile-form");

  const nameElem = document.getElementById("name");
  const bioElem = document.getElementById("bio");
  const linksElem = document.getElementById("links");
  const avatar = document.getElementById("avatar");
  const banner = document.getElementById("banner");
  const avatarInput = document.getElementById("avatarInput");
  const bannerInput = document.getElementById("bannerInput");

  let loggedUser = null;
  let profileUser = null;

  // Pegar ID da URL
  const params = new URLSearchParams(window.location.search);
  const profileId = params.get('id');

  // Buscar usuário logado
  try {
    const res = await getUser();
    loggedUser = res.user;
  } catch (err) {
    console.error("Erro ao buscar usuário logado:", err);
  }

  // Buscar perfil correto
  async function loadProfile() {
    try {
      let endpoint = '';
      let headers = {};
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Usuário não logado");

      headers = { 'Authorization': `Bearer ${token}` };

      if (profileId && parseInt(profileId) !== loggedUser.id) {
        // Perfil de outro usuário
        endpoint = `https://folium-backend.onrender.com/api/auth/profile/${profileId}`;
      } else {
        // Próprio perfil
        endpoint = `https://folium-backend.onrender.com/api/auth/profile/me`;
      }

      const res = await fetch(endpoint, { headers });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      profileUser = data.user;

      // Preencher página
      nameElem.textContent = profileUser.name1;
      bioElem.textContent = profileUser.bio || "";
      avatar.src = profileUser.avatarUrl || "./src/img/icons/profile-icon.jpg";
      banner.src = profileUser.bannerUrl || "./src/img/standard-img.jpg";

      linksElem.innerHTML = "";
      const links = {
        instagram: profileUser.instagram,
        linkedin: profileUser.linkedin,
        github: profileUser.github
      };
      for (const [platform, url] of Object.entries(links)) {
        if (url) {
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.dataset.platform = platform;
          a.textContent = platform;
          linksElem.appendChild(a);
        }
      }

      // Mostrar botão de editar apenas se for o próprio usuário
      if (loggedUser.id === profileUser.id) {
        editProfileBtn.classList.remove("hidden");
      }

    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    }
  }

  await loadProfile();

  // Abrir popup
  editProfileBtn.addEventListener("click", () => {
    popup.classList.remove("hidden");
    editForm.descricao.value = profileUser.bio || "";
    editForm.instagram.value = profileUser.instagram || "";
    editForm.linkedin.value = profileUser.linkedin || "";
    editForm.github.value = profileUser.github || "";
  });

  // Fechar popup
  closePopupBtn.addEventListener("click", () => popup.classList.add("hidden"));

  // Atualizar preview de imagens
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files[0];
    if (file) avatar.src = URL.createObjectURL(file);
  });
  bannerInput.addEventListener("change", () => {
    const file = bannerInput.files[0];
    if (file) banner.src = URL.createObjectURL(file);
  });

  // Salvar alterações
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!profileUser || loggedUser.id !== profileUser.id) return;

    const formData = new FormData();
    formData.append("descricao", editForm.descricao.value);
    formData.append("instagram", editForm.instagram.value.trim());
    formData.append("linkedin", editForm.linkedin.value.trim());
    formData.append("github", editForm.github.value.trim());
    if (avatarInput.files[0]) formData.append("imagem_perfil", avatarInput.files[0]);
    if (bannerInput.files[0]) formData.append("banner_fundo", bannerInput.files[0]);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch('https://folium-backend.onrender.com/api/auth/profile/me', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();

      profileUser = result.user;
      // Atualizar elementos da página
      nameElem.textContent = profileUser.name1;
      bioElem.textContent = profileUser.bio || "";
      avatar.src = profileUser.avatarUrl || "./src/img/icons/profile-icon.jpg";
      banner.src = profileUser.bannerUrl || "./src/img/standard-img.jpg";

      // Fechar popup
      popup.classList.add("hidden");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      alert("Erro ao atualizar perfil.");
    }
  });
});
