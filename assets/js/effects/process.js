import { $, $$, clamp01 } from '../core/dom.js';
import { onScroll, watch } from '../core/raf.js';

const desktop = matchMedia('(min-width: 821px)');

/** fração de cada trecho em que o carrossel fica parado no card */
const HOLD = 0.46;

/**
 * Mapeia o progresso bruto da rolagem num progresso "com degraus".
 *
 * Sem isto o trilho desliza o tempo todo e cada etapa fica centralizada por
 * um instante só. Aqui cada card segura enquanto a rolagem cobre os
 * primeiros HOLD do trecho, e só depois desliza para o próximo — é preciso
 * rolar um pouco mais para sair de "Entrega", por exemplo.
 */
function stepped(p, steps) {
    if (steps < 2) return p;
    const seg = 1 / (steps - 1);
    const i = Math.min(steps - 2, Math.floor(p / seg));
    const u = clamp01((p - i * seg) / seg);
    if (u <= HOLD) return i * seg;
    const e = (u - HOLD) / (1 - HOLD);
    return (i + e * e * (3 - 2 * e)) * seg;   // saída suavizada
}

export function initProcess() {
    const section = $('#process');
    const track = $('#procTrack');
    const bar = $('#procBar');
    const cards = $$('.proc-card');
    if (!section || !track) return;

    let visible = false;
    let distance = 0;

    const measure = () => distance = Math.max(0, track.scrollWidth - innerWidth);
    measure();
    new ResizeObserver(measure).observe(track);
    watch(section, v => visible = v);

    onScroll(() => {
        if (!visible || !desktop.matches) return;

        const r = section.getBoundingClientRect();
        const travel = r.height - innerHeight;
        const raw = clamp01(travel > 0 ? -r.top / travel : 0);
        const p = stepped(raw, cards.length);

        track.style.transform = `translate3d(${-(p * distance).toFixed(1)}px, 0, 0)`;
        // a barra segue a rolagem crua: parar junto pareceria travamento
        bar.style.setProperty('--pp', raw.toFixed(3));

        const mid = innerWidth / 2;
        cards.forEach(card => {
            const b = card.getBoundingClientRect();
            const dist = Math.abs((b.left + b.width / 2) - mid);
            const f = clamp01(1 - dist / (card.offsetWidth * 1.05)) ** 2;
            card.style.setProperty('--f', f.toFixed(3));
            card.style.zIndex = f > 0.45 ? 2 : 1;
        });
    });
}
