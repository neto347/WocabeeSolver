// Solver for "Pexeso" Memory Matching Game
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.pexeso = function (words, helpers, isStealth) {
  const container = document.getElementById('pexeso');
  if (!container || container.style.display === 'none') return false;

  const wordCards = Array.from(container.querySelectorAll('#pq_words .pexesoCardWrapper'));
  const translationCards = Array.from(container.querySelectorAll('#pa_words .pexesoCardWrapper'));
  if (wordCards.length === 0 || translationCards.length === 0) return false;

  // Clean previous
  for (let i = 1; i <= 6; i++) {
    document.querySelectorAll(`.pexeso-pair-${i}`).forEach(c => c.classList.remove(`pexeso-pair-${i}`));
  }
  document.querySelectorAll('.pexeso-matched').forEach(c => c.classList.remove('pexeso-matched'));

  const isCardMatched = card => card.getAttribute('marked') === '1' || card.getAttribute('marked') === '';
  const unmatchedWords = wordCards.filter(c => !isCardMatched(c));
  const unmatchedTranslations = translationCards.filter(c => !isCardMatched(c));

  if (!isStealth) {
    const matchedWords = wordCards.filter(isCardMatched);
    const matchedTranslations = translationCards.filter(isCardMatched);
    matchedWords.forEach(wordCard => {
      const wId = wordCard.getAttribute('w_id');
      matchedTranslations.forEach(transCard => {
        if (transCard.getAttribute('w_id') === wId) {
          wordCard.classList.add('pexeso-matched');
          transCard.classList.add('pexeso-matched');
        }
      });
    });
  }

  let pairIndex = 1;
  const pairedTransCards = new Set();
  const stealthPairs = [];

  unmatchedWords.forEach(wordCard => {
    if (pairIndex > 6) return;
    const wId = wordCard.getAttribute('w_id');
    const wordPexesoId = wordCard.getAttribute('pexeso_id') || pairIndex;

    let matchingTransCard = null;
    if (wId) {
      matchingTransCard = unmatchedTranslations.find(
        tc => tc.getAttribute('w_id') === wId && !pairedTransCards.has(tc)
      );
    }

    if (!matchingTransCard) {
      const backText = wordCard.querySelector('.pexesoBack')?.textContent || '';
      const correctTranslation = helpers.findTranslation(words, backText, true);
      if (correctTranslation) {
        matchingTransCard = unmatchedTranslations.find(tc => {
          if (pairedTransCards.has(tc)) return false;
          const transBackText = tc.querySelector('.pexesoBack')?.textContent || '';
          return helpers.cleanAlphanumeric(transBackText) === helpers.cleanAlphanumeric(correctTranslation);
        });
      }
    }

    if (matchingTransCard) {
      const transPexesoId = matchingTransCard.getAttribute('pexeso_id') || '?';
      pairedTransCards.add(matchingTransCard);

      if (!isStealth) {
        const pairClass = `pexeso-pair-${pairIndex}`;
        wordCard.classList.add(pairClass);
        matchingTransCard.classList.add(pairClass);
      } else {
        stealthPairs.push(`${wordPexesoId}=${transPexesoId}`);
      }

      pairIndex++;

      // Learn this pair into vocabulary
      const wordText = wordCard.querySelector('.pexesoBack')?.textContent?.trim();
      const transText = matchingTransCard.querySelector('.pexesoBack')?.textContent?.trim();
      if (wordText && transText && window.Wocabee.capturer?.extractCleanText) {
        const cleanW = window.Wocabee.capturer.extractCleanText(wordCard.querySelector('.pexesoBack'));
        const cleanT = window.Wocabee.capturer.extractCleanText(matchingTransCard.querySelector('.pexesoBack'));
        if (cleanW && cleanT && cleanW !== cleanT) {
          window.Wocabee.storage.addWordPair(cleanW, cleanT);
        }
      }
    }
  });

  if (isStealth && stealthPairs.length > 0) {
    window.Wocabee.stealth?.setSolution(`Pexeso: ${stealthPairs.join(', ')}`);
    return true;
  }

  return pairIndex > 1;
};
