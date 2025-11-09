// ===== Utilidades =====
const qs = (s)=>document.querySelector(s);
const showEl = (el)=>el.classList.remove('hidden');
const hideEl = (el)=>el.classList.add('hidden');

async function sha256Hex(message){
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ===== Gate simples de autenticação =====
const ADMIN_HASH_LIST_URL = '/admin/_private/hashes_administradores.json';

async function fetchAdminHashes(){
  try{
    const res = await fetch(ADMIN_HASH_LIST_URL, { cache: 'no-store' });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    if(Array.isArray(data)) return data;
    if(Array.isArray(data.validAdmins)) return data.validAdmins.map(v=>v.hash);
    if(Array.isArray(data.validHashes)) return data.validHashes;
    return [];
  }catch(e){
    console.error('Falha ao carregar lista de admins:', e);
    return [];
  }
}

async function doLogin(){
  const email = qs('#email').value.trim().toLowerCase();
  const pass  = qs('#password').value;
  const msgEl = qs('#gateMsg');
  msgEl.textContent = '';
  hideEl(msgEl);
  if(!email || !pass){
    msgEl.textContent = 'Informe e-mail e senha.';
    showEl(msgEl);
    return;
  }
  const candidate = await sha256Hex(email + pass);
  const list = await fetchAdminHashes();
  if(list.includes(candidate)){
    sessionStorage.setItem('admin_auth_hash', candidate);
    hideEl(qs('#gate'));
    showEl(qs('#app'));
  } else {
    msgEl.textContent = 'Credenciais inválidas.';
    showEl(msgEl);
  }
}

function doLogout(){
  sessionStorage.removeItem('admin_auth_hash');
  location.reload();
}

qs('#loginBtn')?.addEventListener('click', doLogin);
qs('#logoutBtn')?.addEventListener('click', doLogout);
window.addEventListener('keydown', (e)=>{
  if(e.key==='Enter' && qs('#app') && !qs('#app').classList.contains('hidden')) return;
  if(e.key==='Enter') doLogin();
});

// ===== Gerador de hashes =====
let sheetData = [];
let detected = { email:null, inscricao:null, senha:null, combined:null };
let mergedHashes = [];

const fileSheet = qs('#file-sheet');
const fileJSON  = qs('#file-json');
const summary   = qs('#summary');
const columnsDiv= qs('#columns');
const preview   = qs('#preview');
const generateBtn = qs('#generate');
const downloadBtn = qs('#download');
const modeSelect  = qs('#mode');

document.querySelector("label[for='file-sheet']")?.addEventListener('click',()=>fileSheet.click());
document.querySelector("label[for='file-json']")?.addEventListener('click',()=>fileJSON.click());

fileSheet?.addEventListener('change', async (ev)=>{
  const f = ev.target.files[0];
  if(!f) return;
  summary.textContent = 'Carregando...';
  sheetData = [];
  try{
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type:'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval:'' });
    sheetData = json;
    summary.textContent = `Linhas lidas: ${json.length}`;
    detectColumns(json);
  }catch(e){
    console.error(e);
    summary.textContent = 'Falha ao ler a planilha: '+e.message;
  }
});

fileJSON?.addEventListener('change', async (ev)=>{
  const f = ev.target.files[0];
  if(!f) return;
  try{
    const text = await f.text();
    const data = JSON.parse(text);
    if(Array.isArray(data)) mergedHashes = data.slice();
    else if(Array.isArray(data.validHashes)) mergedHashes = data.validHashes.slice();
    else mergedHashes = [];
    summary.textContent = `JSON carregado: ${mergedHashes.length} hashes`;
  }catch(e){
    console.error(e);
    summary.textContent = 'Falha ao ler JSON: '+e.message;
  }
});

function detectColumns(json){
  detected = { email:null, inscricao:null, senha:null, combined:null };
  if(!json || !json.length){ columnsDiv.innerHTML = '—'; return; }
  const keys = Object.keys(json[0]);
  for(const k of keys){
    const l = k.toLowerCase();
    if(!detected.email && l.includes('email')) detected.email = k;
    if(!detected.inscricao && (l.includes('inscr')||l.includes('inscrição')||l.includes('matricula')||l.includes('id'))) detected.inscricao = k;
    if(!detected.senha && l.includes('senha')) detected.senha = k;
  }
  columnsDiv.innerHTML = '';
  for(const k of keys){
    const row = document.createElement('div');
    row.className = 'row';
    const label = document.createElement('div');
    label.textContent = k;
    label.style.flex='1';
    const select = document.createElement('select');
    select.innerHTML = `<option value=\"\">-- ignorar --</option><option value=\"email\">email</option><option value=\"inscricao\">inscricao</option><option value=\"senha\">senha</option>`;
    select.value = (detected.email===k?'email':(detected.inscricao===k?'inscricao':(detected.senha===k?'senha':'')));
    select.addEventListener('change',()=>{
      for(const key in detected) if(detected[key]===k) detected[key]=null;
      if(select.value) detected[select.value]=k;
    });
    row.appendChild(label);
    row.appendChild(select);
    columnsDiv.appendChild(row);
  }
}

generateBtn?.addEventListener('click', async ()=>{
  if(!sheetData.length){ alert('Carregue uma planilha primeiro.'); return; }
  const mode = modeSelect.value;
  const emailCol = detected.email;
  const inscrCol = detected.inscricao;
  const senhaCol = detected.senha;
  if(!emailCol){ alert('Não foi possível detectar a coluna de e-mail.'); return; }
  if(mode==='inscricao' && !inscrCol){ alert('Selecione a coluna de inscrição.'); return; }
  if(mode==='senha' && !senhaCol){ alert('Selecione a coluna de senha.'); return; }

  summary.textContent = 'Gerando hashes...';
  const hashes = [];
  for(let i=0;i<sheetData.length;i++){
    const row = sheetData[i];
    const email = String(row[emailCol]||'').trim().toLowerCase();
    const keyPart = mode==='inscricao' ? String(row[inscrCol]||'').trim() : String(row[senhaCol]||'').trim();
    if(!email || !keyPart) continue;
    const h = await sha256Hex(email + keyPart);
    hashes.push(h);
    if(i%250===0) await new Promise(r=>setTimeout(r,0));
  }
  const combined = Array.from(new Set([...(mergedHashes||[]), ...hashes]));
  mergedHashes = combined;
  preview.textContent = combined.slice(0,20).map((h,i)=>`${i+1}. ${h}`).join('\\n') || '—';
  summary.textContent = `Hashes gerados: ${hashes.length} (total após mesclagem: ${combined.length})`;
  showEl(downloadBtn);
});

downloadBtn?.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(mergedHashes,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hashes_membros.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// ===== Envio seguro ao GitHub (via Worker) =====
async function pushHashesToServer(){
  const apiUrl = qs('#api-url').value.trim();
  const apiKey = qs('#api-key').value.trim();
  const msgEl = qs('#remoteMsg');
  msgEl.className='alert';
  msgEl.textContent='';
  hideEl(msgEl);

  if(!apiUrl || !apiKey){
    msgEl.textContent='Preencha API URL e Admin API Key.';
    msgEl.classList.add('bad');
    showEl(msgEl);
    return;
  }
  if(!Array.isArray(mergedHashes) || !mergedHashes.length){
    msgEl.textContent='Gere hashes primeiro.';
    msgEl.classList.add('bad');
    showEl(msgEl);
    return;
  }

  const onlyHex = mergedHashes.filter(h=>/^[a-f0-9]{64}$/.test(h));
  try{
    const res = await fetch(apiUrl, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+apiKey
      },
      body: JSON.stringify({ hashes: onlyHex })
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok){ throw new Error((data && data.error) || ('HTTP '+res.status)); }
    msgEl.textContent = `OK ✅ PR #${data.pr_number || '?'} criado. Novos: ${data.added}. Total: ${data.total}.`;
    msgEl.classList.add('ok');
    showEl(msgEl);
  }catch(e){
    msgEl.textContent = 'Falha ao enviar: '+e.message;
    msgEl.classList.add('bad');
    showEl(msgEl);
  }
}
qs('#pushRemote')?.addEventListener('click', pushHashesToServer);
