// Solver for "Translate Falling Word" Exercise
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.translateFallingWord = function (words, helpers, isStealth) {
  const container = document.getElementById('translateFallingWord');
  if (!container || container.style.display === 'none') return false;

  const questionBtn = container.querySelector('#tfw_word');
  const submitBtn = container.querySelector('#translateFallingWordSubmitBtn');
  if (!questionBtn || !submitBtn) return false;

  const questionText = questionBtn.textContent.trim();
  const aWordVal = document.getElementById('a_word')?.value?.trim();
  const correctAnswer = aWordVal || helpers.findTranslation(words, questionText);
  if (!correctAnswer) return false;

  if (isStealth) {
    const hintElement = document.getElementById('wocabee-tfw-hint');
    if (hintElement) hintElement.style.display = 'none';
    window.Wocabee.stealth?.setSolution(correctAnswer);
    return true;
  }

  let hintElement = document.getElementById('wocabee-tfw-hint');
  if (!hintElement) {
    hintElement = document.createElement('div');
    hintElement.id = 'wocabee-tfw-hint';
    hintElement.className = 'wocabee-translate-hint';
    submitBtn.parentNode.insertBefore(hintElement, submitBtn.nextSibling);
  }

  hintElement.textContent = correctAnswer;
  hintElement.style.display = 'block';
  return true;
};
