/**
 * Tela de abertura em WebGL2 puro — um shader de fragmento em tela cheia.
 * Sem bibliotecas. O nome é rasterizado num canvas 2D, vira textura e o
 * shader aplica glitch, dissolução por ruído, aberração magenta/ciano,
 * grid em perspectiva e brilho roxo.
 *
 * As cores vêm das custom properties do CSS, então a paleta continua
 * definida num lugar só (base/tokens.css) e o tema claro funciona.
 */

import { $, clamp01, reduced, root } from '../core/dom.js';
import { onFrame, onScroll } from '../core/raf.js';

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0., 1.); }`;

const FRAG = taps => `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform vec2  uRes;
uniform float uTime;
uniform float uIntro;   // 0 → 1, progresso da abertura
uniform float uVel;     // velocidade do ponteiro
uniform vec2  uMouse;
uniform float uCalm;    // 1 quando prefers-reduced-motion
uniform float uLight;   // 1 no tema claro
uniform float uExit;    // 0 → 1 enquanto a seção sai por rolagem
uniform sampler2D uTex; // R = letras · G = marca vazada

uniform vec3 uBg;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform vec3 uAccent2;
uniform vec3 uGlowA;
uniform vec3 uGlowB;
uniform vec3 uGlitchM;
uniform vec3 uGlitchC;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

float fbm(vec2 p){
  float v = 0., a = .5;
  for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.03; a *= .5; }
  return v;
}

// Escuro: soma luz. Claro: deposita tinta colorida sobre o papel.
vec3 lay(vec3 col, vec3 c, float a){
  vec3 add = col + c * a;
  vec3 ink = mix(col, c * .82, clamp(a, 0., 1.));
  return mix(add, ink, uLight);
}

void main(){
  vec2 uv = vUv;
  float asp = uRes.x / uRes.y;
  vec2 m = uMouse - .5;

  float tt    = floor(uTime * 14.);
  float intro = uIntro;
  float calm  = 1. - uCalm;

  // a marca assenta na segunda metade da abertura
  float settle = smoothstep(.22, 1., intro);
  float enter  = 1. - settle;                       // 1 no começo, 0 no fim
  float burst  = step(.972, hash(vec2(tt, 3.1))) * calm;
  float amt    = (uExit * .35 + burst * .30 + uVel * .18) * (1. - uCalm * .6);

  // a sala também avança quando a seção sai: tudo passa pelo observador
  float roomZoom = 1. - uExit * .35 * calm;
  vec2  q   = ((uv - .5) * roomZoom) * vec2(asp, 1.) - m * vec2(.09, .06);
  float ext = .5 * length(vec2(asp, 1.));
  float rn  = length(q) / ext;

  // =====================================================================
  // SALA LADRILHADA — chão, teto e duas paredes em perspectiva.
  // Cada ladrilho tem sua própria face acesa e junta marcada; é isso que
  // dá a textura de sala da referência, em vez de uma grade de fios.
  // =====================================================================
  float t    = max(abs(q.x) * .62, abs(q.y)) + .0006;
  float z    = 1. / t;
  float wall = step(abs(q.y), abs(q.x) * .62);
  float u    = mix(q.x / (abs(q.y) + .0006), q.y / (abs(q.x) * .62 + .0006), wall) * .55;

  // a sala corre junto: desacelerando na chegada, acelerando na saída
  vec2 cell  = vec2(u * 1.7, z * .26 - uTime * .06
                    - (1. - (1. - pow(1. - settle, 2.6))) * 2.2 * calm
                    + pow(uExit, 1.3) * 2.6 * calm);
  vec2 ci    = floor(cell);
  vec2 cf    = fract(cell);
  float id   = hash(ci + wall * 37.);

  float dEdge = min(min(cf.x, 1. - cf.x), min(cf.y, 1. - cf.y));
  float grout = 1. - smoothstep(0., fwidth(dEdge) * 1.8 + .003, dEdge);
  float face  = step(.26, id) * (.22 + id * .66);   // alguns ladrilhos apagados
  float depth = smoothstep(.05, .40, t) * smoothstep(1.55, .42, t);

  vec3 col = mix(uBg * .62, uBg, uLight);
  col = lay(col, mix(uGlowB, uGlowA, id), face * depth * .58);
  col = lay(col, mix(uAccent, uAccent2, uv.x), grout * depth * mix(.30, .40, uLight));

  // halo no fundo da sala
  col = lay(col, uGlowA, smoothstep(.95, 0., rn) * .30);

  // =====================================================================
  // MARCA — letras (canal R) e triângulo vazado (canal G)
  // =====================================================================
  vec2 tuv = uv;

  // fatias horizontais e blocos deslocados
  float bands = mix(14., 70., hash(vec2(tt, 7.)));
  float rnd   = hash(vec2(floor(uv.y * bands), tt));
  tuv.x += (rnd - .5) * step(.6, rnd) * amt * .10;
  float blk = hash(floor(vec2(uv.x * 9., uv.y * 5.)) + tt);
  tuv += (blk - .5) * step(.9, blk) * amt * .04;

  // lente discreta sob o cursor
  vec2 dm = (uv - uMouse) * vec2(asp, 1.);
  float lens = exp(-dot(dm, dm) * 16.);
  tuv += normalize(dm + 1e-5) * lens * (-.012) * (.6 + uVel * 1.6) / vec2(asp, 1.);
  tuv += m * vec2(.010, .007);

  // =====================================================================
  // ZOOM 3D — a marca chega do fundo da sala
  //
  // Em vez de torcer a imagem no plano, trato a marca como um plano a uma
  // profundidade z e trago a câmera até ela. Amostrar em (uv-.5)*z+.5 é
  // exatamente isso: z alto cobre uma área maior, então o objeto parece
  // longe; z = 1 é o plano da tela.
  //
  // As letras e o triângulo vêm de profundidades DIFERENTES e só se
  // encaixam no fim — é essa separação que dá volume de verdade, em vez
  // de um escalonamento chapado. A chegada desacelera e passa um fio
  // além antes de assentar, para não bater seco.
  // =====================================================================
  float eZ = 1. - pow(1. - settle, 2.6);          // desacelera ao chegar
  float eX = pow(uExit, 1.3) * calm;              // saída por rolagem
  float land = sin(settle * 3.14159) * .035 * (1. - settle) * calm;

  float zTxt = mix(7.0, 1.0, eZ) - land;          // plano das letras
  float zMrk = mix(3.2, 1.0, eZ) + land * .6;     // plano do triângulo
  zTxt *= mix(1., .26, eX);                       // na saída, passa por nós
  zMrk *= mix(1., .40, eX);

  float roll = (1. - eZ) * .10 * calm - eX * .14; // giro discreto
  float dz   = ((1. - eZ) * .22 + eX * .34) * calm;  // rastro de profundidade

  float cs = cos(roll), sn = sin(roll);
  vec2  c0 = (tuv - .5) * vec2(asp, 1.);
  vec2  cr = vec2(c0.x * cs - c0.y * sn, c0.x * sn + c0.y * cs) / vec2(asp, 1.);

  // Cada pixel começa a varredura num ponto levemente diferente: sem isso
  // as poucas amostras aparecem como cópias menores da marca, em vez de
  // rastro contínuo.
  float jit = hash(uv * uRes + tt);

  float letters = 0., markW = 0., accR = 0., accB = 0., wsum = 0.;
  const int STEPS = ${taps};
  for (int i = 0; i < STEPS; i++){
    float k = (float(i) + jit) / float(STEPS);
    float w = 1. - k * .55;                       // o foco pesa mais

    float lr = texture(uTex, cr * (zTxt * (1. + k * dz)) + .5).r;
    float mg = texture(uTex, cr * (zMrk * (1. + k * dz * .7)) + .5).g;

    letters += lr * w;
    markW   += mg * w;
    accR    += lr * w * (1. - k * .85);           // magenta no foco
    accB    += lr * w * (k * .85 + .15);          // ciano na cauda
    wsum    += w;
  }
  letters /= wsum;
  markW   /= wsum;
  accR    /= wsum;
  accB    /= wsum;

  // emerge da névoa da sala conforme se aproxima
  letters *= smoothstep(4.2, 1.15, zTxt);
  markW   *= smoothstep(2.6, 1.10, zMrk);

  // coordenada já no plano da marca: o brilho e a franja PRECISAM usar
  // esta, não a original. Amostrando em tuv eles desenhavam a marca em
  // tamanho final durante toda a aproximação, e o que de fato se movia
  // virava um fantasma menor no meio.
  vec2 tz = cr * zTxt + .5;

  // ---- bordas rasgadas: pedaços comidos, como no vídeo ----
  // pedaços grandes e poucos: devora na entrada, quase limpo em repouso
  float grain = fbm(uv * vec2(asp, 1.) * 11. + vec2(tt * .05, 0.));
  float bite  = smoothstep(.30 - enter * .18, .50 - enter * .18, grain);
  letters *= mix(1., bite, .07);

  // franja cromática: em repouso é um fio na borda; durante o zoom vem
  // das amostras magenta/ciano acumuladas acima
  float ca = .0010 + amt * .005 + lens * .0016;
  vec2  dir = normalize((uv - .5) + vec2(.0001));
  float sm1 = max(texture(uTex, tz + dir * ca).r, accR);
  float sm2 = max(texture(uTex, tz - dir * ca).r, accB);
  float fm  = max(sm1 - letters, 0.);
  float fc  = max(sm2 - letters, 0.);

  float cover = max(letters, max(fm, fc));
  vec3  txCol = (uInk * letters + uGlitchM * fm + uGlitchC * fc) / max(cover, 1e-4);

  // brilho ao redor do traço
  float glow = 0.;
  for (int i = 0; i < 6; i++){
    float a = float(i) * 1.0471976;
    glow += texture(uTex, tz + vec2(cos(a), sin(a)) * .013).r;
  }
  glow = glow / 6. * smoothstep(4.2, 1.15, zTxt);
  col = lay(col, uGlowA, glow * .55);

  // o triângulo vazado atravessa as letras, como a marca da referência
  float markGlow = smoothstep(.15, .9, settle);
  col = lay(col, mix(uAccent2, uAccent, .45), markW * markGlow * 1.6);

  // letras por cima de tudo
  col = mix(col, txCol, cover * smoothstep(0., .12, intro));

  // =====================================================================
  // acabamento
  // =====================================================================
  float dark = 1. - uLight;
  col *= 1. - mix(.06, .02, uLight) * sin(uv.y * uRes.y * 1.6);
  float vigD = smoothstep(1.45, .28, rn);
  float vigL = mix(1., smoothstep(1.60, .25, rn), .26);
  col *= mix(vigD, vigL, uLight);
  col += (hash(uv * uRes + uTime * 60.) - .5) * mix(.040, .028, uLight);
  col = lay(col, uAccent, smoothstep(.05, 0., intro) * .30 * hash(vec2(tt, 9.)));

  outColor = vec4(max(col, 0.), 1.);
}`;

/** '#7A4DFF' | 'rgb(…)' → [r, g, b] em 0‥1 */
function toRgb(value) {
    const s = (value || '').trim();
    if (s.startsWith('#')) {
        const h = s.length === 4
            ? s.slice(1).split('').map(c => c + c).join('')
            : s.slice(1, 7);
        const n = parseInt(h, 16);
        return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
    }
    const nums = s.match(/-?[\d.]+/g);
    return nums ? nums.slice(0, 3).map(v => +v / 255) : [0, 0, 0];
}

export function initIntroGl() {
    const section = $('#intro');
    const canvas = $('#introGl');
    const coordsEl = $('#introCoords');
    const replayBtn = $('#introReplay');
    if (!section || !canvas) return;

    const fail = () => {
        section.classList.add('no-gl');
        canvas.remove();
    };

    let gl;
    try {
        gl = canvas.getContext('webgl2', {
            antialias: false,
            alpha: false,
            depth: false,
            stencil: false,
            powerPreference: 'high-performance'
        });
    } catch { /* contexto indisponível */ }

    if (!gl) return fail();

    // telas pequenas / toque recebem menos amostras no brilho
    const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
    // só o zoom blur usa isto, e agora é 1 leitura por amostra:
    // dá para ter um rastro bem mais liso pelo mesmo custo de antes
    const taps = coarse ? 6 : 10;

    const compile = (type, src) => {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            console.error('[intro-gl]', gl.getShaderInfoLog(sh));
            return null;
        }
        return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG(taps));
    if (!vs || !fs) return fail();

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('[intro-gl]', gl.getProgramInfoLog(prog));
        return fail();
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = {};
    for (const n of ['uRes', 'uTime', 'uIntro', 'uVel', 'uMouse', 'uCalm', 'uLight', 'uExit', 'uTex',
        'uBg', 'uInk', 'uAccent', 'uAccent2', 'uGlowA', 'uGlowB', 'uGlitchM', 'uGlitchC']) {
        U[n] = gl.getUniformLocation(prog, n);
    }

    // ---------- paleta vinda do CSS ----------
    let light = 0;
    function pushPalette() {
        const cs = getComputedStyle(root);
        const v = name => toRgb(cs.getPropertyValue(name));
        light = root.getAttribute('data-theme') === 'light' ? 1 : 0;
        gl.useProgram(prog);
        gl.uniform3fv(U.uBg, v('--bg'));
        gl.uniform3fv(U.uInk, v('--text'));
        gl.uniform3fv(U.uAccent, v('--accent'));
        gl.uniform3fv(U.uAccent2, v('--accent-2'));
        gl.uniform3fv(U.uGlowA, v('--glow-a'));
        gl.uniform3fv(U.uGlowB, v('--glow-b'));
        gl.uniform3fv(U.uGlitchM, v('--glitch-m'));
        gl.uniform3fv(U.uGlitchC, v('--glitch-c'));
        gl.uniform1f(U.uLight, light);
    }
    new MutationObserver(() => { pushPalette(); dirty = true; })
        .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    // ---------- textura do nome ----------
    const tex = gl.createTexture();
    const tcv = document.createElement('canvas');
    const tctx = tcv.getContext('2d', { willReadFrequently: false });
    let W = 2, H = 2;

    const WORDS = ['FULL', 'STACK'];
    const FAM = 'Unbounded, "Space Grotesk", "Arial Black", Helvetica, sans-serif';

    function drawName() {
        tcv.width = W;
        tcv.height = H;
        tctx.fillStyle = '#000';
        tctx.fillRect(0, 0, W, H);

        // o shader lê dois canais: R = letras, G = marca vazada.
        // 'lighter' soma, então um não apaga o outro onde se cruzam.
        tctx.globalCompositeOperation = 'lighter';

        tctx.textBaseline = 'alphabetic';
        tctx.textAlign = 'center';
        tctx.font = `900 100px ${FAM}`;

        const cap = tctx.measureText('H').actualBoundingBoxAscent || 72;
        const widest = Math.max(...WORDS.map(w => tctx.measureText(w).width));

        const narrow = W / H < 1;
        const uma = WORDS.length === 1;
        // > 1 de propósito: a marca estoura as laterais e é cortada pela
        // tela, como no vídeo de referência
        const fill = uma ? (narrow ? 1.02 : 1.06) : (narrow ? .98 : 1.02);

        const lineGap = cap * (narrow ? 1.34 : 1.18);
        const blockH = lineGap * (WORDS.length - 1) + cap;
        const s = Math.min(
            (W * fill) / widest,
            (H * (narrow ? .54 : .62)) / blockH
        );

        const cx = W / 2;
        const bh = blockH * s;
        const top = (H - bh) / 2 + H * .012;

        // ---------- triângulo vazado, atrás das letras ----------
        const tri = Math.min(W * .40, H * .62);
        const ty = top + bh * .60;
        tctx.strokeStyle = '#0f0';                 // canal G
        tctx.lineWidth = Math.max(3, tri * .013);
        tctx.beginPath();
        tctx.moveTo(cx, ty - tri * .60);
        tctx.lineTo(cx + tri * .56, ty + tri * .42);
        tctx.lineTo(cx - tri * .56, ty + tri * .42);
        tctx.closePath();
        tctx.stroke();
        // segunda linha interna, como marcação de construção
        tctx.globalAlpha = .5;
        tctx.beginPath();
        tctx.moveTo(cx, ty - tri * .34);
        tctx.lineTo(cx + tri * .32, ty + tri * .24);
        tctx.lineTo(cx - tri * .32, ty + tri * .24);
        tctx.closePath();
        tctx.stroke();
        tctx.globalAlpha = 1;

        // ---------- letras ----------
        tctx.font = `900 ${100 * s}px ${FAM}`;
        tctx.fillStyle = '#f00';                   // canal R
        WORDS.forEach((w, i) => {
            tctx.fillText(w, cx, top + cap * s + lineGap * s * i);
        });

        // ---------- réguas finas, como guias de diagramação ----------
        const rw = Math.min(W * .96, widest * s + cap * s * .6);
        const th = Math.max(1, cap * s * .010);
        tctx.fillStyle = '#060';                   // junto da marca, mais fraco
        tctx.fillRect(cx - rw / 2, top - cap * s * .40, rw, th);
        tctx.fillRect(cx - rw / 2, top + bh + cap * s * .28, rw, th);

        tctx.globalCompositeOperation = 'source-over';

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tcv);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // ---------- tamanho do canvas, com teto de pixels ----------
    // a medida só é lida quando o ResizeObserver avisa, para não forçar
    // cálculo de layout a cada quadro
    let needResize = true;
    let dirty = true;

    function resize() {
        const capDpr = coarse ? 1.5 : 2;
        const dpr = Math.min(devicePixelRatio || 1, capDpr);
        let cw = Math.max(2, Math.floor(canvas.clientWidth * dpr));
        let ch = Math.max(2, Math.floor(canvas.clientHeight * dpr));

        const maxPx = coarse ? 1200000 : 2300000;
        if (cw * ch > maxPx) {
            const f = Math.sqrt(maxPx / (cw * ch));
            cw = Math.floor(cw * f);
            ch = Math.floor(ch * f);
        }
        if (cw === W && ch === H) return;

        W = cw; H = ch;
        canvas.width = W;
        canvas.height = H;
        gl.viewport(0, 0, W, H);
        drawName();
        dirty = true;
    }

    new ResizeObserver(() => { needResize = true; }).observe(canvas);

    // ---------- ponteiro ----------
    const target = { x: .5, y: .5 };
    const cur = { x: .5, y: .5 };
    const last = { x: .5, y: .5 };
    let vel = 0;

    function onMove(e) {
        const r = canvas.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        target.x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        target.y = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    }
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerdown', onMove, { passive: true });

    // ---------- linha do tempo ----------
    let exitP = 0;                 // 0 → 1 enquanto a seção sai por rolagem
    let introStart = null;
    let started = false;
    let now = 0;
    const DUR = 3000;
    const easeOut = x => 1 - Math.pow(1 - x, 2.2);

    const restart = () => { introStart = null; started = true; dirty = true; };
    replayBtn?.addEventListener('click', restart);

    // só desenha enquanto a abertura está em tela
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: '10% 0px' })
        .observe(section);

    const t0 = performance.now();
    let frame = 0;

    function draw() {
        gl.useProgram(prog);
        gl.uniform2f(U.uRes, W, H);
        gl.uniform1f(U.uTime, reduced ? 0 : (now - t0) / 1000);
        gl.uniform1f(U.uIntro, reduced ? (started ? 1 : 0)
            : (started ? easeOut(Math.min(1, (now - introStart) / DUR)) : 0));
        gl.uniform1f(U.uVel, reduced ? 0 : vel);
        gl.uniform2f(U.uMouse, cur.x, cur.y);
        gl.uniform1f(U.uCalm, reduced ? 1 : 0);
        gl.uniform1f(U.uExit, reduced ? 0 : exitP);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(U.uTex, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function tick(time) {
        now = time;
        if (started && introStart === null) introStart = time;

        if (needResize) { needResize = false; resize(); }
        if (!visible) return;

        // com movimento reduzido um quadro parado basta; só repinta quando
        // algo muda de fato (tamanho, tema ou "repetir intro")
        if (reduced) {
            if (dirty) { draw(); dirty = false; }
            return;
        }

        cur.x += (target.x - cur.x) * .08;
        cur.y += (target.y - cur.y) * .08;
        const dx = cur.x - last.x, dy = cur.y - last.y;
        vel += (Math.min(1, Math.hypot(dx, dy) * 40) - vel) * .12;
        last.x = cur.x;
        last.y = cur.y;

        draw();

        if (coordsEl && (frame % 4) === 0) {
            coordsEl.textContent = `X ${cur.x.toFixed(3)} · Y ${cur.y.toFixed(3)}`;
        }
        frame++;
    }

    pushPalette();
    resize();
    onFrame(tick);

    // a abertura recua enquanto dá lugar ao hero: o canvas avança um
    // pouco e se apaga, o HUD sai antes
    if (!reduced) {
        onScroll(() => {
            const r = section.getBoundingClientRect();
            exitP = clamp01(-r.top / Math.max(1, r.height));
            section.style.setProperty('--exit', exitP.toFixed(3));
            dirty = true;
        });
    }

    // começa quando a fonte de display estiver pronta e o preloader sair
    const begin = () => { drawName(); restart(); };
    const timer = setTimeout(begin, 1400);
    const ready = () => { clearTimeout(timer); begin(); };

    const fonts = document.fonts?.load(`900 100px Unbounded`, 'BERNARDO PATRIARCA');
    const loaded = fonts ? fonts.catch(() => { }) : Promise.resolve();

    if (document.body.classList.contains('ready')) {
        loaded.then(ready);
    } else {
        const mo = new MutationObserver(() => {
            if (!document.body.classList.contains('ready')) return;
            mo.disconnect();
            loaded.then(ready);
        });
        mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
}
