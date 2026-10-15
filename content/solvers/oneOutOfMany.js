// Solver for "One Out Of Many" Quiz
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.oneOutOfMany = function (words, helpers, isStealth) {
  const container = document.getElementById('oneOutOfMany');
  if (!container || container.style.display === 'none') return false;

  const answerButtons = container.querySelectorAll('#oneOutOfManyWords .oneOutOfManyWord, #oneOutOfManyWords button');
  if (answerButtons.length === 0) return false;

  answerButtons.forEach(btn => btn.classList.remove('wocabee-correct-answer'));

  const aWordInput = document.getElementById('a_word');
  const targetAnswer = aWordInput?.value?.trim();

  const questionBtn = container.querySelector('#oneOutOfManyQuestionWord, .questionBtn, .wordQuestion');
  let questionText = null;
  if (questionBtn) {
    const allText = questionBtn.textContent.trim();
    const lines = allText.split('\n').map(l => l.trim()).filter(Boolean);
    questionText = lines[0] || allText;
  }

  const expectedTranslation = questionText ? helpers.findTranslation(words, questionText) : null;

  let matched = false;
  answerButtons.forEach(btn => {
    if (matched) return;
    const btnText = btn.textContent.trim();

    let isCorrect = false;
    if (targetAnswer && btnText.toLowerCase() === targetAnswer.toLowerCase()) {
      isCorrect = true;
    } else if (expectedTranslation && btnText.toLowerCase() === expectedTranslation.toLowerCase()) {
      isCorrect = true;
    } else if (questionText && helpers.isPairMatch(words, questionText, btnText)) {
      isCorrect = true;
    }

    if (isCorrect) {
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
