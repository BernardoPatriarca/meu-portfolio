import { $ } from '../core/dom.js';
import { onScroll } from '../core/raf.js';
import { scrollToTop } from '../core/smooth-scroll.js';

export function initBackToTop() {
    const btn = $('#toTop');
    if (!btn) return;

    btn.addEventListener('click', scrollToTop);

    onScroll(({ y, progress }) => {
        btn.classList.toggle('show', y > 700);
        btn.style.setProperty('--pp', progress.toFixed(3));
    });
}
