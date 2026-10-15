// Solver for "Translate Word" Typing Prompt
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.translateWord = function (words, helpers, isStealth) {
  const container = document.getElementById('translateWord');
  if (!container || container.style.display === 'none') return false;

  const submitBtn = container.querySelector('#translateWordSubmitBtn');
  if (!submitBtn) return false;

  const aWordVal = document.getElementById('a_word')?.value?.trim();
  let correctAnswer = aWordVal || null;

  if (!correctAnswer) {
    const questionSpan = container.querySelector('#q_word');
    if (questionSpan) {
      const questionText = questionSpan.textContent.trim();
      correctAnswer = helpers.findTranslation(words, questionText);
    }
  }

  if (!correctAnswer) return false;

  if (isStealth) {
    const hintElement = document.getElementById('wocabee-translate-hint');
    if (hintElement) hintElement.style.display = 'none';
    window.Wocabee.stealth?.setSolution(correctAnswer);
    return true;
  }

  let hintElement = document.getElementById('wocabee-translate-hint');
  if (!hintElement) {
    hintElement = document.createElement('div');
    hintElement.id = 'wocabee-translate-hint';
    submitBtn.parentNode.insertBefore(hintElement, submitBtn.nextSibling);
  }

  hintElement.textContent = correctAnswer;
  hintElement.style.display = 'block';
  return true;
};
