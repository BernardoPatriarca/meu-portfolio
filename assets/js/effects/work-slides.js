import { $$, reduced } from '../core/dom.js';

const INTERVAL = 3200;

export function initWorkSlides() {
    if (reduced) return;

    const groups = $$('[data-slides]')
        .map(el => ({ el, slides: $$('.slide', el), i: 0 }))
        .filter(g => g.slides.length > 1);

    if (!groups.length) return;

    const advance = () => {
        if (document.hidden) return;
        groups.forEach(g => {
            g.slides[g.i].classList.remove('on');
            g.i = (g.i + 1) % g.slides.length;
            g.slides[g.i].classList.add('on');
        });
    };

    let timer = setInterval(advance, INTERVAL);

    document.addEventListener('visibilitychange', () => {
        clearInterval(timer);
        if (!document.hidden) timer = setInterval(advance, INTERVAL);
    });
}
