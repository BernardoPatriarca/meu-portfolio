import { $, $$, fine } from '../core/dom.js';
import { onFrame, onScroll } from '../core/raf.js';

export function initWorkFloat(cursorPos) {
    const float = $('#workFloat');
    if (!fine || !float || !cursorPos) return;

    const items = $$('#workFloat img, #workFloat .wf-item');
    const pos = { x: 0, y: 0 };
    let active = false;

    $$('.work').forEach(work => {
        work.addEventListener('mouseenter', () => {
            const i = +work.dataset.img;
            items.forEach((item, n) => item.classList.toggle('on', n === i));
            float.classList.add('show');
            active = true;
        });
        work.addEventListener('mouseleave', () => {
            float.classList.remove('show');
            active = false;
        });
    });

    onFrame(() => {
        if (!active && !float.classList.contains('show')) return;
        pos.x += (cursorPos.mx - pos.x) * 0.1;
        pos.y += (cursorPos.my - pos.y) * 0.1;
        float.style.left = pos.x + 'px';
        float.style.top = pos.y + 'px';
    });

    onScroll(() => {
        if (!active) return;
        float.classList.remove('show');
        active = false;
    });
}
