import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Pre-built component reference — vanilla HTML/CSS/JS equivalents of shadcn/Radix components
const WEB_COMPONENT_REFERENCE = `
## UI Component Library (vanilla HTML/CSS/JS — NO React/JSX)

When the user asks for these UI patterns, use the vanilla HTML/CSS/JS implementations below. NEVER use React, JSX, or any framework.

### Tabs (tabbed interface, switch views)
\`\`\`html
<div class="tabs">
  <div class="tabs-list" role="tablist">
    <button class="tab-trigger active" role="tab" data-tab="tab1" aria-selected="true">Tab 1</button>
    <button class="tab-trigger" role="tab" data-tab="tab2" aria-selected="false">Tab 2</button>
  </div>
  <div class="tab-content active" id="tab1" role="tabpanel">Content 1</div>
  <div class="tab-content" id="tab2" role="tabpanel">Content 2</div>
</div>
\`\`\`
\`\`\`css
.tabs-list { display: inline-flex; height: 40px; align-items: center; justify-content: center; border-radius: 8px; background: #f1f5f9; padding: 4px; gap: 2px; }
.tab-trigger { padding: 6px 12px; border: none; background: transparent; border-radius: 6px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; transition: all 0.2s; }
.tab-trigger:hover { color: #334155; }
.tab-trigger.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.tab-content { display: none; margin-top: 8px; padding: 16px; animation: fadeIn 0.2s ease; }
.tab-content.active { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
\`\`\`
\`\`\`js
document.querySelectorAll('.tab-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    btn.closest('.tabs').querySelectorAll('.tab-trigger').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    btn.closest('.tabs').querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    document.getElementById(tabId).classList.add('active');
  });
});
\`\`\`

### Accordion (FAQ, expandable, collapsible)
\`\`\`html
<div class="accordion">
  <div class="accordion-item">
    <button class="accordion-trigger" aria-expanded="false">
      <span>Question here?</span>
      <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="accordion-content"><p>Answer here.</p></div>
  </div>
</div>
\`\`\`
\`\`\`css
.accordion { display: flex; flex-direction: column; gap: 8px; }
.accordion-item { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fff; }
.accordion-trigger { display: flex; width: 100%; justify-content: space-between; align-items: center; padding: 16px 20px; border: none; background: transparent; font-size: 15px; font-weight: 600; cursor: pointer; text-align: left; color: #0f172a; transition: background 0.2s; }
.accordion-trigger:hover { background: #f8fafc; }
.accordion-trigger .chevron { transition: transform 0.3s ease; }
.accordion-trigger[aria-expanded="true"] .chevron { transform: rotate(180deg); }
.accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; padding: 0 20px; }
.accordion-content.open { max-height: 500px; padding: 0 20px 16px; }
.accordion-content p { color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; }
\`\`\`
\`\`\`js
document.querySelectorAll('.accordion-trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all others (single mode)
    btn.closest('.accordion').querySelectorAll('.accordion-trigger').forEach(t => { t.setAttribute('aria-expanded','false'); t.nextElementSibling.classList.remove('open'); });
    if (!isOpen) { btn.setAttribute('aria-expanded','true'); content.classList.add('open'); }
  });
});
\`\`\`

### Alert / Callout / Banner
\`\`\`html
<div class="alert alert-info" role="alert">
  <svg class="alert-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  <div><strong class="alert-title">Heads up!</strong><p class="alert-desc">This is an informational message.</p></div>
</div>
\`\`\`
\`\`\`css
.alert { display: flex; gap: 12px; padding: 16px; border-radius: 12px; border: 1px solid; font-size: 14px; }
.alert-info { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
.alert-warning { background: #fffbeb; border-color: #fde68a; color: #92400e; }
.alert-error { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.alert-success { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
.alert-icon { flex-shrink: 0; margin-top: 2px; }
.alert-title { font-weight: 600; margin-bottom: 4px; display: block; }
.alert-desc { margin: 0; opacity: 0.9; }
\`\`\`

### Confirm Dialog / Modal
\`\`\`html
<div class="dialog-overlay" id="confirmDialog" style="display:none;">
  <div class="dialog-content" role="alertdialog">
    <h3 class="dialog-title">Are you sure?</h3>
    <p class="dialog-desc">This action cannot be undone.</p>
    <div class="dialog-footer">
      <button class="btn btn-outline" onclick="closeDialog()">Cancel</button>
      <button class="btn btn-danger" onclick="confirmAction()">Delete</button>
    </div>
  </div>
</div>
\`\`\`
\`\`\`css
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); animation: fadeIn 0.2s; }
.dialog-content { background: #fff; border-radius: 16px; padding: 24px; max-width: 420px; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.15); animation: slideUp 0.3s ease; }
.dialog-title { margin: 0 0 8px; font-size: 18px; font-weight: 600; }
.dialog-desc { margin: 0 0 20px; color: #64748b; font-size: 14px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; }
.btn { padding: 8px 16px; border-radius: 8px; border: none; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-outline { background: transparent; border: 1px solid #e2e8f0; color: #334155; }
.btn-outline:hover { background: #f1f5f9; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
\`\`\`
\`\`\`js
function openDialog() { document.getElementById('confirmDialog').style.display = 'flex'; }
function closeDialog() { document.getElementById('confirmDialog').style.display = 'none'; }
function confirmAction() { closeDialog(); /* handle action */ }
// Close on overlay click
document.getElementById('confirmDialog')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeDialog(); });
\`\`\`

### Card
\`\`\`html
<div class="card">
  <div class="card-header"><h3 class="card-title">Title</h3><p class="card-desc">Description</p></div>
  <div class="card-content"><p>Content here</p></div>
  <div class="card-footer"><button class="btn btn-primary">Action</button></div>
</div>
\`\`\`
\`\`\`css
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow: hidden; transition: box-shadow 0.2s; }
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.card-header { padding: 24px 24px 0; }
.card-title { margin: 0; font-size: 20px; font-weight: 600; }
.card-desc { margin: 4px 0 0; color: #64748b; font-size: 14px; }
.card-content { padding: 16px 24px; }
.card-footer { padding: 0 24px 24px; display: flex; gap: 8px; }
.btn-primary { background: #3b82f6; color: #fff; padding: 8px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background: #2563eb; }
\`\`\`

### Dropdown Menu
\`\`\`html
<div class="dropdown">
  <button class="dropdown-trigger" onclick="toggleDropdown(this)">Menu ▾</button>
  <div class="dropdown-menu">
    <button class="dropdown-item">Option 1</button>
    <button class="dropdown-item">Option 2</button>
    <div class="dropdown-separator"></div>
    <button class="dropdown-item danger">Delete</button>
  </div>
</div>
\`\`\`
\`\`\`css
.dropdown { position: relative; display: inline-block; }
.dropdown-trigger { padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; cursor: pointer; font-size: 14px; transition: border-color 0.2s; }
.dropdown-trigger:hover { border-color: #94a3b8; }
.dropdown-menu { display: none; position: absolute; top: calc(100% + 4px); left: 0; min-width: 180px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); padding: 4px; z-index: 50; animation: fadeIn 0.15s; }
.dropdown-menu.open { display: block; }
.dropdown-item { display: block; width: 100%; padding: 8px 12px; border: none; background: transparent; text-align: left; font-size: 14px; border-radius: 6px; cursor: pointer; color: #334155; transition: background 0.15s; }
.dropdown-item:hover { background: #f1f5f9; }
.dropdown-item.danger { color: #ef4444; }
.dropdown-item.danger:hover { background: #fef2f2; }
.dropdown-separator { height: 1px; background: #e2e8f0; margin: 4px 0; }
\`\`\`
\`\`\`js
function toggleDropdown(btn) {
  const menu = btn.nextElementSibling;
  document.querySelectorAll('.dropdown-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
  menu.classList.toggle('open');
}
document.addEventListener('click', e => { if (!e.target.closest('.dropdown')) document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open')); });
\`\`\`

RULE: When generating UI for web-development, ALWAYS use these vanilla HTML/CSS/JS patterns. NEVER output React, JSX, TSX, or any component imports. Match prompt intent (FAQ → accordion, tabbed → tabs, confirm → dialog, etc.) and use these exact patterns as the base.
`;

// Advanced background effects library — vanilla Canvas/CSS animations for modern/advanced projects
const BACKGROUND_EFFECTS_LIBRARY = `
## Advanced Background Effects Library (vanilla HTML/CSS/JS — NO React)

When the user asks for an "advanced", "modern", "stunning", "premium", "creative", or "portfolio" project, ALWAYS include one of these animated background effects. Pick the most appropriate one for the context.

### 1. Particle Field (floating connected dots — great for tech, SaaS, portfolios)
\`\`\`html
<canvas id="particleCanvas" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;"></canvas>
\`\`\`
\`\`\`js
(function(){
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();
  const COUNT = 80, MAX_DIST = 120;
  for(let i=0;i<COUNT;i++) particles.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,r:Math.random()*2+1});
  function draw(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(100,150,255,0.5)'; ctx.fill();
    });
    for(let i=0;i<COUNT;i++) for(let j=i+1;j<COUNT;j++){
      const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
      const dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<MAX_DIST){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle='rgba(100,150,255,'+(1-dist/MAX_DIST)*0.15+')';ctx.stroke();}
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
\`\`\`

### 2. Gradient Mesh Aurora (smooth color waves — great for landing pages, creative sites)
\`\`\`html
<div id="aurora-bg" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:hidden;">
  <div class="aurora-blob aurora-1"></div>
  <div class="aurora-blob aurora-2"></div>
  <div class="aurora-blob aurora-3"></div>
</div>
\`\`\`
\`\`\`css
.aurora-blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.4;animation:auroraFloat 8s ease-in-out infinite alternate;}
.aurora-1{width:600px;height:600px;background:radial-gradient(circle,#6366f1,transparent 70%);top:-10%;left:-5%;animation-delay:0s;}
.aurora-2{width:500px;height:500px;background:radial-gradient(circle,#06b6d4,transparent 70%);top:30%;right:-10%;animation-delay:-3s;animation-duration:10s;}
.aurora-3{width:550px;height:550px;background:radial-gradient(circle,#8b5cf6,transparent 70%);bottom:-15%;left:30%;animation-delay:-5s;animation-duration:12s;}
@keyframes auroraFloat{0%{transform:translate(0,0) scale(1);}50%{transform:translate(40px,-30px) scale(1.1);}100%{transform:translate(-20px,20px) scale(0.95);}
}
\`\`\`

### 3. Pixel Grid Effect (animated canvas grid — great for tech, gaming, retro sites)
\`\`\`html
<canvas id="pixelGrid" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;"></canvas>
\`\`\`
\`\`\`js
(function(){
  const c=document.getElementById('pixelGrid'),ctx=c.getContext('2d');
  let w,h; function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight;} window.addEventListener('resize',resize); resize();
  const cols=60,rows=40,cellW=w/cols,cellH=h/rows;
  const grid=Array.from({length:rows},()=>Array.from({length:cols},()=>({brightness:Math.random()*0.15,target:Math.random()*0.15,speed:0.002+Math.random()*0.005})));
  let mouse={x:-1,y:-1}; document.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  function draw(){
    ctx.fillStyle='#0a0a0f'; ctx.fillRect(0,0,w,h);
    for(let r=0;r<rows;r++) for(let cl=0;cl<cols;cl++){
      const cell=grid[r][cl];
      const cx=cl*cellW+cellW/2, cy=r*cellH+cellH/2;
      const dx=mouse.x-cx,dy=mouse.y-cy,dist=Math.sqrt(dx*dx+dy*dy);
      const mouseBright=dist<150?0.4*(1-dist/150):0;
      cell.brightness+=(cell.target-cell.brightness)*cell.speed*16;
      if(Math.random()<0.005) cell.target=Math.random()*0.2;
      const b=Math.min(1,cell.brightness+mouseBright);
      ctx.fillStyle='rgba(99,102,241,'+b+')';
      ctx.fillRect(cl*cellW+1,r*cellH+1,cellW-2,cellH-2);
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
\`\`\`

### 4. Floating Orbs with Glow (glassmorphism-ready — great for SaaS, dashboards, fintech)
\`\`\`html
<div id="orbs-bg" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:hidden;background:#030712;"></div>
\`\`\`
\`\`\`js
(function(){
  const container=document.getElementById('orbs-bg');
  const orbs=[
    {size:400,color:'rgba(99,102,241,0.15)',x:20,y:30,dx:0.3,dy:0.2},
    {size:350,color:'rgba(6,182,212,0.12)',x:60,y:60,dx:-0.2,dy:0.15},
    {size:300,color:'rgba(139,92,246,0.1)',x:80,y:20,dx:0.15,dy:-0.25},
    {size:250,color:'rgba(236,72,153,0.08)',x:40,y:80,dx:-0.1,dy:-0.2}
  ];
  orbs.forEach(o=>{
    const el=document.createElement('div');
    el.style.cssText='position:absolute;border-radius:50%;filter:blur(60px);transition:transform 0.1s linear;width:'+o.size+'px;height:'+o.size+'px;background:radial-gradient(circle,'+o.color+',transparent 70%);left:'+o.x+'%;top:'+o.y+'%;';
    container.appendChild(el); o.el=el;
  });
  function animate(){
    orbs.forEach(o=>{
      o.x+=o.dx*0.05; o.y+=o.dy*0.05;
      if(o.x<-10||o.x>100) o.dx*=-1;
      if(o.y<-10||o.y>100) o.dy*=-1;
      o.el.style.left=o.x+'%'; o.el.style.top=o.y+'%';
    });
    requestAnimationFrame(animate);
  }
  animate();
})();
\`\`\`

### 5. Starfield / Space Effect (great for dark-themed sites, portfolios, gaming)
\`\`\`html
<canvas id="starfield" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;"></canvas>
\`\`\`
\`\`\`js
(function(){
  const c=document.getElementById('starfield'),ctx=c.getContext('2d');
  let w,h; function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight;} window.addEventListener('resize',resize); resize();
  const stars=Array.from({length:200},()=>({x:Math.random()*w-w/2,y:Math.random()*h-h/2,z:Math.random()*1000}));
  function draw(){
    ctx.fillStyle='rgba(3,7,18,0.2)'; ctx.fillRect(0,0,w,h);
    stars.forEach(s=>{
      s.z-=2; if(s.z<=0){s.z=1000;s.x=Math.random()*w-w/2;s.y=Math.random()*h-h/2;}
      const sx=s.x/s.z*400+w/2, sy=s.y/s.z*400+h/2, r=Math.max(0,(1-s.z/1000)*2.5);
      ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,'+(1-s.z/1000)+')'; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
\`\`\`

### 6. Wavy Background (animated sine waves — great for hero sections, music, creative sites)
\`\`\`html
<canvas id="wavyBg" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;"></canvas>
\`\`\`
\`\`\`js
(function(){
  const c=document.getElementById('wavyBg'),ctx=c.getContext('2d');
  let w,h; function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight;} window.addEventListener('resize',resize); resize();
  const colors=['#38bdf8','#818cf8','#c084fc','#e879f9','#22d3ee'];
  let nt=0;
  // Simple noise-like function using multiple sine waves
  function wave(x,i,t){return Math.sin(x/800+t+i)*50+Math.sin(x/400+t*1.3+i*2)*30+Math.sin(x/200+t*0.7+i*3)*15;}
  function draw(){
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.globalAlpha=0.5; ctx.fillRect(0,0,w,h); ctx.globalAlpha=1;
    ctx.filter='blur(8px)';
    nt+=0.002;
    for(let i=0;i<5;i++){
      ctx.beginPath(); ctx.lineWidth=50; ctx.strokeStyle=colors[i%colors.length];
      for(let x=0;x<w;x+=5){const y=wave(x,0.3*i,nt); ctx.lineTo(x,y+h*0.5);}
      ctx.stroke(); ctx.closePath();
    }
    ctx.filter='none';
    requestAnimationFrame(draw);
  }
  draw();
})();
\`\`\`

### 7. Gradient Animation (animated multi-color blending blobs — great for hero sections, CTA, premium brands)
\`\`\`html
<div id="gradAnim" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:hidden;background:linear-gradient(40deg,rgb(108,0,162),rgb(0,17,82));">
  <svg style="display:none"><defs><filter id="gooey"><feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo"/><feBlend in="SourceGraphic" in2="goo"/></filter></defs></svg>
  <div class="grad-container"></div>
</div>
\`\`\`
\`\`\`css
.grad-container{position:absolute;inset:0;filter:url(#gooey) blur(40px);}
.grad-blob{position:absolute;width:80%;height:80%;top:calc(50% - 40%);left:calc(50% - 40%);border-radius:50%;mix-blend-mode:hard-light;opacity:1;}
.grad-blob:nth-child(1){background:radial-gradient(circle at center,rgba(18,113,255,1) 0,rgba(18,113,255,0) 50%);animation:gradMove1 12s ease infinite;}
.grad-blob:nth-child(2){background:radial-gradient(circle at center,rgba(221,74,255,0.8) 0,rgba(221,74,255,0) 50%);transform-origin:calc(50% - 400px);animation:gradMove2 10s ease infinite reverse;}
.grad-blob:nth-child(3){background:radial-gradient(circle at center,rgba(100,220,255,0.8) 0,rgba(100,220,255,0) 50%);transform-origin:calc(50% + 400px);animation:gradMove3 14s ease infinite;}
.grad-blob:nth-child(4){background:radial-gradient(circle at center,rgba(200,50,50,0.8) 0,rgba(200,50,50,0) 50%);opacity:0.7;animation:gradMove4 8s ease infinite reverse;}
.grad-blob:nth-child(5){background:radial-gradient(circle at center,rgba(180,180,50,0.8) 0,rgba(180,180,50,0) 50%);transform-origin:calc(50% - 800px) calc(50% + 800px);animation:gradMove5 16s ease infinite;}
@keyframes gradMove1{0%{transform:translate(0,0);}33%{transform:translate(30px,-50px);}66%{transform:translate(-20px,20px);}100%{transform:translate(0,0);}}
@keyframes gradMove2{0%{transform:translate(0,0) rotate(0deg);}50%{transform:translate(-40px,30px) rotate(180deg);}100%{transform:translate(0,0) rotate(360deg);}}
@keyframes gradMove3{0%{transform:translate(0,0) rotate(0deg);}50%{transform:translate(40px,-30px) rotate(-180deg);}100%{transform:translate(0,0) rotate(0deg);}}
@keyframes gradMove4{0%{transform:translate(0,0) scale(1);}50%{transform:translate(20px,40px) scale(1.1);}100%{transform:translate(0,0) scale(1);}}
@keyframes gradMove5{0%{transform:translate(0,0) rotate(0deg);}50%{transform:translate(-30px,-20px) rotate(180deg);}100%{transform:translate(0,0) rotate(360deg);}}
\`\`\`
\`\`\`js
(function(){
  const container=document.querySelector('.grad-container');
  for(let i=0;i<5;i++){const b=document.createElement('div');b.className='grad-blob';container.appendChild(b);}
  // Mouse-interactive blob
  const mouseBlob=document.createElement('div');
  mouseBlob.className='grad-blob';
  mouseBlob.style.cssText='background:radial-gradient(circle at center,rgba(140,100,255,0.8) 0,rgba(140,100,255,0) 50%);width:100%;height:100%;top:-50%;left:-50%;opacity:0.7;';
  container.appendChild(mouseBlob);
  let curX=0,curY=0,tgX=0,tgY=0;
  document.addEventListener('mousemove',e=>{const r=container.getBoundingClientRect();tgX=e.clientX-r.left;tgY=e.clientY-r.top;});
  function move(){curX+=(tgX-curX)/20;curY+=(tgY-curY)/20;mouseBlob.style.transform='translate('+Math.round(curX)+'px,'+Math.round(curY)+'px)';requestAnimationFrame(move);}
  move();
})();
\`\`\`

### 8. Dotted Glow Background (shimmering dot grid — great for cards, product showcases, fintech)
\`\`\`html
<canvas id="dottedGlow" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;"></canvas>
\`\`\`
\`\`\`js
(function(){
  const c=document.getElementById('dottedGlow'),ctx=c.getContext('2d');
  const dpr=Math.min(window.devicePixelRatio||1,2);
  let w,h; function resize(){w=c.clientWidth;h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);regenDots();} window.addEventListener('resize',resize);
  c.style.width='100%';c.style.height='100%';
  const gap=12,radius=2,opacity=0.6;
  let dots=[];
  function regenDots(){dots=[];const cols=Math.ceil(w/gap)+2,rows=Math.ceil(h/gap)+2;for(let i=-1;i<cols;i++)for(let j=-1;j<rows;j++){const x=i*gap+(j%2===0?0:gap*0.5),y=j*gap;dots.push({x,y,phase:Math.random()*Math.PI*2,speed:0.4+Math.random()*0.9});}}
  resize();
  function draw(now){
    ctx.clearRect(0,0,w,h);ctx.globalAlpha=opacity;
    const time=now/1000;
    for(let i=0;i<dots.length;i++){const d=dots[i];const mod=(time*d.speed+d.phase)%2;const lin=mod<1?mod:2-mod;const a=0.25+0.55*lin;
      if(a>0.6){ctx.shadowColor='rgba(0,170,255,0.85)';ctx.shadowBlur=6*((a-0.6)/0.4);}else{ctx.shadowColor='transparent';ctx.shadowBlur=0;}
      ctx.globalAlpha=a*opacity;ctx.fillStyle='rgba(150,150,150,0.7)';ctx.beginPath();ctx.arc(d.x,d.y,radius,0,Math.PI*2);ctx.fill();}
    ctx.shadowBlur=0;requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
\`\`\`

### 9. Background Ripple Grid (clickable grid ripple — great for hero sections, interactive CTA)
\`\`\`html
<div id="rippleGrid" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;overflow:hidden;"></div>
\`\`\`
\`\`\`css
#rippleGrid{display:grid;pointer-events:auto;}
.ripple-cell{border:0.5px solid rgba(200,200,200,0.15);opacity:0.3;transition:opacity 0.15s;background:rgba(240,240,240,0.03);}
.ripple-cell:hover{opacity:0.7;}
.ripple-cell.active{animation:cellRipple var(--duration,400ms) ease var(--delay,0ms) 1;}
@keyframes cellRipple{0%{opacity:0.3;transform:scale(1);}30%{opacity:0.9;background:rgba(99,102,241,0.2);transform:scale(1.05);}100%{opacity:0.3;transform:scale(1);}}
\`\`\`
\`\`\`js
(function(){
  const g=document.getElementById('rippleGrid');
  const cellSize=56,cols=Math.ceil(window.innerWidth/cellSize),rows=Math.ceil(window.innerHeight/cellSize);
  g.style.gridTemplateColumns='repeat('+cols+','+cellSize+'px)';g.style.gridTemplateRows='repeat('+rows+','+cellSize+'px)';
  const cells=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const cell=document.createElement('div');cell.className='ripple-cell';cell.dataset.row=r;cell.dataset.col=c;g.appendChild(cell);cells.push(cell);}
  g.addEventListener('click',e=>{const cell=e.target;if(!cell.classList.contains('ripple-cell'))return;
    const cr=+cell.dataset.row,cc=+cell.dataset.col;
    cells.forEach(cl=>{cl.classList.remove('active');void cl.offsetWidth;const dr=+cl.dataset.row,dc=+cl.dataset.col;const dist=Math.hypot(cr-dr,cc-dc);cl.style.setProperty('--delay',Math.max(0,dist*55)+'ms');cl.style.setProperty('--duration',(200+dist*80)+'ms');cl.classList.add('active');});
  });
})();
\`\`\`

### 10. Parallax Floating Images (mouse-driven depth — great for portfolios, agencies, product showcases)
\`\`\`html
<div id="parallaxImages" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;overflow:hidden;"></div>
\`\`\`
\`\`\`js
(function(){
  const container=document.getElementById('parallaxImages');
  const positions=[
    {top:'8%',left:'4%',depth:0.3},{top:'8%',right:'4%',depth:0.35},
    {top:'38%',left:'6%',depth:0.9},{top:'38%',right:'6%',depth:0.85},
    {top:'68%',left:'4%',depth:0.4},{top:'68%',right:'4%',depth:0.45}
  ];
  const images=[
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=320&h=240&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=320&h=240&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=320&h=240&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=320&h=240&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&h=240&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f1d7?w=320&h=240&fit=crop&q=80'
  ];
  let mouseX=0,mouseY=0;const maxOff=40;
  document.addEventListener('mousemove',e=>{mouseX=(e.clientX/window.innerWidth-0.5)*2;mouseY=(e.clientY/window.innerHeight-0.5)*2;});
  positions.forEach((p,i)=>{
    const el=document.createElement('div');
    el.style.cssText='position:absolute;opacity:0;transition:transform 0.3s ease-out;';
    if(p.left)el.style.left=p.left; if(p.right)el.style.right=p.right; el.style.top=p.top;
    const img=document.createElement('img');img.src=images[i%images.length];img.alt='';img.loading='lazy';
    img.style.cssText='width:200px;height:150px;object-fit:cover;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.1);';
    el.appendChild(img);container.appendChild(el);
    setTimeout(()=>{el.style.opacity='1';el.style.transition='opacity 0.8s ease, transform 0.3s ease-out';},200+i*150);
    el._depth=p.depth;el._el=el;
  });
  const els=container.children;
  function animate(){
    for(let i=0;i<els.length;i++){const el=els[i];if(!el._depth)continue;
      const dx=mouseX*maxOff*el._depth,dy=mouseY*maxOff*el._depth;
      el.style.transform='translate('+dx+'px,'+dy+'px)';}
    requestAnimationFrame(animate);
  }
  animate();
})();
\`\`\`

### 11. Scales / Line Pattern (repeating diagonal lines — great for decorative borders, minimalist designs)
\`\`\`html
<div id="scalesBg" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.08;"></div>
\`\`\`
\`\`\`css
#scalesBg{background:repeating-linear-gradient(315deg,currentColor 0,currentColor 1px,transparent 0,transparent 50%);background-size:10px 10px;color:#fff;}
\`\`\`

### Usage Rules:
- **ALWAYS** use one of these effects when the prompt mentions: modern, advanced, premium, stunning, creative, portfolio, landing page, SaaS, startup.
- The background canvas/div should be **position:fixed; z-index:0** and all content should be **position:relative; z-index:1** or higher.
- Match the effect to the topic: tech→particles or pixel grid, creative→aurora or wavy, dark theme→starfield, SaaS→floating orbs or gradient animation, product showcase→parallax images or dotted glow, interactive→ripple grid, minimalist→scales pattern.
- The effect should be SUBTLE — it enhances the design, not overwhelms it.
- You can COMBINE effects: e.g. scales pattern + aurora blobs, or dotted glow + gradient animation for extra premium feel.
`;

// Domain-specific system prompts for AI code generation
const domainPrompts: Record<string, string> = {
  "web-development": `You are Lunor.AI's expert Web Development coding assistant. You generate SELF-CONTAINED, ERROR-FREE, VISUALLY STUNNING code using ONLY vanilla HTML, CSS, and JavaScript.

CRITICAL: NEVER use React, JSX, TSX, Vue, Angular, TypeScript, or any framework. Use ONLY:
- index.html
- styles.css
- script.js

RULES:
1. **HTML only** — semantic HTML5, no JSX or React. No import statements. No components.
2. **CSS only** — styles.css with modern animations (transitions, keyframes, hover effects, gradients).
3. **Vanilla JS only** — plain JavaScript, no import/export, no modules, no require, no npm packages.
4. **IMAGES ARE MANDATORY** — Every website MUST include high-quality images. Use these image sources:
   - **Unsplash (primary)**: <img src="https://images.unsplash.com/photo-ID?w=WIDTH&h=HEIGHT&fit=crop&q=80"> — use real Unsplash photo IDs for relevant topics.
   - **Picsum (random beautiful photos)**: <img src="https://picsum.photos/WIDTH/HEIGHT?random=N"> where N is a unique number per image.
   - **Hero images**: Use full-width background images with CSS: background-image: url('https://images.unsplash.com/photo-ID?w=1920&h=1080&fit=crop&q=80');
   - Include AT LEAST 3-5 images per website (hero banner, feature images, team/product photos, gallery items).
   - Use object-fit: cover on all images. Add loading="lazy" for below-fold images.
   - For icons, use inline SVGs or emoji — NOT external icon libraries.
   
   **Common Unsplash photo IDs by topic:**
   - Technology/coding: 1461749280684-dccba630e2f6, 1498050108023-c5249f4df085, 1504639725590-34d0984388bd, 1555066931-4365d14bab8c, 1517694712202-14dd9538aa97
   - Business/startup: 1553877522-43269d4ea984, 1556761175-5973dc0f32e7, 1552664730-d307ca884978, 1600880292203-757bb62b4baf, 1542744173-8e7e91415657
   - Nature/landscape: 1506744038136-46273834b3fb, 1469474968028-56623f02e42e, 1501854140801-50d01698950b, 1470071459604-3b5ec3a7fe05, 1441974231531-c6227db76b6e
   - Food/restaurant: 1504674900247-0877df9cc836, 1414235077428-338989a2e8c0, 1476224203421-9ac39bcb3327, 1565299624946-b28f40a0ae38, 1555396273-367ea4eb4db5
   - People/team: 1522202176988-66273c2fd55f, 1529156069898-49953707c56b, 1573496359142-b8d87734a5a2, 1560250097-0b93528c311a, 1543269664-56d93c1b41a6
   - Fitness/health: 1517836357463-d25dfeac3438, 1571019614242-c5c5dee9f50a, 1549060279-7aa00f60c6fe, 1518611012118-696072aa579a, 1576678927484-cc907957088c
   - Education: 1503676260728-1c00da094a0b, 1524178232363-1fb2b075b655, 1481627834876-b7833e8f5570, 1427504350979-f38e36f5ceab, 1456513080510-7bf3a84b82f8
   - E-commerce/shopping: 1472851294608-062f824d29cc, 1441986300917-64674bd600d8, 1483985988355-763728e1935b, 1556742049-0cfed4f6a45d, 1607082348824-0a96f2a4b9da
   - Travel: 1488646953014-85cb44e25828, 1476514525535-07fb3b4a6e29, 1530789253388-582c481c54b0, 1507525428034-b723cf961d3e, 1469854523086-cc02fe5d8800
   - Portfolio/creative: 1558618666-fcd25c85f1d7, 1513364776144-60967b0f800f, 1561070791-2526d30994b5, 1534670007418-fbb7f6cf32c3, 1542621334-a254cf47733d

5. **Responsive** — mobile-first, use media queries, flexbox/grid, readable fonts (14px+).
6. **Visually rich** — gradients, cards with hover effects, smooth transitions, box-shadows, modern design patterns. EVERY section should feel polished.
7. **Always produce working UI** — the preview runs directly in HTML; no build step.
8. **Use the UI Component Library below** — when the user asks for tabs, accordions, modals, cards, alerts, dropdowns, use the vanilla HTML/CSS/JS patterns from the component reference. NEVER translate them to React.
9. **Design quality** — Use a consistent color palette, proper typography hierarchy (Google Fonts via <link>), generous whitespace, and smooth scroll behavior.
10. **ADVANCED BACKGROUND EFFECTS** — For ANY prompt that mentions modern, advanced, premium, stunning, creative, portfolio, landing page, SaaS, or startup, ALWAYS include an animated background effect from the Background Effects Library below. Choose the most fitting effect for the topic.

${WEB_COMPONENT_REFERENCE}

${BACKGROUND_EFFECTS_LIBRARY}`,
  "app-development": `You are Lunor.AI's expert Mobile App Development coding assistant. You generate SELF-CONTAINED, ERROR-FREE code using ONLY vanilla HTML, CSS, and JavaScript.

CRITICAL: NEVER use React, JSX, TSX, Vue, TypeScript, or any framework. Use ONLY:
- index.html
- styles.css
- script.js

RULES:
1. **HTML only** — semantic HTML5, no JSX or React.
2. **CSS only** — styles.css with modern animations (transitions, keyframes, hover effects).
3. **Vanilla JS only** — plain JavaScript, no import/export, no modules.
4. **Include images** — use <img src="https://image.pollinations.ai/prompt/DESCRIPTION"> with URL-encoded descriptions (e.g. "modern%20hero%20illustration").
5. **Mobile-first** — design for 393px width, touch-friendly targets (min 44px), readable fonts (14px+).
6. **Visually rich** — gradients, cards, shadows, smooth transitions. Add 2-3 relevant images via pollinations.ai URLs.
7. **Always produce working UI** — the preview runs directly in HTML; no build step.`,
  "cybersecurity": `You are Lunor.AI's expert Cybersecurity tutor specializing in ethical hacking, penetration testing, network security, cryptography, OWASP Top 10, and digital forensics. Explain vulnerabilities with real-world examples, provide secure coding practices. Always emphasize ethical and legal boundaries.`,
  "data-science": `You are Lunor.AI's expert Data Science & ML tutor covering Python, TensorFlow, PyTorch, Pandas, NumPy, Scikit-learn, NLP, and Computer Vision. Explain statistics intuitively, write vectorized code, guide through the full ML pipeline: EDA, feature engineering, training, evaluation, deployment.`,
  "cloud-computing": `You are Lunor.AI's expert Cloud Computing tutor covering AWS, Azure, GCP, Docker, Kubernetes, Terraform, serverless, and CI/CD. Explain cloud services with architecture diagrams in text, write IaC templates. Emphasize cost optimization, security, and scalability.`,
  "devops": `You are Lunor.AI's expert DevOps tutor covering CI/CD (Jenkins, GitHub Actions), IaC (Ansible, Terraform), monitoring (Prometheus, Grafana), Linux, Bash, and Nginx. Write production-grade pipeline configs and guide through automation best practices.`,
  "database": `You are Lunor.AI's expert Database Engineering tutor covering PostgreSQL, MongoDB, Redis, MySQL, database design, normalization, indexing, query optimization, and distributed databases. Write efficient queries, explain execution plans. Emphasize ACID, CAP theorem, and performance tuning.`,
  "iot": `You are Lunor.AI's expert IoT & Embedded Systems tutor covering Arduino, Raspberry Pi, ESP32, MQTT, edge computing, sensors, and Embedded C. Write efficient embedded code, explain protocols (I2C, SPI, UART, MQTT). Include circuit descriptions and pin configs.`,
  "blockchain": `You are Lunor.AI's expert Blockchain & Web3 tutor covering Solidity, Ethereum, smart contracts, DeFi, NFTs, Web3.js, and Hardhat. Write secure, gas-optimized contracts following OpenZeppelin standards. Highlight security vulnerabilities and prevention.`,
  "ui-ux": `You are Lunor.AI's expert UI/UX Design tutor covering Figma, design systems, wireframing, prototyping, user research, and accessibility (WCAG). Explain design principles, provide CSS/HTML implementations, guide through user-centered design.`,
  "dsa": `You are Lunor.AI's expert DSA & Competitive Programming tutor. Solve problems step-by-step: brute force → optimized, with time/space complexity. Write clean code in Python, Java, C++, JavaScript. Explain intuition before code.`,
  "system-design": `You are Lunor.AI's expert System Design tutor covering load balancing, caching, microservices, message queues, CAP theorem, sharding. Explain with component diagrams, estimate capacity, guide through trade-offs for real-world systems.`,
};

// Languages that can be natively executed in Deno
const NATIVE_LANGUAGES = new Set(["javascript", "typescript"]);

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const GOOGLE_AI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

async function callAINonStream(
  systemContent: string,
  userContent: string,
  apiKey: string,
  useGoogle: boolean
): Promise<string> {
  if (useGoogle) {
    const url = `${GOOGLE_AI_URL}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemContent }] },
        contents: [{ role: "user", parts: [{ text: userContent }] }],
      }),
    });
    if (!resp.ok) throw new Error(`AI error: ${resp.status}`);
    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
  const resp = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
      ],
      stream: false,
    }),
  });
  if (!resp.ok) throw new Error(`AI error: ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

function normalizeLovableModel(requested?: string): string {
  const m = (requested || "").toLowerCase();
  if (!m) return DEFAULT_MODEL;
  if (m.includes("gemini-3-pro")) return "google/gemini-3-pro-preview";
  if (m.includes("gemini-2.5-pro")) return "google/gemini-2.5-pro";
  if (m.includes("gemini-2.5-flash-lite")) return "google/gemini-2.5-flash-lite";
  if (m.includes("gemini-2.5-flash")) return "google/gemini-2.5-flash";
  return DEFAULT_MODEL;
}

/**
 * Execute JavaScript/TypeScript code natively in a sandboxed Function scope.
 */
function executeNatively(code: string): string[] {
  const logs: string[] = [];
  const mockConsole = {
    log: (...args: unknown[]) =>
      logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
    error: (...args: unknown[]) =>
      logs.push("❌ " + args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
    warn: (...args: unknown[]) =>
      logs.push("⚠️ " + args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
    info: (...args: unknown[]) =>
      logs.push("ℹ️ " + args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" ")),
    table: (...args: unknown[]) =>
      logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join("\n")),
    dir: (...args: unknown[]) =>
      logs.push(args.map((a) => JSON.stringify(a, null, 2)).join("\n")),
    assert: (condition: unknown, ...args: unknown[]) => {
      if (!condition) logs.push("❌ Assertion failed: " + args.map(String).join(" "));
    },
    time: () => {},
    timeEnd: () => {},
    clear: () => {},
    count: () => {},
    group: () => {},
    groupEnd: () => {},
  };

  // Check if code contains JSX, import/export, or other non-Function() compatible syntax
  const hasModuleSyntax = /\b(import\s+|export\s+|from\s+['"])/m.test(code);
  const hasJSX = /<\w+[\s/>]/.test(code) && /\breturn\s*\(/.test(code);

  if (hasModuleSyntax || hasJSX) {
    // Strip import/export statements and try to execute the remaining logic
    let strippedCode = code
      .replace(/^\s*import\s+.*?[;\n]/gm, "// [import stripped]\n")
      .replace(/^\s*export\s+(default\s+)?/gm, "")
      .replace(/^\s*from\s+['"].*?['"];?\s*$/gm, "");

    // If it's mostly JSX/React, we can't run it natively — return a helpful message
    if (hasJSX) {
      return [
        "⚙️ JSX/React code detected — cannot execute directly in terminal.",
        "💡 This code needs a React runtime (browser) to render.",
        "📋 Static analysis: Code structure looks valid.",
        ...extractExports(code),
      ];
    }

    try {
      const fn = new Function("console", "setTimeout", "setInterval", "fetch", "require", strippedCode);
      fn(mockConsole, undefined, undefined, undefined, mockRequire);
      return logs.length > 0 ? logs : ["✅ Code executed successfully (no output)"];
    } catch (err) {
      return [`❌ Runtime Error: ${err instanceof Error ? err.message : String(err)}`];
    }
  }

  try {
    const fn = new Function("console", "setTimeout", "setInterval", "fetch", "require", code);
    fn(mockConsole, undefined, undefined, undefined, mockRequire);
    return logs.length > 0 ? logs : ["✅ Code executed successfully (no output)"];
  } catch (err) {
    return [`❌ Runtime Error: ${err instanceof Error ? err.message : String(err)}`];
  }
}

/** Mock require for CJS-style code */
function mockRequire(name: string) {
  return new Proxy({}, { get: (_t, prop) => typeof prop === "string" ? (..._a: unknown[]) => `[${name}.${prop}()]` : undefined });
}

/** Extract component/function names from JSX code for display */
function extractExports(code: string): string[] {
  const results: string[] = [];
  const fnMatch = code.match(/(?:function|const|class)\s+(\w+)/g);
  if (fnMatch) {
    results.push("📦 Detected: " + fnMatch.map(m => m.replace(/^(function|const|class)\s+/, "")).join(", "));
  }
  return results;
}

/**
 * Use Lovable AI to simulate execution for non-native languages (Python, SQL, etc.)
 */
async function simulateWithAI(
  code: string,
  language: string,
  domain: string,
  apiKey: string,
  useGoogle: boolean
): Promise<string[]> {
  const systemContent = `You are a precise ${language} code execution simulator for the ${domain} domain. Output ONLY what the code would print — nothing else.`;
  const simulationPrompt = `You are a ${language} runtime simulator. Given the following ${language} code, predict and display the exact output that would be produced if this code were executed in a standard ${language} environment.

Rules:
- Show ONLY the output (stdout) — no explanations, no markdown, no code blocks
- If the code has errors, show the exact error message a real interpreter/compiler would produce
- If the code produces no output, say "✅ Code executed successfully (no output)"
- For imports that would fail, show the appropriate ImportError/ModuleNotFoundError
- Simulate realistic output including formatting, newlines, and special characters
- For data structures (DataFrames, arrays), show them as they would appear in a terminal
- Prefix errors with ❌ and warnings with ⚠️

Code to simulate:
\`\`\`${language}
${code}
\`\`\``;

  try {
    let content: string;
    if (useGoogle) {
      const url = `${GOOGLE_AI_URL}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemContent }] },
          contents: [{ role: "user", parts: [{ text: simulationPrompt }] }],
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error(`[code-engine] Google AI simulation error: ${resp.status}`, text);
        return [`⚙️ ${language} simulation unavailable. Status: ${resp.status}`];
      }
      const data = await resp.json();
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || "✅ Code executed successfully (no output)";
    } else {
      const resp = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: simulationPrompt },
          ],
          stream: false,
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error(`[code-engine] AI simulation error: ${resp.status}`, text);
        return [`⚙️ ${language} simulation unavailable. Status: ${resp.status}`];
      }
      const data = await resp.json();
      content = data.choices?.[0]?.message?.content || "✅ Code executed successfully (no output)";
    }
    return content.split("\n").filter((line: string) => line !== undefined);
  } catch (err) {
    console.error("[code-engine] AI simulation error:", err);
    return [`⚙️ Could not simulate ${language} execution: ${err instanceof Error ? err.message : "Unknown error"}`];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth: allow anon key (unauthenticated) or valid user session
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const isAnonKey = authHeader === `Bearer ${anonKey}`;
  if (!isAnonKey) {
    const supabaseAuth = createClient(Deno.env.get("SUPABASE_URL")!, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!body || typeof body !== "object") {
      return new Response(
        JSON.stringify({ error: "Request body required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const action = body.action as string | undefined;
    const rawDomain = (body.domain as string) || "web-development";
    const domain = typeof rawDomain === "string" ? rawDomain.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "web-development" : "web-development";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_AI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
    const apiKey = LOVABLE_API_KEY || GOOGLE_AI_API_KEY;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || "unknown";

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY or LOVABLE_API_KEY is not configured",
          hint: "Set: supabase secrets set GEMINI_API_KEY=your_key --project-ref byveaoqwuwyhaykgjufj",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Diagnostic: action=ping returns provider status (helps debug 402)
    if (action === "ping") {
      return new Response(
        JSON.stringify({
          provider: LOVABLE_API_KEY ? "lovable" : "gemini",
          projectRef,
          hint: LOVABLE_API_KEY ? "Lovable AI Gateway is configured." : "Using Gemini fallback.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log which provider is used
    if (LOVABLE_API_KEY) {
      console.log(`[code-engine] Using Lovable AI Gateway (preferred)`);
    } else {
      console.log(`[code-engine] Using Gemini/Google AI (fallback - LOVABLE_API_KEY not set)`);
    }

    // ============= ACTION: generate (AI code generation with streaming) =============
    if (action === "generate") {
      const messages = body.messages as Array<{ role: string; content: string }>;
      const model = body.model as string | undefined;
      const selectedModel = normalizeLovableModel(model);
      console.log(`[code-engine] generate domain=${domain}, model=${selectedModel}, messages=${messages?.length}`);

      const basePrompt = domainPrompts[domain] || `You are Lunor.AI's expert coding assistant for the "${domain}" domain.`;
      const stackDirective = domain === "app-development"
        ? `
- STACK: HTML + CSS + JS ONLY. Do NOT generate .jsx, .tsx, React, Vue, TypeScript, or any framework. NEVER.
- Return exactly 3 files: index.html, styles.css, script.js
- index.html: <link href="styles.css"> and <script src="script.js"></script>
- Add modern CSS animations (transitions, keyframes, hover effects)
- Include 2-3 images in HTML using: <img src="https://image.pollinations.ai/prompt/URL_ENCODED_DESCRIPTION"> (e.g. prompt=modern%20hero%20illustration)`
        : domain === "web-development"
        ? `
- STACK: HTML + CSS + JS for the client. Do NOT generate .jsx, .tsx, React, Vue, or TypeScript.
- For a single component or small edit, return index.html, styles.css, and script.js.
- When the user asks to build, create, or generate a website or full-stack site, return this project instead:
  src/index.html, src/styles.css, src/app.js, src/server.js, package.json, README.md
- index.html links styles.css and app.js. app.js fetches JSON and renders SEED data when fetch fails so the editor preview still works.
- server.js is Express with cors, express.json(), express.static(__dirname), and the routes app.js calls. No secrets.
- package.json start script is "node src/server.js" with dependencies express and cors.
- Add modern CSS (transitions, hover, gradients) and a responsive layout.
- Include images with picsum or unsplash URLs.`
        : "";
      const systemPrompt = `${basePrompt}

Rules:
- Always use markdown formatting with fenced code blocks and syntax highlighting
- Be concise but thorough
- When generating code, include comments explaining key parts
- If asked to debug, explain what's wrong and provide the fix
- Suggest improvements when you see opportunity
- Prefer modern production stack patterns (component architecture, clean state management, reusable UI)
- Add subtle motion/micro-interactions using CSS transitions/animations when relevant
- Favor visually polished output (spacing, typography hierarchy, color harmony, responsive layout)
- Ensure imports/paths are consistent and runnable

Output contract (critical):
- Return ONLY file blocks (no intro, no outro, no bullet lists, no explanations)
- Use this exact format for every file:
  path/to/file.ext
  \`\`\`language
  // code
  \`\`\`
- Keep file paths stable and unique so they can be auto-applied safely
${stackDirective}`;

      if (!LOVABLE_API_KEY && GOOGLE_AI_API_KEY) {
        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
        for (const m of messages) {
          if (m.role === "system") continue;
          contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] });
        }
        if (contents.length === 0) contents.push({ role: "user", parts: [{ text: "Hello" }] });
        const googleUrl = `${GOOGLE_AI_URL}:streamGenerateContent?key=${encodeURIComponent(GOOGLE_AI_API_KEY)}&alt=sse`;
        const googleResp = await fetch(googleUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
          }),
        });
        if (!googleResp.ok) {
          const text = await googleResp.text();
          console.error(`[code-engine] Google AI error: ${googleResp.status}`, text);
          return new Response(JSON.stringify({ error: "AI service error" }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        let buf = "";
        const dec = new TextDecoder();
        const rd = googleResp.body!.getReader();
        const stream = new ReadableStream({
          async start(ctrl) {
            try {
              while (true) {
                const { done, value } = await rd.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop() || "";
                for (const line of lines) {
                  if (!line.startsWith("data: ")) continue;
                  const j = line.slice(6).trim();
                  if (!j) continue;
                  try {
                    const p = JSON.parse(j);
                    const t = p.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (t) ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`));
                  } catch {}
                }
              }
              if (buf.trim().startsWith("data: ")) {
                try {
                  const p = JSON.parse(buf.slice(6).trim());
                  const t = p.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (t) ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`));
                } catch {}
              }
            } finally { ctrl.close(); }
          },
        });
        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }

      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        const text = await response.text();
        console.error(`[code-engine] AI gateway error: ${status}`, text);

        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({
            error: "AI credits exhausted. Please try again later or contact support.",
          }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ error: "AI service error" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // ============= ACTION: execute (run code with domain-aware runtime) =============
    if (action === "execute") {
      const code = body.code as string | undefined;
      const language = body.language as string;
      console.log(`[code-engine] execute domain=${domain}, language=${language}, codeLen=${code?.length}`);

      if (!code || typeof code !== "string") {
        return new Response(
          JSON.stringify({ error: "No code provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (code.length > 15000) {
        return new Response(
          JSON.stringify({ error: "Code too long (max 15,000 characters)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let output: string[];

      if (NATIVE_LANGUAGES.has(language)) {
        // Native JS/TS execution
        output = executeNatively(code);
      } else {
        // AI-simulated execution for Python, SQL, Solidity, C++, etc.
        output = await simulateWithAI(code, language, domain || "general", apiKey, !LOVABLE_API_KEY && !!GOOGLE_AI_API_KEY);
      }

      return new Response(
        JSON.stringify({ output, runtime: NATIVE_LANGUAGES.has(language) ? "native" : "ai-simulated", language }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: get-environment (return domain environment config) =============
    if (action === "get-environment") {
      console.log(`[code-engine] get-environment domain=${domain}`);

      // Return domain-specific environment metadata
      const envConfig: Record<string, {
        primaryLanguage: string;
        supportedLanguages: string[];
        runtime: string;
      }> = {
        "web-development": { primaryLanguage: "javascript", supportedLanguages: ["javascript", "typescript", "html", "css", "json"], runtime: "native" },
        "app-development": { primaryLanguage: "javascript", supportedLanguages: ["javascript", "typescript", "json"], runtime: "native" },
        "data-science": { primaryLanguage: "python", supportedLanguages: ["python", "javascript", "json"], runtime: "ai-simulated" },
        "cybersecurity": { primaryLanguage: "python", supportedLanguages: ["python", "javascript", "shell"], runtime: "ai-simulated" },
        "cloud-computing": { primaryLanguage: "yaml", supportedLanguages: ["yaml", "json", "shell", "javascript"], runtime: "ai-simulated" },
        "devops": { primaryLanguage: "yaml", supportedLanguages: ["yaml", "shell", "json", "javascript"], runtime: "ai-simulated" },
        "database": { primaryLanguage: "sql", supportedLanguages: ["sql", "javascript", "json"], runtime: "ai-simulated" },
        "iot": { primaryLanguage: "cpp", supportedLanguages: ["cpp", "python", "javascript"], runtime: "ai-simulated" },
        "blockchain": { primaryLanguage: "solidity", supportedLanguages: ["solidity", "javascript", "json"], runtime: "ai-simulated" },
        "ui-ux": { primaryLanguage: "html", supportedLanguages: ["html", "css", "javascript", "json"], runtime: "native" },
        "dsa": { primaryLanguage: "javascript", supportedLanguages: ["javascript", "python", "typescript"], runtime: "native" },
        "system-design": { primaryLanguage: "javascript", supportedLanguages: ["javascript", "json", "yaml"], runtime: "native" },
      };

      const env = envConfig[domain] || { primaryLanguage: "javascript", supportedLanguages: ["javascript"], runtime: "native" };

      return new Response(
        JSON.stringify({ domain, environment: env }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: generate-tests =============
    if (action === "generate-tests") {
      const { code, language, filename, model } = body as { code: string; language: string; filename: string; model: string };
      const selectedModel = normalizeLovableModel(model);
      console.log(`[code-engine] generate-tests lang=${language}, file=${filename}`);

      const testPrompt = `Generate comprehensive unit tests for the following ${language} code. Use appropriate testing frameworks (Jest for JS/TS, pytest for Python, etc.). Include edge cases, error cases, and happy paths. Return ONLY the test code in a single code block.

File: ${filename || "unknown"}
\`\`\`${language}
${code}
\`\`\``;

      if (!LOVABLE_API_KEY && GOOGLE_AI_API_KEY) {
        const url = `${GOOGLE_AI_URL}:streamGenerateContent?key=${encodeURIComponent(GOOGLE_AI_API_KEY)}&alt=sse`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `You are an expert test engineer. Generate thorough, production-quality tests. Use markdown code blocks with syntax highlighting.` }] },
            contents: [{ role: "user", parts: [{ text: testPrompt }] }],
          }),
        });
        if (!resp.ok) {
          return new Response(JSON.stringify({ error: "Test generation failed" }), {
            status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        let buf = "";
        const dec = new TextDecoder();
        const rd = resp.body!.getReader();
        const stream = new ReadableStream({
          async start(ctrl) {
            try {
              while (true) {
                const { done, value } = await rd.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop() || "";
                for (const line of lines) {
                  if (!line.startsWith("data: ")) continue;
                  const j = line.slice(6).trim();
                  if (!j) continue;
                  try {
                    const p = JSON.parse(j);
                    const t = p.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (t) ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`));
                  } catch {}
                }
              }
            } finally { ctrl.close(); }
          },
        });
        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }
      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: `You are an expert test engineer. Generate thorough, production-quality tests. Use markdown code blocks with syntax highlighting.` },
            { role: "user", content: testPrompt },
          ],
          stream: true,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error(`[code-engine] test gen error: ${response.status}`, text);
        return new Response(JSON.stringify({ error: "Test generation failed" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    // ============= ACTION: generate-docs =============
    if (action === "generate-docs") {
      const { code, language, filename, model } = body as { code: string; language: string; filename: string; model: string };
      const selectedModel = normalizeLovableModel(model);
      console.log(`[code-engine] generate-docs lang=${language}, file=${filename}`);

      const docsPrompt = `Generate comprehensive documentation for the following ${language} code. Include:
1. Module/file overview
2. Function/class documentation with parameters, return types, and examples
3. Usage examples
4. Any important notes or caveats

Return the documentation as a well-formatted markdown document.

File: ${filename || "unknown"}
\`\`\`${language}
${code}
\`\`\``;

      if (!LOVABLE_API_KEY && GOOGLE_AI_API_KEY) {
        const url = `${GOOGLE_AI_URL}:streamGenerateContent?key=${encodeURIComponent(GOOGLE_AI_API_KEY)}&alt=sse`;
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `You are a technical documentation expert. Write clear, comprehensive docs with examples.` }] },
            contents: [{ role: "user", parts: [{ text: docsPrompt }] }],
          }),
        });
        if (!resp.ok) {
          return new Response(JSON.stringify({ error: "Documentation generation failed" }), {
            status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        let buf = "";
        const dec = new TextDecoder();
        const rd = resp.body!.getReader();
        const stream = new ReadableStream({
          async start(ctrl) {
            try {
              while (true) {
                const { done, value } = await rd.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop() || "";
                for (const line of lines) {
                  if (!line.startsWith("data: ")) continue;
                  const j = line.slice(6).trim();
                  if (!j) continue;
                  try {
                    const p = JSON.parse(j);
                    const t = p.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (t) ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`));
                  } catch {}
                }
              }
            } finally { ctrl.close(); }
          },
        });
        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }
      const response = await fetch(LOVABLE_AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: `You are a technical documentation expert. Write clear, comprehensive docs with examples.` },
            { role: "user", content: docsPrompt },
          ],
          stream: true,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        console.error(`[code-engine] docs gen error: ${response.status}`, text);
        return new Response(JSON.stringify({ error: "Documentation generation failed" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    // ============= ACTION: autocomplete (ghost text) =============
    if (action === "autocomplete") {
      const { code, language, cursorLine, cursorColumn } = body as { code: string; language: string; cursorLine: number; cursorColumn: number };
      const selectedModel = "google/gemini-2.5-flash-lite";
      console.log(`[code-engine] autocomplete lang=${language}, line=${cursorLine}`);

      const lines = code.split("\n");
      const contextBefore = lines.slice(Math.max(0, cursorLine - 20), cursorLine + 1).join("\n");
      const contextAfter = lines.slice(cursorLine + 1, cursorLine + 5).join("\n");

      try {
        const content = await callAINonStream(
          `You are an intelligent code autocomplete engine. Given code context, predict the next 1-3 lines of code the developer would write. Return ONLY the completion text — no markdown, no explanation, no code fences. Just the raw code to insert.`,
          `Language: ${language}\n\nCode before cursor:\n${contextBefore}\n\nCode after cursor:\n${contextAfter}\n\nComplete the code at the cursor position:`,
          apiKey,
          !LOVABLE_API_KEY && !!GOOGLE_AI_API_KEY
        );
        const suggestion = content.trim();
        const cleaned = suggestion.replace(/^```\w*\n?/, "").replace(/\n?```$/, "").trim();
        return new Response(JSON.stringify({ suggestion: cleaned }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch {
        return new Response(JSON.stringify({ suggestion: "" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ============= ACTION: analyze-code (real-time AI guidance) =============
    if (action === "analyze-code") {
      const { code, language, cursorLine, domain: actionDomain, teachingMode } = body as { code: string; language: string; cursorLine: number; domain: string; teachingMode: boolean };
      const selectedModel = "google/gemini-2.5-flash-lite";
      console.log(`[code-engine] analyze-code lang=${language}, line=${cursorLine}, teachingMode=${!!teachingMode}`);

      const lines = code.split("\n");
      const contextBefore = lines.slice(Math.max(0, cursorLine - 15), cursorLine + 1).join("\n");
      const basePrompt = domainPrompts[actionDomain || domain] || `You are a coding mentor for ${actionDomain || domain}.`;
      const teachingHint = teachingMode
        ? "\n\nTEACHING MODE: The user has made repeated errors. Provide step-by-step guidance, break concepts into small pieces, and suggest a simple exercise or next action."
        : "";

      const analyzePrompt = `As a coding mentor, analyze this ${language} code the user is writing.

Code so far:
\`\`\`${language}
${contextBefore}
\`\`\`

Respond in JSON only:
{
  "intent": "brief description of what the user seems to be building (1 sentence)",
  "suggestion": "next step or fix (1-2 sentences, actionable)",
  "nextLine": "optional: exact next line of code to suggest (or null)",
  "hasError": false,
  "concept": "brief concept name for a visual diagram (e.g. 'HTML button element', 'JavaScript event handler')"
}

If you detect an obvious error (unclosed tag, syntax mistake), set hasError: true and explain in suggestion.
Keep responses concise.${teachingHint}`;

      let content = "{}";
      try {
        content = (await callAINonStream(
          basePrompt + " Respond ONLY with valid JSON. No markdown, no explanation outside JSON.",
          analyzePrompt,
          apiKey,
          !LOVABLE_API_KEY && !!GOOGLE_AI_API_KEY
        )).trim() || "{}";
      } catch {
        return new Response(JSON.stringify({ intent: "", suggestion: "", nextLine: null, hasError: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      let parsed: { intent?: string; suggestion?: string; nextLine?: string | null; hasError?: boolean; concept?: string } = {};
      try {
        parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "")) || {};
      } catch {
        parsed = { intent: "", suggestion: content.slice(0, 200), nextLine: null, hasError: false, concept: "" };
      }

      const concept = parsed.concept || "code concept";
      const diagramUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`educational diagram: ${concept}, clean infographic, developer tutorial style, no watermark`)}?width=500&height=320&nologo=true`;

      return new Response(
        JSON.stringify({
          intent: parsed.intent || "",
          suggestion: parsed.suggestion || "",
          nextLine: parsed.nextLine || null,
          hasError: !!parsed.hasError,
          concept: parsed.concept || "",
          diagramUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: explain-error (AI explanation for errors) =============
    if (action === "explain-error") {
      const { error: codeError, code, language, domain: actionDomain, teachingMode } = body as { error: string; code: string; language: string; domain: string; teachingMode: boolean };
      const selectedModel = "google/gemini-2.5-flash-lite";
      console.log(`[code-engine] explain-error teachingMode=${!!teachingMode}`);

      const basePrompt = domainPrompts[actionDomain || domain] || `You are a coding mentor for ${actionDomain || domain}.`;
      const teachingHint = teachingMode
        ? "\n\nTEACHING MODE: Provide step-by-step guidance. Break the concept into small pieces. Include a simple example. Be encouraging."
        : "";

      const explainPrompt = `The user has this error in their ${language} code:

Error: ${codeError}

Relevant code:
\`\`\`${language}
${(code || "").slice(0, 500)}
\`\`\`

Respond in JSON:
{
  "explanation": "Clear, friendly explanation (2-3 sentences)",
  "fix": "Exact code fix or suggestion",
  "concept": "Brief concept name for diagram (e.g. 'HTML closing tags', 'Flexbox layout')"
}${teachingHint}`;

      let content = "{}";
      try {
        content = (await callAINonStream(
          basePrompt + " Respond ONLY with valid JSON.",
          explainPrompt,
          apiKey,
          !LOVABLE_API_KEY && !!GOOGLE_AI_API_KEY
        )).trim() || "{}";
      } catch {
        return new Response(
          JSON.stringify({ explanation: "Could not get AI explanation.", fix: "", concept: "" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      let parsed: { explanation?: string; fix?: string; concept?: string } = {};
      try {
        parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "")) || {};
      } catch {
        parsed = { explanation: content.slice(0, 300), fix: "", concept: "" };
      }

      const concept = parsed.concept || "code concept";
      const diagramUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`educational diagram explaining ${concept}, clean infographic style, no watermark`)}?width=400&height=300&nologo=true`;

      return new Response(
        JSON.stringify({
          explanation: parsed.explanation || "",
          fix: parsed.fix || "",
          concept: parsed.concept || "",
          diagramUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= ACTION: concept-image (AI generated concept diagram) =============
    if (action === "concept-image") {
      const { concept } = body;
      if (!concept || typeof concept !== "string") {
        return new Response(JSON.stringify({ error: "concept is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(`educational diagram: ${concept}, clean infographic, developer tutorial style, no watermark`)}?width=500&height=350&nologo=true`;
      return new Response(JSON.stringify({ url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============= ACTION: visual-assets (generated image URLs from prompt) =============
    if (action === "visual-assets") {
      const { prompt, domain: visualDomain, count } = body;
      const total = Math.max(1, Math.min(Number(count) || 3, 4));
      if (!prompt || typeof prompt !== "string") {
        return new Response(
          JSON.stringify({ error: "Prompt is required for visual-assets" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const styleHints = [
        "modern UI mockup, glassmorphism, vibrant gradients, clean typography, subtle depth, no watermark",
        "futuristic dashboard interface, animated feel, neon accents, premium product design, no watermark",
        "product hero visual, cinematic lighting, smooth motion aesthetics, high detail, no watermark",
        "app screen concept, minimal and elegant, delightful micro-interactions style, no watermark",
      ];

      const seedBase = Date.now();
      const images = Array.from({ length: total }).map((_, i) => {
        const style = styleHints[i % styleHints.length];
        const finalPrompt = `${prompt}, domain: ${visualDomain || "general"}, ${style}`;
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1280&height=720&seed=${seedBase + i}&nologo=true`;
        return {
          id: `img-${seedBase + i}`,
          caption: `Generated visual ${i + 1}`,
          prompt: finalPrompt,
          url,
        };
      });

      return new Response(
        JSON.stringify({ images }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.error("[code-engine] Unknown action:", action, "keys:", Object.keys(body || {}));
    return new Response(
      JSON.stringify({ error: `Unknown action: ${action ?? "undefined"}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[code-engine] error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
