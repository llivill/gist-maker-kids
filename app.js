(() => {
  const home = document.getElementById('home-screen');
  const boardScreen = document.getElementById('board-screen');
  const setupScreen = document.getElementById('setup-screen');
  const ideaScreen = document.getElementById('idea-screen');
  const detailScreen = document.getElementById('detail-screen');
  const reviewScreen = document.getElementById('review-screen');
  const screens = [home, boardScreen, setupScreen, ideaScreen, detailScreen, reviewScreen];
  const idle = home.querySelector('.idle');
  const wave = home.querySelector('.wave');
  const area = home.querySelector('.video-area');
  const speech = home.querySelector('#speech-text');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const welcome = speech.textContent;
  let busy = false;
  let messageTimer;
  let fadeTimer;
  let safetyTimer;

  function showScreen(screen) {
    screens.forEach(item => { item.hidden = item !== screen; });
    const back = screen.querySelector('.board-back, .flow-back');
    if (back) back.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function typeSpeech(message) {
    speech.textContent = message;
    const length = Array.from(message).length;
    speech.style.setProperty('--type-steps', length);
    speech.style.setProperty('--type-time', `${Math.max(0.7, length * 0.075)}s`);
    speech.classList.remove('typing');
    void speech.offsetWidth;
    speech.classList.add('typing');
  }

  function showBoard() {
    if (!busy) return;
    clearTimeout(fadeTimer);
    clearTimeout(safetyTimer);
    wave.pause();
    idle.pause();
    area.classList.remove('is-waving');
    showScreen(boardScreen);
    busy = false;
  }

  function showHome() {
    clearTimeout(messageTimer);
    clearTimeout(fadeTimer);
    clearTimeout(safetyTimer);
    busy = false;
    wave.pause();
    area.classList.remove('is-waving');
    showScreen(home);
    typeSpeech(welcome);
    if (!reduced) {
      try { idle.currentTime = 2; } catch (_) {}
      const play = idle.play();
      if (play && play.catch) play.catch(() => {});
    }
    home.querySelector('.primary').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  typeSpeech(welcome);
  if (reduced) { idle.removeAttribute('autoplay'); idle.pause(); }
  else { const play = idle.play(); if (play && play.catch) play.catch(() => {}); }
  wave.addEventListener('ended', showBoard);
  wave.addEventListener('error', showBoard);
  home.querySelectorAll('[data-message]').forEach(button => button.addEventListener('click', () => {
    if (busy) return;
    clearTimeout(messageTimer);
    typeSpeech(button.dataset.message);
    if (!button.classList.contains('primary')) {
      messageTimer = setTimeout(() => typeSpeech(welcome), 1800);
      return;
    }
    busy = true;
    if (reduced) {
      showBoard();
      return;
    }
    try { wave.currentTime = 0; } catch (_) {}
    safetyTimer = setTimeout(showBoard, 8000);
    Promise.resolve(wave.play()).then(() => {
      if (!busy) return;
      area.classList.add('is-waving');
      fadeTimer = setTimeout(() => idle.pause(), 340);
    }).catch(showBoard);
  }));

  boardScreen.querySelector('.board-back').addEventListener('click', showHome);
  const help = boardScreen.querySelector('.board-help');
  const helpContent = document.getElementById('board-help-content');
  help.addEventListener('click', () => {
    const opened = help.getAttribute('aria-expanded') === 'true';
    help.setAttribute('aria-expanded', String(!opened));
    helpContent.hidden = opened;
  });
  const next = boardScreen.querySelector('.board-next');
  const status = document.getElementById('board-status');
  boardScreen.querySelectorAll('input[name="board"]').forEach(input => {
    input.addEventListener('change', () => {
      next.disabled = false;
      status.textContent = '';
    });
  });
  next.addEventListener('click', () => {
    const choice = boardScreen.querySelector('input[name="board"]:checked');
    if (!choice) return;
    document.querySelectorAll('[data-selected-board]').forEach(item => { item.textContent = choice.value; });
    showScreen(setupScreen);
  });

  setupScreen.querySelector('.setup-back').addEventListener('click', () => showScreen(boardScreen));
  setupScreen.querySelectorAll('.setup-next, .setup-skip').forEach(button => {
    button.addEventListener('click', () => showScreen(ideaScreen));
  });
  ideaScreen.querySelector('.idea-back').addEventListener('click', () => showScreen(setupScreen));
  const ideaText = document.getElementById('idea-text');
  const ideaNext = ideaScreen.querySelector('.idea-next');
  const examples = [...ideaScreen.querySelectorAll('.idea-example')];
  function updateIdea() {
    const value = ideaText.value.trim();
    ideaNext.disabled = !value;
    examples.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.idea === value)));
  }
  examples.forEach(button => button.addEventListener('click', () => {
    ideaText.value = button.dataset.idea;
    updateIdea();
  }));
  ideaText.addEventListener('input', updateIdea);
  ideaNext.addEventListener('click', () => {
    if (!ideaText.value.trim()) return;
    document.querySelectorAll('[data-selected-idea]').forEach(item => { item.textContent = ideaText.value.trim(); });
    showScreen(detailScreen);
  });
  detailScreen.querySelector('.detail-back').addEventListener('click', () => showScreen(ideaScreen));
  const detailNext = detailScreen.querySelector('.detail-next');
  detailScreen.querySelectorAll('input[name="trigger"]').forEach(input => {
    input.addEventListener('change', () => { detailNext.disabled = false; });
  });
  detailNext.addEventListener('click', () => {
    const choice = detailScreen.querySelector('input[name="trigger"]:checked');
    if (!choice) return;
    document.querySelectorAll('[data-selected-trigger]').forEach(item => { item.textContent = choice.value; });
    document.getElementById('review-status').textContent = '';
    showScreen(reviewScreen);
  });
  reviewScreen.querySelector('.review-back').addEventListener('click', () => showScreen(detailScreen));
  reviewScreen.querySelector('.review-next').addEventListener('click', () => {
    document.getElementById('review-status').textContent = '생각을 잘 정리했어요! 다음 부품 준비 화면은 아직 준비 중이에요.';
  });
})();
