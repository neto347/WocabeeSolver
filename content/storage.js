// Storage & Persistence Module for Wocabee Solver
window.Wocabee = window.Wocabee || {};

(function () {
  const DB_NAME = 'WocabeeDB';
  const STORE_NAME = 'fileHandles';
  
  let fileHandle = null;
  let cachedWords = [];
  let isEnabled = false;
  let stealthMode = false;
  const changeListeners = [];

  function isContextValid() {
    return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
  }

  // Initialize IndexedDB for OPFS file handle storage
  function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async function getFileHandleFromDB() {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('wordsFileHandle');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    } catch (err) {
      return null;
    }
  }

  async function saveFileHandleToDB(handle) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(handle, 'wordsFileHandle');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (err) {
      // silently ignore file handle storage errors
    }
  }

  async function initializeFile() {
    try {
      if (!navigator.storage || !navigator.storage.getDirectory) return;
      const root = await navigator.storage.getDirectory();
      const wocabeeDir = await root.getDirectoryHandle('wocabee', { create: true });
      fileHandle = await wocabeeDir.getFileHandle('words.json', { create: true });
      await saveFileHandleToDB(fileHandle);
    } catch (err) {
      console.warn('OPFS file initialization error:', err);
    }
  }

  async function writeWordsToFile(words) {
    try {
      if (!fileHandle) {
        fileHandle = await getFileHandleFromDB();
        if (!fileHandle) {
          await initializeFile();
        }
        if (!fileHandle) return;
      }
      const writable = await fileHandle.createWritable();
      const dataStr = JSON.stringify(words, null, 2);
      await writable.write(dataStr);
      await writable.close();
    } catch (err) {
      // Handle write errors gracefully
    }
  }

  // Load initial settings and words
  function init() {
    if (!isContextValid()) return;

    try {
      chrome.storage.local.get(['isEnabled', 'words', 'stealthMode'], (result) => {
        if (!isContextValid() || chrome.runtime.lastError) return;
        isEnabled = Boolean(result.isEnabled);
        stealthMode = Boolean(result.stealthMode);
        cachedWords = Array.isArray(result.words) ? result.words : [];
        notifyListeners();
      });

      // Keep memory cache updated on changes
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (!isContextValid() || areaName !== 'local') return;

        if (changes.isEnabled !== undefined) {
          isEnabled = Boolean(changes.isEnabled.newValue);
        }
        if (changes.stealthMode !== undefined) {
          stealthMode = Boolean(changes.stealthMode.newValue);
        }
        if (changes.words !== undefined) {
          cachedWords = Array.isArray(changes.words.newValue) ? changes.words.newValue : [];
        }
        notifyListeners();
      });
    } catch (err) {
      // Ignore extension context invalidated
    }

    // Initialize file handle in background
    (async () => {
      fileHandle = await getFileHandleFromDB();
      if (!fileHandle) {
        await initializeFile();
      }
    })();
  }

  function notifyListeners() {
    changeListeners.forEach(fn => fn({ isEnabled, stealthMode, words: cachedWords }));
  }

  // Public API
  window.Wocabee.storage = {
    init,
    isEnabled: () => isEnabled,
    isStealthMode: () => stealthMode,
    getWords: () => cachedWords,
    onChange: (fn) => changeListeners.push(fn),
    addWordPair: async (word, translation) => {
      if (!isContextValid()) return;

      const normalizedWord = word.trim();
      const normalizedTranslation = translation.trim();

      const isDuplicate = cachedWords.some(
        w => w.word.toLowerCase() === normalizedWord.toLowerCase() &&
             w.translation.toLowerCase() === normalizedTranslation.toLowerCase()
      );

      if (!isDuplicate) {
        const newWords = [
          ...cachedWords,
          {
            word: normalizedWord,
            translation: normalizedTranslation,
            timestamp: new Date().toISOString()
          }
        ];
        cachedWords = newWords;

        try {
          if (isContextValid()) {
            chrome.storage.local.set({ words: newWords, wordCount: newWords.length }, () => {
              if (chrome.runtime?.lastError) {
                // Ignore context invalidated
              }
            });
          }
          await writeWordsToFile(newWords);
        } catch (err) {
          // Gracefully ignore extension context invalidated when extension reloads
        }
      }
    }
  };
})();
