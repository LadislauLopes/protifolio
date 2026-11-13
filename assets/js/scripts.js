// Portfólio de Ladislau Lopes.
// Sem dependências. Tudo funciona sem JavaScript: o conteúdo aparece inteiro e o combo,
// completo. Com JavaScript, as seções entram ao rolar e o controle vira jogável.

(() => {
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
     O combo jogável: cada hit é uma etapa da plataforma de automação.
     Notação numérica de 4 botões; "f" é para a frente com o jogador do lado esquerdo.
  --------------------------------------------------------------------------------------- */
  const pad = document.querySelector("[data-pad]");
  if (pad) {
    const board = pad.querySelector("[data-board]");
    const ball = pad.querySelector("[data-ball]");
    const countEl = pad.querySelector("[data-count]");
    const wordEl = pad.querySelector("[data-word]");
    const logEl = pad.querySelector("[data-log]");
    const btnEls = {};
    pad.querySelectorAll("[data-btn]").forEach((b) => (btnEls[b.dataset.btn] = b));
    const comboSection = document.getElementById("combo");
    const moveEls = [...comboSection.querySelectorAll("[data-moves] li")];
    const moves = moveEls.map((li) => ({
      input: li.querySelector(".move-input").textContent,
      stage: li.querySelector(".move-stage").textContent,
      what: li.querySelector(".move-what").textContent,
    }));
    const demoBtn = comboSection.querySelector("[data-demo]");
    const resetBtn = comboSection.querySelector("[data-reset]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // um passo por hit: botões (juntos), direção segurada ou toques para a frente
    const STEPS = [
      { move: 0, btns: "4", dir: "uf" },
      { move: 1, btns: "4" },
      { move: 2, btns: "3", taps: 2 },
      { move: 3, btns: "1", dir: "b" },
      { move: 3, btns: "2" },
      { move: 4, btns: "34", dir: "f" },
      { move: 4, btns: "2" },
      { move: 5, btns: "2" },
      { move: 6, btns: "24", taps: 3 },
    ];
    const GAP = 1600;      // ms máximos entre um hit e o próximo
    const TOGETHER = 110;  // ms para botões contarem como simultâneos
    const TAP_WINDOW = 900;
    const START = "Comece pelo <strong>uf4</strong>: segure para cima e para a frente e aperte 4.";
    const OFFSET = { n: [0, 0], u: [0, -1], d: [0, 1], f: [1, 0], b: [-1, 0], uf: [0.7, -0.7], ub: [-0.7, -0.7], df: [0.7, 0.7], db: [-0.7, 0.7] };

    let step = 0, lastHit = 0, done = false, demo = false, pending = null;
    let taps = [], timers = [];
    const held = new Set();

    const dirNow = () => {
      const v = held.has("u") ? "u" : held.has("d") ? "d" : "";
      const h = held.has("f") ? "f" : held.has("b") ? "b" : "";
      return v + h || "n";
    };
    const drawStick = () => {
      const [x, y] = OFFSET[dirNow()];
      ball.style.transform = `translate(${x * 30}%, ${y * 30}%)`;
    };
    const setCount = (n) => {
      countEl.textContent = n;
      wordEl.textContent = n === 1 ? "hit" : "hits";
    };
    const log = (html) => (logEl.innerHTML = html);

    function reset(message = START) {
      step = 0; lastHit = 0; done = false;
      setCount(0);
      moveEls.forEach((li) => li.classList.remove("is-hit"));
      log(message);
    }

    function dirDown(k) {
      if (k === "f" && !held.has("f")) taps.push(performance.now());
      if (taps.length > 12) taps = taps.slice(-6);
      held.add(k);
      drawStick();
    }
    function dirUp(k) { held.delete(k); drawStick(); }
    function setDir(d) { // demonstração e as setas da tela
      for (const k of ["u", "d", "f", "b"]) if (!d.includes(k)) held.delete(k);
      if (d !== "n") for (const k of d.match(/[udfb]/g)) if (!held.has(k)) dirDown(k);
      drawStick();
    }

    function flash(n, hit) {
      const el = btnEls[n];
      el.classList.add("is-down");
      setTimeout(() => el.classList.remove("is-down"), 130);
      if (hit) {
        el.classList.remove("is-hit");
        void el.offsetWidth; // reinicia a animação do anel
        el.classList.add("is-hit");
      }
    }

    function press(n) {
      const now = performance.now();
      flash(n, false);
      // o mesmo botão de novo dentro da janela (o 2,2 rápido do f3+4,2 → 2) é outro golpe:
      // fecha o anterior na hora em vez de juntar os dois num aperto só
      if (pending && pending.btns.has(n)) {
        clearTimeout(pending.timer);
        resolve();
      }
      if (!pending) {
        pending = { btns: new Set(), dir: dirNow(), at: now };
        pending.timer = setTimeout(resolve, TOGETHER);
      }
      pending.btns.add(n);
    }

    function matches(exp, got, dir, now) {
      if (got !== exp.btns) return false;
      if (exp.dir === "uf" && dir !== "uf") return false;
      if ((exp.dir === "b" || exp.dir === "f") && !dir.endsWith(exp.dir)) return false;
      if (exp.taps) {
        const since = Math.max(lastHit, now - TAP_WINDOW);
        if (taps.filter((t) => t >= since).length < exp.taps) return false;
      }
      return true;
    }

    function resolve() {
      const { btns, dir, at } = pending;
      pending = null;
      const got = [...btns].sort().join("");
      if (done) reset();
      if (step > 0 && at - lastHit > GAP) reset("Demorou demais entre os golpes. " + START);
      if (matches(STEPS[step], got, dir, at)) return hit(btns, at);
      if (step > 0) {
        const where = step;
        reset();
        if (matches(STEPS[0], got, dir, at)) return hit(btns, at);
        return log(`O combo caiu no hit ${where + 1}: era <strong>${moves[STEPS[where].move].input}</strong>. ${START}`);
      }
      log(START);
    }

    function hit(btns, at) {
      const exp = STEPS[step];
      btns.forEach((n) => flash(n, true));
      step += 1;
      lastHit = at;
      setCount(step);
      moveEls[exp.move].classList.add("is-hit");
      const m = moves[exp.move];
      if (step === STEPS.length) {
        done = true;
        log("<strong>Combo completo:</strong> do agendamento ao aviso no chat.");
      } else {
        log(`<strong>${m.input} · ${m.stage}</strong>: ${m.what}.`);
      }
    }

    // teclado, só com o controle em foco (fora dele as setas continuam rolando a página)
    const KEYS = {
      ArrowLeft: "b", a: "b", ArrowRight: "f", d: "f", ArrowUp: "u", w: "u", ArrowDown: "d", s: "d",
      u: "1", i: "2", j: "3", k: "4", 1: "1", 2: "2", 3: "3", 4: "4",
    };
    const keyOf = (e) => KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
    board.addEventListener("keydown", (e) => {
      const key = keyOf(e);
      if (!key || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      if (demo || e.repeat) return;
      if ("1234".includes(key)) press(key);
      else dirDown(key);
    });
    board.addEventListener("keyup", (e) => {
      const key = keyOf(e);
      if (key && !"1234".includes(key)) dirUp(key);
    });
    board.addEventListener("blur", () => { held.clear(); drawStick(); });

    // mouse e toque
    Object.entries(btnEls).forEach(([n, el]) =>
      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        board.focus({ preventScroll: true });
        if (!demo) press(n);
      })
    );
    pad.querySelectorAll("[data-dir]").forEach((el) => {
      const d = el.dataset.dir;
      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (demo) return;
        el.classList.add("is-down");
        setDir(d);
      });
      const up = () => {
        if (!el.classList.contains("is-down")) return;
        el.classList.remove("is-down");
        setDir("n");
      };
      ["pointerup", "pointerleave", "pointercancel"].forEach((t) => el.addEventListener(t, up));
    });

    // demonstração: os mesmos inputs, nos tempos do combo do perfil do GitHub
    const SCRIPT = [
      [500, "uf"], [620, "4"], [800, "n"], [1150, "4"],
      [1600, "f"], [1720, "n"], [1820, "f"], [1950, "3"], [2200, "n"],
      [2600, "b"], [2720, "1"], [2850, "n"], [3000, "2"],
      [3500, "f"], [3620, "34"], [3750, "n"], [3920, "2"], [4400, "2"],
      [4900, "f"], [5000, "n"], [5100, "f"], [5200, "n"], [5300, "f"], [5450, "24"], [5700, "n"],
    ];
    function stopDemo() {
      timers.forEach(clearTimeout);
      timers = [];
      demo = false;
      held.clear();
      drawStick();
    }
    function runDemo() {
      stopDemo();
      reset("Assista: o combo inteiro, um golpe por etapa.");
      demo = true;
      for (const [t, what] of SCRIPT) {
        timers.push(setTimeout(() => {
          if (/^\d+$/.test(what)) what.split("").forEach(press);
          else setDir(what);
        }, t));
      }
      timers.push(setTimeout(() => {
        demo = false;
        log("<strong>Combo completo:</strong> do agendamento ao aviso no chat. Agora é a sua vez.");
      }, 6000));
    }
    demoBtn.addEventListener("click", runDemo);
    resetBtn.addEventListener("click", () => {
      stopDemo();
      reset();
      board.focus({ preventScroll: true });
    });

    // a demonstração roda sozinha uma vez, quando a seção do combo chega na tela
    reset();
    if ("IntersectionObserver" in window && !reduced.matches) {
      const seen = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        seen.disconnect();
        setTimeout(runDemo, 600);
      }, { threshold: 0.35 });
      seen.observe(comboSection);
    }
  }

})();
