(() => {
  const root = document.getElementById('dot-kids-video-home');
  const idle = root.querySelector('.idle');
  const wave = root.querySelector('.wave');
  const area = root.querySelector('.video-area');
  const speech = root.querySelector('#speech-text');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const welcome = speech.textContent;
  let busy = false;
  let messageTimer;
  let fadeTimer;
  function typeSpeech(message) {
    speech.textContent = message;
    const length = Array.from(message).length;
    speech.style.setProperty('--type-steps', length);
    speech.style.setProperty('--type-time', `${Math.max(0.7, length * 0.075)}s`);
    speech.classList.remove('typing');
    void speech.offsetWidth;
    speech.classList.add('typing');
  }
  function resetHard() {
    clearTimeout(messageTimer);
    clearTimeout(fadeTimer);
    wave.pause();
    area.classList.remove('is-waving');
    busy = false;
    typeSpeech(welcome);
    if (!reduced) { const p = idle.play(); if (p && p.catch) p.catch(() => {}); }
  }
  function returnToIdle() {
    clearTimeout(fadeTimer);
    try { idle.currentTime = 2; } catch (_) {}
    Promise.resolve(idle.play()).then(() => {
      area.classList.remove('is-waving');
      fadeTimer = setTimeout(() => {
        wave.pause();
        busy = false;
        typeSpeech(welcome);
      }, 340);
    }).catch(resetHard);
  }
  typeSpeech(welcome);
  if (reduced) { idle.removeAttribute('autoplay'); idle.pause(); }
  else { const p = idle.play(); if (p && p.catch) p.catch(() => {}); }
  wave.addEventListener('ended', returnToIdle);
  wave.addEventListener('error', resetHard);
  root.querySelectorAll('[data-message]').forEach(button => button.addEventListener('click', () => {
    if (busy) return;
    clearTimeout(messageTimer);
    typeSpeech(button.dataset.message);
    if (!button.classList.contains('primary') || reduced) {
      messageTimer = setTimeout(() => typeSpeech(welcome), 1800);
      return;
    }
    busy = true;
    try { wave.currentTime = 0; } catch (_) {}
    const play = wave.play();
    Promise.resolve(play).then(() => {
      area.classList.add('is-waving');
      fadeTimer = setTimeout(() => idle.pause(), 340);
    }).catch(resetHard);
  }));
})();
