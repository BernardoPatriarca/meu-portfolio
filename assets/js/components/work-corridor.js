/**
 * Corredor 3D dos projetos.
 *
 * Uma sala ladrilhada em perspectiva — chão, teto e duas paredes — com os
 * painéis dos projetos flutuando em profundidades diferentes. A câmera
 * avança conforme a página rola: a seção é alta e o palco fica preso com
 * position: sticky, então o scroll vira o trilho da câmera.
 *
 * Three.js (versão fixa, via CDN) só aqui e baixado sob demanda. Em
 * aparelho de toque, com prefers-reduced-motion ou sem WebGL fica a versão
 * em CSS: os mesmos painéis, parados, e a seção encolhe para a altura do
 * conteúdo (nada de 300vh de rolagem vazia no celular).
 *
 * O conteúdo vem das linhas de projeto que já existem no HTML — nada é
 * duplicado. A camada toda é aria-hidden; os links de verdade seguem na
 * lista abaixo.
 */

import { $, $$, clamp01, fine, reduced, root } from '../core/dom.js';
import { onFrame, onScroll } from '../core/raf.js';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

/* ---------- medidas do corredor, em unidades de mundo ---------- */
const HALF_W = 5;          // meia largura
const HALF_H = 3;          // meia altura
const Z_FAR = -30;         // fundo
const Z_NEAR = 8;          // atrás da câmera
const TILE = 2;            // lado do ladrilho
const CAM_FROM = 4;
const CAM_TO = -18.5;

/* os projetos da lista, ladeando o corredor */
const PANELS = [
    { x: -2.75, y: 0.15, z: -3, ry: 0.34 },
    { x: 2.75, y: -0.10, z: -9.5, ry: -0.34 },
    { x: -2.60, y: 0.10, z: -15.5, ry: 0.30 }
];

/* o projeto em destaque fecha o corredor, de frente para a câmera */
const FEATURE = { x: 0, y: 0.42, z: -24.5, w: 6.6, h: 4.12 };

const css = n => getComputedStyle(root).getPropertyValue(n).trim();

/** '#rrggbb' → número 0xrrggbb */
/** '#rrggbb' → 'r, g, b' para montar rgba() */
const rgbOf = v => {
    const n = hex(v);
    return `${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}`;
};

const hex = v => {
    const s = (v || '').trim();
    if (s.startsWith('#')) {
        const h = s.length === 4 ? s.slice(1).split('').map(c => c + c).join('') : s.slice(1, 7);
        return parseInt(h, 16);
    }
    const n = s.match(/\d+/g) || [0, 0, 0];
    return (+n[0] << 16) | (+n[1] << 8) | (+n[2]);
};

function readProjects() {
    return $$('.works .work').map(el => ({
        num: el.querySelector('.work-num')?.textContent.trim() || '',
        // o h3 do destaque carrega o selo junto; fica só o nome
        name: (el.querySelector('h3')?.childNodes[0]?.textContent || '').trim()
            || el.querySelector('h3')?.textContent.trim() || '',
        badge: el.querySelector('.work-badge')?.textContent.trim() || '',
        // :not(.work-meta) — a linha de destaque tem uma nota antes do texto
        desc: el.querySelector('.work-main p:not(.work-meta)')?.textContent.trim() || '',
        stack: el.querySelector('.work-tags')?.textContent.trim() || '',
        href: el.querySelector('.work-links a')?.href || '',
        // a tela real do projeto, quando existe (o ZELA ainda não tem)
        shot: el.querySelector('.work-thumb .slide')?.getAttribute('src') || '',
        feature: el.hasAttribute('data-feature')
    }));
}

function wrap(ctx, text, max) {
    const out = [];
    let line = '';
    for (const w of text.split(/\s+/)) {
        const next = line ? line + ' ' + w : w;
        if (ctx.measureText(next).width > max && line) { out.push(line); line = w; }
        else line = next;
    }
    if (line) out.push(line);
    return out;
}

/* ---------- textura dos ladrilhos ----------
   Um bloco de 4×4 ladrilhos que se repete pelas paredes: base escura,
   junta fina acesa, alguns ladrilhos apagados e uma mira em cada cruzamento,
   como as marcas de diagramação da referência. */
function tileTexture(seed) {
    const N = 4, S = 256, W = N * S;
    const c = document.createElement('canvas');
    c.width = c.height = W;
    const x = c.getContext('2d');

    const bg = css('--bg') || '#05041a';
    const line = css('--accent') || '#7a4dff';

    x.fillStyle = bg;
    x.fillRect(0, 0, W, W);

    // alguns ladrilhos recebem um banho mais claro, outros ficam apagados
    let r = seed * 9301;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const v = rnd();
            if (v > 0.78) continue;                       // ladrilho apagado
            const g = x.createLinearGradient(i * S, j * S, (i + 1) * S, (j + 1) * S);
            g.addColorStop(0, `rgba(122,77,255,${0.10 + v * 0.14})`);
            g.addColorStop(1, `rgba(47,123,255,${0.04 + v * 0.10})`);
            x.fillStyle = g;
            x.fillRect(i * S + 2, j * S + 2, S - 4, S - 4);
        }
    }

    // juntas
    x.strokeStyle = line;
    x.globalAlpha = 0.55;
    x.lineWidth = 3;
    for (let k = 0; k <= N; k++) {
        x.beginPath(); x.moveTo(k * S, 0); x.lineTo(k * S, W); x.stroke();
        x.beginPath(); x.moveTo(0, k * S); x.lineTo(W, k * S); x.stroke();
    }

    // miras nos cruzamentos
    x.globalAlpha = 0.9;
    x.lineWidth = 4;
    const a = 26;
    for (let i = 0; i <= N; i++) {
        for (let j = 0; j <= N; j++) {
            const px = i * S, py = j * S;
            x.beginPath(); x.moveTo(px - a, py); x.lineTo(px + a, py); x.stroke();
            x.beginPath(); x.moveTo(px, py - a); x.lineTo(px, py + a); x.stroke();
        }
    }
    x.globalAlpha = 1;
    return c;
}

/** letras gigantes do nome, para fantasmear nas paredes */
function ghostTexture(word) {
    const W = 2048, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.clearRect(0, 0, W, H);
    x.font = `900 ${H * 0.78}px Unbounded, "Space Grotesk", sans-serif`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.lineWidth = 4;
    x.strokeStyle = 'rgba(214,205,255,.85)';
    x.strokeText(word, W / 2, H / 2 + H * 0.03);
    return c;
}

/**
 * Capa de um projeto. Quando a tela real já existe (`img`), ela entra como
 * fundo recortado em "cover" e o texto vai por cima, sobre um degradê de
 * leitura. Sem imagem, cai no banho de gradiente da identidade.
 */
function coverTexture(item, i, isFeature, img) {
    const W = 1024, H = 640;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');

    const bg = css('--bg') || '#05041a';
    const text = css('--text') || '#eeebff';
    const accent = css('--accent') || '#7a4dff';
    const accent2 = css('--accent-2') || '#2f7bff';
    // tudo que antes era claro fixo passa a seguir a tinta do tema,
    // senão no tema claro o texto do painel some no fundo claro
    const ink = rgbOf(text);
    const paper = rgbOf(bg);

    x.fillStyle = bg;
    x.fillRect(0, 0, W, H);

    if (img) {
        // recorte "cover": preenche o painel sem distorcer a tela
        const k = Math.max(W / img.width, H / img.height);
        const w = img.width * k, h = img.height * k;
        x.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);

        // véu da identidade, leve, só para a tela não destoar do corredor
        x.globalAlpha = 0.22;
        const gi = x.createLinearGradient(0, H, W, 0);
        gi.addColorStop(0, accent2);
        gi.addColorStop(1, accent);
        x.fillStyle = gi;
        x.fillRect(0, 0, W, H);
        x.globalAlpha = 1;

        // degradê de leitura embaixo, onde ficam nome e stack
        const sc = x.createLinearGradient(0, H, 0, H * .32);
        sc.addColorStop(0, `rgba(${rgbOf(bg)}, .94)`);
        sc.addColorStop(1, `rgba(${rgbOf(bg)}, 0)`);
        x.fillStyle = sc;
        x.fillRect(0, 0, W, H);
    } else {
        const g = x.createLinearGradient(0, H, W, 0);
        g.addColorStop(0, accent2);
        g.addColorStop(1, accent);
        x.globalAlpha = isFeature ? 0.80 : [0.62, 0.48, 0.70][i % 3];
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        x.globalAlpha = 1;

        const r = x.createRadialGradient(W * .3, H * .78, 0, W * .3, H * .78, W * .72);
        r.addColorStop(0, 'rgba(107,71,255,.5)');
        r.addColorStop(1, 'rgba(107,71,255,0)');
        x.fillStyle = r;
        x.fillRect(0, 0, W, H);
    }

    if (!img) {
        x.strokeStyle = `rgba(${ink}, .15)`;
        x.lineWidth = 1;
        for (let k = 1; k < 8; k++) { x.beginPath(); x.moveTo(W / 8 * k + .5, 0); x.lineTo(W / 8 * k + .5, H); x.stroke(); }
        for (let k = 1; k < 5; k++) { x.beginPath(); x.moveTo(0, H / 5 * k + .5); x.lineTo(W, H / 5 * k + .5); x.stroke(); }
    }

    x.strokeStyle = `rgba(${ink}, .4)`;
    x.lineWidth = 2;
    x.strokeRect(24, 24, W - 48, H - 48);

    x.fillStyle = text;
    x.textBaseline = 'top';
    x.font = '500 30px "JetBrains Mono", monospace';
    x.fillText(item.num, 56, 56);

    // selo do destaque, no alto à direita
    if (isFeature && item.badge) {
        x.font = '500 26px "JetBrains Mono", monospace';
        const label = item.badge.toUpperCase();
        const tw = x.measureText(label).width;
        const bw = tw + 52, bh = 54, bx = W - 56 - bw, by = 50;
        x.fillStyle = `rgba(${ink}, .94)`;
        x.beginPath();
        x.roundRect(bx, by, bw, bh, bh / 2);
        x.fill();
        x.fillStyle = `rgb(${paper})`;
        x.fillText(label, bx + 26, by + 14);
    }

    x.textBaseline = 'alphabetic';
    const size = isFeature ? 104 : 76;
    const step = isFeature ? 106 : 78;
    x.fillStyle = text;
    x.font = `700 ${size}px "Space Grotesk", "Arial Black", sans-serif`;
    const lines = wrap(x, item.name.toUpperCase(), W - 130).slice(0, 3);
    lines.forEach((ln, n) => x.fillText(ln, 56, H - 190 + n * step - (lines.length - 1) * step));

    x.font = '400 25px "JetBrains Mono", monospace';
    x.fillStyle = `rgba(${ink}, .85)`;
    wrap(x, item.stack, W - 130).slice(0, 2).forEach((ln, n) => x.fillText(ln, 56, H - 110 + n * 34));

    return c;
}

/* ---------- versão em CSS ---------- */
function buildFlat(flat, items) {
    flat.innerHTML = '';
    items.forEach((it, i) => {
        const card = document.createElement('article');
        card.className = 'cor-card';
        card.style.setProperty('--i', i);
        if (it.feature) card.classList.add('is-feature');
        card.innerHTML = `<span class="cor-card-num mono-label"></span>
                      <span class="cor-card-badge mono-label"></span>
                      <h4 class="cor-card-name"></h4>
                      <p class="cor-card-stack mono-label"></p>`;
        const badge = card.querySelector('.cor-card-badge');
        badge.textContent = it.badge || '';
        badge.hidden = !it.badge;
        card.querySelector('.cor-card-num').textContent = it.num;
        card.querySelector('.cor-card-name').textContent = it.name;
        card.querySelector('.cor-card-stack').textContent = it.stack;
        flat.appendChild(card);
    });
}

export function initCorridor() {
    const host = $('#corridor');
    const flat = $('#corridorFlat');
    const canvas = $('#corridorGl');
    if (!host || !flat || !canvas) return;

    const items = readProjects();
    if (!items.length) return;

    buildFlat(flat, items);

    // o estado base já é a faixa de cards: desiste é só limpar o canvas
    const giveUp = () => {
        host.classList.remove('is-3d');
        canvas.remove();
    };

    if (!fine || reduced) return giveUp();

    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl2') && !probe.getContext('webgl')) return giveUp();

    // o trilho alto entra agora, antes de pintar, para a altura da seção
    // não mudar no meio da rolagem quando o Three.js chegar
    host.classList.add('is-3d');

    const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        import(THREE_URL).then(
            THREE => build(THREE, { host, flat, canvas, items }),
            giveUp   // CDN fora do ar: volta para os cards
        );
    }, { rootMargin: '600px 0px' });
    io.observe(host);
}

function build(THREE, { host, flat, canvas, items }) {
    host.classList.add('is-gl');

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 90);

    let bgHex = hex(css('--bg'));
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.Fog(bgHex, 12, 36);

    /* ---------- paredes ---------- */
    const LEN = Z_NEAR - Z_FAR;
    const MID = (Z_NEAR + Z_FAR) / 2;
    const TEX_SPAN = TILE * 4;

    const walls = [];
    function wall(w, h, pos, rot, seed) {
        const tex = new THREE.CanvasTexture(tileTexture(seed));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(w / TEX_SPAN, h / TEX_SPAN);
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: tex, fog: true })
        );
        mesh.position.copy(pos);
        mesh.rotation.copy(rot);
        mesh.userData.tex = tex;
        scene.add(mesh);
        walls.push(mesh);
        return mesh;
    }

    const V = (a, b, c) => new THREE.Vector3(a, b, c);
    const E = (a, b, c) => new THREE.Euler(a, b, c);
    wall(HALF_W * 2, LEN, V(0, -HALF_H, MID), E(-Math.PI / 2, 0, 0), 1);   // chão
    wall(HALF_W * 2, LEN, V(0, HALF_H, MID), E(Math.PI / 2, 0, 0), 2);   // teto
    wall(LEN, HALF_H * 2, V(-HALF_W, 0, MID), E(0, Math.PI / 2, 0), 3);   // esquerda
    wall(LEN, HALF_H * 2, V(HALF_W, 0, MID), E(0, -Math.PI / 2, 0), 4);   // direita

    /* ---------- letras-fantasma nas paredes ---------- */
    const ghosts = [];
    [['BERNARDO', -1], ['PATRIARCA', 1]].forEach(([word, side], i) => {
        const tex = new THREE.CanvasTexture(ghostTexture(word));
        tex.colorSpace = THREE.SRGBColorSpace;
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(18, 4.5),
            new THREE.MeshBasicMaterial({
                map: tex, transparent: true, opacity: 0.16,
                blending: THREE.AdditiveBlending, depthWrite: false, fog: true
            })
        );
        mesh.position.set(side * (HALF_W - 0.06), 0.3, -8 - i * 9);
        mesh.rotation.y = -side * Math.PI / 2;
        scene.add(mesh);
        ghosts.push(mesh);
    });

    /* ---------- brilho no fundo do corredor ---------- */
    const glowCv = document.createElement('canvas');
    glowCv.width = glowCv.height = 256;
    {
        const g2 = glowCv.getContext('2d');
        const rg = g2.createRadialGradient(128, 128, 0, 128, 128, 128);
        rg.addColorStop(0, 'rgba(122,77,255,.95)');
        rg.addColorStop(.45, 'rgba(47,123,255,.4)');
        rg.addColorStop(1, 'rgba(47,123,255,0)');
        g2.fillStyle = rg;
        g2.fillRect(0, 0, 256, 256);
    }
    const glowTex = new THREE.CanvasTexture(glowCv);
    // No tema claro a soma aditiva estoura e o plano vira um retângulo
    // branco no fundo do corredor; aí ele entra em mistura normal e mais
    // apagado, só como halo atrás do painel de destaque.
    const light = () => root.getAttribute('data-theme') === 'light';
    const glowMat = new THREE.MeshBasicMaterial({
        map: glowTex, transparent: true, opacity: .9,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false
    });
    const syncGlow = () => {
        const cl = light();
        glowMat.blending = cl ? THREE.NormalBlending : THREE.AdditiveBlending;
        glowMat.needsUpdate = true;
    };
    syncGlow();
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(13, 8.4), glowMat);
    glow.position.set(0, 0, FEATURE.z - 1.6);
    scene.add(glow);

    /* ---------- painéis ---------- */
    const feature = items.find(it => it.feature);
    const rest = items.filter(it => !it.feature);
    const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());

    // telas já baixadas, por caminho
    const shots = new Map();

    /** (re)pinta a capa de um painel com o que houver disponível agora */
    function paint(mesh) {
        const it = mesh.userData.item;
        mesh.material.map?.dispose();
        const tex = new THREE.CanvasTexture(
            coverTexture(it, mesh.userData.index, !!it.feature, shots.get(it.shot) || null)
        );
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        mesh.material.map = tex;
        mesh.material.needsUpdate = true;
    }

    function makePanel(item, i, p, w, h) {
        const tex = new THREE.CanvasTexture(coverTexture(item, i, !!item.feature, null));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: true })
        );
        mesh.position.set(p.x, p.y, p.z);
        mesh.rotation.y = p.ry || 0;
        mesh.userData = { base: { ...p, ry: p.ry || 0 }, hover: 0, item, index: i };
        scene.add(mesh);
        return mesh;
    }

    const panels = rest.slice(0, PANELS.length)
        .map((item, i) => makePanel(item, i, PANELS[i], 4.2, 2.63));

    // o destaque fecha o corredor, maior e de frente
    if (feature) panels.push(makePanel(feature, panels.length, FEATURE, FEATURE.w, FEATURE.h));

    // as telas reais entram assim que carregam: o painel nasce com o
    // gradiente da identidade e é repintado sem travar a cena
    for (const mesh of panels) {
        const src = mesh.userData.item.shot;
        if (!src) continue;
        const im = new Image();
        im.decoding = 'async';
        im.addEventListener('load', () => { shots.set(src, im); paint(mesh); }, { once: true });
        im.src = src;
    }

    /* ---------- repinta tudo quando o tema muda ---------- */
    new MutationObserver(() => {
        bgHex = hex(css('--bg'));
        scene.background.setHex(bgHex);
        scene.fog.color.setHex(bgHex);
        walls.forEach((m, i) => {
            m.userData.tex.dispose();
            const t = new THREE.CanvasTexture(tileTexture(i + 1));
            t.colorSpace = THREE.SRGBColorSpace;
            t.wrapS = t.wrapT = THREE.RepeatWrapping;
            t.repeat.copy(m.material.map.repeat);
            m.material.map = t;
            m.userData.tex = t;
            m.material.needsUpdate = true;
        });
        syncGlow();
        panels.forEach(paint);
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    /* ---------- legenda ---------- */
    const capEl = $('#corCaption');
    const numEl = capEl?.querySelector('.cor-num');
    const nameEl = capEl?.querySelector('.cor-name');
    const descEl = capEl?.querySelector('.cor-desc');
    const badgeEl = capEl?.querySelector('.cor-badge');
    const idxEl = $('#corIndex');
    const barEl = $('#corBar');
    let shown = null;

    function showCaption(it) {
        if (!it || it === shown || !capEl) return;
        shown = it;
        // o texto troca na hora e a transição reinicia com um reflow:
        // um requestAnimationFrame aninhado aqui atrasaria a legenda
        capEl.classList.remove('on');
        numEl.textContent = it.num;
        nameEl.textContent = it.name;
        descEl.textContent = it.desc;
        capEl.classList.toggle('is-feature', !!it.feature);
        if (badgeEl) {
            badgeEl.textContent = it.badge || '';
            badgeEl.hidden = !it.badge;
        }
        void capEl.offsetWidth;
        capEl.classList.add('on');
        if (idxEl) idxEl.textContent = `${it.num} / ${String(items.length).padStart(2, '0')}`;
    }

    /* ---------- tamanho ---------- */
    let needResize = true;
    new ResizeObserver(() => { needResize = true; }).observe(host);

    function resize() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // janela estreita: abre o campo de visão para o corredor não sumir
        camera.fov = camera.aspect < 1.1 ? 68 : 52;
        camera.updateProjectionMatrix();
    }

    /* ---------- ponteiro ---------- */
    const ptr = new THREE.Vector2(0, 0);
    const aim = { x: 0, y: 0 };
    const ray = new THREE.Raycaster();
    let hovered = null;

    host.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        aim.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        aim.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    }, { passive: true });

    host.addEventListener('pointerleave', () => { aim.x = 0; aim.y = 0; });

    host.addEventListener('click', () => {
        const href = hovered?.userData.item.href;
        if (href) window.open(href, '_blank', 'noopener');
    });

    /* ---------- a rolagem é o trilho da câmera ---------- */
    let progress = 0;
    let vel = 0;

    // idem: a posição da câmera não pode esperar o primeiro scroll
    const readProgress = () => {
        const r = host.getBoundingClientRect();
        const run = Math.max(1, r.height - innerHeight);
        progress = clamp01(-r.top / run);
        if (barEl) barEl.style.transform = `scaleX(${progress.toFixed(3)})`;
    };
    readProgress();
    onScroll(({ velocity }) => { readProgress(); vel = velocity; });

    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '10% 0px' })
        .observe(host);

    let camZ = CAM_FROM + (CAM_TO - CAM_FROM) * progress;
    let roll = 0, kick = 0;
    const clock = { t: 0 };

    onFrame((now) => {
        if (needResize) { needResize = false; resize(); }
        if (!visible) return;

        clock.t = now * 0.001;

        ptr.x += (aim.x - ptr.x) * 0.06;
        ptr.y += (aim.y - ptr.y) * 0.06;

        // avanço suavizado, para a câmera não "travar" junto com o scroll
        const want = CAM_FROM + (CAM_TO - CAM_FROM) * progress;
        camZ += (want - camZ) * 0.085;

        // a inércia da rolagem inclina e abre a lente, como num travelling
        roll += (vel * 0.0016 - roll) * 0.08;
        kick += (Math.min(Math.abs(vel), 40) * 0.13 - kick) * 0.06;

        camera.position.set(ptr.x * 0.9, ptr.y * 0.45 + Math.sin(clock.t * 0.6) * 0.05, camZ);
        camera.rotation.y = -ptr.x * 0.12;
        camera.rotation.x = ptr.y * 0.06;
        camera.rotation.z = roll;
        const fovBase = camera.aspect < 1.1 ? 68 : 52;
        if (Math.abs(camera.fov - (fovBase + kick)) > 0.05) {
            camera.fov = fovBase + kick;
            camera.updateProjectionMatrix();
        }

        // as juntas deslizam de leve: dá sensação de movimento mesmo parado
        for (const m of walls) m.userData.tex.offset.y = clock.t * 0.012;

        glow.material.opacity = 0.55 + Math.sin(clock.t * 1.1) * 0.12;
        ghosts.forEach((g, i) => { g.material.opacity = 0.12 + Math.sin(clock.t * 0.5 + i) * 0.04; });

        ray.setFromCamera(ptr, camera);
        hovered = ray.intersectObjects(panels, false)[0]?.object || null;
        host.classList.toggle('is-over', !!hovered);

        // o foco fica à frente da câmera: a legenda descreve o painel que
        // está chegando, não o que acabou de passar
        const focusZ = camera.position.z - 3.2;
        let nearest = null, best = Infinity;
        for (const m of panels) {
            const p = m.userData.base;
            const want2 = m === hovered ? 1 : 0;
            m.userData.hover += (want2 - m.userData.hover) * 0.09;
            const h = m.userData.hover;
            m.rotation.y = p.ry * (1 - h * 0.6);
            m.scale.setScalar(1 + h * 0.045);
            // sempre encara um pouco a câmera, como os painéis da referência
            m.position.y = p.y + Math.sin(clock.t * 0.7 + p.z) * 0.045;

            const d = Math.abs(focusZ - p.z);
            if (d < best) { best = d; nearest = m.userData.item; }
        }
        showCaption(nearest);

        renderer.render(scene, camera);
    });

    resize();
}
