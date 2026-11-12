import { $, reduced } from '../core/dom.js';

export function initPreloader() {
    const loader = $('#loader');
    const fill = $('#loaderFill');
    const count = $('#loaderCount');
    if (!loader) return;

    document.body.classList.add('loading');

    const finish = () => {
        document.body.classList.remove('loading');
        document.body.classList.add('ready');
        loader.classList.add('done');
        setTimeout(() => loader.remove(), 800);
    };

    if (reduced) return finish();

    let pct = 0;
    (function step() {
        pct = Math.min(100, pct + Math.random() * 18 + 14);
        count.textContent = Math.round(pct);
        fill.style.width = pct + '%';
        // contagem curta: a abertura não deve esperar um carregamento de mentira
        if (pct < 100) setTimeout(step, 24 + Math.random() * 16);
        else finish();
    })();
}
