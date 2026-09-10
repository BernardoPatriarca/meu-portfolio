import { $, $$ } from '../core/dom.js';
import { pause, resume } from '../core/smooth-scroll.js';

const isOpen = () => document.body.classList.contains('menu-open');

export function closeMenu() {
    if (!isOpen()) return;
    document.body.classList.remove('menu-open');
    $('#menuBtn')?.setAttribute('aria-expanded', 'false');
    resume();
}

export function initMenu() {
    const btn = $('#menuBtn');
    if (!btn) return;

    $$('.menu-links a').forEach((a, i) => a.style.setProperty('--i', i));

    btn.addEventListener('click', () => {
        const open = document.body.classList.toggle('menu-open');
        btn.setAttribute('aria-expanded', open);
        open ? pause() : resume();
    });

    document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
}
