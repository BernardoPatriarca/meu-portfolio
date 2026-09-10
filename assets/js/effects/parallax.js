import { $, $$, clamp01, reduced } from '../core/dom.js';
import { onScroll, watch } from '../core/raf.js';

/**
 * Escreve uma propriedade so quando o valor realmente mudou.
 * O hero tem um <h1> gigante com -webkit-text-stroke: reescrever estilo nele
 * a cada frame de scroll custa um repaint do texto inteiro.
 */
const writer = () => {
    const last = new Map();
    return (el, prop, val) => {
        if (!el) return;
        const cache = last.get(el) || (last.set(el, {}), last.get(el));
        if (cache[prop] === val) return;
        cache[prop] = val;
        if (prop === 'opacity') el.style.opacity = val;
        else if (prop === 'transform') el.style.transform = val;
        else el.style.setProperty(prop, val);
    };
};

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

    const set = writer();

    // medir o bento a cada frame forca um reflow sincrono; a posicao dele no
    // documento so muda em resize, entao medimos uma vez e derivamos do scroll
    let bentoBox = null;
    addEventListener('resize', () => bentoBox = null, { passive: true });

    onScroll(({ y, progress }) => {
        if (stage) {
            const drift = (progress - 0.5) * innerHeight * 0.7;
            orbs.forEach((orb, i) => {
                const depth = [1, -0.68, 0.42][i];
                set(orb, 'transform', `translate3d(0, ${(drift * depth).toFixed(1)}px, 0)`);
            });
            set(stage, '--o1', (0.95 - progress * 0.55).toFixed(2));
            set(stage, '--o2', (0.18 + progress * 0.72).toFixed(2));
            set(stage, '--o3', (0.22 + Math.sin(progress * Math.PI) * 0.62).toFixed(2));
        }

        if (heroVisible && title) {
            const p = clamp01(y / (innerHeight * 0.85));
            set(title, '--py', `${(p * 90).toFixed(0)}px`);
            // quantizado em passos de 2%: o olho nao ve a diferenca e o titulo
            // com contorno repinta ~50x no scroll inteiro em vez de todo frame
            set(title, 'opacity', (Math.round((1 - p * 0.92) * 50) / 50).toFixed(2));
            set(lead, '--py', `${(p * 130).toFixed(0)}px`);
            set(lead, 'opacity', (Math.round(clamp01(1 - p * 1.35) * 50) / 50).toFixed(2));
            set(portrait, '--py', `${(p * -70).toFixed(0)}px`);
            set(seal, '--rot', `${(y * 0.12).toFixed(0)}deg`);
        }

        if (bentoVisible && cells.length) {
            if (!bentoBox) {
                const r = bento.getBoundingClientRect();
                bentoBox = { top: r.top + y, height: r.height };
            }
            const top = bentoBox.top - y;
            const p = clamp01((innerHeight - top) / (innerHeight + bentoBox.height)) - 0.5;
            cells.forEach((c, i) => set(c, '--py', `${(p * (i % 2 ? 30 : -20)).toFixed(0)}px`));
        }
    });
}
