// Solver for "Find Pair" Exercise
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.findPair = function (words, helpers, isStealth) {
  const container = document.getElementById('findPair');
  if (!container || container.style.display === 'none') return false;

  const questionButtons = Array.from(container.querySelectorAll('#q_words .fp_q'));
  const answerButtons = Array.from(container.querySelectorAll('#a_words .fp_a'));
  if (questionButtons.length === 0 || answerButtons.length === 0) return false;

  questionButtons.forEach(btn => btn.classList.remove('wocabee-correct-answer'));
  answerButtons.forEach(btn => btn.classList.remove('wocabee-correct-answer'));

  const pairs = [];
  questionButtons.forEach((qBtn, qIdx) => {
    const qId = qBtn.getAttribute('w_id');
    if (!qId) return;

    for (let aIdx = 0; aIdx < answerButtons.length; aIdx++) {
      const aBtn = answerButtons[aIdx];
      if (aBtn.getAttribute('w_id') === qId) {
        if (!isStealth) {
          qBtn.classList.add('wocabee-correct-answer');
          aBtn.classList.add('wocabee-correct-answer');
        }
        pairs.push(`${qIdx + 1}=${aIdx + 1}`);
        break;
      }
    }
  });

  if (pairs.length > 0) {
    if (isStealth) {
      window.Wocabee.stealth?.setSolution(`Páry: ${pairs.join(', ')}`);
    }
    return true;
  }

  return false;
};
