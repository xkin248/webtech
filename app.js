// ==========================================
// EDUSTREAM MASTER STATE & UI
// ==========================================
const AppState = { 
    user: null, cart: [], xp: 0,
    announcements: [{ id: 1, text: "Welcome to Week 4! Project proposals due Friday.", timestamp: Date.now() - 86400000 }],
    assignments: [ { id: 101, student: "Justin Ngu", task: "React Capstone", status: "Pending" } ],
    logs: [ "[10:42 AM] User logged in.", "[10:45 AM] System backup verified." ],
    users: [ { id: "bcs24020033", name: "Justin", role: "Student" }, { id: "lec01", name: "Dr. Sarah", role: "Lecturer" } ]
};

function showToast(message, type = 'default') {
    const toast = document.createElement('div'); 
    let icon = 'ℹ️'; if(type === 'success') icon = '✅'; if(type === 'error') icon = '❌'; if(type === 'warning') icon = '⚠️'; if(type === 'cart') icon = '🛒';
    toast.innerHTML = `<span style="margin-right: 10px;">${icon}</span> ${message}`;
    toast.style.position = 'fixed'; toast.style.bottom = '30px'; toast.style.right = '30px'; toast.style.background = 'rgba(15, 23, 42, 0.95)'; toast.style.color = '#fff'; toast.style.padding = '16px 32px'; toast.style.borderRadius = '50px'; toast.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.3)'; toast.style.zIndex = '9999'; toast.style.fontWeight = '500'; toast.style.transition = 'all 0.4s'; toast.style.transform = 'translateY(100px)'; toast.style.opacity = '0'; toast.style.display = 'flex'; toast.style.alignItems = 'center';
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; }, 50);
    setTimeout(() => { toast.style.transform = 'translateY(20px)'; toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3500);
}
function timeAgo(dateParam) { const s = Math.round((new Date() - new Date(dateParam)) / 1000); const m = Math.round(s / 60); const h = Math.round(m / 60); if (s < 60) return 'Just now'; if (m < 60) return `${m} min ago`; if (h < 24) return `${h} hour ago`; return 'Yesterday'; }

// ==========================================
// 1. MOBILE MENU & AI CHATBOT INJECTORS
// ==========================================
function initMobileMenu() {
    const nav = document.querySelector('nav');
    const ul = nav.querySelector('.nav-links');
    if(nav && ul) {
        const btn = document.createElement('button');
        btn.className = 'mobile-toggle'; btn.innerHTML = '☰';
        btn.onclick = () => ul.classList.toggle('active');
        nav.insertBefore(btn, ul);
    }
}

function initChatbot() {
    const botHTML = `
    <div id="chatbot-container" style="position:fixed; bottom:30px; left:30px; z-index:9999;">
        <button onclick="toggleChat()" style="width:60px; height:60px; border-radius:50%; background:var(--primary); color:#fff; border:none; font-size:1.5rem; cursor:pointer; box-shadow:0 10px 15px rgba(79,70,229,0.3); transition:transform 0.3s;">🤖</button>
        <div id="chat-window" class="card" style="display:none; position:absolute; bottom:80px; left:0; width:300px; height:400px; padding:1.5rem; flex-direction:column; box-shadow:0 25px 50px rgba(0,0,0,0.15); z-index:10000;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border); padding-bottom:1rem; margin-bottom:1rem;">
                <h3 style="margin:0; font-size:1.2rem;">EduBot AI</h3>
                <button onclick="toggleChat()" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--text-light);">&times;</button>
            </div>
            <div id="chat-messages" style="flex:1; overflow-y:auto; margin-bottom:1rem; display:flex; flex-direction:column; gap:0.5rem; padding-right:5px;">
                <div style="background:rgba(79,70,229,0.1); color:var(--primary-hover); padding:0.8rem; border-radius:12px 12px 12px 0; font-size:0.9rem; align-self:flex-start;">Hello! I'm your AI assistant. How can I help?</div>
            </div>
            <div style="display:flex; gap:0.5rem;">
                <input type="text" id="chat-input" placeholder="Ask something..." style="padding:0.8rem; font-size:0.9rem;" onkeypress="if(event.key==='Enter') sendChat()">
                <button class="btn btn-primary" style="padding:0.5rem 1rem;" onclick="sendChat()">➤</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', botHTML);
}

window.toggleChat = function() { const w = document.getElementById('chat-window'); w.style.display = w.style.display === 'none' || w.style.display === '' ? 'flex' : 'none'; }
window.sendChat = function() {
    const input = document.getElementById('chat-input'); const msg = input.value.trim(); if(!msg) return;
    const c = document.getElementById('chat-messages');
    c.innerHTML += `<div style="background:var(--primary); color:#fff; padding:0.8rem; border-radius:12px 12px 0 12px; font-size:0.9rem; align-self:flex-end; max-width:85%; margin-top:0.5rem;">${msg}</div>`;
    input.value = ''; c.scrollTop = c.scrollHeight;
    
    setTimeout(() => {
        let reply = "That's a great question! I recommend checking your latest module notes.";
        if(msg.toLowerCase().includes("html")) reply = "HTML provides the structure of a webpage using semantic tags.";
        if(msg.toLowerCase().includes("react")) reply = "React is a JavaScript library for building component-based user interfaces.";
        c.innerHTML += `<div style="background:rgba(79,70,229,0.1); color:var(--primary-hover); padding:0.8rem; border-radius:12px 12px 12px 0; font-size:0.9rem; align-self:flex-start; max-width:85%; margin-top:0.5rem;">${reply}</div>`;
        c.scrollTop = c.scrollHeight;
    }, 800);
}

// ==========================================
// 2. GAMIFICATION (XP & CONFETTI)
// ==========================================
function shootConfetti() {
    const colors = ['#4f46e5', '#ec4899', '#10b981', '#fbbf24'];
    for(let i=0; i<40; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'fixed'; conf.style.left = '50%'; conf.style.top = '50%';
        conf.style.width = '8px'; conf.style.height = '8px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        conf.style.zIndex = '10000'; conf.style.pointerEvents = 'none';
        document.body.appendChild(conf);

        const angle = Math.random() * Math.PI * 2; const velocity = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * velocity + (Math.random()-0.5)*50; const ty = Math.sin(angle) * velocity + (Math.random()-0.5)*50 - 150;

        conf.animate([ { transform: 'translate(0,0) rotate(0deg)', opacity: 1 }, { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random()*360}deg)`, opacity: 1, offset: 0.8 }, { transform: `translate(${tx}px, ${ty+200}px) rotate(${Math.random()*720}deg)`, opacity: 0 } ], { duration: 1500 + Math.random()*1000, easing: 'cubic-bezier(.37,0,.63,1)' });
        setTimeout(()=>conf.remove(), 2500);
    }
}

function addXP(amount) {
    if(!AppState.user || AppState.user.role !== 'student') return;
    AppState.xp = (parseInt(AppState.xp) || 0) + amount;
    localStorage.setItem(`edustream_xp_${AppState.user.id}`, AppState.xp);
    showToast(`🌟 +${amount} XP Gained!`, 'success');
    shootConfetti(); updateXPUI();
}

function updateXPUI() {
    const xpText = document.getElementById('xp-text'); const xpBar = document.getElementById('xp-bar-fill');
    if(xpText && xpBar) {
        let level = Math.floor(AppState.xp / 100) + 1; let currentLevelXP = AppState.xp % 100;
        xpText.innerText = `${currentLevelXP} / 100 XP`;
        xpText.previousElementSibling.innerText = `Level ${level} Scholar`;
        xpBar.style.width = `${currentLevelXP}%`;
    }
}

// ==========================================
// 3. LIVE SEARCH FILTER (BOOKSTORE)
// ==========================================
window.filterBooks = function() {
    const term = document.getElementById('search-bar').value.toLowerCase();
    const books = document.querySelectorAll('.book-card');
    books.forEach(book => {
        const title = book.querySelector('h3').innerText.toLowerCase();
        if(title.includes(term)) {
            book.style.display = 'flex'; book.style.opacity = '1';
        } else {
            book.style.display = 'none'; book.style.opacity = '0';
        }
    });
}

// ==========================================
// UI/UX: DARK MODE & 3D PHYSICS
// ==========================================
function toggleDarkMode() {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'dark') { body.removeAttribute('data-theme'); localStorage.setItem('edustream_theme', 'light'); document.getElementById('theme-icon').innerText = '🌙';
    } else { body.setAttribute('data-theme', 'dark'); localStorage.setItem('edustream_theme', 'dark'); document.getElementById('theme-icon').innerText = '☀️'; }
}
function loadTheme() { if (localStorage.getItem('edustream_theme') === 'dark') { document.body.setAttribute('data-theme', 'dark'); const i = document.getElementById('theme-icon'); if (i) i.innerText = '☀️'; } }

function init3DPhysics() {
    const cards = document.querySelectorAll('.card:not(.draggable-task)');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const cx = rect.width / 2; const cy = rect.height / 2;
            const rX = ((y - cy) / cy) * -4; const rY = ((x - cx) / cx) * 4;
            card.style.transform = `perspective(1000px) scale(1.02) rotateX(${rX}deg) rotateY(${rY}deg)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`; });
    });
}

// ==========================================
// AUTHENTICATION
// ==========================================
const validUsers = { 'bcs24020033': { name: 'Justin', password: 'pass123', role: 'student' }, 'lec01': { name: 'Dr. Sarah', password: 'pass123', role: 'lecturer' }, 'admin01': { name: 'Admin', password: 'pass123', role: 'admin' } };
function handleLogin(e) {
    e.preventDefault(); const btn = e.target.querySelector('button'); const orig = btn.innerText; btn.innerText = 'Authenticating...'; btn.disabled = true; btn.style.opacity = '0.7';
    setTimeout(() => {
        const id = document.getElementById('loginId').value.trim().toLowerCase(); const pw = document.getElementById('password').value; const r = document.getElementById('roleSelect').value; const u = validUsers[id];
        if (u && u.password === pw && u.role === r) { localStorage.setItem('edustream_session', JSON.stringify({ id, name: u.name, role: u.role })); window.location.href = `${u.role}-dashboard.html`; } 
        else { showToast("Invalid Credentials.", 'error'); btn.innerText = orig; btn.disabled = false; btn.style.opacity = '1'; }
    }, 800);
}
function handleLogout() { localStorage.removeItem('edustream_session'); window.location.href = 'portal.html'; }
function checkAuthStatus() {
    const s = localStorage.getItem('edustream_session'); const cur = window.location.pathname.split('/').pop() || 'index.html'; const auth = document.querySelectorAll('.auth-required'); const dLink = document.getElementById('dynamic-dash-link'); const nBtn = document.getElementById('nav-auth-btn');
    if (s) {
        AppState.user = JSON.parse(s); const r = AppState.user.role;
        AppState.xp = localStorage.getItem(`edustream_xp_${AppState.user.id}`) || 0; updateXPUI();
        
        auth.forEach(i => i.style.display = 'block'); if (dLink) dLink.href = `${r}-dashboard.html`;
        if (nBtn) { nBtn.innerText = 'Sign Out'; nBtn.className = 'btn btn-outline'; nBtn.onclick = handleLogout; nBtn.href = '#'; }
        const g = document.getElementById('user-greeting'); if (g) g.innerText = AppState.user.name;
        if (cur === 'portal.html') window.location.href = `${r}-dashboard.html`; else if (cur.includes('-dashboard.html') && !cur.startsWith(r)) window.location.href = `${r}-dashboard.html`;
        if (cur === 'lecturer-dashboard.html') { renderAnnouncements(); renderAssignments(); } if (cur === 'admin-dashboard.html') { renderLogs(); renderUsers(); }
    } else {
        auth.forEach(i => i.style.display = 'none'); if (nBtn) { nBtn.innerText = 'Sign In'; nBtn.className = 'btn btn-primary'; nBtn.onclick = null; nBtn.href = 'portal.html'; }
        if (cur.includes('-dashboard.html') || cur === 'forum.html') window.location.href = 'portal.html';
    }
}

// ==========================================
// DRAG-AND-DROP KANBAN PLANNER
// ==========================================
function allowDrop(e) { e.preventDefault(); e.currentTarget.style.background = "rgba(79, 70, 229, 0.05)"; }
function drag(e) { e.dataTransfer.setData("text", e.target.id); e.target.style.opacity = "0.5"; }
function drop(e) {
    e.preventDefault(); e.currentTarget.style.background = "transparent"; const id = e.dataTransfer.getData("text"); const el = document.getElementById(id); el.style.opacity = "1"; const z = e.target.closest('.drop-zone');
    if (z) { z.appendChild(el); if (z.id === 'completed-zone') { el.style.borderLeft = "4px solid var(--success)"; addXP(50); } else if (z.id === 'progress-zone') el.style.borderLeft = "4px solid var(--primary)"; else el.style.borderLeft = "none"; saveKanbanState(); updateKanbanCounters(); }
}
document.addEventListener('dragleave', e => { if (e.target.classList.contains('drop-zone')) e.target.style.background = "transparent"; });
function updateKanbanCounters() { ['todo-zone', 'progress-zone', 'completed-zone'].forEach(id => { const z = document.getElementById(id); if (z) { const c = z.querySelectorAll('.draggable-task').length; const b = z.parentElement.querySelector('h4 span'); if (b) b.innerText = c; } }); }
function saveKanbanState() { if (!AppState.user) return; const s = { t: document.getElementById('todo-zone')?.innerHTML||'', p: document.getElementById('progress-zone')?.innerHTML||'', c: document.getElementById('completed-zone')?.innerHTML||'' }; localStorage.setItem(`kanban_${AppState.user.id}`, JSON.stringify(s)); }
function loadKanbanState() { if (!AppState.user) return; const s = localStorage.getItem(`kanban_${AppState.user.id}`); if (s) { const st = JSON.parse(s); const t = document.getElementById('todo-zone'); const p = document.getElementById('progress-zone'); const c = document.getElementById('completed-zone'); if(t&&st.t) t.innerHTML=st.t; if(p&&st.p) p.innerHTML=st.p; if(c&&st.c) c.innerHTML=st.c; updateKanbanCounters(); } }

// ==========================================
// COURSE NOTEPAD, SHOPPING CART, QUIZ
// ==========================================
let curMod = '';
function openNotepad(id) { if (!AppState.user) return showToast("Sign in required.", 'warning'); curMod = id; const m = document.getElementById('notepad-modal'); if(m) { m.querySelector('textarea').value = localStorage.getItem(`notes_${AppState.user.id}_${id}`) || ''; m.style.display = 'flex'; setTimeout(() => m.style.opacity = '1', 10); } }
function closeNotepad() { const m = document.getElementById('notepad-modal'); if(m) { m.style.opacity = '0'; setTimeout(() => m.style.display = 'none', 300); } }
function saveNotepad() { localStorage.setItem(`notes_${AppState.user.id}_${curMod}`, document.getElementById('notepad-text').value); showToast("Notes saved!", 'success'); closeNotepad(); }
function simulateDownload(n) { showToast(`Generating ${n}.pdf...`, 'info'); setTimeout(() => showToast(`'${n}.pdf' downloaded!`, 'success'), 2000); }

function loadCart() { const s = localStorage.getItem('cart'); if(s) AppState.cart = JSON.parse(s); }
function saveCart() { localStorage.setItem('cart', JSON.stringify(AppState.cart)); }
function addToCart(id, t, p) { AppState.cart.push({ id, title: t, price: p }); saveCart(); updateCartBadge(); renderCartUI(); showToast(`Added "${t}"`, 'cart'); }
function removeFromCart(i) { AppState.cart.splice(i, 1); saveCart(); updateCartBadge(); renderCartUI(); }
function updateCartBadge() { const b = document.getElementById('cart-badge'); if (b) { b.innerText = AppState.cart.length; b.style.display = AppState.cart.length > 0 ? 'inline-block' : 'none'; } }
function renderCartUI() { 
    const c = document.getElementById('cart-items-container'); const t = document.getElementById('cart-total'); if (!c || !t) return; 
    if (AppState.cart.length === 0) { c.innerHTML = `<div style="text-align:center; padding:2rem 0; color:var(--text-light);">🛒<br>Empty.</div>`; t.innerText = 'RM 0.00'; return; } 
    let tot = 0; c.innerHTML = AppState.cart.map((i, x) => { tot += i.price; return `<div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--glass-border);"><div><strong style="display:block;">${i.title}</strong><span style="color:var(--primary); font-weight:800;">RM ${i.price.toFixed(2)}</span></div><button onclick="removeFromCart(${x})" style="background:none;border:none;cursor:pointer;">&times;</button></div>`; }).join(''); t.innerText = `RM ${tot.toFixed(2)}`; 
}
const API = { checkout: () => { if (!AppState.cart.length) return showToast("Cart empty", 'warning'); const m = document.createElement('div'); m.className = 'modal-overlay'; m.style.display = 'flex'; m.innerHTML = `<div class="card" style="text-align:center;"><h3>Checkout</h3><p>Total: <strong>RM ${AppState.cart.reduce((s,i)=>s+i.price,0).toFixed(2)}</strong></p><button class="btn btn-primary" id="pay-btn" style="width:100%;margin-top:10px;">Pay</button><button class="btn btn-outline" style="width:100%;margin-top:10px;" onclick="this.closest('.modal-overlay').remove()">Cancel</button></div>`; document.body.appendChild(m); setTimeout(() => m.style.opacity = '1', 10); document.getElementById('pay-btn').onclick = function() { this.innerText = "Processing..."; this.disabled = true; setTimeout(() => { m.remove(); AppState.cart = []; saveCart(); updateCartBadge(); renderCartUI(); showToast("Payment Successful!", 'success'); }, 1500); }; } };

let cQ = 0, sc = 0, sO = null; const qD = [{q:"What is HTML used for?", opts:["Styling","Structure","Logic","DB"], a:1}, {q:"CSS changes background?", opts:["color","bgcolor","background-color","paint"], a:2}];
function openQuiz() { cQ=0; sc=0; const m = document.getElementById('quiz-modal'); if(m) { m.style.display='flex'; setTimeout(()=>m.style.opacity='1',10); ldQ(); } }
function closeQuiz() { const m = document.getElementById('quiz-modal'); if(m) { m.style.opacity='0'; setTimeout(()=>m.style.display='none',300); } }
function ldQ() { sO = null; const q = qD[cQ]; document.getElementById('quiz-progress').innerText = `${cQ+1}/${qD.length}`; document.getElementById('question-text').innerText = q.q; const c = document.getElementById('options-container'); c.innerHTML = ''; q.opts.forEach((o,i) => { const b = document.createElement('button'); b.className = 'btn btn-outline'; b.style.width='100%'; b.style.marginBottom='1rem'; b.innerText = o; b.onclick = () => { sO=i; c.querySelectorAll('button').forEach(btn=>{btn.style.background='transparent'; btn.style.color='var(--text-dark)';}); b.style.background='var(--primary)'; b.style.color='#fff'; }; c.appendChild(b); }); document.getElementById('next-btn').innerText = cQ===qD.length-1?"Finish":"Next"; }
function nxtQ() { if (sO === null) return; if (sO === qD[cQ].a) sc++; cQ++; if (cQ < qD.length) ldQ(); else { closeQuiz(); showToast(`Quiz Complete! Scored ${Math.round((sc/qD.length)*100)}%`, 'success'); addXP(100); } }

function openTopicModal() { const m = document.getElementById('topic-modal'); if(m) { m.style.display='flex'; setTimeout(()=>m.style.opacity='1',10); } }
function closeTopicModal() { const m = document.getElementById('topic-modal'); if(m) { m.style.opacity='0'; setTimeout(()=>{m.style.display='none'; document.getElementById('topic-title').value=''; document.getElementById('topic-body').value='';},300); } }
function submitTopic() { const t = document.getElementById('topic-title').value.trim(); const b = document.getElementById('topic-body').value.trim(); if (!t) return; closeTopicModal(); showToast("Posted!", 'success'); const c = document.getElementById('forum-posts-container'); if (c) { const d = document.createElement('div'); d.className = 'card'; d.style.marginBottom = '1.5rem'; d.innerHTML = `<div style="display:flex; justify-content:space-between;"><h3>${t}</h3><button class="btn btn-danger" onclick="this.closest('.card').remove()">Del</button></div><div style="color:var(--text-light); margin-top:0.5rem;">By ${AppState.user.name}</div><hr style="margin:1rem 0;"><p>${b}</p>`; c.insertBefore(d, c.firstChild); } }

// Admin/Lecturer Renders
function renderAnnouncements() { const c = document.getElementById('announcements-feed'); if (c) c.innerHTML = AppState.announcements.map(a => `<div class="card" style="padding:1.5rem; margin-bottom:1rem; border-left:4px solid var(--secondary);"><p>${a.text}</p><span style="font-size:0.75rem; color:var(--text-light);">Posted ${timeAgo(a.timestamp)}</span></div>`).join(''); }
function renderAssignments() { const c = document.getElementById('assignments-feed'); if (!c) return; if (!AppState.assignments.length) return c.innerHTML = '<p style="text-align:center;">All caught up!</p>'; c.innerHTML = AppState.assignments.map(a => `<div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:1.2rem; margin-bottom:1rem;"><div><strong>${a.student}</strong><br><span style="font-size:0.85rem;">${a.task}</span></div><button class="btn btn-outline" onclick="gradeAssignment(${a.id})">Grade</button></div>`).join(''); }
function gradeAssignment(id) { const g = prompt("Enter grade (0-100):"); if (g && !isNaN(g) && g >= 0 && g <= 100) { AppState.assignments = AppState.assignments.filter(a => a.id !== id); renderAssignments(); showToast(`Graded: ${g}`, 'success'); } }
function renderLogs() { const c = document.getElementById('logs-feed'); if (c) c.innerHTML = AppState.logs.map(l => `<div style="font-family:monospace; color:${l.includes('ERROR')||l.includes('ALERT')?'var(--danger)':'inherit'}; border-bottom:1px solid var(--glass-border); padding:0.5rem 0;">${l}</div>`).join(''); }
function renderUsers() { const c = document.getElementById('users-feed'); if (c) c.innerHTML = AppState.users.map(u => `<div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:1.2rem; margin-bottom:1rem;"><div><strong>${u.name}</strong> <span class="badge badge-primary">${u.role}</span><br><span style="font-size:0.8rem;">ID: ${u.id}</span></div><button class="btn btn-danger" onclick="banUser('${u.id}')">Ban</button></div>`).join(''); }
function banUser(id) { if(confirm(`Ban user ${id}?`)) { AppState.users = AppState.users.filter(u => u.id !== id); renderUsers(); AppState.logs.unshift(`[${new Date().toLocaleTimeString()}] ALERT: Banned '${id}'`); renderLogs(); showToast(`Banned.`, 'success'); } }

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadTheme(); loadCart(); updateCartBadge(); renderCartUI(); checkAuthStatus(); loadKanbanState(); init3DPhysics();
    initMobileMenu(); initChatbot();
    const loginForm = document.getElementById('loginForm'); if (loginForm) loginForm.onsubmit = handleLogin;
});