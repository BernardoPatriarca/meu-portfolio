import { root } from './dom.js';

/**
 * Modo baixo consumo.
 *
 * A detecção estática (núcleos de CPU / memória) roda num script inline no
 * <head> para que o CSS já pinte leve no primeiro frame. Aqui apenas lemos
 * o resultado e, se a máquina passou pela triagem, medimos o FPS real —
 * máquina sem aceleração de GPU passa nos números e trava na prática.
 */
export let lowPower = root.dataset.perf === 'low';

const enable = () => {
    if (lowPower) return;
    lowPower = true;
    root.dataset.perf = 'low';
    try { sessionStorage.setItem('perf', 'low'); } catch { /* modo privado */ }
};

/** amostra o FPS por ~1s e degrada se estiver abaixo do aceitável */
export function watchFps(onDowngrade) {
    if (lowPower) return;

    let frames = 0;
    let t0 = 0;

    const sample = t => {
        if (!t0) t0 = t;
        frames++;

        const elapsed = t - t0;
        if (elapsed < 1000) return requestAnimationFrame(sample);

        // < 40fps com a página parada = renderização por software / GPU fraca
        if (frames / (elapsed / 1000) < 40) {
            enable();
            onDowngrade?.();
        }
    };

    // o preloader e a troca de fontes seguram o main thread no início;
    // medir antes disso acusaria máquina boa como fraca
    setTimeout(() => requestAnimationFrame(sample), 1800);
}
