import { $$ } from '../core/dom.js';

export function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            obs.unobserve(e.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    // blocos que animam ao entrar em tela, mas não usam a classe .reveal
    // (o hero, por exemplo, tem máscaras próprias)
    const inView = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in-view');
            inView.unobserve(e.target);
        });
    }, { threshold: 0.2 });
    $$('[data-in-view]').forEach(el => inView.observe(el));

    $$('.reveal').forEach(el => {
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.setProperty('--i', siblings.indexOf(el));
        obs.observe(el);
    });
}
