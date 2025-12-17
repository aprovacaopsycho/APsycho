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
let turmasDB = [];
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
    hide(qs('#section-turmas'));
    show(qs('#section-students'));

    qs('#nav-students').classList.add('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-students').classList.remove('text-slate-400', 'hover:bg-slate-800');

    qs('#nav-psicodata').classList.remove('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-psicodata').classList.add('text-slate-400', 'hover:bg-slate-800');

    qs('#nav-turmas').classList.remove('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-turmas').classList.add('text-slate-400', 'hover:bg-slate-800');

  } else if (section === 'turmas') {
    hide(qs('#section-students'));
    hide(qs('#section-psicodata'));
    show(qs('#section-turmas'));

    qs('#nav-turmas').classList.add('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-turmas').classList.remove('text-slate-400', 'hover:bg-slate-800');

    qs('#nav-students').classList.remove('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-students').classList.add('text-slate-400', 'hover:bg-slate-800');

    qs('#nav-psicodata').classList.remove('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-psicodata').classList.add('text-slate-400', 'hover:bg-slate-800');

    renderTurmasMgmt();

  } else {
    hide(qs('#section-students'));
    hide(qs('#section-turmas'));
    show(qs('#section-psicodata'));

    qs('#nav-psicodata').classList.add('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-psicodata').classList.remove('text-slate-400', 'hover:bg-slate-800');

    qs('#nav-students').classList.remove('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-students').classList.add('text-slate-400', 'hover:bg-slate-800');

    qs('#nav-turmas').classList.remove('bg-brand-blue', 'text-white', 'shadow-lg');
    qs('#nav-turmas').classList.add('text-slate-400', 'hover:bg-slate-800');

    if (!currentBanca) {
      const keys = Object.keys(appData).sort();
      if (keys.length > 0) selectBanca(keys[0]);
    }
  }
}
window.switchSection = switchSection; // Expor globalmente

// ===== 1. LOGIN =====

async function loadData() {
  try {
    // 1. Alunos
    const resStudents = await fetch(CONFIG.PRIVATE_DB_URL, { cache: 'no-store' });
    if (resStudents.ok) {
      studentsDB = await resStudents.json();
      renderStudentTable();
    }

    // 2. PsicoData
    const resPsico = await fetch('private/psicodata_db.json', { cache: 'no-store' });
    if (resPsico.ok) {
      appData = await resPsico.json();
    }

    // 3. Configs
    const resConfig = await fetch('private/psicodata_config.json', { cache: 'no-store' });
    if (resConfig.ok) {
      const config = await resConfig.json();
      if (config.types) currentTestTypes = config.types;
      if (config.aliases) currentAliases = config.aliases;
    }

    // Init UI Psico
    if (Object.keys(appData).length > 0) {
      if (!currentBanca) selectBanca(Object.keys(appData).sort()[0]);
    }

  } catch (e) {
    console.warn("LoadData: Algum arquivo não encontrado (novo deploy?)", e);
  }
}

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
      loadTurmasData(); // Load Turmas
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

    // 2. PsicoData (Load from Server)
    try {
      const resPsico = await fetch('private/psicodata_db.json', { cache: 'no-store' });
      if (resPsico.ok) {
        appData = await resPsico.json();
        notify(`PsicoData baixado!`, "ok");
      } else {
        console.log("PsicoData DB não encontrado no servidor ou erro (404). Mantendo local.");
      }

      const resConfig = await fetch('private/psicodata_config.json', { cache: 'no-store' });
      if (resConfig.ok) {
        const config = await resConfig.json();
        if (config.types) currentTestTypes = config.types;
        if (config.aliases) currentAliases = config.aliases;
        console.log("Configs PsicoData carregadas.");
      }

      // Refresh UI
      if (Object.keys(appData).length > 0) {
        if (!currentBanca) currentBanca = Object.keys(appData).sort()[0];
        selectBanca(currentBanca);
      }

    } catch (e) {
      console.warn("Erro ao tentar carregar PsicoData da nuvem:", e);
    }


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
    const publicHashes = {}; // Changed from Array to Object
    // const now = new Date(); // Client-side check now

    for (const s of studentsDB) {
      const hash = await sha256Hex(s.email + s.inscricao);
      // Store object with validity & permissions
      publicHashes[hash] = {
        validity: s.validade || null,
        permissions: s.permissions || [],
        name: s.nome || 'Aluno'
      };
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
        { path: 'admin/private/psicodata_config.json', content: JSON.stringify({ types: currentTestTypes, aliases: currentAliases }, null, 2) },
        // 5. Banco de Turmas
        { path: 'admin/private/turmas_db.json', content: JSON.stringify(turmasDB, null, 2) }
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

// ===== 2.2 DOWNLOAD HASHES (FOR LOCAL TESTING) =====
qs('#btn-download-hashes').addEventListener('click', async () => {
  const publicHashes = {};
  for (const s of studentsDB) {
    const hash = await sha256Hex(s.email + s.inscricao);
    publicHashes[hash] = s.validade || null;
  }
  const blob = new Blob([JSON.stringify(publicHashes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hashes_membros.json';
  a.click();
  notify("Hashes baixados! Substitua o arquivo na raiz.", "ok");
});

// ===== 2.1 BACKUP LOCAL (JSON UNIFICADO) =====
qs('#btn-backup-local').onclick = () => {
  const backup = {
    timestamp: new Date().toISOString(),
    studentsDB,
    appData,
    currentTestTypes,
    currentAliases
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_completo_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  notify("Backup completo salvo!", "ok");
};

qs('#btn-restore-local').onclick = () => qs('#file-backup-local').click();

qs('#file-backup-local').onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const text = await f.text();
    const json = JSON.parse(text);

    // Verifica formato novo (unificado) ou antigo (só lista)
    if (Array.isArray(json)) {
      // Formato Antigo (Só alunos)
      studentsDB = json;
      notify(`Backup legado: ${json.length} alunos restaurados.`, "ok");
    } else if (json.studentsDB || json.appData) {
      // Formato Novo
      if (json.studentsDB) studentsDB = json.studentsDB;
      if (json.appData) appData = json.appData;
      if (json.currentTestTypes) currentTestTypes = json.currentTestTypes;
      if (json.currentAliases) currentAliases = json.currentAliases;

      notify("Backup Completo restaurado com sucesso!", "ok");
    } else {
      throw new Error("Formato desconhecido.");
    }

    renderStudentTable();
    // Refresh Psico View if active
    if (currentBanca && appData[currentBanca]) selectBanca(currentBanca);
    else if (Object.keys(appData).length) selectBanca(Object.keys(appData)[0]);

  } catch (err) {
    alert("Erro ao ler backup: " + err.message);
  }
  e.target.value = '';
};


// ===== 3. GESTÃO DE ALUNOS =====

let selectedStudents = new Set();
// New Helper: Render Permissions Checkboxes
function renderPermissionOptions() {
  const container = qs('#permissions-container');
  container.innerHTML = '';

  // 1. Padrão PMPR
  const lblPMPR = document.createElement('label');
  lblPMPR.className = "flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer";
  lblPMPR.innerHTML = `<input type="checkbox" value="PMPR" class="perm-check w-4 h-4 rounded border-slate-600 bg-slate-700 text-brand-blue focus:ring-brand-blue"> PMPR (Padrão)`;
  container.appendChild(lblPMPR);

  // 2. Turmas Dinâmicas
  turmasDB.forEach(t => {
    const lbl = document.createElement('label');
    lbl.className = "flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer";
    lbl.innerHTML = `<input type="checkbox" value="${t.pasta}" class="perm-check w-4 h-4 rounded border-slate-600 bg-slate-700 text-brand-blue focus:ring-brand-blue"> ${t.nome}`;
    container.appendChild(lbl);
  });
}

function getSelectedPermissions() {
  const checks = document.querySelectorAll('.perm-check:checked');
  return Array.from(checks).map(c => c.value);
}

function setPermissionsUI(perms) {
  const checks = document.querySelectorAll('.perm-check');
  checks.forEach(c => {
    c.checked = perms.includes(c.value);
  });
}

function renderStudentTable() {
  const tbody = qs('#studentTable tbody');
  qs('#label-count-students').textContent = `${studentsDB.length} alunos`;
  tbody.innerHTML = '';

  // Ensure options are up to date with turmas
  renderPermissionOptions();

  const sorted = [...studentsDB].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

  sorted.forEach((s) => {
    const originalIndex = studentsDB.indexOf(s);
    const isSelected = selectedStudents.has(originalIndex);

    // Validity Logic
    let validityHtml = '<span class="text-slate-500 text-xs">∞ Ilimitado</span>';
    if (s.validade) {
      const vDate = new Date(s.validade);
      const isExpired = vDate < new Date();
      const fmt = vDate.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

      if (isExpired) {
        validityHtml = `<span class="text-red-400 font-bold text-xs"><i class="fas fa-clock mr-1"></i> Exp: ${fmt}</span>`;
      } else {
        validityHtml = `<span class="text-green-400 font-bold text-xs"><i class="fas fa-check-circle mr-1"></i> Até: ${fmt}</span>`;
      }
    }

    // Permission Bagde (Count)
    const accessCount = Array.isArray(s.permissions) ? s.permissions.length : (s.permissions ? 1 : 'All');
    const permBadge = `<span class="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 ml-2" title="${s.permissions}">📶 ${accessCount}</span>`;

    const tr = document.createElement('tr');
    tr.className = `border-b border-slate-700/50 transition-colors ${isSelected ? 'bg-brand-blue/10' : 'hover:bg-slate-800/50'}`;
    tr.innerHTML = `
            <td class="px-6 py-4">
                <input type="checkbox" onchange="toggleSelect(${originalIndex})" ${isSelected ? 'checked' : ''} class="w-4 h-4 rounded border-slate-600 bg-slate-700 text-brand-blue focus:ring-brand-blue">
            </td>
            <td class="px-6 py-4 font-medium">${s.nome || '-'}</td>
            <td class="px-6 py-4">${s.email}</td>
            <td class="px-6 py-4 font-mono text-xs text-slate-400">
                ${(s.permissions || []).map(p => {
      if (p === 'PMPR') return '<span class="bg-blue-900 text-blue-300 px-1 rounded">PMPR</span>';
      const turma = turmasDB.find(t => t.pasta === p);
      const label = turma ? turma.nome : p;
      return `<span class="bg-slate-700 px-1 rounded" title="${p}">${label}</span>`;
    }).join(' ')}
            </td>
            <td class="px-6 py-4">${s.cpf || '-'}</td>
            <td class="px-6 py-4 font-mono text-xs text-brand-blue">${s.inscricao}</td>
            <td class="px-6 py-4">${validityHtml}</td>
            <td class="px-6 py-4 text-right whitespace-nowrap">
                <button onclick="editStudent(${originalIndex})" class="text-xs bg-brand-accent/10 hover:bg-brand-accent text-brand-accent hover:text-white px-3 py-1.5 rounded transition-all mr-2" title="Editar">
                    <i class="fas fa-pen mr-1"></i> Editar
                </button>
                <button onclick="deleteStudent(${originalIndex})" class="text-xs bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded transition-all" title="Excluir">
                    <i class="fas fa-trash mr-1"></i> Excluir
                </button>
            </td>
        `;
    tbody.appendChild(tr);
  });

  // Update Bulk Action UI
  updateBulkUI();
}

function updateBulkUI() {
  const count = selectedStudents.size;
  const btn = qs('#btn-delete-bulk');

  if (count > 0) {
    btn.classList.remove('hidden');
    btn.innerHTML = `<i class="fas fa-trash mr-2"></i> Excluir (${count})`;
  } else {
    btn.classList.add('hidden');
  }

  // Update Header Checkbox
  const allSelected = studentsDB.length > 0 && selectedStudents.size === studentsDB.length;
  qs('#check-all-students').checked = allSelected;
}

// Make functions global
window.toggleSelect = function (index) {
  if (selectedStudents.has(index)) selectedStudents.delete(index);
  else selectedStudents.add(index);
  renderStudentTable();
}

window.toggleSelectAll = function () {
  if (selectedStudents.size === studentsDB.length) {
    selectedStudents.clear();
  } else {
    studentsDB.forEach((_, i) => selectedStudents.add(i));
  }
  renderStudentTable();
}

window.deleteBulk = function () {
  if (!confirm(`Excluir ${selectedStudents.size} alunos selecionados?`)) return;

  // Sort descending to remove correctly
  const indices = Array.from(selectedStudents).sort((a, b) => b - a);
  indices.forEach(i => studentsDB.splice(i, 1));

  selectedStudents.clear();
  renderStudentTable();
  notify("Alunos removidos.", "ok");
}

window.editStudent = function (index) {
  const s = studentsDB[index];
  if (!s) return;
  editingStudentIndex = index;

  qs('#new-name').value = s.nome;
  qs('#new-email').value = s.email;
  qs('#new-cpf').value = s.cpf;
  qs('#new-key').value = s.inscricao;
  qs('#new-validity').value = s.validade || '';

  // Set Permissions
  const perms = s.permissions || ['PMPR']; // Default legacy
  setPermissionsUI(perms);

  const btn = qs('#btn-add');
  btn.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Edição';
  btn.classList.add('bg-brand-accent', 'hover:bg-yellow-600');
  btn.classList.remove('bg-brand-blue', 'hover:bg-blue-600');

  qs('#new-name').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.deleteStudent = function (index) {
  if (confirm("Remover este aluno?")) {
    studentsDB.splice(index, 1);
    renderStudentTable();
    notify("Aluno removido.", "bad");
  }
}


// Fix CPF Formatting (Respect Selection)
window.fixCPFs = function () {
  let count = 0;
  const targetIndices = selectedStudents.size > 0 ? Array.from(selectedStudents) : studentsDB.map((_, i) => i);

  targetIndices.forEach(index => {
    const s = studentsDB[index];
    if (!s) return;

    let clean = String(s.cpf).replace(/\D/g, '');

    // Handle Excel leading zero drop (10 digits -> 0 + digits)
    if (clean.length === 10) clean = '0' + clean;

    if (clean.length === 11) {
      const formatted = clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      if (s.cpf !== formatted) {
        s.cpf = formatted;
        count++;
      }
    }
  });

  if (count > 0) {
    renderStudentTable();
    const scope = selectedStudents.size > 0 ? "selecionados" : "da lista";
    notify(`Sucesso: ${count} CPFs ${scope} formatados!`, "ok");
  } else {
    notify("Nenhum CPF precisou de correção.", "brand-blue");
  }
}


// Auto-Generate Password
function generatePassword() {
  const nome = qs('#new-name').value.trim();
  const cpfRaw = qs('#new-cpf').value.replace(/\D/g, '');

  if (!nome || cpfRaw.length < 4) return;

  // Initials: First letter of each word
  const initials = nome.split(/\s+/).map(w => w[0].toUpperCase()).join('');
  // CPF: First 4 digits
  const cpf4 = cpfRaw.substring(0, 4);

  // Set Password
  qs('#new-key').value = `${initials}${cpf4}`;
}

// Validation Helpers
function showInputError(id, msg) {
  const el = qs(id);
  const parent = el.parentElement;

  // Remove old error
  const old = parent.querySelector('.text-red-500');
  if (old) old.remove();

  el.classList.add('border-red-500');
  const err = document.createElement('span');
  err.className = "text-red-500 text-[10px] absolute right-0 top-0 font-bold";
  err.textContent = msg;
  parent.appendChild(err);

  setTimeout(() => {
    el.classList.remove('border-red-500');
    err.remove();
  }, 3000);
}

// Input Listeners for Auto-Gen
qs('#new-name').addEventListener('input', generatePassword);
qs('#new-cpf').addEventListener('input', generatePassword);


// Add/Save Student Logic
qs('#btn-add').addEventListener('click', () => {
  const nome = qs('#new-name').value.trim();
  const email = qs('#new-email').value.trim().toLowerCase();
  const cpf = qs('#new-cpf').value.trim();
  const inscricao = qs('#new-key').value.trim();
  const validade = qs('#new-validity').value;
  const permissions = getSelectedPermissions(); // CAPTURE PERMISSIONS

  let hasError = false;
  if (!nome) { showInputError('#new-name', 'Obrigatório'); hasError = true; }
  if (!isValidEmail(email)) { showInputError('#new-email', 'Inválido'); hasError = true; }
  if (!cpf || !isValidCPF(cpf)) { showInputError('#new-cpf', 'CPF Inválido'); hasError = true; }
  if (!inscricao) { showInputError('#new-key', 'Obrigatório'); hasError = true; }

  if (hasError) return notify("Corrija os erros.", "bad");

  if (editingStudentIndex !== null) {
    studentsDB[editingStudentIndex] = { nome, email, cpf, inscricao, validade, permissions }; // SAVE PERMISSIONS
    editingStudentIndex = null;
    qs('#btn-add').innerHTML = '<i class="fas fa-plus mr-1"></i> Salvar';
    qs('#btn-add').classList.remove('bg-brand-accent');
    qs('#btn-add').classList.add('bg-brand-blue');
    notify("Editado!", "ok");
  } else {
    const dup = studentsDB.find(s => s.email === email || s.cpf === cpf);
    if (dup) {
      if (!confirm(`Dados duplicados (${dup.nome}). Substituir?`)) return;
      const idx = studentsDB.indexOf(dup);
      studentsDB[idx] = { nome, email, cpf, inscricao, validade, permissions }; // SAVE PERMISSIONS
    } else {
      studentsDB.push({ nome, email, cpf, inscricao, validade, permissions }); // SAVE PERMISSIONS
    }
    notify("Adicionado!", "ok");
  }

  qs('#new-name').value = ''; qs('#new-email').value = ''; qs('#new-cpf').value = ''; qs('#new-key').value = ''; qs('#new-validity').value = '';
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
  const bancas = Object.keys(appData).sort();

  bancas.forEach(b => {
    const option = document.createElement('option');
    option.value = b;
    option.textContent = `${b} (${appData[b].length})`;
    if (b === currentBanca) option.selected = true;
    select.appendChild(option);
  });

  // Populate Filters
  updatePsicoFilters();
  renderPsicoContent();
}

function updatePsicoFilters() {
  const data = appData[currentBanca] || [];

  // Years
  const years = [...new Set(data.map(i => i.ano))].sort((a, b) => b - a);
  const yrSelect = qs('#filter-year');
  yrSelect.innerHTML = '<option value="all">Todos os Anos</option>';
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    yrSelect.appendChild(opt);
  });

  // Concursos (Names)
  const names = [...new Set(data.map(i => i.concurso))].sort();
  const concSelect = qs('#filter-concurso');
  concSelect.innerHTML = '<option value="all">Todos os Concursos</option>';
  names.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n; opt.textContent = n;
    concSelect.appendChild(opt);
  });
}
window.applyFilters = function () { renderPsicoContent(); }
window.applyStatsFilter = function () { renderPsicoContent(); } // Re-render triggers stats update too

function renderPsicoContent() {
  const container = qs('#cards-container');
  const subtitle = qs('#current-page-subtitle');

  let data = appData[currentBanca] || [];

  // Apply Filters
  const fYear = qs('#filter-year').value;
  const fConc = qs('#filter-concurso').value;
  const fType = qs('#filter-type').value;

  if (fYear !== 'all') data = data.filter(i => i.ano == fYear);
  if (fConc !== 'all') data = data.filter(i => i.concurso === fConc);
  if (fType !== 'all') {
    data = data.filter(i => {
      // Check if ANY test in the contest matches the selected type
      return i.testes.some(t => {
        const type = getTestType(resolveTestName(t));
        return type === fType;
      });
    });
  }

  // Sort
  data.sort((a, b) => b.ano - a.ano);

  subtitle.textContent = `${data.length} concursos exibidos.`;
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = `<div class="p-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-lg">Nenhum concurso correspondente.</div>`;
    renderStats([]); // Clear stats
    return;
  }

  // Render Cards
  data.forEach(item => {
    // Find original index for editing
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
                    <h3 class="font-bold text-white leading-tight mt-1 text-sm md:text-base">${item.concurso}</h3>
                </div>
                <div class="flex gap-2">
                    <button onclick="openModal('edit', ${realIndex})" class="bg-slate-700 hover:bg-brand-blue text-white px-2 py-1 rounded text-xs transition-colors flex items-center gap-1" title="Editar">
                        <i class="fas fa-pen"></i> <span class="hidden md:inline">Editar</span>
                    </button>
                    <button onclick="deleteContest(${realIndex})" class="bg-slate-700 hover:bg-red-500 text-white px-2 py-1 rounded text-xs transition-colors" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
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
  const summaryContainer = qs('#stats-summary');
  const filter = qs('#filter-stats-type').value;

  container.innerHTML = '';
  summaryContainer.innerHTML = '';

  // 1. Calculate General Stats (Type Counts)
  const typeCounts = { "Personalidade": 0, "Atenção": 0, "Memória": 0, "Raciocínio": 0, "Outros": 0 };

  // 2. Calculate Specific Test Counts
  const testCounts = {};


  data.forEach(item => item.testes.forEach(t => {
    const r = resolveTestName(t);
    const type = getTestType(r);

    // Increment Type Count
    if (typeCounts[type] !== undefined) typeCounts[type]++;
    else typeCounts["Outros"] = (typeCounts["Outros"] || 0) + 1;

    // Increment Test Count
    testCounts[r] = (testCounts[r] || 0) + 1;
  }));

  // Render Summary
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count === 0) return;
    const color = typeColors[type] || "bg-gray-500";
    const div = document.createElement('div');
    div.className = "flex items-center gap-2 text-[10px] text-slate-300 bg-slate-800/50 rounded px-2 py-1";
    div.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${color}"></span> ${type}: <b>${count}</b>`;
    summaryContainer.appendChild(div);
  });


  // Render Detailed Stats
  const sorted = Object.entries(testCounts).sort((a, b) => b[1] - a[1]);

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
let modalTests = [];

window.openModal = function (mode, index = -1) {
  modalIndex = index;
  const modal = qs('#modal');
  modal.classList.remove('hidden'); modal.classList.add('flex');

  if (mode === 'edit') {
    const item = appData[currentBanca][index];
    qs('#modal-title').textContent = "Editar Concurso";
    qs('#modal-ano').value = item.ano;
    qs('#modal-concurso').value = item.concurso;
    modalTests = [...item.testes]; // Copy
  } else {
    qs('#modal-title').textContent = "Novo Concurso";
    qs('#modal-ano').value = new Date().getFullYear();
    qs('#modal-concurso').value = "";
    modalTests = [];
  }
  renderModalTests();
}

window.renderModalTests = function () {
  const container = qs('#modal-tests-list');
  container.innerHTML = '';

  if (modalTests.length === 0) {
    container.innerHTML = '<span class="text-xs text-slate-500 italic">Nenhum teste adicionado.</span>';
    return;
  }

  modalTests.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = "flex justify-between items-center bg-slate-700/50 rounded px-3 py-2 group hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-600";
    div.innerHTML = `
      <div class="flex-1">
        <input value="${t}" 
          class="bg-transparent text-sm text-slate-200 outline-none w-full cursor-pointer hover:text-white"
          onchange="updateModalTest(${i}, this.value)"
          title="Clique para editar nome">
      </div>
      <button onclick="removeTestFromModal(${i})" class="text-slate-500 hover:text-red-400 px-2">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

window.addTestToModal = function () {
  const input = qs('#modal-new-test-input');
  const val = input.value.trim();
  if (!val) return;
  modalTests.push(val);
  renderModalTests();
  input.value = '';
  input.focus();
}

window.removeTestFromModal = function (i) {
  modalTests.splice(i, 1);
  renderModalTests();
}

window.updateModalTest = function (i, val) {
  if (!val.trim()) return removeTestFromModal(i);
  modalTests[i] = val.trim();
}
window.closeModal = function () {
  qs('#modal').classList.add('hidden'); qs('#modal').classList.remove('flex');
}
window.saveTest = function () {
  const ano = parseInt(qs('#modal-ano').value);
  const conc = qs('#modal-concurso').value.trim();
  const testes = modalTests.filter(t => t.length > 0);
  // No longer parsing textarea

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
  if (confirm("Deletar concurso?")) {
    appData[currentBanca].splice(i, 1);
    savePsicoLocal();
    selectBanca(currentBanca);
  }
}

function savePsicoLocal() {
  // Just UI Refresh or Notify?
  // We rely on "Publicar na Nuvem" for persistence, or "Backup Local".
  // But we should probably implement a 'dirty' state or auto-save to browser storage (later).
  notify("Alterações locais salvas (Memória). Lembre-se de publicar!", "brand-blue");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf === '') return false;

  // Elimina CPFs invalidos conhecidos (todos dígitos iguais)
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  // Validação Matemática
  return validarDigitos(cpf);
}

// Lógica do Módulo 11 (Cálculo dos dígitos verificadores)
function validarDigitos(cpf) {
  let soma = 0;
  let resto;

  // Valida 1º Dígito
  for (let i = 1; i <= 9; i++)
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);

  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // Valida 2º Dígito
  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);

  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// ===== 5. GESTÃO DE TURMAS =====

async function loadTurmasData() {
  try {
    const res = await fetch('private/turmas_db.json', { cache: 'no-store' });
    if (res.ok) {
      turmasDB = await res.json();
      console.log("Turmas carregadas:", turmasDB.length);
      renderStudentTable(); // Re-render to show options/columns
    }
  } catch (e) {
    console.warn("Sem turmas ou erro:", e);
  }
}

// Global state for editing
let editingTurmaIndex = null;

// RENAMED TO AVOID CONFLICTS
window.renderTurmasMgmt = function () {
  const container = qs('#turmas-list');
  if (!container) return;
  qs('#label-count-turmas').textContent = `${turmasDB.length} turmas cadastradas`;
  container.innerHTML = '';

  if (turmasDB.length === 0) {
    container.innerHTML = `<div class="col-span-3 text-center text-slate-500 py-10 border border-dashed border-slate-700 rounded-lg">Nenhuma turma cadastrada.</div>`;
    return;
  }

  turmasDB.forEach((t, index) => {
    const div = document.createElement('div');
    div.className = "bg-brand-panel border border-slate-700 rounded-xl p-5 shadow-lg hover:border-brand-blue transition-all group relative animate-fade-in";
    div.innerHTML = `
      <div class="flex justify-between items-start mb-4">
        <div class="bg-brand-blue/20 p-3 rounded-lg text-brand-blue">
          <i class="fas fa-layer-group text-2xl"></i>
        </div>
        <div class="flex gap-2">
            <button onclick="editTurma(${index})" class="bg-gray-700 hover:bg-brand-accent text-white px-3 py-1 rounded text-xs transition-colors flex items-center gap-1" title="Editar">
                <i class="fas fa-pen"></i> <span>EDITAR</span>
            </button>
            <button onclick="deleteTurma(${index})" class="bg-gray-700 hover:bg-red-500 text-white px-3 py-1 rounded text-xs transition-colors flex items-center gap-1" title="Excluir">
                <i class="fas fa-trash"></i> <span>EXCLUIR</span>
            </button>
        </div>
      </div>
      <h3 class="text-lg font-bold text-white mb-1">${t.nome}</h3>
      <p class="text-xs text-slate-400 font-mono mb-4 bg-black/20 px-2 py-1 rounded inline-block">${t.pasta || 'Sem pasta'}</p>
      
      <div class="bg-slate-800/50 rounded p-2 text-[10px] text-slate-400">
        <div class="flex justify-between mb-1"><span>Base:</span> <span class="text-white">${t.base || 'Base'}</span></div>
        <div class="flex justify-between"><span>Criado:</span> <span class="text-slate-500">${t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Hoje'}</span></div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
         <span class="text-[10px] text-slate-500">Ações Locais</span>
         <a href="../${t.pasta}/pmpr.html" target="_blank" class="text-xs text-brand-blue hover:underline font-bold">Acessar Painel <i class="fas fa-external-link-alt ml-1"></i></a>
      </div>
    `;
    container.appendChild(div);
  });
}

window.addTurma = async function () {
  const nome = qs('#turma-nome').value.trim();
  const pasta = qs('#turma-pasta').value.trim();
  const base = qs('#turma-base').value;
  const imagem = qs('#turma-imagem').value.trim();

  if (!nome || !pasta) return alert("Preencha Nome e Pasta Corretamente.");
  if (pasta.includes(' ')) return alert("O nome da pasta não pode conter espaços.");

  // Check UI mode
  if (editingTurmaIndex !== null) {
    // EDIT MODE
    turmasDB[editingTurmaIndex] = {
      ...turmasDB[editingTurmaIndex], // keep created_at
      nome, pasta, base, imagem
    };

    // Reset UI
    editingTurmaIndex = null;
    const btn = qs('#btn-add-turma');
    btn.innerHTML = '<i class="fas fa-plus mr-1"></i> Criar Cards';
    btn.classList.remove('bg-brand-accent', 'hover:bg-yellow-600');
    btn.classList.add('bg-brand-blue', 'hover:bg-blue-600');
    hide(qs('#btn-delete-turma-form')); // Hide Delete Button

    notify("Turma editada! Lembre-se de Rodar Script ou Salvar.", "ok");
    renderTurmasMgmt();

    qs('#turma-nome').value = '';
    qs('#turma-pasta').value = '';
    qs('#turma-imagem').value = '';
    return;
  }

  // ADD MODE
  // Verifica Duplicidade
  if (turmasDB.find(t => t.pasta === pasta)) return alert("Já existe uma turma com essa pasta.");

  // 1. Atualiza Memória Local (UI Otimista)
  const novaTurma = { nome, pasta, base, imagem, created_at: new Date().toISOString() };
  turmasDB.push(novaTurma);
  renderTurmasMgmt(); // Mostra na tela imediatamente

  // 2. Tenta Automação com Python Local
  const btn = qs('#btn-add-turma');
  const originalText = btn.innerHTML;
  btn.textContent = "Sincronizando...";
  btn.disabled = true;

  try {
    // Tenta enviar para o script Python rodando localmente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout

    // USO 127.0.0.1 para evitar problemas de resolução de IPv6 do 'localhost'
    const res = await fetch('http://127.0.0.1:8080/sync-turmas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(turmasDB),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.created > 0) {
        notify(`Sucesso! Pasta "${pasta}" criada fisicamente.`, "ok");
      } else {
        notify("Turma salva, mas o sync não criou novas pastas (já existem?).", "brand-blue");
      }
    } else {
      throw new Error(`Erro HTTP: ${res.status}`);
    }

  } catch (err) {
    console.warn("Automação Falhou (Silencioso):", err);
    // Silent fail - user can run script manually later
    // alert(`AVISO: O Servidor de Automação não respondeu.\n\nErro: ${err.message}\n\nA turma foi salva APENAS no navegador. Para criar as pastas, garanta que o script 'admin/sync_turmas.py' esteja rodando no terminal.`);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
    qs('#turma-nome').value = '';
    qs('#turma-pasta').value = '';
    qs('#turma-imagem').value = '';
  }
}

window.editTurma = function (index) {
  const t = turmasDB[index];
  if (!t) return;

  editingTurmaIndex = index;
  qs('#turma-nome').value = t.nome;
  qs('#turma-pasta').value = t.pasta;
  qs('#turma-base').value = t.base || 'Base';
  qs('#turma-imagem').value = t.imagem || '';

  // Change Button State
  const btn = qs('#btn-add-turma');
  btn.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Edição';
  btn.classList.add('bg-brand-accent', 'hover:bg-yellow-600');
  btn.classList.remove('bg-brand-blue', 'hover:bg-blue-600');

  show(qs('#btn-delete-turma-form')); // Show Delete Button

  qs('#turma-nome').scrollIntoView({ behavior: 'smooth', block: 'center' });
  notify(`Editando "${t.nome}"...`, "brand-blue");
}

window.deleteTurma = function (index) {
  const turma = turmasDB[index];
  if (confirm(`Remover a turma "${turma.nome}" da LISTA?\n\nIsso NÃO apaga a pasta física do servidor, apenas remove do painel de controle.\n\nPara apagar a pasta física, salve o DB e rode o script Python.`)) {
    turmasDB.splice(index, 1);

    // If we were editing this exact item, reset the form
    if (editingTurmaIndex === index) {
      editingTurmaIndex = null;
      const btn = qs('#btn-add-turma');
      btn.innerHTML = '<i class="fas fa-plus mr-1"></i> Criar Cards';
      btn.classList.remove('bg-brand-accent', 'hover:bg-yellow-600');
      btn.classList.add('bg-brand-blue', 'hover:bg-blue-600');
      hide(qs('#btn-delete-turma-form'));
      qs('#turma-nome').value = '';
      qs('#turma-pasta').value = '';
      qs('#turma-imagem').value = '';
    }

    renderTurmasMgmt();
    notify("Turma removida da lista.");
  }
}

window.deleteTurmaForm = function () {
  if (editingTurmaIndex !== null) {
    deleteTurma(editingTurmaIndex);
  }
}

// 1. Salvar DB Local (Inteligente)
window.saveTurmasLocal = async function () {
  const dataStr = JSON.stringify(turmasDB, null, 2);

  // Feature Detection: File System Access API
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: 'turmas_db.json',
        types: [{
          description: 'JSON Database',
          accept: { 'application/json': ['.json'] },
        }],
      });

      const writable = await handle.createWritable();
      await writable.write(dataStr);
      await writable.close();
      notify("Arquivo salvo com sucesso!", "ok");
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err);
        alert("Erro ao salvar arquivo: " + err.message);
      }
      // If aborted or error, do nothing (or fallback?)
      return;
    }
  }

  // Fallback: Legacy Download
  exportTurmas();
}

window.exportTurmas = function () {
  const dataStr = JSON.stringify(turmasDB, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "turmas_db.json";
  a.click();
  notify("Banco de Turmas baixado (Legacy)!", "ok");
}

window.importTurmas = function () {
  qs('#file-turmas').click();
}

qs('#file-turmas').onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const text = await f.text();
    turmasDB = JSON.parse(text);
    renderTurmasMgmt();
    notify("Turmas importadas!", "ok");
  } catch (err) {
    alert("Erro JSON: " + err.message);
  }
}

window.downloadSyncScript = function () {
  alert("Para ativar a automação:\n\n1. Abra o terminal na pasta do projeto.\n2. Execute: python admin/sync_turmas.py\n\nIsso iniciará o SEVIDOR LOCAL (Porta 5000).\nMantenha o terminal aberto enquanto adiciona turmas.");
}