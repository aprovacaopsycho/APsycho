// ===== UTILITÁRIOS =====
const qs = s => document.querySelector(s);
const show = el => el?.classList.remove('hidden');
const hide = el => el?.classList.add('hidden');

function notify(text, type = 'brand-blue') {
  const el = qs('#toast-message');
  const container = qs('#toast-container');
  el.textContent = text;

  if (type === 'ok') container.style.background = '#22c55e';
  else if (type === 'bad') container.style.background = '#ef4444';
  else container.style.background = '#3b82f6';

  container.classList.add('show');
  setTimeout(() => container.classList.remove('show'), 3000);
}

// Crypto para Hashes
async function sha256Hex(msg) {
  const data = new TextEncoder().encode(msg);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== CONFIG GLOBAL =====
const CONFIG = {
  PRIVATE_DB_URL: 'private/alunos_db.json',
  ADMIN_HASH_URL: 'private/hashes_administradores.json'
};

// ===== ESTADO: ALUNOS =====
let studentsDB = [];
let editingStudentIndex = null;

// ===== ESTADO: PSICODATA (TESTES) =====
let appData = {};
let currentTestTypes = {};
let currentAliases = {};
let currentBanca = "";
let currentView = "students"; // 'students' | 'psicodata'

const defaultTestTypes = {
  "NEO PI": "Personalidade", "NEO PI-R": "Personalidade", "NEO FII R": "Personalidade", "NEO-PI": "Personalidade", "NEO PPI": "Personalidade",
  "IFP": "Personalidade", "IFP II": "Personalidade", "IFP 2": "Personalidade", "IFP-II": "Personalidade", "IFP-R": "Personalidade",
  "BFP": "Personalidade", "BPR-5 RV": "Personalidade", "BPF": "Personalidade",
  "PALOGRÁFICO": "Personalidade", "PALO": "Personalidade", "PALOGRAFICO": "Personalidade",
  "PMK": "Personalidade", "CPS": "Personalidade", "QUATI": "Personalidade", "IHS": "Personalidade", "EFN-R": "Personalidade", "MIG": "Personalidade",
  "TEACO": "Atenção", "TEACO-FF": "Atenção",
  "TEADI": "Atenção", "TEADI 2": "Atenção",
  "TEALT": "Atenção",
  "CTA": "Atenção", "CTA-AD": "Atenção", "CTA-AC": "Atenção", "CTA COMPLETO": "Atenção", "CTA CONCENTRADO": "Atenção", "CTA DIVIDIDO": "Atenção", "CTA ALTERNADO": "Atenção",
  "BPA": "Atenção", "BPA AC/AD/AA": "Atenção", "BPA(AC E AD)": "Atenção",
  "AC VETOR": "Atenção",
  "TEPIC": "Atenção", "TEDIF 2": "Atenção", "TADIS": "Atenção", "EATA": "Atenção",
  "MEMÓRIA": "Memória", "MEMÓRIA F": "Memória", "MEMÓRIA DE FACES": "Memória", "MEMÓRIA F FACES": "Memória", "MVR": "Memória", "MVR FACES DUPLAS": "Memória",
  "TSP MEMÓRIA": "Memória", "TSP (MEMO)": "Memória", "TSP": "Memória",
  "TEM-R": "Memória", "TEM R": "Memória", "TIME-R": "Memória", "TMR": "Memória",
  "R1": "Raciocínio", "G36": "Raciocínio", "G 36": "Raciocínio", "G38": "Raciocínio",
  "BETA 3": "Raciocínio", "BETA III": "Raciocínio", "BETA 3 MATRICIAL": "Raciocínio", "BETA III MATRICIAL": "Raciocínio", "BETA III CÓDIGOS": "Raciocínio",
  "BRD": "Raciocínio", "BRD RV": "Raciocínio", "BRD-RV": "Raciocínio", "BRD-AR": "Raciocínio",
  "TIG": "Raciocínio", "TIG NV": "Raciocínio",
  "WMT-2": "Raciocínio", "WMT 2": "Raciocínio",
  "CUBOS": "Raciocínio", "TRL": "Raciocínio", "TRI": "Raciocínio",
  "RAVEN": "Raciocínio", "HTM": "Raciocínio",
  "ESAVI": "Raciocínio", "ESAVI A": "Raciocínio", "ESAVI B": "Raciocínio", "ESAVI-B": "Raciocínio"
};

const defaultAliases = {
  "NEO-PI": "NEO PI-R", "NEO PI": "NEO PI-R", "NEO PIR": "NEO PI-R", "NEO-PIR": "NEO PI-R", "NEO FII R": "NEO PI-R",
  "IFP 2": "IFP-II", "IFP2": "IFP-II", "IFP II": "IFP-II",
  "PALO": "PALOGRÁFICO", "PALOGRAFICO": "PALOGRÁFICO",
  "BETA 3": "BETA-III", "BETA III": "BETA-III", "BETA-3": "BETA-III",
  "WMT 2": "WMT-2", "WMT2": "WMT-2",
  "AC VETOR": "AC-VETOR"
};

const typeColors = {
  "Personalidade": "bg-purple-500",
  "Atenção": "bg-yellow-500",
  "Memória": "bg-green-500",
  "Raciocínio": "bg-blue-500",
  "Outros": "bg-gray-500"
};

// ===== NAVEGAÇÃO =====
function switchSection(section) {
  currentView = section;

  // UI Updates
  if (section === 'students') {
    hide(qs('#section-psicodata'));
    show(qs('#section-students'));

    qs('#nav-students').classList.add('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-students').classList.remove('text-slate-400', 'hover:bg-slate-800');

    qs('#nav-psicodata').classList.remove('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-psicodata').classList.add('text-slate-400', 'hover:bg-slate-800');
  } else {
    hide(qs('#section-students'));
    show(qs('#section-psicodata'));

    qs('#nav-psicodata').classList.add('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-psicodata').classList.remove('text-slate-400', 'hover:bg-slate-800');

    qs('#nav-students').classList.remove('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-students').classList.add('text-slate-400', 'hover:bg-slate-800');

    // Inicializa view psicodata se necessário
    if (!currentBanca) {
      const keys = Object.keys(appData).sort();
      if (keys.length > 0) selectBanca(keys[0]);
    }
  }
}
window.switchSection = switchSection; // Expor globalmente

// ===== 1. LOGIN =====
async function doLogin() {
  const email = qs('#email').value.trim().toLowerCase();
  const pass = qs('#password').value;
  const msg = qs('#gateMsg');

  if (!email || !pass) return alert("Preencha tudo.");
  msg.textContent = "Verificando..."; show(msg);

  try {
    const res = await fetch(CONFIG.ADMIN_HASH_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error("Erro ao ler lista de admins.");
    const validHashes = await res.json();
    const myHash = await sha256Hex(email + pass);

    if (validHashes.includes(myHash)) {
      sessionStorage.setItem('admin_auth', myHash);
      hide(qs('#gate'));
      show(qs('#app'));
      loadData(); // Carregar dados iniciais dos DAIS bancos
    } else {
      msg.textContent = "Senha incorreta.";
    }
  } catch (e) {
    alert("Erro crítico: " + e.message);
  }
}
qs('#loginBtn').addEventListener('click', doLogin);


// ===== 2. MODO NUVEM (CLOUD SYNC) =====

// CARREGAR (LOAD)
qs('#btn-load-cloud').addEventListener('click', async () => {
  const btn = qs('#btn-load-cloud');
  btn.textContent = "⏳ Baixando...";
  btn.disabled = true;

  try {
    // 1. Alunos
    const resStudents = await fetch(CONFIG.PRIVATE_DB_URL, { cache: 'no-store' });
    if (resStudents.ok) {
      studentsDB = await resStudents.json();
      notify(`Alunos baixados: ${studentsDB.length}`, "ok");
      renderStudentTable();
    }

    // 2. PsicoData (Se existir end-point, por enquanto é local storage, mas vamos tentar carregar se tivermos URL)
    // Para simplificar, assumimos que PsicoData é principalmente local ou gerido separadamente, mas o usuario pediu merge.
    // Vamos usar localStorage para PsicoData por enquanto, pois não temos URL definida no servidor.
    // MAS o deploy vai enviar como 'PMPR/private/testes_db.json'. Vamos tentar ler de lá se criarmos.
    // Por hora, apenas lógica local para PsicoData e Load Cloud para Alunos.

  } catch (e) {
    console.error(e);
    notify("Erro cloud: " + e.message, "bad");
  } finally {
    btn.textContent = "🔄 Recarregar da Nuvem";
    btn.disabled = false;
  }
});

// SALVAR (DEPLOY)
qs('#btn-save-cloud').addEventListener('click', async () => {
  const apiKey = qs('#api-key').value.trim();
  const apiUrl = qs('#api-url').value.trim(); // User forneceu a URL completa

  if (!apiKey || !apiUrl) return alert("Configure a API Key em Configurações.");
  if (!confirm(`PUBLICAR NO SITE?\n\nIsso atualizará:\n- Lista de Alunos (${studentsDB.length})\n- Banco de Testes (${Object.keys(appData).length} bancas)`)) return;

  const btn = qs('#btn-save-cloud');
  btn.disabled = true;
  btn.textContent = "🚀 Enviando...";

  try {
    const publicHashes = [];
    for (const s of studentsDB) {
      const hash = await sha256Hex(s.email + s.inscricao);
      publicHashes.push(hash);
    }

    // Payload Unificado
    const payload = {
      files: [
        // 1. Hashes Para Login dos Alunos
        { path: 'hashes_membros.json', content: JSON.stringify(publicHashes, null, 2) },
        // 2. Banco de Dados Privado dos Alunos
        { path: 'admin/private/alunos_db.json', content: JSON.stringify(studentsDB, null, 2) },
        // 3. Banco de Dados de Testes (PsicoData)
        { path: 'admin/private/psicodata_db.json', content: JSON.stringify(appData, null, 2) },
        // 4. Configurações de Tipos/Aliases
        { path: 'admin/private/psicodata_config.json', content: JSON.stringify({ types: currentTestTypes, aliases: currentAliases }, null, 2) }
      ]
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro no envio");

    notify("✅ Site atualizado com sucesso!", "ok");

  } catch (e) {
    console.error(e);
    notify("Erro ao enviar: " + e.message, "bad");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Publicar Tudo';
  }
});


// ===== 3. GESTÃO DE ALUNOS =====

function renderStudentTable() {
  const tbody = qs('#studentTable tbody');
  qs('#label-count-students').textContent = `${studentsDB.length} alunos`;
  tbody.innerHTML = '';

  const sorted = [...studentsDB].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

  sorted.forEach((s) => {
    const originalIndex = studentsDB.indexOf(s);
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-800/50 transition-colors border-b border-slate-700/50";
    tr.innerHTML = `
      <td class="px-6 py-4 font-medium">${s.nome || '-'}</td>
      <td class="px-6 py-4 text-slate-400">${s.email}</td>
      <td class="px-6 py-4">${s.cpf || '-'}</td>
      <td class="px-6 py-4 font-mono text-xs text-brand-blue">${s.inscricao}</td>
      <td class="px-6 py-4 text-right">
        <button onclick="editStudent(${originalIndex})" class="text-brand-accent hover:text-white mr-3"><i class="fas fa-pen"></i></button>
        <button onclick="deleteStudent(${originalIndex})" class="text-brand-danger hover:text-white"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editStudent = function (index) {
  const s = studentsDB[index];
  if (!s) return;
  editingStudentIndex = index;

  qs('#new-name').value = s.nome;
  qs('#new-email').value = s.email;
  qs('#new-cpf').value = s.cpf;
  qs('#new-key').value = s.inscricao;

  const btn = qs('#btn-add');
  btn.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Edição';
  btn.classList.add('bg-brand-accent', 'hover:bg-yellow-600');
  btn.classList.remove('bg-brand-blue', 'hover:bg-blue-600');
}

window.deleteStudent = function (index) {
  if (confirm("Remover este aluno?")) {
    studentsDB.splice(index, 1);
    renderStudentTable();
  }
}

// Add/Save Student Logic
qs('#btn-add').addEventListener('click', () => {
  const nome = qs('#new-name').value.trim();
  const email = qs('#new-email').value.trim().toLowerCase();
  const cpf = qs('#new-cpf').value.trim();
  const inscricao = qs('#new-key').value.trim();

  // Validation
  if (!isValidEmail(email)) return alert("Email inválido");
  if (cpf && !isValidCPF(cpf)) return alert("CPF inválido");
  if (!inscricao) return alert("Senha obrigatória");

  if (editingStudentIndex !== null) {
    studentsDB[editingStudentIndex] = { nome, email, cpf, inscricao };
    editingStudentIndex = null;
    qs('#btn-add').innerHTML = '<i class="fas fa-plus mr-1"></i> Salvar';
    qs('#btn-add').classList.remove('bg-brand-accent', 'hover:bg-yellow-600');
    qs('#btn-add').classList.add('bg-brand-blue', 'hover:bg-blue-600');
    notify("Aluno editado!", "ok");
  } else {
    // Check Duplicate
    if (studentsDB.find(s => s.email === email)) {
      if (!confirm("Email já existe. Substituir?")) return;
      const idx = studentsDB.findIndex(s => s.email === email);
      studentsDB[idx] = { nome, email, cpf, inscricao };
    } else {
      studentsDB.push({ nome, email, cpf, inscricao });
    }
    notify("Aluno adicionado!", "ok");
  }

  // Clear
  qs('#new-name').value = ''; qs('#new-email').value = ''; qs('#new-cpf').value = ''; qs('#new-key').value = '';
  renderStudentTable();
});

// Import Sheet Logic
qs('#trigger-sheet').onclick = () => qs('#file-sheet').click();
qs('#file-sheet').onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

    // Simple mapping logic (enhancement from previous version)
    let added = 0;
    json.forEach(row => {
      // Try to find keys
      const kName = Object.keys(row).find(k => k.toLowerCase().includes('nome'));
      const kMail = Object.keys(row).find(k => k.toLowerCase().includes('mail'));
      const kPass = Object.keys(row).find(k => k.toLowerCase().includes('senha') || k.toLowerCase().includes('inscr'));
      const kCpf = Object.keys(row).find(k => k.toLowerCase().includes('cpf'));

      if (kMail && kPass) {
        const s = {
          nome: kName ? row[kName] : '',
          email: row[kMail].toLowerCase().trim(),
          inscricao: String(row[kPass]).trim(),
          cpf: kCpf ? String(row[kCpf]).trim() : ''
        };
        studentsDB.push(s);
        added++;
      }
    });
    renderStudentTable();
    notify(`${added} alunos importados.`, "ok");
  } catch (err) {
    alert("Erro ao importar: " + err.message);
  }
  e.target.value = '';
};

// Export Sheet
qs('#btn-export-sheet').onclick = () => {
  if (!studentsDB.length) return alert("Lista vazia");
  const ws = XLSX.utils.json_to_sheet(studentsDB);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Alunos");
  XLSX.writeFile(wb, "alunos_export.xlsx");
};


// ===== 4. PSICODATA (TESTES) =====

// Utils Psico
function normalizeString(str) { return str ? str.trim().toUpperCase() : ""; }
function resolveTestName(rawName) { const n = normalizeString(rawName); return currentAliases[n] || n; }
function getTestType(testName) {
  const n = normalizeString(testName);
  if (currentTestTypes[n]) return currentTestTypes[n];
  for (const [key, value] of Object.entries(currentTestTypes)) {
    if (n.includes(key) && key.length > 3) return value;
  }
  return "Outros";
}

// UI Psico
function selectBanca(banca) {
  if (!banca) return;
  currentBanca = banca;

  // Update Dropdown UI
  const select = qs('#banca-select');
  select.innerHTML = '';
  Object.keys(appData).sort().forEach(b => {
    const option = document.createElement('option');
    option.value = b;
    option.textContent = `${b} (${appData[b].length})`;
    if (b === currentBanca) option.selected = true;
    select.appendChild(option);
  });

  renderPsicoContent();
}

function renderPsicoContent() {
  const container = qs('#cards-container');
  const subtitle = qs('#current-page-subtitle');

  // Filtros TODO: Implementar filtros reais se necessário. Por simplicidade, exibimos tudo.
  const data = appData[currentBanca] || [];
  data.sort((a, b) => b.ano - a.ano);

  subtitle.textContent = `${data.length} concursos registrados nesta banca.`;
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-lg">Nenhum concurso nesta banca. Adicione um novo.</div>`;
    return;
  }

  data.forEach(item => {
    const realIndex = appData[currentBanca].indexOf(item);

    const badges = item.testes.map(t => {
      const resolved = resolveTestName(t);
      const type = getTestType(resolved);
      const color = typeColors[type] || "bg-gray-500";
      return `<span class="inline-block text-[10px] px-2 py-0.5 rounded mr-1 mb-1 bg-slate-800 border border-slate-700 text-slate-300" title="${type}"><span class="w-1.5 h-1.5 rounded-full inline-block mr-1 ${color}"></span>${t}</span>`;
    }).join('');

    const card = document.createElement('div');
    card.className = "bg-brand-panel border border-slate-700 rounded-xl p-4 shadow-lg hover:border-slate-600 transition-all group relative animate-fade-in";
    card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="text-brand-accent text-xs font-bold border border-brand-accent/30 px-1 rounded">${item.ano}</span>
                    <h3 class="font-bold text-white leading-tight mt-1">${item.concurso}</h3>
                </div>
                <div class="flex gap-2">
                    <button onclick="openModal('edit', ${realIndex})" class="text-slate-500 hover:text-brand-blue"><i class="fas fa-pen"></i></button>
                    <button onclick="deleteContest(${realIndex})" class="text-slate-500 hover:text-brand-danger"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="flex flex-wrap mt-2">${badges}</div>
        `;
    container.appendChild(card);
  });

  renderStats(data);
}

function renderStats(data) {
  const container = qs('#stats-container');
  const filter = qs('#filter-stats-type').value;
  container.innerHTML = '';

  const counts = {};
  data.forEach(item => item.testes.forEach(t => {
    const r = resolveTestName(t);
    counts[r] = (counts[r] || 0) + 1;
  }));

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([name, count]) => {
    const type = getTestType(name);
    if (filter !== 'all' && type !== filter) return;

    const color = typeColors[type] || "bg-gray-500";
    const div = document.createElement('div');
    div.className = "flex justify-between items-center text-xs p-1 hover:bg-slate-800/50 rounded cursor-default group";
    div.innerHTML = `
            <div class="flex items-center gap-2 overflow-hidden">
                <span class="w-2 h-2 rounded-full flex-shrink-0 ${color}"></span>
                <span class="text-slate-300 truncate">${name}</span>
            </div>
            <span class="font-bold text-brand-accent">${count}</span>
         `;
    container.appendChild(div);
  });
}


// MANAGER VIEW (CATALOG) - Simplificado
window.selectManagerView = function () {
  hide(qs('#view-banca'));
  show(qs('#view-manager'));
  renderManagerTable();
}
window.closeManagerView = function () {
  hide(qs('#view-manager'));
  show(qs('#view-banca'));
}
window.renderManagerTable = function () {
  const tbody = qs('#manager-table-body');
  const search = qs('#manager-search').value.toLowerCase();
  tbody.innerHTML = '';

  const allTests = new Set();
  Object.values(appData).forEach(arr => arr.forEach(i => i.testes.forEach(t => allTests.add(t))));

  Array.from(allTests).sort().forEach(raw => {
    if (search && !raw.toLowerCase().includes(search)) return;
    const norm = normalizeString(raw);
    const res = resolveTestName(raw);
    const type = getTestType(res);
    const isAlias = res !== norm;

    const tr = document.createElement('tr');
    tr.className = "bg-slate-800 border-b border-slate-700 hover:bg-slate-700";
    tr.innerHTML = `
            <td class="px-6 py-2 text-white font-mono text-xs">${raw}</td>
            <td class="px-6 py-2">
                <input class="bg-black/20 border border-slate-600 rounded px-2 py-1 w-full text-brand-accent text-xs" 
                    value="${isAlias ? res : ''}" 
                    placeholder="${norm}"
                    onchange="updateAlias('${raw}', this.value)">
            </td>
            <td class="px-6 py-2">
                 <select onchange="updateType('${res}', this.value)" class="bg-black/20 text-white text-xs border border-slate-600 rounded px-2 py-1 w-full">
                    ${Object.keys(typeColors).map(t => `<option value="${t}" ${t === type ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
            </td>
        `;
    tbody.appendChild(tr);
  });
}
window.updateAlias = function (raw, val) {
  const k = normalizeString(raw);
  const v = normalizeString(val);
  if (v === "" || v === k) delete currentAliases[k];
  else currentAliases[k] = v;
  savePsicoLocal();
}
window.updateType = function (name, type) {
  const k = normalizeString(name);
  currentTestTypes[k] = type;
  savePsicoLocal();
}

// ===== MODAL (CONCURSO) =====
let modalIndex = -1;
window.openModal = function (mode, index = -1) {
  modalIndex = index;
  const modal = qs('#modal');
  modal.classList.remove('hidden'); modal.classList.add('flex');

  if (mode === 'edit') {
    const item = appData[currentBanca][index];
    qs('#modal-title').textContent = "Editar Concurso";
    qs('#modal-ano').value = item.ano;
    qs('#modal-concurso').value = item.concurso;
    qs('#modal-testes').value = item.testes.join('\n');
  } else {
    qs('#modal-title').textContent = "Novo Concurso";
    qs('#modal-ano').value = new Date().getFullYear();
    qs('#modal-concurso').value = "";
    qs('#modal-testes').value = "";
  }
}
window.closeModal = function () {
  qs('#modal').classList.add('hidden'); qs('#modal').classList.remove('flex');
}
window.saveTest = function () {
  const ano = parseInt(qs('#modal-ano').value);
  const conc = qs('#modal-concurso').value.trim();
  const testes = qs('#modal-testes').value.split(/[\n,]/).map(t => t.trim()).filter(t => t.length);

  if (!ano || !conc || !testes.length) return alert("Preencha tudo");

  // Check if new banca needed
  // Simple logic: extract banca from string (e.g. "PM-PE") or keep current
  // We will stick to current banca context or create new if we implement a banca creator.
  // For now, assuming adding TO the current banca.

  if (modalIndex > -1) {
    appData[currentBanca][modalIndex] = { ano, concurso: conc, testes };
  } else {
    if (!appData[currentBanca]) appData[currentBanca] = [];
    appData[currentBanca].push({ ano, concurso: conc, testes });
  }

  savePsicoLocal();
  closeModal();
  selectBanca(currentBanca);
}
window.deleteContest = function (i) {
  if (confirm("Excluir?")) {
    appData[currentBanca].splice(i, 1);
    savePsicoLocal();
    selectBanca(currentBanca);
  }
}


// ===== DATA PERSISTENCE =====
function loadData() {
  // 1. Load PsicoData (Local Storage for now)
  const storedDB = localStorage.getItem('psicoDataDB');
  const storedTypes = localStorage.getItem('psicoDataTestTypes');
  const storedAliases = localStorage.getItem('psicoDataAliases');

  if (storedDB) appData = JSON.parse(storedDB);
  else appData = { "AOCP": [], "CEBRASPE": [], "FGV": [], "IBFC": [], "VUNESP": [] }; // Default se vazio

  if (storedTypes) currentTestTypes = JSON.parse(storedTypes);
  else currentTestTypes = { ...defaultTestTypes }; // Merged defaults

  if (storedAliases) currentAliases = JSON.parse(storedAliases);
  else currentAliases = { ...defaultAliases };

  // 2. Load Students (Already handled locally or cloud)
  // Se tivermos studentsDB vazio, tentamos carregar do storage só pra não ficar zero?
  // Não, studentsDB deve vir do CLOUD LOAD button principalmente.
}

function savePsicoLocal() {
  localStorage.setItem('psicoDataDB', JSON.stringify(appData));
  localStorage.setItem('psicoDataTestTypes', JSON.stringify(currentTestTypes));
  localStorage.setItem('psicoDataAliases', JSON.stringify(currentAliases));
  notify("PsicoData salvo localmente!", "brand-blue");
}

// ===== VALIDATORS COPY =====
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0, remainder;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}