/**
 * "A máquina" — o objeto 3D atrás das etapas do processo.
 *
 * A ideia é a seção contar visualmente o que o texto diz: a cada etapa a
 * estrutura ganha uma camada. Começa como uma nuvem de pontos dispersa
 * (descoberta), ganha um núcleo (planejamento), uma gaiola (desenvolvimento),
 * um anel em órbita com marcos nos vértices (entrega) e por fim acende
 * inteira (bora começar).
 *
 * Fica atrás dos cards, que são opacos — o objeto emoldura a etapa em foco
 * em vez de competir com ela.
 *
 * Three.js (versão fixa, via CDN) baixado sob demanda. Em toque, com
 * prefers-reduced-motion ou sem WebGL, simplesmente não existe: a seção
 * continua funcionando como carrossel.
 */

import { $, $$, clamp01, fine, reduced, root } from '../core/dom.js';
import { onFrame, onScroll } from '../core/raf.js';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
const desktop = matchMedia('(min-width: 821px)');

const css = n => getComputedStyle(root).getPropertyValue(n).trim();

const hex = v => {
    const s = (v || '').trim();
    if (s.startsWith('#')) {
        const h = s.length === 4 ? s.slice(1).split('').map(c => c + c).join('') : s.slice(1, 7);
        return parseInt(h, 16);
    }
    const n = s.match(/\d+/g) || [0, 0, 0];
    return (+n[0] << 16) | (+n[1] << 8) | (+n[2]);
};

export function initProcess3D() {
    const section = $('#process');
    const canvas = $('#procGl');
    if (!section || !canvas) return;

    const steps = $$('.proc-card').length;
    if (steps < 2) return;

    const drop = () => canvas.remove();
    if (!fine || reduced || !desktop.matches) return drop();

    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl2') && !probe.getContext('webgl')) return drop();

    const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        import(THREE_URL).then(
            THREE => build(THREE, { section, canvas, steps }),
            drop
        );
    }, { rootMargin: '500px 0px' });
    io.observe(section);
}

function build(THREE, { section, canvas, steps }) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearAlpha(0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(0, 0, 7.0);

    const rig = new THREE.Group();
    scene.add(rig);

    const cAccent = new THREE.Color(hex(css('--accent')));
    const cAccent2 = new THREE.Color(hex(css('--accent-2')));
    const cText = new THREE.Color(hex(css('--text')));

    /** cada camada acende quando a etapa dela chega */
    const layers = [];
    const addLayer = (obj, mats, max) => {
        rig.add(obj);
        layers.push({ obj, mats, on: 0, max });
        return obj;
    };

    // ---------- 0 · nuvem de pontos: a fase de descoberta ----------
    const N = 460;
    const pos = new Float32Array(N * 3);
    const home = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        // distribuição de Fibonacci: pontos espalhados sem aglomerar nos polos
        const y = 1 - (i / (N - 1)) * 2;
        const rad = Math.sqrt(Math.max(0, 1 - y * y));
        const th = i * 2.399963;
        const d = 3.0 + Math.random() * 2.6;
        home[i * 3] = Math.cos(th) * rad * d;
        home[i * 3 + 1] = y * d;
        home[i * 3 + 2] = Math.sin(th) * rad * d;
        pos.set(home.subarray(i * 3, i * 3 + 3), i * 3);
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const ptMat = new THREE.PointsMaterial({
        color: cAccent2, size: 0.058, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    addLayer(new THREE.Points(ptGeo, ptMat), [ptMat], 0.9);

    // ---------- 1 · núcleo: a arquitetura aparece ----------
    const coreMat = new THREE.LineBasicMaterial({ color: cText, transparent: true, opacity: 0 });
    const core = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.OctahedronGeometry(1.55, 0)), coreMat
    );
    addLayer(core, [coreMat], 0.8);

    // ---------- 2 · gaiola: a construção em volta ----------
    const cageMat = new THREE.LineBasicMaterial({ color: cAccent, transparent: true, opacity: 0 });
    const cage = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.8, 1)), cageMat
    );
    addLayer(cage, [cageMat], 0.5);

    // ---------- 3 · anel em órbita e marcos: a entrega ----------
    const orbit = new THREE.Group();
    const ringMat = new THREE.LineBasicMaterial({ color: cAccent2, transparent: true, opacity: 0 });
    const ring = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.TorusGeometry(4.35, 0.02, 3, 80)), ringMat
    );
    ring.rotation.x = Math.PI / 2.35;
    orbit.add(ring);

    const markMat = new THREE.MeshBasicMaterial({
        color: cText, transparent: true, opacity: 0, wireframe: true
    });
    const markGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const mk = new THREE.Mesh(markGeo, markMat);
        mk.position.set(Math.cos(a) * 4.35, Math.sin(a * 2) * 0.55, Math.sin(a) * 4.35);
        orbit.add(mk);
    }
    addLayer(orbit, [ringMat, markMat], 0.62);

    // ---------- 4 · acende: bora começar ----------
    const glowCv = document.createElement('canvas');
    glowCv.width = glowCv.height = 128;
    {
        const g = glowCv.getContext('2d');
        const rg = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        rg.addColorStop(0, 'rgba(160,120,255,1)');
        rg.addColorStop(.5, 'rgba(90,60,255,.35)');
        rg.addColorStop(1, 'rgba(47,123,255,0)');
        g.fillStyle = rg;
        g.fillRect(0, 0, 128, 128);
    }
    const haloMat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(glowCv), transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(9.5);
    addLayer(halo, [haloMat], 0.45);

    /* ---------- repinta quando o tema muda ---------- */
    new MutationObserver(() => {
        const a = hex(css('--accent')), a2 = hex(css('--accent-2')), tx = hex(css('--text'));
        ptMat.color.setHex(a2);
        coreMat.color.setHex(tx);
        cageMat.color.setHex(a);
        ringMat.color.setHex(a2);
        markMat.color.setHex(tx);
    }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    /* ---------- tamanho ---------- */
    let needResize = true;
    new ResizeObserver(() => { needResize = true; }).observe(canvas);

    function resize() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // tela baixa ou estreita: afasta para a estrutura caber
        camera.position.z = camera.aspect < 1.4 ? 9.2 : 7.0;
        camera.updateProjectionMatrix();
    }

    /* ---------- ponteiro ---------- */
    const aim = { x: 0, y: 0 }, ptr = { x: 0, y: 0 };
    addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        aim.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        aim.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    }, { passive: true });

    /* ---------- a rolagem define a etapa ---------- */
    let stepF = 0, vel = 0;

    // calculado agora e a cada rolagem: se a seção já estiver em tela
    // quando o módulo carregar, a etapa precisa estar certa de cara
    const readStep = () => {
        const r = section.getBoundingClientRect();
        const travel = r.height - innerHeight;
        stepF = clamp01(travel > 0 ? -r.top / travel : 0) * (steps - 1);
    };
    readStep();
    onScroll(({ velocity }) => { readStep(); vel = velocity; });

    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '10% 0px' })
        .observe(section);

    let spin = 0;
    onFrame(now => {
        if (needResize) { needResize = false; resize(); }
        if (!visible) return;

        const t = now * 0.001;

        ptr.x += (aim.x - ptr.x) * 0.05;
        ptr.y += (aim.y - ptr.y) * 0.05;

        // gira sozinha; a rolagem empurra o giro
        spin += 0.0022 + Math.min(Math.abs(vel), 40) * 0.00018;
        rig.rotation.y = spin + ptr.x * 0.5;
        rig.rotation.x = Math.sin(t * 0.33) * 0.12 - ptr.y * 0.3;

        // cada camada acende quando sua etapa chega
        layers.forEach((L, i) => {
            const want = clamp01(stepF - i + 1);
            L.on += (want - L.on) * 0.09;
            for (const m of L.mats) m.opacity = L.on * L.max;
            const s = 0.82 + L.on * 0.18;
            L.obj.scale.setScalar(s);
        });

        // a nuvem respira
        const pa = ptGeo.attributes.position;
        const puff = 1 + Math.sin(t * 0.7) * 0.03;
        for (let i = 0; i < N; i++) {
            const k = i * 3;
            const w = 1 + Math.sin(t * 1.3 + home[k] * 2.1) * 0.025;
            pa.array[k] = home[k] * puff * w;
            pa.array[k + 1] = home[k + 1] * puff * w;
            pa.array[k + 2] = home[k + 2] * puff * w;
        }
        pa.needsUpdate = true;

        orbit.rotation.y = -spin * 2.2;
        halo.material.rotation = t * 0.1;

        renderer.render(scene, camera);
    });

    resize();
}
