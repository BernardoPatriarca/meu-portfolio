import { $, $$, fine } from '../core/dom.js';
import { onFrame, onScroll } from '../core/raf.js';

/** troca a tela mostrada a cada N milissegundos enquanto o cursor está parado */
const CICLO = 2200;

/**
 * Preview que acompanha o cursor sobre as linhas de projeto.
 *
 * O conteúdo é montado a partir das telas que já estão no HTML de cada
 * linha (`.work-thumb .slide`), então os caminhos das imagens vivem num
 * lugar só. Projeto sem telas — o ZELA, ainda em desenvolvimento — cai
 * no cartão de espera.
 */
export function initWorkFloat(cursorPos) {
    const float = $('#workFloat');
    if (!fine || !float || !cursorPos) return;

    const rows = $$('.works .work');
    if (!rows.length) return;

    // monta um quadro por linha, a partir do que já existe no HTML
    float.innerHTML = '';
    const frames = rows.map(row => {
        const frame = document.createElement('div');
        frame.className = 'wf-frame';

        const shots = $$('.work-thumb .slide', row);
        if (shots.length) {
            for (const shot of shots) {
                const img = document.createElement('img');
                img.src = shot.getAttribute('src');
                img.alt = '';
                img.loading = 'lazy';
                img.decoding = 'async';
                frame.appendChild(img);
            }
            frame.firstChild.classList.add('on');
        } else {
            const repo = (row.querySelector('.work-links a')?.href || '').split('/').pop();
            frame.classList.add('shot');
            frame.innerHTML = `<span class="shot-repo"></span><span class="mono-label">MVP em desenvolvimento</span>`;
            frame.querySelector('.shot-repo').textContent = repo;
        }

        float.appendChild(frame);
        return frame;
    });

    const pos = { x: 0, y: 0 };
    let active = -1;
    let slide = 0;
    let trocaEm = 0;

    const mostrar = i => {
        frames.forEach((f, n) => f.classList.toggle('on', n === i));
        slide = 0;
        trocaEm = performance.now() + CICLO;
        const imgs = frames[i]?.querySelectorAll('img') || [];
        imgs.forEach((im, n) => im.classList.toggle('on', n === 0));
    };

    rows.forEach((row, i) => {
        row.addEventListener('mouseenter', () => {
            active = i;
            mostrar(i);
            float.classList.add('show');
        });
        row.addEventListener('mouseleave', () => {
            float.classList.remove('show');
            active = -1;
        });
    });

    onFrame(now => {
        if (active < 0 && !float.classList.contains('show')) return;

        pos.x += (cursorPos.mx - pos.x) * 0.1;
        pos.y += (cursorPos.my - pos.y) * 0.1;
        float.style.left = pos.x + 'px';
        float.style.top = pos.y + 'px';

        // passa as telas do projeto em foco
        if (active < 0) return;
        const imgs = frames[active].querySelectorAll('img');
        if (imgs.length < 2 || now < trocaEm) return;
        imgs[slide].classList.remove('on');
        slide = (slide + 1) % imgs.length;
        imgs[slide].classList.add('on');
        trocaEm = now + CICLO;
    });

    onScroll(() => {
        if (active < 0) return;
        float.classList.remove('show');
        active = -1;
    });
}
