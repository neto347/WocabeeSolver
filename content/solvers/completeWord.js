// Solver for "Complete Word" Letter Placement Quiz
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.completeWord = function (words, helpers, isStealth) {
  const container = document.getElementById('completeWord');
  if (!container || container.style.display === 'none') return false;

  const questionBtn = container.querySelector('#completeWordQuestion');
  if (!questionBtn) return false;

  const questionText = questionBtn.textContent.trim();
  const aWordVal = document.getElementById('a_word')?.value?.trim();
  const correctTranslation = aWordVal || helpers.findTranslation(words, questionText);
  if (!correctTranslation) return false;

  const answerBtn = container.querySelector('#completeWordAnswer');
  if (!answerBtn) return false;

  const answerTemplate = answerBtn.textContent.trim();
  const charButtons = container.querySelectorAll('#characters .char');
  if (charButtons.length === 0) return false;

  // Check if all characters have already been placed
  const hiddenCount = Array.from(charButtons).filter(btn => btn.getAttribute('is_hidden') === '1').length;
  if (hiddenCount === charButtons.length) return false;

  // Find index of next blank underscore
  const nextBlankIndex = answerTemplate.indexOf('_');
  if (nextBlankIndex === -1) return false;

  const correctChar = correctTranslation[nextBlankIndex];
  if (!correctChar) return false;

  if (isStealth) {
    charButtons.forEach(btn => btn.classList.remove('wocabee-correct-char'));
    window.Wocabee.stealth?.setSolution(`"${correctChar}" (${correctTranslation})`);
    return true;
  }

  let matched = false;
  charButtons.forEach(btn => {
    btn.classList.remove('wocabee-correct-char');

    if (!matched && btn.getAttribute('is_hidden') !== '1') {
      const btnText = btn.textContent.trim();
      if (btnText.toLowerCase() === correctChar.toLowerCase()) {
        btn.classList.add('wocabee-correct-char');
        matched = true;
      }
    }
  });

  return matched;
};
