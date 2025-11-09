// /admin/app.js — login via usuário + senha
(() => {
  const $ = (s) => document.querySelector(s);
  const form  = $("#login-form");
  const btn   = $("#btn-login");
  const msg   = $("#msg");
  const build = $("#build-info");

  build.textContent = `[admin] ${new Date().toISOString()}`;

  const ADMIN_HASH_URLS = [
    "./private/hashes_administradores.json",
    "/admin/private/hashes_administradores.json"
  ];

  // === utilitário SHA-256 ===
  async function sha256Hex(str) {
    const enc = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return [...new Uint8Array(buf)]
      .map(b => b.toString(16).padStart(2,"0"))
      .join("");
  }

  async function loadHashes() {
    for (const url of ADMIN_HASH_URLS) {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (Array.isArray(data)) return data.map(String);
      } catch (e) {
        console.warn("[admin] falha ao carregar", url, e);
      }
    }
    throw new Error("Não foi possível carregar hashes.");
  }

  function show(text, ok = false) {
    msg.style.display = "block";
    msg.classList.toggle("ok", ok);
    msg.textContent = text;
  }

  function persistSession(username) {
    sessionStorage.setItem("admin.logged", "1");
    sessionStorage.setItem("admin.user", username);
  }

  function isLogged() {
    return sessionStorage.getItem("admin.logged") === "1";
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    msg.style.display = "none";
    btn.disabled = true;

    try {
      const user = $("#user").value.trim();
      const pass = $("#pass").value;
      if (!user || !pass) { show("Preencha usuário e senha."); return; }

      const hashes = await loadHashes();
      const candidate = await sha256Hex(`${user}:${pass}`);

      console.debug("[admin] hash(user:pass) =", candidate);

      if (!hashes.includes(candidate)) {
        show("Credenciais inválidas.");
        return;
      }

      persistSession(user);
      show("Login realizado com sucesso!", true);
      setTimeout(() => location.href = "./dashboard.html", 400);

    } catch (e) {
      console.error(e);
      show("Erro ao validar. Verifique o arquivo de administradores.");
    } finally {
      btn.disabled = false;
    }
  }

  if (isLogged()) {
    location.replace("./dashboard.html");
  } else {
    form?.addEventListener("submit", onSubmit);
  }

  // Gerar hash manualmente no console:
  // window.__hash__("email","senha").then(console.log)
  window.__hash__ = async (u, p) => sha256Hex(`${u}:${p}`);
})();
