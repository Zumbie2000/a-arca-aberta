/* ============================================
   quiz.js — Questionário "Qual clássico você vai abrir hoje?"
   Base de dados: localStorage (db_classicos)
   ============================================ */

const DB_KEY = 'db_classicos_v1';

function dbLoad() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : { responses: [], counts: {} };
  } catch (error) {
    console.error('Erro ao carregar dados do localStorage:', error);
    return { responses: [], counts: {} };
  }
}

function dbSave(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar dados no localStorage:', error);
  }
}

function dbAddResponse(book, name) {
  const data = dbLoad();
  const entry = {
    id: Date.now(),
    book: book.trim(),
    name: name.trim() || 'Anônimo',
    timestamp: new Date().toISOString()
  };
  data.responses.push(entry);
  data.counts[entry.book] = (data.counts[entry.book] || 0) + 1;
  dbSave(data);
  return entry;
}

function dbGetCounts() {
  return dbLoad().counts;
}

function dbClear() {
  dbSave({ responses: [], counts: {} });
}

function renderScoreboard() {
  const list = document.getElementById('scoreList');
  if (!list) return;

  const counts = dbGetCounts();
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    list.innerHTML = '<p class="loading-text">Nenhuma resposta ainda. Seja o primeiro! ✦</p>';
    return;
  }

  const max = entries[0][1];
  list.innerHTML = entries.map(([book, count]) => {
    const pct = Math.round((count / max) * 100);
    return `
      <div class="score-item">
        <span class="book-name">${escapeHTML(book)}</span>
        <div class="score-bar-wrap">
          <div class="score-bar" style="width:${pct}%"></div>
        </div>
        <span class="score-count">${count}</span>
      </div>
    `;
  }).join('');
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function validateInput(input) {
  return input && input.trim().length > 0 && input.trim().length <= 80;
}

document.addEventListener('DOMContentLoaded', () => {
  const quizBtns = document.querySelectorAll('.quiz-btn');
  const customInput = document.getElementById('customBook');
  const nameInput = document.getElementById('userName');
  const submitBtn = document.getElementById('submitBtn');
  const feedback = document.getElementById('quizFeedback');
  const clearBtn = document.getElementById('clearBtn');

  let selectedBook = '';

  quizBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      quizBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedBook = btn.dataset.book;
      customInput.value = '';
    });
  });

  customInput.addEventListener('input', () => {
    if (customInput.value.trim()) {
      quizBtns.forEach(b => b.classList.remove('selected'));
      selectedBook = '';
    }
  });

  submitBtn.addEventListener('click', () => {
    const custom = customInput.value.trim();
    const book = custom || selectedBook;
    const name = nameInput.value.trim();

    if (!book) {
      showFeedback('⚠ Escolha ou escreva um clássico antes de enviar.', 'warn');
      return;
    }

    if (!validateInput(book)) {
      showFeedback('⚠ O nome do clássico deve ter entre 1 e 80 caracteres.', 'warn');
      return;
    }

    if (name && !validateInput(name)) {
      showFeedback('⚠ O nome deve ter entre 1 e 40 caracteres.', 'warn');
      return;
    }

    dbAddResponse(book, name);
    renderScoreboard();
    showFeedback(`✦ "${escapeHTML(book)}" foi registrado! Boa leitura${name ? ', ' + escapeHTML(name) : ''}.`, 'ok');

    quizBtns.forEach(b => b.classList.remove('selected'));
    customInput.value = '';
    nameInput.value = '';
    selectedBook = '';
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja apagar todos os registros?')) {
      dbClear();
      renderScoreboard();
      showFeedback('Base de dados limpa.', 'warn');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      const isVisible = clearBtn.style.display !== 'none';
      clearBtn.style.display = isVisible ? 'none' : 'inline-block';
    }
  });

  function showFeedback(msg, type) {
    feedback.style.display = 'block';
    feedback.innerHTML = msg;
    feedback.style.borderColor = type === 'ok' ? 'var(--gold)' : '#c04040';
    feedback.style.color = type === 'ok' ? 'var(--gold-2)' : '#e07070';

    clearTimeout(feedback._timeout);
    feedback._timeout = setTimeout(() => {
      feedback.style.display = 'none';
    }, 5000);
  }

  renderScoreboard();
});

/* ============================================
   COMO EXPORTAR OS DADOS (para professores):

   Abra o Console do Navegador (F12 > Console) e cole:

   const db = JSON.parse(localStorage.getItem('db_classicos_v1'));
   const csv = ['Nome,Clássico,Data', ...db.responses.map(r =>
     `"${r.name}","${r.book}","${r.timestamp}"`)].join('\n');
   const a = document.createElement('a');
   a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
   a.download = 'respostas_classicos.csv';
   a.click();

   Isso fará o download de um arquivo CSV com todas as respostas.
   ============================================ */
