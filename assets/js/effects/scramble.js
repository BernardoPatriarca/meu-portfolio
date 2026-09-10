import { $$, reduced } from '../core/dom.js';

const GLYPHS = '▚▞█▓▒░/\\<>[]{}=+*#@$%&0123456789';
const STEPS = 16;

function scramble(el) {
    const text = el.textContent;
    let frame = 0;

    const id = setInterval(() => {
        frame++;
        const shown = Math.floor((frame / STEPS) * text.length);
        el.textContent = [...text]
            .map((c, i) => (i < shown || c === ' ') ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])
            .join('');
        if (frame >= STEPS) {
            clearInterval(id);
            el.textContent = text;
        }
    }, 40);
}

export function initScramble() {
    if (reduced) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            scramble(e.target);
            obs.unobserve(e.target);
        });
    }, { threshold: 0.9 });

    $$('[data-scramble]').forEach(el => obs.observe(el));
}
