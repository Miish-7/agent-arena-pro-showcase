'use strict';
for (const library of document.querySelectorAll('[data-film-library]')) {
  const player = library.querySelector('video');
  const links = [...library.querySelectorAll('[data-film-choice]')];
  const title = library.querySelector('[data-film-title]');
  const direct = library.querySelector('[data-film-direct]');
  for (const link of links) {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (player.getAttribute('src') === link.getAttribute('href')) return;
      player.pause();
      player.setAttribute('src', link.getAttribute('href'));
            player.poster = link.dataset.poster;
      player.classList.toggle('square-film', link.getAttribute('href').endsWith('/LINKEDIN_LAUNCH_EN.mp4'));
      player.setAttribute('aria-label', link.textContent);
      direct.setAttribute('href', link.getAttribute('href'));
      title.textContent = link.textContent;
      for (const choice of links) choice.removeAttribute('aria-current');
      link.setAttribute('aria-current', 'true');
      player.load();
    });
  }
}

