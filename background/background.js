// Background Service Worker for Wocabee Word Recorder / Solver

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.local.get(['isEnabled', 'words', 'wordCount', 'stealthMode'], (result) => {
    const defaults = {
      isEnabled: result.isEnabled !== undefined ? result.isEnabled : false,
      stealthMode: result.stealthMode !== undefined ? result.stealthMode : false,
      words: result.words || [],
      wordCount: result.wordCount || (result.words ? result.words.length : 0)
    };
    chrome.storage.local.set({ ...result, ...defaults });
  });
});
