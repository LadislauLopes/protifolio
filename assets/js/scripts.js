// Portfólio de Ladislau Lopes.
// Sem dependências. Tudo funciona sem JavaScript: as figuras ficam no fluxo e as descrições
// abertas. Com JavaScript, no desktop, as figuras vão para o palco fixo da direita.

(() => {
  const wide = window.matchMedia("(min-width: 64em)");

  /* ---------------------------------------------------------------------------------------
     Revelação ao rolar: uma vez por elemento, nunca deixa conteúdo escondido
  --------------------------------------------------------------------------------------- */
  const reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
    window.addEventListener("load", () =>
      setTimeout(() => {
        reveals.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in");
        });
      }, 2500)
    );
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------------------------------------------------------------------------------------
     Palco: cada split tem uma metade fixa que mostra a figura da seção ativa
  --------------------------------------------------------------------------------------- */
  const splits = [...document.querySelectorAll("[data-split]")].map((el) => {
    const stage = el.querySelector(".stage");
    const plates = document.createElement("div");
    plates.className = "stage-plates";
    stage.appendChild(plates);
    const figures = [...el.querySelectorAll("figure.plate[data-plate-id]")].map((fig) => ({
      fig,
      parent: fig.parentNode,
      next: fig.nextSibling,
    }));
    return { el, stage, plates, figures, owners: [...el.querySelectorAll("[data-plate]")], current: null };
  });

  function setPlate(split, id) {
    if (!split || split.current === id) return;
    split.current = id;
    for (const { fig } of split.figures) fig.classList.toggle("is-active", fig.dataset.plateId === id);
  }

  function setOwner(split, owner) {
    split.owners.forEach((o) => o.classList.toggle("is-current", o === owner));
    if (owner) setPlate(split, owner.dataset.plate);
  }

  function place() {
    if (wide.matches) {
      for (const split of splits) {
        for (const { fig } of split.figures) split.plates.appendChild(fig);
        split.current = null;
        setPlate(split, split.owners[0].dataset.plate);
      }
      onScroll();
    } else {
      for (const split of splits) {
        for (const { fig, parent, next } of split.figures) {
          fig.classList.remove("is-active");
          parent.insertBefore(fig, next && next.parentNode === parent ? next : null);
        }
      }
    }
  }

  // A seção ativa é a que cruza a linha do meio da tela.
  let ticking = false;
  function onScroll() {
    ticking = false;
    if (!wide.matches) return;
    const mid = innerHeight * 0.5;
    for (const split of splits) {
      const r = split.el.getBoundingClientRect();
      if (r.top > mid || r.bottom < mid) continue;
      let owner = split.owners[0];
      for (const o of split.owners) {
        if (o.offsetParent === null) continue;
        if (o.getBoundingClientRect().top <= mid) owner = o;
      }
      setOwner(split, owner);
    }
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(onScroll));
  wide.addEventListener("change", place);

  // Passar o mouse ou focar um item do trabalho mostra o diagrama dele na hora.
  for (const split of splits) {
    for (const owner of split.owners) {
      if (!owner.matches(".work-item")) continue;
      const show = () => wide.matches && setOwner(split, owner);
      owner.addEventListener("mouseenter", show);
      owner.addEventListener("focusin", show);
    }
  }

  /* ---------------------------------------------------------------------------------------
     Projetos: uma linha aberta por vez; o palco mostra a linha aberta (ou a apontada)
  --------------------------------------------------------------------------------------- */
  const projectSection = document.getElementById("projetos");
  const projectSplit = splits.find((s) => s.el.contains(projectSection));
  const projects = [...document.querySelectorAll(".project")];
  projects.forEach((p) => (p.dataset.plateRef = p.querySelector("figure.plate").dataset.plateId));
  const showProjects = (id) => wide.matches && projectSection.classList.contains("is-current") && setPlate(projectSplit, id);

  function openProject(project) {
    for (const p of projects) {
      const open = p === project && !p.classList.contains("is-open");
      p.classList.toggle("is-open", open);
      p.querySelector(".project-row").setAttribute("aria-expanded", String(open));
    }
    projectSection.dataset.plate = project.dataset.plateRef;
    showProjects(project.dataset.plateRef);
  }
  projects.forEach((p, i) => {
    const open = i === 0;
    p.classList.toggle("is-open", open);
    p.querySelector(".project-row").setAttribute("aria-expanded", String(open));
    p.querySelector(".project-row").addEventListener("click", () => openProject(p));
    p.addEventListener("mouseenter", () => showProjects(p.dataset.plateRef));
    p.addEventListener("focusin", () => showProjects(p.dataset.plateRef));
  });
  projectSection.querySelector(".project-list").addEventListener("mouseleave", () => showProjects(projectSection.dataset.plate));

  /* ---------------------------------------------------------------------------------------
     Currículos: abas
  --------------------------------------------------------------------------------------- */
  const cvSection = document.getElementById("curriculos");
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  function selectTab(tab, focus) {
    tabs.forEach((t, i) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    cvSection.dataset.plate = tab.getAttribute("aria-controls");
    const split = splits.find((s) => s.el.contains(cvSection));
    if (wide.matches && cvSection.classList.contains("is-current")) setPlate(split, cvSection.dataset.plate);
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      selectTab(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });

  /* ---------------------------------------------------------------------------------------
     Contato: abre o email com a mensagem pronta
  --------------------------------------------------------------------------------------- */
  const contactForm = document.querySelector(".contact-form");
  const contactField = document.getElementById("mensagem");
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const body = contactField.value.trim();
    if (!body) return contactField.focus();
    const subject = "Contato pelo portfólio";
    window.location.href =
      "mailto:ladislau.contato.01@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });

  /* ---------------------------------------------------------------------------------------
     Início
  --------------------------------------------------------------------------------------- */
  selectTab(tabs[0]);
  place();
})();
