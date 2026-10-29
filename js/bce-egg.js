/* BCE easter egg: click anywhere on the page 3 times quickly. Press ? for date-me.html. */
(function(){
var HDR=["✦ · ˚ ✧ · ˚ ⌁ · ˚ ✧ · ˚ ✦ · ˚ ✧ · ˚ ⌁ · ˚ ✧ · ˚ ✦", "╔═══╗                                         ╔═══╗", "║ ♥ ║ ⌁ ████████╗   ██████╗███████╗ ⌁        ║ ♥ ║", "╚═══╝   ███╔═══██╗ ██╔════╝██╔════╝           ╚═══╝", ">>>>════████████╔╝ ██║     █████╗══════════════════▶", "        ███╔═══██╗ ██║     ██╔══╝", "     ⌁ ████████╔╝ ╚██████╗███████╗ ⌁", "╔═══╗   ╚═══════╝   ╚═════╝╚══════╝           ╔═══╗", "║ ♥ ║ ░▒▓█ B I G  C O N T E N T  E N E R G Y █▓▒░ ║ ♥ ║", "╚═══╝                                         ╚═══╝", "✦ · ˚ ✧ · ˚ ⌁ · ˚ ✧ · ˚ ✦ · ˚ ✧ · ˚ ⌁ · ˚ ✧ · ˚ ✦", "Let's Fucking Build The Future We Want Dot Com"];
var st=document.createElement('style');
st.textContent='#bce-egg{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:1;transition:opacity .6s ease}#bce-egg.out{opacity:0!important}#bce-egg pre{margin:0;padding:1.2em 1.4em;border-radius:8px;white-space:pre;overflow:visible;font-family:"DejaVu Sans Mono",Menlo,Consolas,"Liberation Mono","Courier New",monospace;font-size:clamp(5px,2.6vw,17px);line-height:1.25;mix-blend-mode:normal;filter:none;text-shadow:none;border:1px solid}#bce-egg.dk pre{background:#242428!important;color:#E8E8E8!important;border-color:#55555c;box-shadow:0 0 0 100vmax rgba(0,0,0,.55)}#bce-egg.lt pre{background:#F2F2F2!important;color:#242428!important;border-color:#8a8a90;box-shadow:0 0 0 100vmax rgba(255,255,255,.6)}@media (prefers-reduced-motion:reduce){#bce-egg{transition:none}}';
document.head.appendChild(st);
var clicks=[],ov=null,t1=null,t2=null;
function hide(){clearTimeout(t1);clearTimeout(t2);if(ov){ov.remove();ov=null}}
function dark(){var t=null;try{t=localStorage.getItem('bce-theme')}catch(e){}var a=document.documentElement.getAttribute('data-theme');if(t==='dark'||t==='light')return a?a==='dark':t==='dark';return !!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)}
function show(){hide();ov=document.createElement('div');ov.id='bce-egg';ov.className=dark()?'dk':'lt';ov.setAttribute('role','status');ov.setAttribute('aria-label','Big Content Energy');
var pre=document.createElement('pre');pre.textContent=HDR.join('\n');ov.appendChild(pre);document.body.appendChild(ov);
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
t1=setTimeout(function(){if(!ov)return;if(RM){hide();return}ov.className+=' out';t2=setTimeout(hide,700)},5000)}
document.addEventListener('click',function(e){
if(e.target.closest&&e.target.closest('a,button,input,select,textarea,label,summary,[role=button]'))return;
var now=Date.now();clicks.push(now);clicks=clicks.filter(function(t){return now-t<=1500});
if(clicks.length>=3){clicks=[];show()}});
document.addEventListener('keydown',function(e){
if(e.key!=='?'||e.ctrlKey||e.metaKey||e.altKey)return;var a=document.activeElement;
if(a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable))return;
e.preventDefault();location.href='/date-me.html'});
})();
