const families = {
  appoggiatura: { name: "Appoggiatura", glyph: "♪", description: "A grace-note approach resolving into the principal note." },
  compound: { name: "Compound Appoggiatura", glyph: "♫", description: "Linked grace notes resolving into the principal note." },
  mordent: { name: "Mordent", glyph: "≈", description: "A compact alternating ornament around the principal note." },
  slide: { name: "Slide", glyph: "╱", description: "A directional approach that leads into the target note." },
  snap: { name: "Snap", glyph: "⌜", description: "A concise hooked accent with an immediate return." },
  trill: { name: "Trill", glyph: "∿", description: "A repeated oscillation around the target note." },
  turn: { name: "Turn", glyph: "S", description: "A curved reversal that surrounds the target note." }
};

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("etapki-theme", theme);
  const button = document.querySelector("[data-theme-toggle]");
  if (button) button.textContent = theme === "parchment" ? "Midnight" : theme === "gloss" ? "Matte" : "Parchment";
}

function nextTheme() {
  const current = document.documentElement.dataset.theme || "midnight";
  setTheme(current === "midnight" ? "parchment" : current === "parchment" ? "gloss" : "midnight");
}

function createNotes(container, mode = "source") {
  if (!container) return;
  container.querySelectorAll(".note").forEach((note) => note.remove());
  const notes = mode === "revision"
    ? [[14, 66, 15], [25, 53, 12], [36, 43, 11], [48, 50, 14], [60, 34, 18], [76, 25, 16]]
    : [[14, 61, 18], [31, 52, 18], [48, 43, 20], [65, 35, 22], [82, 27, 17]];
  notes.forEach(([left, top, width]) => {
    const note = document.createElement("span");
    note.className = `note ${mode === "revision" ? "revision" : "source"}`;
    note.style.left = `${left}%`;
    note.style.top = `${top}%`;
    note.style.width = `${width}%`;
    container.appendChild(note);
  });
}

function activateWorkspaceFamily(key) {
  const item = families[key] || families.appoggiatura;
  document.querySelectorAll("[data-family-button]").forEach((button) => {
    button.classList.toggle("active", button.dataset.familyButton === key);
  });
  const name = document.querySelector("[data-family-name]");
  const description = document.querySelector("[data-family-description]");
  if (name) name.textContent = item.name;
  if (description) description.textContent = item.description;
  const status = document.querySelector("[data-workspace-status]");
  if (status) status.textContent = `${item.name} selected. Choose a variant or preview the compatible revision.`;
  createNotes(document.querySelector("[data-timeline]"), "revision");
}

function wirePage() {
  const saved = localStorage.getItem("etapki-theme") || "midnight";
  setTheme(saved);
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", nextTheme));
  document.querySelectorAll("[data-family-button]").forEach((button) => {
    button.addEventListener("click", () => activateWorkspaceFamily(button.dataset.familyButton));
  });
  document.querySelectorAll("[data-preview]").forEach((button) => {
    button.addEventListener("click", () => {
      createNotes(document.querySelector("[data-timeline]"), button.dataset.preview === "after" ? "revision" : "source");
      const status = document.querySelector("[data-workspace-status]");
      if (status) status.textContent = button.dataset.preview === "after" ? "Previewing current revision." : "Previewing original source.";
    });
  });
  document.querySelectorAll("[data-reveal]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.reveal);
      if (!target) return;
      target.classList.toggle("hidden");
      button.setAttribute("aria-expanded", String(!target.classList.contains("hidden")));
    });
  });
  createNotes(document.querySelector("[data-timeline]"));
}

document.addEventListener("DOMContentLoaded", wirePage);

