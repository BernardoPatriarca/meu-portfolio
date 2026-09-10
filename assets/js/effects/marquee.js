import { $$, reduced } from '../core/dom.js';
import { onScroll } from '../core/raf.js';

export function initMarquee() {
    const tracks = $$('[data-marquee]');
    if (!tracks.length) return;

    const pauseObs = new IntersectionObserver(entries => {
        entries.forEach(e => e.target.classList.toggle('paused', !e.isIntersecting));
    }, { rootMargin: '150px' });
    tracks.forEach(el => pauseObs.observe(el));

    if (reduced) return;

    const anims = [];
    requestAnimationFrame(() => tracks.forEach(el => anims.push(...el.getAnimations())));

    const band = document.querySelector('.band');

    onScroll(({ velocity }) => {
        if (anims.length) {
            const rate = Math.max(-4, Math.min(6, 1 + velocity * 0.07));
            anims.forEach(a => a.playbackRate = rate);
        }
        band?.style.setProperty('--sk', `${(velocity * 0.05).toFixed(2)}deg`);
    });
}
