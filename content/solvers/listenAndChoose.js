// Solver for "Listen And Choose" Exercise
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.listenAndChoose = function (words, helpers, isStealth) {
  const container = document.getElementById('listenAndChoose');
  if (!container || container.style.display === 'none') return false;

  const answerButtons = container.querySelectorAll('#listenAndChooseWords button');
  if (answerButtons.length === 0) return false;

  const aWordVal = document.getElementById('a_word')?.value?.trim();
  if (!aWordVal) return false;

  answerButtons.forEach(btn => btn.classList.remove('wocabee-correct-answer'));

  let matched = false;
  answerButtons.forEach(btn => {
    if (matched) return;
    const btnText = btn.textContent.trim();

    if (btnText.toLowerCase() === aWordVal.toLowerCase() || helpers.isPairMatch(words, aWordVal, btnText)) {
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
