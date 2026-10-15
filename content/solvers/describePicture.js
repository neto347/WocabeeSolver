// Solver for "Describe Picture" Exercise
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.describePicture = function (words, helpers, isStealth) {
  const container = document.getElementById('describePicture');
  if (!container || container.style.display === 'none') return false;

  const img = container.querySelector('#describePictureImg');
  const submitBtn = container.querySelector('#describePictureSubmitBtn');
  if (!img || !submitBtn) return false;

  let correctAnswer = null;
  const imgWord = img.getAttribute('word');

  if (imgWord) {
    correctAnswer = helpers.findTranslation(words, imgWord);
  }

  if (!correctAnswer) return false;

  if (isStealth) {
    const hintElement = document.getElementById('describePictureHint');
    if (hintElement) hintElement.style.display = 'none';
    window.Wocabee.stealth?.setSolution(correctAnswer);
    return true;
  }

  let hintElement = document.getElementById('describePictureHint');
  if (!hintElement) {
    hintElement = document.createElement('div');
    hintElement.id = 'describePictureHint';
    submitBtn.parentNode.insertBefore(hintElement, submitBtn.nextSibling);
  }

  hintElement.textContent = correctAnswer;
  hintElement.style.display = 'block';
  return true;
};
