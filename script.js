const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

toggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

document.querySelector(".signup")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector("input");
  const button = form.querySelector("button");
  button.textContent = "Joined";
  input.value = "";
  setTimeout(() => {
    button.textContent = "Sign Up";
  }, 1800);
});

/* Modal */
const modal = document.getElementById("menu-modal");
const modalImage = document.getElementById("modal-image");
const modalClose = modal?.querySelector(".modal-close");

document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const src = link.getAttribute("data-modal");
    if (modal && modalImage && src) {
      modalImage.src = src;
      modal.classList.add("open");
    }
  });
});

function closeModal() {
  if (modal) {
    modal.classList.remove("open");
  }
}

modalClose?.addEventListener("click", closeModal);

modal?.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});
