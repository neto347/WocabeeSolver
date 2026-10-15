// Wocabee Solver Vocabulary Manager
const wordsList = document.getElementById('wordsList');
const wordCountEl = document.getElementById('wordCount');
const searchInput = document.getElementById('searchInput');

// Selection controls
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const bulkActions = document.getElementById('bulkActions');
const selectedCountEl = document.getElementById('selectedCount');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const exportSelectedBtn = document.getElementById('exportSelectedBtn');

// Header buttons
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');

// Import Modal
const importModal = document.getElementById('importModal');
const importCloseBtn = document.getElementById('importCloseBtn');
const importCancelBtn = document.getElementById('importCancelBtn');
const importSubmitBtn = document.getElementById('importSubmitBtn');
const importTextarea = document.getElementById('importTextarea');
const importFileInput = document.getElementById('importFileInput');

let cachedWords = [];
let selectedIndices = new Set();

function formatWordCount(count) {
  if (count === 1) return '1 slovíčko';
  if (count >= 2 && count <= 4) return `${count} slovíčka`;
  return `${count} slovíček`;
}

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return '';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function loadWords() {
  chrome.storage.local.get(['words'], (result) => {
    cachedWords = Array.isArray(result.words) ? result.words : [];
    cleanSelectedIndices();
    render();
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  if (changes.words) {
    cachedWords = Array.isArray(changes.words.newValue) ? changes.words.newValue : [];
    cleanSelectedIndices();
    render();
  }
});

function cleanSelectedIndices() {
  const valid = new Set();
  selectedIndices.forEach(idx => {
    if (idx >= 0 && idx < cachedWords.length) {
      valid.add(idx);
    }
  });
  selectedIndices = valid;
}

function getFilteredWords() {
  const query = searchInput.value.trim().toLowerCase();
  let list = cachedWords.map((item, originalIndex) => ({ ...item, originalIndex }));

  if (query) {
    list = list.filter(item =>
      (item.word && item.word.toLowerCase().includes(query)) ||
      (item.translation && item.translation.toLowerCase().includes(query))
    );
  }

  return list;
}

function updateSelectionUI() {
  const filtered = getFilteredWords();
  const count = selectedIndices.size;
  selectedCountEl.textContent = count;

  if (count > 0) {
    bulkActions.style.display = 'flex';
  } else {
    bulkActions.style.display = 'none';
  }

  if (filtered.length > 0 && filtered.every(item => selectedIndices.has(item.originalIndex))) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else if (filtered.some(item => selectedIndices.has(item.originalIndex))) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  }
}

function render() {
  const displayed = getFilteredWords();
  wordCountEl.textContent = formatWordCount(cachedWords.length);

  updateSelectionUI();

  if (!displayed || displayed.length === 0) {
    wordsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🧃</div>
        <p>Žádná slovíčka nebyla nalezena.</p>
        <p style="font-size: 11px; margin-top: 8px;">Asi ti nebyly slíbeny před 3000 lety</p>
      </div>`;
    return;
  }

  wordsList.innerHTML = displayed.map((item, index) => {
    const isSelected = selectedIndices.has(item.originalIndex);
    const dateStr = formatDate(item.timestamp);

    return `
      <div class="word-item ${isSelected ? 'selected' : ''}" data-index="${item.originalIndex}">
        <input type="checkbox" class="word-checkbox" data-index="${item.originalIndex}" ${isSelected ? 'checked' : ''}>
        <div class="word-content">
          <div class="word-header-line">
            <span class="word">${index + 1}. ${escapeHtml(item.word)}</span>
            ${dateStr ? `<span class="word-date">${dateStr}</span>` : ''}
          </div>
          <div class="translation">${escapeHtml(item.translation)}</div>
        </div>
        <button class="delete-btn single-delete-btn" data-index="${item.originalIndex}">Smazat</button>
      </div>
    `;
  }).join('');

  // Single Delete handlers
  wordsList.querySelectorAll('.single-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      deleteWord(index);
    });
  });

  // Checkbox handlers
  wordsList.querySelectorAll('.word-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      if (e.target.checked) {
        selectedIndices.add(idx);
      } else {
        selectedIndices.delete(idx);
      }
      render();
    });
  });
}

function deleteWord(index) {
  let words = [...cachedWords];
  words.splice(index, 1);
  selectedIndices.delete(index);
  // Shift higher indices
  const updatedSelected = new Set();
  selectedIndices.forEach(idx => {
    if (idx < index) updatedSelected.add(idx);
    else if (idx > index) updatedSelected.add(idx - 1);
  });
  selectedIndices = updatedSelected;

  chrome.storage.local.set({ words: words, wordCount: words.length }, () => {
    cachedWords = words;
    render();
  });
}

// Multi-delete
deleteSelectedBtn.addEventListener('click', () => {
  if (selectedIndices.size === 0) return;
  const count = selectedIndices.size;
  if (!confirm(`Opravdu si přejete smazat ${formatWordCount(count)}?`)) {
    return;
  }

  const words = cachedWords.filter((_, idx) => !selectedIndices.has(idx));
  selectedIndices.clear();

  chrome.storage.local.set({ words: words, wordCount: words.length }, () => {
    cachedWords = words;
    render();
  });
});

// Select all toggle
selectAllCheckbox.addEventListener('change', (e) => {
  const filtered = getFilteredWords();
  if (e.target.checked) {
    filtered.forEach(item => selectedIndices.add(item.originalIndex));
  } else {
    filtered.forEach(item => selectedIndices.delete(item.originalIndex));
  }
  render();
});

// Search input
searchInput.addEventListener('input', () => {
  render();
});

// Export functions
function downloadJson(data, filename) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

exportBtn.addEventListener('click', () => {
  if (cachedWords.length === 0) {
    alert('Žádná slovíčka k exportu.');
    return;
  }
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadJson(cachedWords, `wocabee_slovicka_${dateStr}.json`);
});

exportSelectedBtn.addEventListener('click', () => {
  if (selectedIndices.size === 0) return;
  const selectedWords = cachedWords.filter((_, idx) => selectedIndices.has(idx));
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadJson(selectedWords, `wocabee_vybrana_slovicka_${dateStr}.json`);
});

// Import modal handlers
importBtn.addEventListener('click', () => {
  importTextarea.value = '';
  if (importFileInput) importFileInput.value = '';
  importModal.style.display = 'flex';
  importTextarea.focus();
});

function closeImport() {
  importModal.style.display = 'none';
}

importCloseBtn.addEventListener('click', closeImport);
importCancelBtn.addEventListener('click', closeImport);

window.addEventListener('click', (e) => {
  if (e.target === importModal) closeImport();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && importModal.style.display === 'flex') {
    closeImport();
  }
});

// File picker for import
if (importFileInput) {
  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importTextarea.value = event.target.result;
    };
    reader.readAsText(file);
  });
}

importSubmitBtn.addEventListener('click', () => {
  const text = importTextarea.value.trim();
  if (!text) {
    alert('Zadejte prosím data pro import.');
    return;
  }

  const mode = document.querySelector('input[name="importMode"]:checked')?.value || 'merge';
  const parsedWords = [];

  // Check JSON
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      list.forEach(item => {
        if (item && item.word && item.translation) {
          parsedWords.push({
            word: item.word.trim(),
            translation: item.translation.trim(),
            timestamp: item.timestamp || new Date().toISOString()
          });
        }
      });
    } catch (err) {
      alert('Neplatný JSON formát.');
      return;
    }
  } else {
    // Delimited lines: "word = trans", "word - trans", "word,trans"
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const parts = line.split(/[=\-\t;,]/);
      if (parts.length >= 2) {
        const w = parts[0].trim();
        const t = parts.slice(1).join(' ').trim();
        if (w && t) {
          parsedWords.push({
            word: w,
            translation: t,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  if (parsedWords.length === 0) {
    alert('Nebyla rozpoznána žádná platná slovíčka.');
    return;
  }

  let finalWords = [];
  if (mode === 'replace') {
    finalWords = parsedWords;
  } else {
    finalWords = [...cachedWords];
    for (const item of parsedWords) {
      const exists = finalWords.some(
        w => w.word.toLowerCase() === item.word.toLowerCase() &&
             w.translation.toLowerCase() === item.translation.toLowerCase()
      );
      if (!exists) {
        finalWords.push(item);
      }
    }
  }

  selectedIndices.clear();
  chrome.storage.local.set({ words: finalWords, wordCount: finalWords.length }, () => {
    cachedWords = finalWords;
    render();
    closeImport();
  });
});

// Initial load
loadWords();
