import { $, $$, clamp01, reduced } from '../core/dom.js';
import { onScroll, watch } from '../core/raf.js';

export function initParallax() {
    if (reduced) return;

    const hero = $('.hero');
    const title = $('.hero-title');
    const lead = $('.hero-lead');
    const portrait = $('.portrait');
    const seal = $('#seal');
    const stage = $('#stage');
    const orbs = $$('.stage .orb');
    const bento = $('.bento');
    const cells = $$('.bento .cell');

    let heroVisible = true;
    let bentoVisible = false;
    watch(hero, v => heroVisible = v);
    watch(bento, v => bentoVisible = v);

    onScroll(({ y, progress }) => {
        if (stage) {
            const drift = (progress - 0.5) * innerHeight * 0.7;
            orbs.forEach((orb, i) => {
                const depth = [1, -0.68, 0.42][i];
                orb.style.transform = `translate3d(0, ${(drift * depth).toFixed(1)}px, 0)`;
            });
            stage.style.setProperty('--o1', (0.95 - progress * 0.55).toFixed(2));
            stage.style.setProperty('--o2', (0.18 + progress * 0.72).toFixed(2));
            stage.style.setProperty('--o3', (0.22 + Math.sin(progress * Math.PI) * 0.62).toFixed(2));
        }

        if (heroVisible && title) {
            const p = clamp01(y / (innerHeight * 0.85));
            title.style.setProperty('--py', `${(p * 90).toFixed(1)}px`);
            title.style.opacity = (1 - p * 0.92).toFixed(3);
            lead.style.setProperty('--py', `${(p * 130).toFixed(1)}px`);
            lead.style.opacity = clamp01(1 - p * 1.35).toFixed(3);
            portrait?.style.setProperty('--py', `${(p * -70).toFixed(1)}px`);
            seal?.style.setProperty('--rot', `${(y * 0.12).toFixed(1)}deg`);
        }

        if (bentoVisible && cells.length) {
            const r = bento.getBoundingClientRect();
            const p = clamp01((innerHeight - r.top) / (innerHeight + r.height)) - 0.5;
            cells.forEach((c, i) => c.style.setProperty('--py', `${(p * (i % 2 ? 30 : -20)).toFixed(1)}px`));
        }
    });
}
