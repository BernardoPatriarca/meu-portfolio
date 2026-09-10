import { $$ } from '../core/dom.js';

const DURATION = 1400;

export function initCounters() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            const target = +el.dataset.count;
            const suffix = el.dataset.suffix || '';
            const start = performance.now();

            (function tick(now) {
                const t = Math.min(1, (now - start) / DURATION);
                el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + (t === 1 ? suffix : '');
                if (t < 1) requestAnimationFrame(tick);
            })(start);

            obs.unobserve(el);
        });
    }, { threshold: 0.6 });

    $$('[data-count]').forEach(el => obs.observe(el));
}
