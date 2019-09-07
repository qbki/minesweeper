import 'core-js';
import App from './app/App';

window.addEventListener('DOMContentLoaded', () => {
  const domRoot: HTMLDivElement | null = document.querySelector('#main');
  if (domRoot instanceof HTMLDivElement) {
    const app = new App(domRoot);
  } else {
    document.body.innerHTML = 'Fatal Error: Can\'t load the game';
  }
});
