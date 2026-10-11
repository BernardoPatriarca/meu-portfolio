/**
 * Letras-fantasma atrás dos cabeçalhos de seção.
 *
 * Cada seção já tem um rótulo numerado do tipo "(01) — Sobre". A palavra
 * desse rótulo vira uma letra gigante vazada no fundo, que desliza na
 * direção contrária à rolagem — o pano de fundo tipográfico da referência.
 *
 * Nada é escrito no HTML à mão: o texto sai do rótulo que já existe e a
 * camada é aria-hidden, então leitores de tela não leem nada duas vezes.
 */

import { $$, clamp01, reduced } from '../core/dom.js';
import { onScroll, watch } from '../core/raf.js';

/** "(01) — Sobre mim" → "SOBRE MIM" (tira a numeração e o travessão) */
function wordOf(label) {
    return (label || '')
        .replace(/\(.*?\)/g, '')
        .replace(/[—–-]/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
        .toUpperCase();
}

export function initGhostType() {
    const made = [];

    for (const head of $$('.sec-head')) {
        const section = head.closest('section');
        if (!section) continue;

        const word = wordOf(head.querySelector('.mono-label')?.textContent);
        if (word.length < 3) continue;

        const wrap = document.createElement('div');
        wrap.className = 'ghost-wrap';
        wrap.setAttribute('aria-hidden', 'true');

        const span = document.createElement('span');
        span.className = 'ghost-word';
        span.textContent = word;
        // o corpo da fonte cai conforme o número de letras, senão uma
        // palavra longa vira só um pedaço ilegível no meio da tela
        span.style.setProperty('--len', String(word.length));
        wrap.appendChild(span);

        // primeiro filho: fica atrás do conteúdo
        section.insertBefore(wrap, section.firstChild);
        made.push({ section, span, visible: false });
    }

    if (!made.length || reduced) return;

    for (const g of made) watch(g.section, v => g.visible = v, '20%');

    onScroll(() => {
        for (const g of made) {
            if (!g.visible) continue;
            const r = g.section.getBoundingClientRect();
            // -0.5 → 0.5 enquanto a seção cruza a tela
            const p = clamp01((innerHeight - r.top) / (innerHeight + r.height)) - 0.5;
            g.span.style.transform = `translate3d(${(-p * 26).toFixed(1)}%, ${(p * -30).toFixed(0)}px, 0)`;
        }
    });
}
