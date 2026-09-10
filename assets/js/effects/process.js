import { $, $$, clamp01 } from '../core/dom.js';
import { onScroll, watch } from '../core/raf.js';

const desktop = matchMedia('(min-width: 821px)');

export function initProcess() {
    const section = $('#process');
    const track = $('#procTrack');
    const bar = $('#procBar');
    const cards = $$('.proc-card');
    if (!section || !track) return;

    let visible = false;
    let distance = 0;

    const measure = () => distance = Math.max(0, track.scrollWidth - innerWidth);
    measure();
    new ResizeObserver(measure).observe(track);
    watch(section, v => visible = v);

    onScroll(() => {
        if (!visible || !desktop.matches) return;

        const r = section.getBoundingClientRect();
        const travel = r.height - innerHeight;
        const p = clamp01(travel > 0 ? -r.top / travel : 0);

        track.style.transform = `translate3d(${-(p * distance).toFixed(1)}px, 0, 0)`;
        bar.style.setProperty('--pp', p.toFixed(3));

        const mid = innerWidth / 2;
        cards.forEach(card => {
            const b = card.getBoundingClientRect();
            const dist = Math.abs((b.left + b.width / 2) - mid);
            const f = clamp01(1 - dist / (card.offsetWidth * 1.05)) ** 2;
            card.style.setProperty('--f', f.toFixed(3));
            card.style.zIndex = f > 0.45 ? 2 : 1;
        });
    });
}
