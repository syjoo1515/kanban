const STORAGE_KEY = 'kanban-cards';

// ── State ─────────────────────────────────────────────────────────────────────

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveState(cards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // localStorage 사용 불가 환경에서는 무시
  }
}

let cards = loadState();

// ── Rendering ─────────────────────────────────────────────────────────────────

function renderBoard() {
  const columns = ['todo', 'inprogress', 'done'];

  columns.forEach(col => {
    const list = document.getElementById(`list-${col}`);
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
  text.textContent = card.text;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '&times;';
  deleteBtn.title = '카드 삭제';
  deleteBtn.addEventListener('click', () => deleteCard(card.id));

  li.appendChild(text);
  li.appendChild(deleteBtn);

  // Drag events on card
  li.addEventListener('dragstart', onDragStart);
  li.addEventListener('dragend', onDragEnd);

  return li;
}

// ── Card Operations ───────────────────────────────────────────────────────────

function addCard(text, column) {
  const trimmed = text.trim();
  if (!trimmed) return;

  cards.push({ id: Date.now().toString(), text: trimmed, column });
  saveState(cards);
  renderBoard();
}

function deleteCard(id) {
  cards = cards.filter(c => c.id !== id);
  saveState(cards);
  renderBoard();
}

function moveCard(id, targetColumn) {
  const card = cards.find(c => c.id === id);
  if (!card || card.column === targetColumn) return;

  card.column = targetColumn;
  saveState(cards);
  renderBoard();
}

// ── Drag and Drop ─────────────────────────────────────────────────────────────

let draggingId = null;

function onDragStart(e) {
  draggingId = e.currentTarget.dataset.id;
  e.dataTransfer.setData('text/plain', draggingId);
  e.dataTransfer.effectAllowed = 'move';
  // 다음 프레임에 클래스 추가해야 드래그 이미지가 정상 렌더링됨
  requestAnimationFrame(() => e.currentTarget.classList.add('dragging'));
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  draggingId = null;
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function onDragEnter(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function onDragLeave(e) {
  // 자식 요소로 이동할 때 발생하는 오발사 방지
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

function bindColumnEvents() {
  document.querySelectorAll('.column').forEach(col => {
    col.addEventListener('dragover', onDragOver);
    col.addEventListener('dragenter', onDragEnter);
    col.addEventListener('dragleave', onDragLeave);
    col.addEventListener('drop', onDrop);
  });
}

function bindFormEvents() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const col = btn.dataset.column;
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
}

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  bindColumnEvents();
  bindFormEvents();
  renderBoard();
});
