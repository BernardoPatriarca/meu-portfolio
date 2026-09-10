import { $, clamp01 } from '../core/dom.js';
import { onScroll, watch } from '../core/raf.js';

export function initTimeline() {
    const timeline = $('#timeline');
    const fill = $('#tlFill');
    if (!timeline || !fill) return;

    let visible = false;
    watch(timeline, v => visible = v);

    onScroll(() => {
        if (!visible) return;
        const r = timeline.getBoundingClientRect();
        fill.style.setProperty('--p', clamp01((innerHeight * 0.62 - r.top) / r.height).toFixed(3));
    });
}
