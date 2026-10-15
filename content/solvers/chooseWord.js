// Solver for "Choose Word" Multiple Choice Quiz
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.chooseWord = function (words, helpers, isStealth) {
  const container = document.getElementById('chooseWord');
  if (!container || container.style.display === 'none') return false;

  const questionBtn = container.querySelector('#ch_word');
  if (!questionBtn) return false;

  const questionText = questionBtn.textContent.trim();
  const answerButtons = container.querySelectorAll('#chooseWords button, .chooseWordAnswer');
  if (answerButtons.length === 0) return false;

  // Remove previous highlights
  answerButtons.forEach(btn => btn.classList.remove('wocabee-correct-answer'));

  // Highlight ONLY the single best match
  let matched = false;
  answerButtons.forEach(btn => {
    if (matched) return;
    const btnText = btn.textContent.trim();

    if (helpers.isPairMatch(words, questionText, btnText)) {
      matched = true;
      if (isStealth) {
        window.Wocabee.stealth?.setSolution(btnText);
      } else {
        btn.classList.add('wocabee-correct-answer');
      }
    }
  });

  return matched;
};
