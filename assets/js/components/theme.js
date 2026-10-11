import { $, root } from '../core/dom.js';
import { THEME_COLORS } from '../core/config.js';

const btn = () => $('#themeBtn');

export const currentTheme = () => root.getAttribute('data-theme');

export function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    $('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[next]);
    return next;
}

export function initTheme() {
    root.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
    btn()?.addEventListener('click', toggleTheme);
}
