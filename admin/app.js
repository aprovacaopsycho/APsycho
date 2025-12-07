// ===== UTILITÁRIOS =====
const qs = s => document.querySelector(s);
const show = el => el?.classList.remove('hidden');
const hide = el => el?.classList.add('hidden');

async function sha256Hex(msg) {
  const data = new TextEncoder().encode(msg);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== CONFIGURAÇÃO =====
const PRIVATE_DB_URL = 'private/alunos_db.json';
const ADMIN_HASH_URL = 'private/hashes_administradores.json';

let studentsDB = [];

// ===== 1. LOGIN =====
async function doLogin() {
  const email = qs('#email').value.trim().toLowerCase();
  const pass = qs('#password').value;
  const msg = qs('#gateMsg');
  
  if(!email || !pass) return alert("Preencha tudo.");
  msg.textContent = "Verificando..."; show(msg);
  
  try {
    const res = await fetch(ADMIN_HASH_URL, { cache: 'no-store' });
    if(!res.ok) throw new Error("Erro ao ler lista de admins.");
    const validHashes = await res.json();
    const myHash = await sha256Hex(email + pass);
    
    if (validHashes.includes(myHash)) {
      sessionStorage.setItem('admin_auth', myHash);
      hide(qs('#gate'));
      show(qs('#app'));
    } else {
      msg.textContent = "Senha incorreta.";
    }
  } catch(e) {
    alert("Erro crítico: " + e.message);
  }
}
qs('#loginBtn').addEventListener('click', doLogin);

// ===== 2. MODO NUVEM (CLOUD) =====

// Carregar do Site
qs('#btn-load-db').addEventListener('click', async () => {
  const btn = qs('#btn-load-db');
  btn.textContent = "⏳ Baixando...";
  btn.disabled = true;

  try {
    const res = await fetch(PRIVATE_DB_URL, { cache: 'no-store' });
    if(res.status === 404) {
      studentsDB = [];
      notify("Nenhum banco de dados encontrado no site (404). Inicie um novo.", "ok");
    } else if (res.ok) {
      studentsDB = await res.json();
      notify(`Sucesso! ${studentsDB.length} alunos baixados do site.`, "ok");
    } else {
      throw new Error("Erro HTTP " + res.status);
    }
    renderTable();
  } catch(e) {
    console.error(e);
    notify("Erro ao baixar da nuvem: " + e.message, "bad");
  } finally {
    btn.textContent = "🔄 Baixar do Site (Load)";
    btn.disabled = false;
  }
});

// Salvar no Site (Deploy)
qs('#btn-save-cloud').addEventListener('click', async () => {
  const apiKey = qs('#api-key').value.trim();
  const apiUrl = qs('#api-url').value.trim();
  
  if(!apiKey || !apiUrl) return alert("Preencha a API Key e URL abaixo.");
  if(!confirm(`Isso vai sobrescrever o site com os ${studentsDB.length} alunos da lista atual. Confirmar?`)) return;

  const btn = qs('#btn-save-cloud');
  btn.disabled = true;
  btn.textContent = "🚀 Enviando...";

  try {
    const publicHashes = [];
    for(const s of studentsDB) {
      const hash = await sha256Hex(s.email + s.inscricao);
      publicHashes.push(hash);
    }

    const payload = {
      files: [
        { path: 'hashes_membros.json', content: JSON.stringify(publicHashes, null, 2) },
        { path: 'admin/private/alunos_db.json', content: JSON.stringify(studentsDB, null, 2) }
      ]
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if(!res.ok) throw new Error(data.error || "Erro no envio");

    notify("✅ Site atualizado com sucesso!", "ok");

  } catch(e) {
    console.error(e);
    notify("Erro ao enviar: " + e.message, "bad");
  } finally {
    btn.disabled = false;
    btn.textContent = "🚀 Enviar para o Site (Deploy)";
  }
});

// ===== 3. MODO MANUAL (LOCAL) =====

// Conecta os botões visíveis aos inputs ocultos
qs('#trigger-db-local').addEventListener('click', () => qs('#file-db-local').click());
qs('#trigger-sheet').addEventListener('click', () => qs('#file-sheet').click());

// Salvar Backup Local (Download)
qs('#btn-save-local').addEventListener('click', () => {
  if(!studentsDB.length) return alert("A lista está vazia.");
  
  const blob = new Blob([JSON.stringify(studentsDB, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0,10);
  a.download = `backup_alunos_${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  notify("Backup salvo no seu computador.", "ok");
});

// Carregar Backup Local (Upload JSON)
qs('#file-db-local').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;

  try {
    const text = await f.text();
    const json = JSON.parse(text);
    if(Array.isArray(json)) {
      studentsDB = json;
      renderTable();
      notify(`Backup carregado! ${json.length} alunos recuperados.`, "ok");
    } else {
      alert("Arquivo inválido. Precisa ser uma lista de alunos.");
    }
  } catch(err) {
    alert("Erro ao ler JSON: " + err.message);
  }
  e.target.value = ''; // Reseta input
});

// Importar Excel
qs('#file-sheet').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;

  try {
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

    if (!json.length) return alert("Planilha vazia.");

    let count = 0;
    const keys = Object.keys(json[0]);
    let map = { nome: null, email: null, cpf: null, inscricao: null };

    keys.forEach(k => {
      const low = k.toLowerCase();
      if(low.includes('nome') || low.includes('name') || low.includes('aluno')) map.nome = k;
      if(low.includes('mail')) map.email = k;
      if(low.includes('cpf') || low.includes('doc')) map.cpf = k;
      if(low.includes('inscr') || low.includes('senha') || low.includes('key')) map.inscricao = k;
    });

    if(!map.email || !map.inscricao) {
      return alert("Colunas 'Email' e 'Inscrição' não identificadas automaticamente.");
    }

    json.forEach(row => {
      const s = {
        nome: row[map.nome] ? String(row[map.nome]).trim() : '',
        email: row[map.email] ? String(row[map.email]).trim().toLowerCase() : '',
        cpf: row[map.cpf] ? String(row[map.cpf]).trim() : '',
        inscricao: row[map.inscricao] ? String(row[map.inscricao]).trim() : ''
      };
      if(s.email && s.inscricao) {
        addStudentToDB(s);
        count++;
      }
    });

    notify(`Importação Excel: ${count} novos registros processados.`, "ok");
    e.target.value = ''; 

  } catch (err) {
    console.error(err);
    notify("Erro ao ler planilha: " + err.message, "bad");
  }
});

// ===== 4. GESTÃO DA TABELA =====

// Limpar Tudo
qs('#btn-clear-all').addEventListener('click', () => {
  if(confirm('Tem certeza? Isso apagará a lista atual da memória.')) {
    studentsDB = [];
    renderTable();
    notify("Lista limpa.", "ok");
  }
});

function renderTable() {
  const tbody = qs('#studentTable tbody');
  qs('#count').textContent = studentsDB.length;
  tbody.innerHTML = '';

  const sorted = [...studentsDB].sort((a,b) => (a.nome||'').localeCompare(b.nome||''));

  sorted.forEach((s) => {
    // Usamos o índice no array original
    const originalIndex = studentsDB.indexOf(s);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.nome || '-'}</td>
      <td>${s.email}</td>
      <td>${s.cpf || '-'}</td>
      <td>${s.inscricao}</td>
      <td>
        <button class="btn-delete" data-index="${originalIndex}" style="background:none;border:none;cursor:pointer;color:#f87171" title="Remover">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Event Delegation para o botão Deletar (funciona mesmo com CSP estrita)
qs('#studentTable').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-delete');
  if (btn) {
    const idx = btn.dataset.index;
    if(confirm("Remover este aluno?")) {
      studentsDB.splice(idx, 1);
      renderTable();
      notify("Aluno removido. Lembre de Salvar.", "bad");
    }
  }
});

// Adicionar Manualmente
qs('#btn-add').addEventListener('click', () => {
  const nome = qs('#new-name').value.trim();
  const email = qs('#new-email').value.trim().toLowerCase();
  const cpf = qs('#new-cpf').value.trim();
  const inscricao = qs('#new-key').value.trim();

  addStudentToDB({ nome, email, cpf, inscricao });
  
  qs('#new-name').value = '';
  qs('#new-email').value = '';
  qs('#new-cpf').value = '';
  qs('#new-key').value = '';
});

function addStudentToDB(student) {
  if(!student.email || !student.inscricao) return alert("E-mail e Inscrição obrigatórios.");
  
  const existingIndex = studentsDB.findIndex(s => s.email === student.email);
  
  if (existingIndex >= 0) {
    studentsDB[existingIndex] = student; // Atualiza
  } else {
    studentsDB.push(student); // Adiciona
  }
  renderTable();
}

function notify(text, type) {
  const el = qs('#statusMsg');
  el.textContent = text;
  el.className = `alert ${type}`;
  show(el);
  setTimeout(() => hide(el), 5000);
}