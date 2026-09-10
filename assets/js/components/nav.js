import { $, $$ } from '../core/dom.js';
import { onScroll } from '../core/raf.js';

export function initNav() {
    const nav = $('#nav');
    const dots = $('#dots');
    const navLinks = $$('.nav-links a');
    const dotLinks = $$('.dots a');

    const setActive = id => {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        dotLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
    };

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => e.isIntersecting && setActive(e.target.id));
    }, { threshold: 0.35 });

    $$('main section[id]').forEach(s => obs.observe(s));

    onScroll(({ y, down }) => {
        nav.classList.toggle('stuck', y > 40);
        nav.classList.toggle('hide', y > 500 && down && !document.body.classList.contains('menu-open'));
        dots?.classList.toggle('show', y > 600);
    });
}
