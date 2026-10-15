// Main Orchestrator for Wocabee Solver Content Script
window.Wocabee = window.Wocabee || {};

(function () {
  const HIGHLIGHT_THROTTLE_MS = 200;
  const CAPTURE_DEBOUNCE_MS = 150;
  const FALLBACK_INTERVAL_MS = 1000;

  let captureTimeout = null;
  let highlightTimeout = null;
  let lastHighlightTime = 0;
  let intervalId = null;

  function isContextValid() {
    return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
  }

  function debouncedCapture() {
    if (!isContextValid()) return;
    clearTimeout(captureTimeout);
    captureTimeout = setTimeout(() => {
      if (isContextValid()) {
        window.Wocabee.capturer.captureWords();
      }
    }, CAPTURE_DEBOUNCE_MS);
  }

  function throttledHighlight() {
    if (!isContextValid()) return;
    const now = Date.now();
    if (now - lastHighlightTime < HIGHLIGHT_THROTTLE_MS) {
      clearTimeout(highlightTimeout);
      highlightTimeout = setTimeout(() => {
        if (isContextValid()) {
          runHighlights();
        }
      }, HIGHLIGHT_THROTTLE_MS);
      return;
    }
    lastHighlightTime = now;
    runHighlights();
  }

  function runHighlights() {
    if (!isContextValid()) return;

    if (!window.Wocabee.storage.isEnabled()) {
      window.Wocabee.stealth?.clearDOMHighlights();
      window.Wocabee.stealth?.resetTitle();
      return;
    }

    const isStealth = window.Wocabee.storage.isStealthMode();
    if (isStealth) {
      window.Wocabee.stealth?.clearDOMHighlights();
    } else {
      window.Wocabee.stealth?.resetTitle();
    }

    const words = window.Wocabee.storage.getWords();
    const helpers = window.Wocabee.helpers;
    const solvers = window.Wocabee.solvers || {};

    let solvedSomething = false;
    for (const name of Object.keys(solvers)) {
      try {
        const result = solvers[name](words, helpers, isStealth);
        if (result) {
          solvedSomething = true;
        }
      } catch (err) {
        console.warn(`Solver ${name} encountered an error:`, err);
      }
    }

    if (isStealth && !solvedSomething) {
      window.Wocabee.stealth?.resetTitle();
    }
  }

  // Initialize storage and react to changes
  window.Wocabee.storage.init();
  window.Wocabee.storage.onChange(({ isEnabled, stealthMode }) => {
    if (isContextValid()) {
      if (isEnabled) {
        window.Wocabee.capturer.captureWords();
      }
      runHighlights();
    }
  });

  // Observe DOM changes on Wocabee page
  const observer = new MutationObserver(() => {
    if (!isContextValid()) {
      observer.disconnect();
      if (intervalId) clearInterval(intervalId);
      return;
    }
    debouncedCapture();
    throttledHighlight();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    characterDataOldValue: true
  });

  // Initial execution
  window.Wocabee.capturer.captureWords();
  runHighlights();

  // Low-frequency fallback heartbeat for asynchronous quiz state changes
  intervalId = setInterval(() => {
    if (!isContextValid()) {
      clearInterval(intervalId);
      observer.disconnect();
      return;
    }
    if (window.Wocabee.storage.isEnabled()) {
      window.Wocabee.capturer.captureWords();
      throttledHighlight();
    }
  }, FALLBACK_INTERVAL_MS);
})();
