import { $$ } from '../core/dom.js';

export function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            obs.unobserve(e.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    $$('.reveal').forEach(el => {
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.setProperty('--i', siblings.indexOf(el));
        obs.observe(el);
    });
}
