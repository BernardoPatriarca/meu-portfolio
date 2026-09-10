import { $ } from '../core/dom.js';
import { onScroll } from '../core/raf.js';

export function initProgress() {
    const bar = $('#progress');
    if (!bar) return;
    onScroll(({ progress }) => bar.style.transform = `scaleX(${progress})`);
}
