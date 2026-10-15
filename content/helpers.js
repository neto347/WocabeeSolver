// Utility & Matching Helpers for Wocabee Solver
window.Wocabee = window.Wocabee || {};

(function () {
  function cleanText(text) {
    if (!text) return '';
    return text.trim().toLowerCase();
  }

  function cleanAlphanumeric(text) {
    if (!text) return '';
    return text.replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase();
  }

  /**
   * Find matching translation given a query word in either direction
   * (e.g. Czech -> German or German -> Czech).
   */
  function findTranslation(words, queryText, useAlphanumeric = false) {
    if (!queryText || !words || words.length === 0) return null;
    
    const query = useAlphanumeric ? cleanAlphanumeric(queryText) : cleanText(queryText);
    if (!query) return null;

    for (const item of words) {
      const itemWord = useAlphanumeric ? cleanAlphanumeric(item.word) : cleanText(item.word);
      const itemTrans = useAlphanumeric ? cleanAlphanumeric(item.translation) : cleanText(item.translation);

      if (itemWord === query) {
        return item.translation;
      }
      if (itemTrans === query) {
        return item.word;
      }
    }
    return null;
  }

  /**
   * Checks whether two texts form a valid word-translation pair.
   */
  function isPairMatch(words, textA, textB, useAlphanumeric = false) {
    if (!textA || !textB || !words || words.length === 0) return false;

    const a = useAlphanumeric ? cleanAlphanumeric(textA) : cleanText(textA);
    const b = useAlphanumeric ? cleanAlphanumeric(textB) : cleanText(textB);

    return words.some(w => {
      const wWord = useAlphanumeric ? cleanAlphanumeric(w.word) : cleanText(w.word);
      const wTrans = useAlphanumeric ? cleanAlphanumeric(w.translation) : cleanText(w.translation);
      return (wWord === a && wTrans === b) || (wTrans === a && wWord === b);
    });
  }

  window.Wocabee.helpers = {
    cleanText,
    cleanAlphanumeric,
    findTranslation,
    isPairMatch
  };
})();
