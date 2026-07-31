(function () {
  const viewport = document.getElementById("deck-viewport");
  const slides = Array.from(document.querySelectorAll(".slide"));
  let current = 0;
  let fragIndex = -1; // quantas "unidades" de fragment do slide atual já estão visíveis (-1 = nenhuma)

  function fragmentsOf(slide) {
    return Array.from(slide.querySelectorAll(".fragment"));
  }

  // Agrupa fragments em "unidades" de revelação: elementos com o mesmo
  // data-step aparecem juntos no mesmo clique. Elementos sem data-step
  // formam cada um sua própria unidade (comportamento padrão anterior).
  function unitsOf(slide) {
    const frags = fragmentsOf(slide);
    const units = [];
    const byStep = new Map();
    frags.forEach((f) => {
      const step = f.dataset.step;
      if (step !== undefined) {
        if (!byStep.has(step)) {
          const unit = [];
          byStep.set(step, unit);
          units.push(unit);
        }
        byStep.get(step).push(f);
      } else {
        units.push([f]);
      }
    });
    return units;
  }

  function applyFragments() {
    const units = unitsOf(slides[current]);
    units.forEach((unit, i) => {
      unit.forEach((f) => f.classList.toggle("visible", i <= fragIndex));
    });
  }

  function scaleToFit() {
    const scale = Math.min(
      window.innerWidth / 1920,
      window.innerHeight / 1080
    );
    viewport.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  function show(index, opts = {}) {
    if (index < 0 || index >= slides.length) return;
    slides[current].classList.remove("active");
    current = index;
    slides[current].classList.add("active");
    const total = unitsOf(slides[current]).length;
    fragIndex = opts.allFragments ? total - 1 : -1;
    applyFragments();
  }

  function next() {
    const units = unitsOf(slides[current]);
    if (fragIndex < units.length - 1) {
      fragIndex++;
      applyFragments();
      return;
    }
    show(current + 1);
  }

  function prev() {
    if (fragIndex >= 0) {
      fragIndex--;
      applyFragments();
      return;
    }
    show(current - 1, { allFragments: true });
  }

  window.addEventListener("resize", scaleToFit);
  window.addEventListener("keydown", (e) => {
    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
      e.preventDefault();
      next();
    } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
      e.preventDefault();
      prev();
    }
  });
  viewport.addEventListener("click", (e) => {
    const rect = viewport.getBoundingClientRect();
    const clickedRight = e.clientX - rect.left > rect.width / 2;
    clickedRight ? next() : prev();
  });

  scaleToFit();

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get("slide");
  const allFrags = params.get("frag") === "all";
  let startIndex = 0;
  if (targetId) {
    const idx = slides.findIndex((s) => s.id === "slide-" + targetId);
    if (idx >= 0) startIndex = idx;
  }
  show(startIndex, { allFragments: allFrags });
})();
