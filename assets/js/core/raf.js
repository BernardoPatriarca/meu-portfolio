import { clamp01 } from './dom.js';

const frameTasks = [];
const scrollTasks = [];

let lastY = -1;
let maxScroll = 0;
let smoothVel = 0;

/** roda todo frame */
export const onFrame = fn => frameTasks.push(fn);

/** roda só quando o scroll muda: { y, progress, velocity, down } */
export const onScroll = fn => scrollTasks.push(fn);

export const invalidate = () => { lastY = -1; };

/** observa visibilidade e revalida o scroll */
export const watch = (el, set, rootMargin = '100px') => {
    if (!el) return;
    new IntersectionObserver(([e]) => {
        set(e.isIntersecting);
        invalidate();
    }, { rootMargin }).observe(el);
};

const measure = () => { maxScroll = document.documentElement.scrollHeight - innerHeight; };

export function start() {
    measure();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) invalidate(); });
    new ResizeObserver(measure).observe(document.body);

    requestAnimationFrame(function loop(time) {
        // aba em segundo plano: nada do que roda aqui e visivel
        if (document.hidden) return requestAnimationFrame(loop);

        for (const fn of frameTasks) fn(time);

        const y = scrollY;
        if (y !== lastY) {
            if (lastY >= 0) smoothVel += ((y - lastY) - smoothVel) * 0.18;
            const ctx = {
                y,
                progress: maxScroll > 0 ? clamp01(y / maxScroll) : 0,
                velocity: Math.max(-40, Math.min(40, smoothVel)),
                down: y > lastY
            };
            for (const fn of scrollTasks) fn(ctx);
            lastY = y;
        }

        requestAnimationFrame(loop);
    });
}
