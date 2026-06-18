import { supabase } from './supabase.js';

// ── DOM refs ──────────────────────────────────────────────────────────────────

const authScreen  = document.getElementById('auth-screen');
const boardScreen = document.getElementById('board-screen');
const userEmailEl = document.getElementById('user-email');
const authError   = document.getElementById('auth-error');

// ── Auth ──────────────────────────────────────────────────────────────────────

function showAuth()  { authScreen.classList.remove('hidden'); boardScreen.classList.add('hidden'); }
function showBoard() { authScreen.classList.add('hidden');    boardScreen.classList.remove('hidden'); }

function showError(msg) {
  authError.textContent = msg;
  authError.classList.remove('hidden');
}
function clearError() { authError.classList.add('hidden'); authError.textContent = ''; }

function showBoardError(msg) {
  const existing = document.getElementById('board-error');
  if (existing) existing.remove();
  const el = document.createElement('p');
  el.id = 'board-error';
  el.style.cssText = 'color:#e53935;font-size:0.85rem;padding:8px 24px;';
  el.textContent = '오류: ' + msg;
  document.getElementById('board').before(el);
  setTimeout(() => el.remove(), 5000);
}

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    userEmailEl.textContent = session.user.email ?? session.user.user_metadata?.user_name ?? '';
    showBoard();
    loadCards();
  } else {
    // SIGNED_OUT 또는 세션 없음 → 로그인 화면
    showAuth();
    // OAuth 리다이렉트 후 URL 해시 제거
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
  }
});

document.getElementById('btn-google').addEventListener('click', async () => {
  clearError();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.href }
  });
  if (error) showError(error.message);
});

document.getElementById('btn-github').addEventListener('click', async () => {
  clearError();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: location.href }
  });
  if (error) showError(error.message);
});

document.getElementById('btn-login').addEventListener('click', async (e) => {
  e.preventDefault();
  clearError();
  const email    = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value;
  if (!email || !password) return showError('이메일과 비밀번호를 입력해주세요.');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) showError(error.message);
});

document.getElementById('btn-signup').addEventListener('click', async () => {
  clearError();
  const email    = document.getElementById('input-email').value.trim();
  const password = document.getElementById('input-password').value;
  if (!email || !password) return showError('이메일과 비밀번호를 입력해주세요.');
  if (password.length < 6)  return showError('비밀번호는 6자 이상이어야 합니다.');

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      showError('이미 해당 이메일과 연동된 소셜 계정이 있습니다. 소셜 로그인을 이용해주세요.');
    } else {
      showError(error.message);
    }
    return;
  }
  // identities가 비어있으면 이미 존재하는 계정 (Supabase 중복 가입 방지 동작)
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    showError('이미 해당 이메일과 연동된 소셜 계정이 있습니다. 소셜 로그인을 이용해주세요.');
    return;
  }
  showError('확인 이메일을 발송했습니다. 메일함을 확인해주세요.');
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabase.auth.signOut({ scope: 'local' });
  cards = [];
  clearError();
});

// ── State ─────────────────────────────────────────────────────────────────────

let cards = [];

async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

// ── DB Operations ─────────────────────────────────────────────────────────────

async function loadCards() {
  const user = await getCurrentUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('cards')
    .select('id, user_id, title, "column", position, created_at')
    .eq('user_id', user.id)
    .order('created_at');

  if (error) { console.error('loadCards error:', error); showBoardError(error.message); return; }
  cards = data;
  renderBoard();
}

async function addCard(title, column) {
  const trimmed = title.trim();
  if (!trimmed) return;

  const user = await getCurrentUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('cards')
    .insert({ title: trimmed, column, user_id: user.id })
    .select('id, user_id, title, "column", position, created_at')
    .single();

  if (error) { console.error('addCard error:', error); showBoardError(error.message); return; }
  cards.push(data);
  renderBoard();
}

async function deleteCard(id) {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) { console.error('deleteCard error:', error); showBoardError(error.message); return; }
  cards = cards.filter(c => c.id !== id);
  renderBoard();
}

async function moveCard(id, targetColumn) {
  const card = cards.find(c => c.id === id);
  if (!card || card.column === targetColumn) return;

  const { error } = await supabase.from('cards').update({ column: targetColumn }).eq('id', id);
  if (error) { console.error('moveCard error:', error); showBoardError(error.message); return; }
  card.column = targetColumn;
  renderBoard();
}

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderBoard() {
  ['todo', 'inprogress', 'done'].forEach(col => {
    const list  = document.getElementById(`list-${col}`);
    const badge = document.getElementById(`badge-${col}`);
    const colCards = cards.filter(c => c.column === col);

    list.innerHTML = '';
    colCards.forEach(card => list.appendChild(createCardEl(card)));
    badge.textContent = colCards.length;
  });
}

function createCardEl(card) {
  const li = document.createElement('li');
  li.className = 'card';
  li.draggable = true;
  li.dataset.id = card.id;

  const text = document.createElement('span');
  text.className = 'card-text';
  text.textContent = card.title;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '&times;';
  deleteBtn.title = '카드 삭제';
  deleteBtn.addEventListener('click', () => deleteCard(card.id));

  li.appendChild(text);
  li.appendChild(deleteBtn);
  li.addEventListener('dragstart', onDragStart);
  li.addEventListener('dragend', onDragEnd);

  return li;
}

// ── Drag and Drop ─────────────────────────────────────────────────────────────

function onDragStart(e) {
  e.dataTransfer.setData('text/plain', e.currentTarget.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
  requestAnimationFrame(() => e.currentTarget.classList.add('dragging'));
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
}

function onDragOver(e)  { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
function onDragEnter(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }

function onDragLeave(e) {
  if (e.currentTarget.contains(e.relatedTarget)) return;
  e.currentTarget.classList.remove('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const id = e.dataTransfer.getData('text/plain');
  const targetColumn = e.currentTarget.dataset.column;
  if (id && targetColumn) moveCard(id, targetColumn);
}

// ── Event Binding ─────────────────────────────────────────────────────────────

document.querySelectorAll('.column').forEach(col => {
  col.addEventListener('dragover',  onDragOver);
  col.addEventListener('dragenter', onDragEnter);
  col.addEventListener('dragleave', onDragLeave);
  col.addEventListener('drop',      onDrop);
});

document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const col   = btn.dataset.column;
    const input = document.querySelector(`.card-input[data-column="${col}"]`);
    addCard(input.value, col);
    input.value = '';
    input.focus();
  });
});

document.querySelectorAll('.card-input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      addCard(input.value, input.dataset.column);
      input.value = '';
    }
  });
});
