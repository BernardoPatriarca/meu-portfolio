import { $$ } from '../core/dom.js';

export function initLangBars() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.style.transform = `scaleX(${e.target.dataset.fill})`;
            obs.unobserve(e.target);
        });
    }, { threshold: 0.5 });

    $$('.lang-bar i').forEach(el => obs.observe(el));
}
