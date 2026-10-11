import { $$ } from '../core/dom.js';

export function initLangBars() {
    // observa o trilho: o preenchimento começa em scaleX(0), sem área para o observer medir
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const fill = e.target.querySelector('i');
            fill.style.transform = `scaleX(${fill.dataset.fill})`;
            obs.unobserve(e.target);
        });
    }, { threshold: 0.5 });

    $$('.lang-bar').forEach(el => obs.observe(el));
}
