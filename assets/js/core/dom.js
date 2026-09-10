export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

export const clamp01 = v => Math.max(0, Math.min(1, v));
export const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const root = document.documentElement;
