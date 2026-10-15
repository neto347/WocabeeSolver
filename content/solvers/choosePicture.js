// Solver for "Choose Picture" Exercise
window.Wocabee = window.Wocabee || {};
window.Wocabee.solvers = window.Wocabee.solvers || {};

window.Wocabee.solvers.choosePicture = function (words, helpers, isStealth) {
  const container = document.getElementById('choosePicture');
  if (!container || container.style.display === 'none') return false;

  const questionBtn = container.querySelector('#choosePictureWord');
  if (!questionBtn) return false;

  const questionText = questionBtn.textContent.trim();
  const pictures = container.querySelectorAll('#word-img-container .picture');
  if (pictures.length === 0) return false;

  const correctWord = helpers.findTranslation(words, questionText);
  if (!correctWord) return false;

  if (isStealth) {
    pictures.forEach(pic => pic.classList.remove('picture-correct', 'picture-incorrect'));
    const indicator = document.getElementById('choosePictureIndicator');
    if (indicator) indicator.style.display = 'none';
    window.Wocabee.stealth?.setSolution(`Obrázek: ${correctWord}`);
    return true;
  }

  // Normal mode
  pictures.forEach(pic => {
    pic.classList.remove('picture-correct', 'picture-incorrect');
    const picWord = pic.getAttribute('word');
    if (picWord && picWord.toLowerCase() === correctWord.toLowerCase()) {
      pic.classList.add('picture-correct');
    }
  });

  let indicatorElement = document.getElementById('choosePictureIndicator');
  if (!indicatorElement) {
    const hintDiv = document.getElementById('choosePictureHint');
    if (hintDiv) {
      indicatorElement = document.createElement('div');
      indicatorElement.id = 'choosePictureIndicator';
      hintDiv.parentNode.insertBefore(indicatorElement, hintDiv.nextSibling);
    }
  }

  if (indicatorElement) {
    indicatorElement.style.display = '';
    const selectedPic = document.querySelector('#word-img-container .slick-current .picture');
    if (selectedPic) {
      const selectedWord = selectedPic.getAttribute('word');
      if (selectedWord && selectedWord.toLowerCase() === correctWord.toLowerCase()) {
        indicatorElement.innerHTML = '✓';
        indicatorElement.className = 'show-correct';
      } else {
        indicatorElement.innerHTML = '✗';
        indicatorElement.className = 'show-incorrect';
      }
    } else {
      indicatorElement.className = '';
    }
  }

  return true;
};
