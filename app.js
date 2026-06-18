import { supabase } from './supabase.js';

// ── DOM refs ──────────────────────────────────────────────────────────────────

const authScreen        = document.getElementById('auth-screen');
const boardScreen       = document.getElementById('board-screen');
const userEmailEl       = document.getElementById('user-email');
const authError         = document.getElementById('auth-error');
const shareCodeEl       = document.getElementById('share-code');
const copyCodeBtn       = document.getElementById('btn-copy-code');
const currentBoardName  = document.getElementById('current-board-name');
const historyModal      = document.getElementById('history-modal');
const historyList       = document.getElementById('history-list');
const createBoardModal  = document.getElementById('create-board-modal');
const joinBoardModal    = document.getElementById('join-board-modal');
const joinError         = document.getElementById('join-error');
const createBoardError  = document.getElementById('create-board-error');

// ── 화면 전환 ─────────────────────────────────────────────────────────────────

function showAuth()  { authScreen.classList.remove('hidden'); boardScreen.classList.add('hidden'); }
function showBoard() { authScreen.classList.add('hidden');    boardScreen.classList.remove('hidden'); }

function showError(msg) { authError.textContent = msg; authError.classList.remove('hidden'); }
function clearError()   { authError.classList.add('hidden'); authError.textContent = ''; }

function showBoardError(msg) {
  const existing = document.getElementById('board-error');
  if (existing) existing.remove();
  const el = document.createElement('p');
  el.id = 'board-error';
  el.style.cssText = 'color:#e53935;font-size:0.85rem;padding:6px 24px;background:#fff3f3;';
  el.textContent = '오류: ' + msg;
  document.getElementById('board').before(el);
  setTimeout(() => el.remove(), 5000);
}

// ── State ─────────────────────────────────────────────────────────────────────

let cards           = [];
let currentBoardId  = null;
let currentUser     = null;
let realtimeChannel = null;
let myBoards        = [];  // 내가 owner인 보드 목록
let joinedBoards    = [];  // 내가 멤버로 참여한 보드 목록

// ── Auth 이벤트 ───────────────────────────────────────────────────────────────

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    userEmailEl.textContent = session.user.email ?? session.user.user_metadata?.user_name ?? '';
    showBoard();
    initBoard(session.user);
  } else {
    showAuth();
    cards = []; currentBoardId = null; myBoards = []; joinedBoards = [];
    clearError();
    if (window.location.hash) history.replaceState(null, '', window.location.pathname);
  }
});

document.getElementById('btn-google').addEventListener('click', async () => {
  clearError();
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.href } });
  if (error) showError(error.message);
});

document.getElementById('btn-github').addEventListener('click', async () => {
  clearError();
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: location.href } });
  if (error) showError(error.message);
});

document.getElementById('btn-login').addEventListener('click', async (e) => {
  e.preventDefault(); clearError();
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
    } else { showError(error.message); }
    return;
  }
  if (data.user?.identities?.length === 0) {
    showError('이미 해당 이메일과 연동된 소셜 계정이 있습니다. 소셜 로그인을 이용해주세요.');
    return;
  }
  showError('확인 이메일을 발송했습니다. 메일함을 확인해주세요.');
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  await supabase.auth.signOut({ scope: 'local' });
  if (realtimeChannel) { await supabase.removeChannel(realtimeChannel); realtimeChannel = null; }
});

// ── Board 초기화 ──────────────────────────────────────────────────────────────

async function initBoard(user) {
  currentUser = user;

  // 내가 owner인 보드 조회
  const { data: ownedBoards } = await supabase
    .from('boards')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at');

  myBoards = ownedBoards ?? [];

  // 내가 멤버로 참여한 보드 조회
  const { data: memberships } = await supabase
    .from('board_members')
    .select('board_id, joined_at, boards(*)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  joinedBoards = (memberships ?? []).map(m => m.boards).filter(Boolean);

  // 기본 보드: 내 소유 보드 중 첫 번째, 없으면 자동 생성
  let defaultBoard = myBoards[0] ?? null;
  if (!defaultBoard) {
    const { data: newBoard, error } = await supabase
      .from('boards')
      .insert({ owner_id: user.id, name: 'My Board', max_members: 10, owner_email: user.email ?? user.user_metadata?.user_name ?? '' })
      .select().single();
    if (error) { showBoardError(error.message); return; }
    defaultBoard = newBoard;
    myBoards = [newBoard];
  }

  renderRoomBar();
  await switchBoard(defaultBoard);
}

// ── 보드 전환 ─────────────────────────────────────────────────────────────────

async function switchBoard(board) {
  if (realtimeChannel) { await supabase.removeChannel(realtimeChannel); realtimeChannel = null; }

  currentBoardId = board.id;
  currentBoardName.textContent = board.name;

  // 내 소유 보드면 공유코드 표시
  const isOwner = board.owner_id === currentUser.id;
  shareCodeEl.textContent = board.share_code;
  shareCodeEl.classList.toggle('hidden', !isOwner);
  copyCodeBtn.classList.toggle('hidden', !isOwner);

  renderRoomBar();
  renderBoardInfo(board, isOwner);
  await loadCards();
  subscribeRealtime();
}

function renderBoardInfo(board, isOwner) {
  const date = new Date(board.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('info-board-name').textContent  = board.name;
  document.getElementById('info-board-date').textContent  = date;
  document.getElementById('info-board-owner').textContent = board.owner_email ?? '—';
  document.getElementById('info-board-role').textContent  = isOwner ? '소유자' : '멤버';
}

// ── 방 목록 렌더링 ────────────────────────────────────────────────────────────

function renderRoomBar() {
  const roomList = document.getElementById('room-list');
  const allBoards = [
    ...myBoards.map(b => ({ ...b, role: 'owner' })),
    ...joinedBoards.map(b => ({ ...b, role: 'member' })),
  ];

  if (!allBoards.length) {
    roomList.innerHTML = '<span class="room-empty">참여 중인 보드가 없습니다.</span>';
    return;
  }

  roomList.innerHTML = allBoards.map(b => `
    <button
      class="room-chip ${b.id === currentBoardId ? 'active' : ''}"
      data-board-id="${b.id}"
      title="${b.role === 'owner' ? '내 보드' : '참여 보드'}"
    >
      ${b.role === 'owner' ? '👑 ' : ''}${b.name}
    </button>
  `).join('');

  // 보드 참여 버튼 추가
  roomList.innerHTML += `<button id="btn-open-join" class="room-join-btn">+ 코드로 참여</button>`;

  roomList.querySelectorAll('.room-chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const boardId = chip.dataset.boardId;
      const board = [...myBoards, ...joinedBoards].find(b => b.id === boardId);
      if (board) await switchBoard(board);
    });
  });

  document.getElementById('btn-open-join')?.addEventListener('click', () => {
    joinBoardModal.classList.remove('hidden');
    joinError.classList.add('hidden');
    document.getElementById('input-join-code').value = '';
  });
}

// ── 공유코드 복사 ─────────────────────────────────────────────────────────────

copyCodeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(shareCodeEl.textContent).then(() => {
    copyCodeBtn.textContent = '복사됨!';
    setTimeout(() => copyCodeBtn.textContent = '복사', 2000);
  });
});

// ── 공유코드 생성 모달 ────────────────────────────────────────────────────────

document.getElementById('btn-create-board').addEventListener('click', () => {
  createBoardModal.classList.remove('hidden');
  document.getElementById('created-result').classList.add('hidden');
  createBoardError.classList.add('hidden');
  document.getElementById('input-board-name').value = '';
  document.getElementById('input-max-members').value = '5';
});

document.getElementById('btn-close-create').addEventListener('click', () => {
  createBoardModal.classList.add('hidden');
});

createBoardModal.addEventListener('click', e => {
  if (e.target === createBoardModal) createBoardModal.classList.add('hidden');
});

document.getElementById('btn-confirm-create').addEventListener('click', async () => {
  const name       = document.getElementById('input-board-name').value.trim();
  const maxMembers = parseInt(document.getElementById('input-max-members').value, 10);
  createBoardError.classList.add('hidden');

  if (!name)                        { createBoardError.textContent = '방 이름을 입력해주세요.'; createBoardError.classList.remove('hidden'); return; }
  if (!maxMembers || maxMembers < 2){ createBoardError.textContent = '최대 인원은 2명 이상이어야 합니다.'; createBoardError.classList.remove('hidden'); return; }

  const { data: newBoard, error } = await supabase
    .from('boards')
    .insert({ owner_id: currentUser.id, name, max_members: maxMembers, owner_email: currentUser.email ?? currentUser.user_metadata?.user_name ?? '' })
    .select().single();

  if (error) { createBoardError.textContent = error.message; createBoardError.classList.remove('hidden'); return; }

  myBoards.push(newBoard);
  document.getElementById('created-code').textContent = newBoard.share_code;
  document.getElementById('created-result').classList.remove('hidden');
  document.getElementById('btn-confirm-create').classList.add('hidden');
  renderRoomBar();
});

document.getElementById('btn-copy-created').addEventListener('click', () => {
  const code = document.getElementById('created-code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('btn-copy-created');
    btn.textContent = '복사됨!';
    setTimeout(() => btn.textContent = '복사', 2000);
  });
});

document.getElementById('btn-go-board').addEventListener('click', async () => {
  const code = document.getElementById('created-code').textContent;
  const board = myBoards.find(b => b.share_code === code);
  createBoardModal.classList.add('hidden');
  document.getElementById('btn-confirm-create').classList.remove('hidden');
  if (board) await switchBoard(board);
});

// ── 보드 참여 모달 ────────────────────────────────────────────────────────────

document.getElementById('btn-close-join').addEventListener('click', () => {
  joinBoardModal.classList.add('hidden');
});

joinBoardModal.addEventListener('click', e => {
  if (e.target === joinBoardModal) joinBoardModal.classList.add('hidden');
});

document.getElementById('btn-confirm-join').addEventListener('click', () => joinBoard());
document.getElementById('input-join-code').addEventListener('keydown', e => {
  if (e.key === 'Enter') joinBoard();
});

async function joinBoard() {
  const code = document.getElementById('input-join-code').value.trim().toUpperCase();
  joinError.classList.add('hidden');

  if (!code || code.length !== 6) { joinError.textContent = '6자리 공유코드를 입력해주세요.'; joinError.classList.remove('hidden'); return; }

  const { data: board, error } = await supabase
    .from('boards').select('*').eq('share_code', code).single();

  if (error || !board) { joinError.textContent = '유효하지 않은 공유코드입니다.'; joinError.classList.remove('hidden'); return; }
  if (board.owner_id === currentUser.id) { joinError.textContent = '내가 만든 보드입니다.'; joinError.classList.remove('hidden'); return; }

  const alreadyJoined = joinedBoards.some(b => b.id === board.id);
  if (alreadyJoined) { joinBoardModal.classList.add('hidden'); await switchBoard(board); return; }

  const { error: joinErr } = await supabase
    .from('board_members')
    .upsert({ board_id: board.id, user_id: currentUser.id }, { onConflict: 'board_id,user_id' });

  if (joinErr) { joinError.textContent = joinErr.message; joinError.classList.remove('hidden'); return; }

  joinedBoards.push(board);
  joinBoardModal.classList.add('hidden');
  renderRoomBar();
  await switchBoard(board);
}

// ── DB Operations ─────────────────────────────────────────────────────────────

async function loadCards() {
  if (!currentBoardId) return;
  const { data, error } = await supabase
    .from('cards')
    .select('id, board_id, user_id, title, "column", position, created_at')
    .eq('board_id', currentBoardId)
    .order('created_at');
  if (error) { showBoardError(error.message); return; }
  cards = data;
  renderBoard();
}

async function addCard(title, column) {
  const trimmed = title.trim();
  if (!trimmed || !currentBoardId) return;
  const { data, error } = await supabase
    .from('cards')
    .insert({ title: trimmed, column, board_id: currentBoardId, user_id: currentUser.id })
    .select('id, board_id, user_id, title, "column", position, created_at')
    .single();
  if (error) { showBoardError(error.message); return; }
  cards.push(data);
  renderBoard();
  logHistory('created', data, null, column);
}

async function deleteCard(id) {
  const card = cards.find(c => c.id === id);
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) { showBoardError(error.message); return; }
  if (card) logHistory('deleted', card, card.column, null);
  cards = cards.filter(c => c.id !== id);
  renderBoard();
}

async function moveCard(id, targetColumn) {
  const card = cards.find(c => c.id === id);
  if (!card || card.column === targetColumn) return;
  const fromColumn = card.column;
  const { error } = await supabase.from('cards').update({ column: targetColumn }).eq('id', id);
  if (error) { showBoardError(error.message); return; }
  logHistory('moved', card, fromColumn, targetColumn);
  card.column = targetColumn;
  renderBoard();
}

// ── 이력 ──────────────────────────────────────────────────────────────────────

async function logHistory(action, card, fromColumn, toColumn) {
  if (!currentBoardId || !currentUser) return;
  await supabase.from('card_history').insert({
    board_id: currentBoardId, card_id: card.id,
    user_id: currentUser.id,
    user_email: currentUser.email ?? currentUser.user_metadata?.user_name ?? '알 수 없음',
    action, card_title: card.title, from_column: fromColumn, to_column: toColumn,
  });
}

document.getElementById('btn-history').addEventListener('click', async () => {
  historyModal.classList.remove('hidden');
  await renderHistory();
});
document.getElementById('btn-close-history').addEventListener('click', () => historyModal.classList.add('hidden'));
historyModal.addEventListener('click', e => { if (e.target === historyModal) historyModal.classList.add('hidden'); });

async function renderHistory() {
  historyList.innerHTML = '<li class="history-empty">불러오는 중...</li>';
  const { data, error } = await supabase
    .from('card_history').select('*')
    .eq('board_id', currentBoardId)
    .order('created_at', { ascending: false });
  if (error) { historyList.innerHTML = `<li class="history-empty">오류: ${error.message}</li>`; return; }
  if (!data.length) { historyList.innerHTML = '<li class="history-empty">이력이 없습니다.</li>'; return; }

  const colLabel    = { todo: 'TO-DO', inprogress: 'In-Progress', done: 'Done' };
  const actionLabel = { created: '추가', moved: '이동', deleted: '삭제' };
  const actionClass = { created: 'action-created', moved: 'action-moved', deleted: 'action-deleted' };

  historyList.innerHTML = data.map(h => {
    const date = new Date(h.created_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    let detail = '';
    if (h.action === 'created') detail = `→ <b>${colLabel[h.to_column] ?? h.to_column}</b>`;
    if (h.action === 'moved')   detail = `<b>${colLabel[h.from_column] ?? h.from_column}</b> → <b>${colLabel[h.to_column] ?? h.to_column}</b>`;
    if (h.action === 'deleted') detail = `<b>${colLabel[h.from_column] ?? h.from_column}</b>에서 삭제`;
    return `<li class="history-item">
      <span class="history-action ${actionClass[h.action]}">${actionLabel[h.action]}</span>
      <div class="history-content">
        <span class="history-title">"${h.card_title}"</span>
        <span class="history-detail">${detail}</span>
      </div>
      <div class="history-meta">
        <span class="history-user">${h.user_email}</span>
        <span class="history-date">${date}</span>
      </div>
    </li>`;
  }).join('');
}

// ── Realtime ──────────────────────────────────────────────────────────────────

function subscribeRealtime() {
  if (!currentBoardId) return;
  realtimeChannel = supabase
    .channel(`board-${currentBoardId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${currentBoardId}` }, () => loadCards())
    .subscribe();
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
  li.className = 'card'; li.draggable = true; li.dataset.id = card.id;
  const text = document.createElement('span');
  text.className = 'card-text'; text.textContent = card.title;
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn'; deleteBtn.innerHTML = '&times;'; deleteBtn.title = '카드 삭제';
  deleteBtn.addEventListener('click', () => deleteCard(card.id));
  li.appendChild(text); li.appendChild(deleteBtn);
  li.addEventListener('dragstart', onDragStart);
  li.addEventListener('dragend',   onDragEnd);
  return li;
}

// ── Drag and Drop ─────────────────────────────────────────────────────────────

function onDragStart(e) {
  e.dataTransfer.setData('text/plain', e.currentTarget.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
  requestAnimationFrame(() => e.currentTarget.classList.add('dragging'));
}
function onDragEnd(e)   { e.currentTarget.classList.remove('dragging'); }
function onDragOver(e)  { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
function onDragEnter(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
function onDragLeave(e) { if (e.currentTarget.contains(e.relatedTarget)) return; e.currentTarget.classList.remove('drag-over'); }
function onDrop(e) {
  e.preventDefault(); e.currentTarget.classList.remove('drag-over');
  const id = e.dataTransfer.getData('text/plain');
  const targetColumn = e.currentTarget.dataset.column;
  if (id && targetColumn) moveCard(id, targetColumn);
}

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
    addCard(input.value, col); input.value = ''; input.focus();
  });
});

document.querySelectorAll('.card-input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { addCard(input.value, input.dataset.column); input.value = ''; }
  });
});
