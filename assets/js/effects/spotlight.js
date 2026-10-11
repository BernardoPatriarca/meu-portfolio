import { $, fine } from '../core/dom.js';

export function initSpotlight() {
    if (!fine) return;

    $('.bento')?.addEventListener('mousemove', e => {
        const cell = e.target.closest('.cell');
        if (!cell) return;
        const r = cell.getBoundingClientRect();
        cell.style.setProperty('--mx', `${e.clientX - r.left}px`);
        cell.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
}
