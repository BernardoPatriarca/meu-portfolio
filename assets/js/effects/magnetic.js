import { $$, fine, reduced } from '../core/dom.js';

export function initMagnetic() {
    if (!fine || reduced) return;

    $$('.magnetic').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width / 2) * 0.28;
            const y = (e.clientY - r.top - r.height / 2) * 0.4;
            el.style.transform = `translate(${x}px, ${y}px)`;
        });
        el.addEventListener('mouseleave', () => el.style.transform = '');
    });
}
