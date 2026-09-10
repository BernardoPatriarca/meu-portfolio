import { $, $$, fine } from '../core/dom.js';
import { onFrame } from '../core/raf.js';

const LABELS = { plus: '+', view: 'Ver' };

export function initCursor() {
    if (!fine) return;

    const ring = $('#cursor');
    const dot = $('#cursorDot');
    const label = $('#cursorLabel');
    if (!ring) return;

    $$('.work').forEach(w => w.dataset.cursor = 'view');

    const pos = { mx: 0, my: 0, cx: 0, cy: 0 };
    let ready = false;

    addEventListener('mousemove', e => {
        pos.mx = e.clientX;
        pos.my = e.clientY;
        dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        if (!ready) {
            ready = true;
            document.body.classList.add('cursor-ready');
        }
    }, { passive: true });

    document.addEventListener('mouseover', e => {
        const hit = e.target.closest('[data-cursor], a, button');
        if (!hit) return;
        const kind = hit.dataset.cursor || 'link';
        ring.classList.toggle('on-plus', kind !== 'link');
        ring.classList.toggle('on-link', kind === 'link');
        label.textContent = LABELS[kind] || '';
    });

    document.addEventListener('mouseout', e => {
        if (e.target.closest('[data-cursor], a, button')) ring.classList.remove('on-link', 'on-plus');
    });

    onFrame(() => {
        // mouse parado: o anel ja alcancou o alvo, nao ha nada pra escrever
        if (Math.abs(pos.mx - pos.cx) < 0.1 && Math.abs(pos.my - pos.cy) < 0.1) return;

        pos.cx += (pos.mx - pos.cx) * 0.16;
        pos.cy += (pos.my - pos.cy) * 0.16;
        ring.style.transform = `translate3d(${pos.cx}px, ${pos.cy}px, 0)`;
    });

    return pos;
}
