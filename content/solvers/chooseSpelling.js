// Solver for "Choose Spelling" Exercise
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.chooseSpelling = function (words, helpers, isStealth) {
  const container = document.getElementById('chooseSpelling');
  if (!container || container.style.display === 'none') return false;

  const questionBtn = container.querySelector('#cs_word');
  if (!questionBtn) return false;

  const questionText = questionBtn.textContent.trim();
  const answerButtons = container.querySelectorAll('#chooseSpellingWords .chooseSpellingAnswer, #chooseSpellingWords button');
  if (answerButtons.length === 0) return false;

  answerButtons.forEach(btn => btn.classList.remove('wocabee-correct-answer'));

  const aWordVal = document.getElementById('a_word')?.value?.trim();
  const expectedTranslation = questionText ? helpers.findTranslation(words, questionText) : null;

  let matched = false;
  answerButtons.forEach(btn => {
    if (matched) return;
    const btnText = btn.textContent.trim();

    let isMatch = false;
    if (aWordVal && btnText.toLowerCase() === aWordVal.toLowerCase()) {
      isMatch = true;
    } else if (expectedTranslation && btnText.toLowerCase() === expectedTranslation.toLowerCase()) {
      isMatch = true;
    } else if (questionText && helpers.isPairMatch(words, questionText, btnText)) {
      isMatch = true;
    }

    if (isMatch) {
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
