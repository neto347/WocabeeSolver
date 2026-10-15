const toggleSwitch = document.getElementById('toggleSwitch');
const statusText = document.getElementById('statusText');
const stealthToggleSwitch = document.getElementById('stealthToggleSwitch');
const stealthStatusText = document.getElementById('stealthStatusText');
const viewWordsBtn = document.getElementById('viewWordsBtn');

function formatWordCount(count) {
  if (count === 1) return '1 slovíčko';
  if (count >= 2 && count <= 4) return `${count} slovíčka`;
  return `${count} slovíček`;
}

// Initialize popup state from storage
chrome.storage.local.get(['isEnabled', 'wordCount', 'stealthMode'], (result) => {
  updateUI(result.isEnabled || false, result.wordCount || 0, result.stealthMode || false);
});

toggleSwitch.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const url = tabs[0].url;
      if (!url || !url.includes('wocabee.app')) {
        alert('Musíš být na Wocabee stránce!');
        return;
      }
    }

    chrome.storage.local.get(['isEnabled', 'wordCount', 'stealthMode'], (result) => {
      const newState = !result.isEnabled;
      chrome.storage.local.set({ isEnabled: newState });
      updateUI(newState, result.wordCount || 0, result.stealthMode || false);
    });
  });
});

stealthToggleSwitch.addEventListener('click', () => {
  chrome.storage.local.get(['isEnabled', 'wordCount', 'stealthMode'], (result) => {
    const newStealthState = !result.stealthMode;
    chrome.storage.local.set({ stealthMode: newStealthState });
    updateUI(result.isEnabled || false, result.wordCount || 0, newStealthState);
  });
});

// Reactive storage updates
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  if (changes.wordCount !== undefined || changes.isEnabled !== undefined || changes.stealthMode !== undefined) {
    chrome.storage.local.get(['isEnabled', 'wordCount', 'stealthMode'], (result) => {
      updateUI(result.isEnabled || false, result.wordCount || 0, result.stealthMode || false);
    });
  }
});

// Open Vocabulary Manager in a new tab
viewWordsBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('manager/index.html') });
});

function updateUI(isEnabled, wordCount, stealthMode) {
  if (isEnabled) {
    toggleSwitch.classList.add('active');
  } else {
    toggleSwitch.classList.remove('active');
  }
  statusText.textContent = formatWordCount(wordCount);

  if (stealthMode) {
    stealthToggleSwitch.classList.add('active');
    stealthStatusText.textContent = 'Zapnuto';
  } else {
    stealthToggleSwitch.classList.remove('active');
    stealthStatusText.textContent = 'Vypnuto';
  }
}
