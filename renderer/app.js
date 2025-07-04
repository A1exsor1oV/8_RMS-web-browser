const webview = document.getElementById('webview');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const edge    = document.getElementById('edge');
const list    = document.getElementById('linkList');
const btnRefresh = document.getElementById('btnRefresh');
const btnAdd     = document.getElementById('btnAdd');
const btnManage  = document.getElementById('btnManage');
const dlgPass = document.getElementById('dlgPass');
const passInput= document.getElementById('passInput');

let menuOpen=false, startX=null;

// ─────────────────── жесты
function cap(el){
  el.addEventListener('pointerdown',e=>{startX=e.clientX;el.setPointerCapture(e.pointerId);});
  el.addEventListener('pointerup',reset); el.addEventListener('pointercancel',reset);
}
function reset(e){startX=null;e.target.releasePointerCapture(e.pointerId);}
cap(edge); cap(sidebar);

edge.addEventListener('pointermove',e=>{
  if(startX!==null && e.clientX-startX>40) toggleMenu(true);
});
sidebar.addEventListener('pointermove',e=>{
  if(startX!==null && e.clientX-startX<-40) toggleMenu(false);
});
overlay.onclick = ()=>toggleMenu(false);

function toggleMenu(open){
  menuOpen=open;
  sidebar.classList.toggle('open',open);
  overlay.classList.toggle('hidden',!open);
  webview.style.pointerEvents=open?'none':'auto';
}

// ─────────────────── загрузка ссылок
async function load(){
  const cfg = await window.api.getConfig();
  render(cfg.links);
  if(!webview.src && cfg.links[0]) webview.src = cfg.links[0].url;
}
load();

function render(arr){
  list.innerHTML='';
  arr.forEach((l,i)=>{
    const b=document.createElement('button');
    b.textContent=l.title;
    b.onclick=()=>{webview.src=l.url;toggleMenu(false);};
    list.appendChild(b);
  });
}

btnRefresh.addEventListener('click', () => webview.reload());

btnAdd.addEventListener('click', () =>
  passwordGate(async () => {
    const title = prompt('Имя ссылки');
    const url   = prompt('URL');
    if (!title || !url) return;
    const cfg = await api.getConfig();
    cfg.links.push({ title, url });
    await api.saveLinks(cfg.links);
    render(cfg.links);
  })
);

btnManage.addEventListener('click', () =>
  passwordGate(() => alert('UI управления ссылками сделаем следующим шагом'))
);
/* ─────────────────── команды футера
btnRefresh.onclick = ()=>webview.reload();
btnAdd.onclick     = ()=>passwordGate(async ()=>{
  const title = prompt('Имя ссылки'); if(!title) return;
  const url   = prompt('URL');        if(!url)   return;
  const cfg   = await window.api.getConfig();
  cfg.links.push({title,url});
  await window.api.saveLinks(cfg.links);
  render(cfg.links);
});
btnManage.onclick  = ()=>alert('UI управления ссылками появится позже');

// ─────────────────── пароль
function passwordGate(okFn){
  dlgPass.showModal();
  dlgPass.onclose=async()=>{
    if(dlgPass.returnValue!=='ok') return;
    const ok=await window.api.checkPass(passInput.value);
    if(ok) okFn(); else alert('Неверный пароль');
  };
}
*/

// Esc скрывает меню
window.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false);});

function ensureFooterHandlers () {
  const refresh = document.getElementById('btnRefresh');
  const add     = document.getElementById('btnAdd');
  const manage  = document.getElementById('btnManage');

  if (!refresh._wired) {                      // флаг, чтобы не дублировать
    refresh.onclick = () => webview.reload();
    add.onclick     = () => passwordGate(addLink);
    manage.onclick  = () => passwordGate(toggleManage);
    refresh._wired = add._wired = manage._wired = true;
  }
}

/* вызываем сразу и каждый раз после toggleMenu(true) */
ensureFooterHandlers();                       // при старте
const _origToggle = toggleMenu;
toggleMenu = function (open) {                // «обёртка» поверх старой функции
  _origToggle(open);
  if (open) ensureFooterHandlers();
};