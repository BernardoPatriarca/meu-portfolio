import { $ } from '../core/dom.js';

export function initClock() {
    const targets = [
        { el: $('#clockTop'), seconds: false },
        { el: $('#clockBento'), seconds: true },
        { el: $('#clockFoot'), seconds: false }
    ].filter(t => t.el);

    if (!targets.length) return;

    const tick = () => {
        const [h, m, s] = new Date().toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).split(':');
        targets.forEach(t => t.el.textContent = t.seconds ? `${h}:${m}:${s}` : `${h}:${m}`);
    };

    tick();
    setInterval(tick, 1000);
}
