import { $, $$, clamp01 } from '../core/dom.js';
import { onScroll, watch } from '../core/raf.js';

const HOT_WORDS = 6;

export function initManifesto() {
    const section = $('#manifesto');
    const text = $('.manifesto-text');
    if (!section || !text) return;

    const raw = text.textContent.trim().split(/\s+/);
    text.innerHTML = raw
        .map((w, i) => `<span class="w${i >= raw.length - HOT_WORDS ? ' hot' : ''}">${w}</span>`)
        .join(' ');

    const words = $$('.w', text);
    let visible = false;
    let shown = -1;
    watch(section, v => visible = v);

    onScroll(() => {
        if (!visible) return;
        const r = section.getBoundingClientRect();
        const p = clamp01((innerHeight * 0.88 - r.top) / (innerHeight * 0.6));
        const n = Math.round(p * words.length);
        if (n === shown) return;
        words.forEach((w, i) => w.classList.toggle('on', i < n));
        shown = n;
    });
}
