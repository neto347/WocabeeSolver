// Word Capturer Module for Wocabee Solver
window.Wocabee = window.Wocabee || {};

(function () {
  /**
   * Checks if an element is currently visible on the screen.
   */
  function isVisible(element) {
    if (!element) return false;
    const parentContainer = element.closest('#intro, #pDetailWrapper, #problem-words, #correct, #incorrect, #chooseWord, #chooseSpelling, #completeWord, #translateWord, #pexeso, #oneOutOfMany, #findPair, #choosePicture, #describePicture');
    if (parentContainer && parentContainer.style.display === 'none') {
      return false;
    }
    return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
  }

  /**
   * Safely extract clean text from an element while ignoring child icons,
   * audio buttons, auxiliary notes, or badges.
   */
  function extractCleanText(element) {
    if (!element) return '';
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      return element.value.trim();
    }
    const clone = element.cloneNode(true);
    clone.querySelectorAll('i, svg, .speaker, .arrow, .otherMeanings, #note, script, style').forEach(node => node.remove());
    return clone.textContent.trim();
  }

  const IGNORED_WORDS = new Set([
    'dále', 'zkontrolovat', 'další', 'ano', 'ne', 'zpět',
    'pokračovat', 'start', 'submit', 'tip', 'checkpoint'
  ]);

  function tryRecordPair(word, translation) {
    if (!word || !translation) return false;
    const w = word.trim();
    const t = translation.trim();

    if (w.length === 0 || t.length === 0) return false;
    if (IGNORED_WORDS.has(w.toLowerCase()) || IGNORED_WORDS.has(t.toLowerCase())) {
      return false;
    }
    if (w.toLowerCase() === t.toLowerCase()) {
      return false;
    }

    window.Wocabee.storage.addWordPair(w, t);
    return true;
  }

  function captureWords() {
    if (!window.Wocabee.storage.isEnabled()) return;

    try {
      // 1. Package Detail / Intro Flashcards Screen (#intro)
      const introContainer = document.getElementById('intro');
      if (introContainer && isVisible(introContainer)) {
        // Variant A: Package review with #word-button (#word) and #translation
        const wordBtn = introContainer.querySelector('#word-button');
        const transBtn = introContainer.querySelector('#translation');
        if (wordBtn && transBtn) {
          const wordEl = wordBtn.querySelector('#word') || wordBtn;
          const w = extractCleanText(wordEl);
          const t = extractCleanText(transBtn);
          if (w && t) tryRecordPair(w, t);
        } else {
          // Variant B: Homework intro with #introWord and #introTranslation
          const introWord = introContainer.querySelector('#introWord');
          const introTranslation = introContainer.querySelector('#introTranslation');
          if (introWord && introTranslation) {
            const w = extractCleanText(introWord);
            const t = extractCleanText(introTranslation);
            if (w && t) tryRecordPair(w, t);
          } else {
            // Variant C: Generic two-button layout inside intro
            const introButtons = introContainer.querySelectorAll('#introWordTranslation button, #introContainer button.btn-lg');
            if (introButtons.length >= 2) {
              const w = extractCleanText(introButtons[0]);
              const t = extractCleanText(introButtons[1]);
              if (w && t) tryRecordPair(w, t);
            }
          }
        }
      }

      // 2. Package Detail Wrapper (#pDetailWrapper with #currentWord and #currentTranslation)
      const pDetail = document.getElementById('pDetailWrapper');
      if (pDetail && isVisible(pDetail)) {
        const curWord = pDetail.querySelector('#currentWord');
        const curTrans = pDetail.querySelector('#currentTranslation');
        if (curWord && curTrans) {
          const w = extractCleanText(curWord);
          const t = extractCleanText(curTrans);
          if (w && t) tryRecordPair(w, t);
        }
      }

      // 3. Problem Words Screen (#problem-words-word & #problem-words-translation)
      const pwContainer = document.getElementById('problem-words');
      if (pwContainer && isVisible(pwContainer)) {
        const pwWord = document.getElementById('problem-words-word');
        const pwTranslation = document.getElementById('problem-words-translation');
        if (pwWord && pwTranslation) {
          const w = extractCleanText(pwWord);
          const t = extractCleanText(pwTranslation);
          if (w && t) tryRecordPair(w, t);
        }
      }

      // 4. Pexeso Cards (Cards share identical w_id attribute)
      const pexesoContainer = document.getElementById('pexeso');
      if (pexesoContainer && isVisible(pexesoContainer)) {
        const pexesoWordCards = pexesoContainer.querySelectorAll('#pq_words .pexesoCardWrapper');
        if (pexesoWordCards.length > 0) {
          pexesoWordCards.forEach(wCard => {
            const wId = wCard.getAttribute('w_id');
            if (!wId) return;
            const tCard = pexesoContainer.querySelector(`#pa_words .pexesoCardWrapper[w_id="${wId}"]`);
            if (tCard) {
              const w = extractCleanText(wCard.querySelector('.pexesoBack'));
              const t = extractCleanText(tCard.querySelector('.pexesoBack'));
              if (w && t) tryRecordPair(w, t);
            }
          });
        }
      }

      // 5. Completed Word exercise (when #completeWord is visible and answer has no underscores)
      const cwContainer = document.getElementById('completeWord');
      if (cwContainer && isVisible(cwContainer)) {
        const cwQuestion = document.getElementById('completeWordQuestion');
        const cwAnswer = document.getElementById('completeWordAnswer');
        if (cwQuestion && cwAnswer) {
          const aText = extractCleanText(cwAnswer);
          if (aText && !aText.includes('_')) {
            const qText = extractCleanText(cwQuestion);
            if (qText && aText) tryRecordPair(qText, aText);
          }
        }
      }

      // 6. Post-answer feedback - Correct answer banner (ONLY when #correct is visible)
      const correctBox = document.getElementById('correct');
      if (correctBox && isVisible(correctBox)) {
        const qEl = correctBox.querySelector('.wordQuestion');
        const aEl = correctBox.querySelector('.myWordAnswer');
        if (qEl && aEl) {
          const w = extractCleanText(qEl);
          const t = extractCleanText(aEl);
          if (w && t) tryRecordPair(w, t);
        }
      }

      // 7. Post-answer feedback - Incorrect answer explanation (ONLY when #incorrect is visible)
      const incorrectBox = document.getElementById('incorrect');
      if (incorrectBox && isVisible(incorrectBox)) {
        const qEl = incorrectBox.querySelector('.correctWordQuestion') || incorrectBox.querySelector('.wordQuestion');
        const aEl = incorrectBox.querySelector('.correctWordAnswer');
        if (qEl && aEl) {
          const w = extractCleanText(qEl);
          const t = extractCleanText(aEl);
          if (w && t) tryRecordPair(w, t);
        }
      }

      // 8. Active visible question paired with a_word (strictly checks isVisible on question container)
      const aWordInput = document.getElementById('a_word');
      if (aWordInput && aWordInput.value && aWordInput.value.trim()) {
        const answerVal = aWordInput.value.trim();
        const activeQuestionSelectors = [
          '#chooseWord:not([style*="display: none"]) #ch_word',
          '#translateWord:not([style*="display: none"]) #q_word',
          '#chooseSpelling:not([style*="display: none"]) #cs_word',
          '#completeWord:not([style*="display: none"]) #completeWordQuestion',
          '#choosePicture:not([style*="display: none"]) #choosePictureWord',
          '#translateFallingWord:not([style*="display: none"]) #tfw_word'
        ];
        for (const sel of activeQuestionSelectors) {
          const qEl = document.querySelector(sel);
          if (qEl && isVisible(qEl)) {
            const qText = extractCleanText(qEl);
            if (qText && qText.toLowerCase() !== answerVal.toLowerCase()) {
              tryRecordPair(qText, answerVal);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Word capture error:', err);
    }
  }

  // Pre-emptive capture on user navigation clicks
  document.addEventListener('click', (e) => {
    const target = e.target.closest('#introNext, #introRun, #problem-words-next, #continueBtn, #incorrect-next-button, #rightArrow, #leftArrow, .arrow, #word-button, #translation, #currentWordBtn, .submit');
    if (target) {
      captureWords();
      setTimeout(captureWords, 60);
      setTimeout(captureWords, 180);
    }
  }, true);

  window.Wocabee.capturer = {
    captureWords,
    extractCleanText,
    isVisible
  };
})();
