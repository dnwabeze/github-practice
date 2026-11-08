// Lumen demo — vanilla JavaScript, no dependencies.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Safe localStorage wrapper (may throw in private mode / blocked storage)
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
    },
  };

  // ---------- Toast ----------
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }

  // ---------- Theme ----------
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = store.get("theme", prefersDark ? "dark" : "light");
  $("#theme-toggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    store.set("theme", root.dataset.theme);
  });

  // ---------- Mobile nav ----------
  const navToggle = $(".nav-toggle");
  const navLinks = $("#nav-links");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$("#nav-links a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  // ---------- Reveal on scroll + counters ----------
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.count) animateCount(el);
        else el.classList.add("visible");
        io.unobserve(el);
      });
    }, { threshold: 0.15 });
    $$(".reveal, [data-count]").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("visible"));
    $$("[data-count]").forEach((el) => (el.textContent = Number(el.dataset.count).toLocaleString()));
  }

  // ---------- Todo demo ----------
  const list = $("#todo-list");
  const form = $("#todo-form");
  const input = $("#todo-input");
  const countEl = $("#todo-count");
  let filter = "all";
  let todos = store.get("todos", [
    { id: 1, text: "Explore the Lumen demo", done: true },
    { id: 2, text: "Toggle dark mode", done: false },
    { id: 3, text: "Add your own task", done: false },
  ]);

  const save = () => store.set("todos", todos);

  function render() {
    list.innerHTML = "";
    const visible = todos.filter((t) =>
      filter === "all" ? true : filter === "done" ? t.done : !t.done
    );
    if (!visible.length) {
      const li = document.createElement("li");
      li.className = "todo-empty";
      li.textContent = filter === "done" ? "Nothing completed yet." : "All clear! 🎉";
      list.append(li);
    }
    visible.forEach((t) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (t.done ? " done" : "");
      li.dataset.id = t.id;

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = t.done;
      cb.setAttribute("aria-label", `Mark "${t.text}" as ${t.done ? "not done" : "done"}`);

      const span = document.createElement("span");
      span.textContent = t.text; // textContent prevents HTML injection

      const del = document.createElement("button");
      del.className = "delete";
      del.innerHTML = "&times;";
      del.setAttribute("aria-label", `Delete "${t.text}"`);

      li.append(cb, span, del);
      list.append(li);
    });
    const left = todos.filter((t) => !t.done).length;
    countEl.textContent = `${left} task${left === 1 ? "" : "s"} left`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    todos.push({ id: Date.now(), text, done: false });
    input.value = "";
    save(); render();
    toast("Task added");
  });

  list.addEventListener("click", (e) => {
    const li = e.target.closest(".todo-item");
    if (!li) return;
    const id = Number(li.dataset.id);
    if (e.target.matches("input[type=checkbox]")) {
      todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    } else if (e.target.matches(".delete")) {
      todos = todos.filter((t) => t.id !== id);
      toast("Task deleted");
    } else return;
    save(); render();
  });

  $$(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      $$(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      filter = chip.dataset.filter;
      render();
    })
  );

  $("#clear-done").addEventListener("click", () => {
    const before = todos.length;
    todos = todos.filter((t) => !t.done);
    save(); render();
    toast(before === todos.length ? "No completed tasks" : "Cleared completed tasks");
  });

  render();

  // ---------- Pricing toggle ----------
  $("#billing").addEventListener("change", (e) => {
    const yearly = e.target.checked;
    $$(".price span").forEach((el) => {
      const v = Number(yearly ? el.dataset.yearly : el.dataset.monthly);
      el.textContent = "$" + (Number.isInteger(v) ? v : v.toFixed(2));
    });
  });

  // ---------- Contact form validation ----------
  const contact = $("#contact-form");
  const rules = {
    name: (v) => (v.trim() ? "" : "Please enter your name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email."),
    message: (v) => (v.trim().length >= 10 ? "" : "Message must be at least 10 characters."),
  };

  function validateField(field) {
    const msg = rules[field.name](field.value);
    const wrap = field.closest(".field");
    wrap.classList.toggle("invalid", !!msg);
    $(".error", wrap).textContent = msg;
    field.setAttribute("aria-invalid", String(!!msg));
    return !msg;
  }

  Object.keys(rules).forEach((name) => {
    const field = contact.elements[name];
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("invalid")) validateField(field);
    });
  });

  contact.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = Object.keys(rules).map((n) => contact.elements[n]);
    const ok = fields.map(validateField).every(Boolean);
    if (!ok) { fields.find((f) => f.getAttribute("aria-invalid") === "true").focus(); return; }
    contact.reset();
    $("#form-success").hidden = false;
    toast("Message sent (demo)");
  });

  // ---------- Footer ----------
  $("#year").textContent = new Date().getFullYear();
})();
