// Stealth Mode Manager for Wocabee Solver
window.Wocabee = window.Wocabee || {};

(function () {
  let defaultTitle = document.title || 'WocaBee';

  function setSolution(solutionText) {
    if (!solutionText) {
      resetTitle();
      return;
    }
    document.title = solutionText;
  }

  function resetTitle() {
    if (document.title !== defaultTitle) {
      document.title = defaultTitle;
    }
  }

  function clearDOMHighlights() {
    document.querySelectorAll('.wocabee-correct-answer').forEach(el => el.classList.remove('wocabee-correct-answer'));
    document.querySelectorAll('.wocabee-correct-char').forEach(el => el.classList.remove('wocabee-correct-char'));
    for (let i = 1; i <= 6; i++) {
      document.querySelectorAll(`.pexeso-pair-${i}`).forEach(el => el.classList.remove(`pexeso-pair-${i}`));
    }
    document.querySelectorAll('.pexeso-matched').forEach(el => el.classList.remove('pexeso-matched'));
    document.querySelectorAll('.picture-correct, .picture-incorrect').forEach(el => el.classList.remove('picture-correct', 'picture-incorrect'));

    const translateHint = document.getElementById('wocabee-translate-hint');
    if (translateHint) translateHint.style.display = 'none';

    const describeHint = document.getElementById('describePictureHint');
    if (describeHint) describeHint.style.display = 'none';

    const tfwHint = document.getElementById('wocabee-tfw-hint');
    if (tfwHint) tfwHint.style.display = 'none';

    const picIndicator = document.getElementById('choosePictureIndicator');
    if (picIndicator) picIndicator.style.display = 'none';
  }

  window.Wocabee.stealth = {
    setSolution,
    resetTitle,
    clearDOMHighlights
  };
})();
