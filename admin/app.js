function show(id){ document.getElementById(id).classList.remove('hidden'); }
function hide(id){ document.getElementById(id).classList.add('hidden'); }

async function sha256Hex(message){
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

const ADMIN_HASH_LIST_URL = '/admin/_private/hashes_administradores.json';

async function fetchAdminHashes(){
  try{
    const res = await fetch(ADMIN_HASH_LIST_URL, { cache: 'no-store' });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    if(Array.isArray(data)) return data;
    if(Array.isArray(data.validAdmins)) return data.validAdmins.map(v => v.hash);
    if(Array.isArray(data.validHashes)) return data.validHashes;
    return [];
  }catch(e){
    console.error('Falha ao carregar lista de admins:', e);
    return [];
  }
}

async function doLogin(){
  const email = document.getElementById('email').value.trim().toLowerCase();
  const pass  = document.getElementById('password').value;
  const msgEl = document.getElementById('gateMsg');
  msgEl.textContent = '';
  if(!email || !pass){ msgEl.textContent = 'Informe e-mail e senha.'; return; }
  const candidate = await sha256Hex(email + pass);
  const list = await fetchAdminHashes();
  if(list.includes(candidate)){
    sessionStorage.setItem('admin_auth_hash', candidate);
    hide('gate'); show('app');
  }else{
    msgEl.textContent = 'Credenciais inválidas.';
  }
}

function doLogout(){
  sessionStorage.removeItem('admin_auth_hash');
  location.reload();
}

document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('logoutBtn').addEventListener('click', doLogout);
window.addEventListener('keydown', (e)=>{ if(e.key==='Enter' && document.getElementById('gate') && !document.getElementById('app').classList.contains('hidden')) doLogin(); });

// ====== Gerador de hashes ======
let sheetData = [];
let detected = { email: null, inscricao: null, senha: null, combined: null };
let mergedHashes = [];

const fileSheet = document.getElementById('file-sheet');
const fileJSON  = document.getElementById('file-json');
const summary   = document.getElementById('summary');
const columnsDiv= document.getElementById('columns');
const preview   = document.getElementById('preview');
const generateBtn = document.getElementById('generate');
const downloadBtn = document.getElementById('download');
const modeSelect  = document.getElementById('mode');

fileSheet?.addEventListener('change', async (ev) => {
  const f = ev.target.files[0];
  if(!f) return;
  summary.textContent = 'Carregando...';
  sheetData = [];
  try{
    const arrayBuffer = await f.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const ws = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
    sheetData = json;
    summary.textContent = `Linhas lidas: ${json.length}`;
    detectColumns(json);
  }catch(e){
    console.error(e);
    summary.textContent = 'Falha ao ler a planilha: ' + e.message;
  }
});

fileJSON?.addEventListener('change', async (ev) => {
  const f = ev.target.files[0];
  if(!f) return;
  try{
    const text = await f.text();
    const data = JSON.parse(text);
    if(Array.isArray(data)) mergedHashes = data.slice();
    else if (Array.isArray(data.validHashes)) mergedHashes = data.validHashes.slice();
    else mergedHashes = [];
    summary.textContent = `JSON carregado: ${mergedHashes.length} hashes`;
  }catch(e){
    console.error(e);
    summary.textContent = 'Falha ao ler JSON: ' + e.message;
  }
});

function detectColumns(json){
  detected = { email: null, inscricao: null, senha: null, combined: null };
  if(!json || json.length===0){ columnsDiv.innerHTML='—'; return; }
  const keys = Object.keys(json[0]);
  for(const k of keys){
    const lower = k.toLowerCase();
    if(!detected.email && lower.includes('email')) detected.email = k;
    if(!detected.inscricao && (lower.includes('inscr') || lower.includes('inscrição') || lower.includes('inscricao'))) detected.inscricao = k;
    if(!detected.senha && lower.includes('senha')) detected.senha = k;
  }
  for(const k of keys){
    const lower = k.toLowerCase();
    if(!detected.inscricao && (lower.includes('id') || lower.includes('matricula') || lower.includes('número') || lower.includes('numero'))) detected.inscricao = k;
  }
  columnsDiv.innerHTML = '';
  for(const k of keys){
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-center mb-1.5';
    const label = document.createElement('div'); label.textContent = k; label.className = 'flex-1';
    const select = document.createElement('select');
    select.className = 'bg-transparent border border-[color:var(--stroke)] text-[color:#e6eef6] px-2 py-1 rounded-md';
    select.innerHTML = `<option value="">-- ignorar --</option><option value="email">email</option><option value="inscricao">inscricao</option><option value="senha">senha</option><option value="combined">email + inscrição (coluna única)</option>`;
    select.value = (detected.email===k? 'email' : (detected.inscricao===k? 'inscricao' : (detected.senha===k? 'senha' : '')));
    select.addEventListener('change', ()=>{
      const val = select.value;
      for(const key in detected) if(detected[key]===k) detected[key]=null;
      if(val) detected[val]=k;
    });
    row.appendChild(label); row.appendChild(select); columnsDiv.appendChild(row);
  }
}

generateBtn?.addEventListener('click', async ()=>{
  if(!sheetData || sheetData.length===0){ alert('Carregue uma planilha primeiro.'); return; }
  const mode = modeSelect.value;
  const emailCol = detected.email;
  const inscrCol = detected.inscricao;
  const senhaCol = detected.senha;
  const combinedCol = detected.combined || null;
  if(!emailCol && !combinedCol){ alert('Não foi possível detectar a coluna de e-mail.'); return; }
  if(mode==='inscricao' && !inscrCol && !combinedCol){ alert('Modo email+inscrição selecionado, mas falta a coluna.'); return; }
  if(mode==='senha' && !senhaCol){ alert('Modo email+senha selecionado, mas falta a coluna.'); return; }

  summary.textContent = 'Gerando hashes...';
  const hashes = [];
  for(let i=0;i<sheetData.length;i++){
    const row = sheetData[i];
    let email = '';
    let keyPart = '';
    if(combinedCol){
      const raw = String(row[combinedCol] || '').trim();
      if(!raw) continue;
      let parts = raw.split(/[,;|\t]+/).map(s=>s.trim()).filter(Boolean);
      if(parts.length < 2){ parts = raw.split(/\s+/).map(s=>s.trim()).filter(Boolean); }
      email = (parts[0] || '').toLowerCase();
      keyPart = (parts[1] || '').toString();
    } else {
      email = String(row[emailCol] || '').trim().toLowerCase();
      keyPart = mode==='inscricao' ? String(row[inscrCol] || '').trim() : String(row[senhaCol] || '').trim();
    }
    if(!email || !keyPart) continue;
    const h = await sha256Hex(email + keyPart);
    hashes.push(h);
    if(i%200===0) await new Promise(r=>setTimeout(r,0));
  }

  const combined = Array.from(new Set([...(mergedHashes||[]), ...hashes]));
  mergedHashes = combined;

  preview.textContent = combined.slice(0,20).map((h,i)=>`${i+1}. ${h}`).join('\n') || '—';
  summary.textContent = `Hashes gerados: ${hashes.length} (total após mesclagem: ${combined.length})`;
  downloadBtn.classList.remove('hidden');
});

downloadBtn?.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(mergedHashes, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'hashes_membros.json'; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});
