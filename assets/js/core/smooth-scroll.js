import { $, $$, reduced } from './dom.js';
import { onFrame } from './raf.js';

export const lenis = (window.Lenis && !reduced)
    ? new Lenis({ lerp: 0.09, wheelMultiplier: 1.05 })
    : null;

if (lenis) onFrame(time => lenis.raf(time));

export function scrollToEl(target) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.3 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

export function scrollToTop() {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else scrollTo({ top: 0, behavior: 'smooth' });
}

export const pause = () => lenis?.stop();
export const resume = () => lenis?.start();

export function bindAnchors(onNavigate) {
    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = $(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            onNavigate?.();
            scrollToEl(target);
        });
    });
}
