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
  setTheme(current === "midnight" ? "parchment" : current === "parchment" ? "gloss" : current === "gloss" ? "satin" : "midnight");
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
  document.querySelectorAll("[data-demo-play]").forEach((button) => {
    button.addEventListener("click", () => toggleDemoPlayback(button));
  });
  document.querySelectorAll("[data-demo-stop]").forEach((button) => {
    button.addEventListener("click", () => stopDemoPlayback());
  });
  document.querySelectorAll("[data-demo-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-demo-mode]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      const status = document.querySelector("[data-demo-status]");
      if (status) status.textContent = `${button.dataset.demoMode === "notation" ? "Notation" : "Piano-roll"} view selected. The desktop application keeps this view synchronized with the same note model.`;
    });
  });
  document.querySelectorAll("[data-demo-scrub]").forEach((slider) => {
    slider.addEventListener("input", () => setDemoProgress(Number(slider.value)));
  });
  document.querySelectorAll(".demo-note").forEach((note) => {
    note.addEventListener("click", () => {
      document.querySelectorAll(".demo-note").forEach((item) => item.classList.remove("selected"));
      note.classList.add("selected");
      const status = document.querySelector("[data-demo-status]");
      if (status) status.textContent = "Selected note target. In the desktop app this action also selects the corresponding MIDI event and can audition it.";
    });
  });
  createNotes(document.querySelector("[data-timeline]"));
}

let demoTimer = null;
let demoProgress = 0;

function setDemoProgress(value) {
  demoProgress = Math.max(0, Math.min(100, value));
  document.querySelectorAll("[data-demo-scrub]").forEach((slider) => { slider.value = String(demoProgress); });
  document.querySelectorAll(".demo-playhead").forEach((playhead) => { playhead.style.left = `${demoProgress}%`; });
  document.querySelectorAll("[data-demo-readout]").forEach((readout) => { readout.textContent = `${Math.round(demoProgress)}%`; });
}

function toggleDemoPlayback(button) {
  if (demoTimer) {
    clearInterval(demoTimer);
    demoTimer = null;
    button.textContent = "Play demo";
    button.setAttribute("aria-pressed", "false");
    return;
  }
  button.textContent = "Pause demo";
  button.setAttribute("aria-pressed", "true");
  demoTimer = window.setInterval(() => {
    const next = demoProgress >= 100 ? 0 : demoProgress + 1;
    setDemoProgress(next);
  }, 90);
}

function stopDemoPlayback() {
  if (demoTimer) clearInterval(demoTimer);
  demoTimer = null;
  setDemoProgress(0);
  document.querySelectorAll("[data-demo-play]").forEach((button) => {
    button.textContent = "Play demo";
    button.setAttribute("aria-pressed", "false");
  });
}

document.addEventListener("DOMContentLoaded", wirePage);

