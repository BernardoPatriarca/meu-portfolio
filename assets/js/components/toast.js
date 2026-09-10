import { $ } from '../core/dom.js';
import { EMAIL } from '../core/config.js';

let timer;

export function showToast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('show'), 2200);
}

export async function copyEmail() {
    try {
        await navigator.clipboard.writeText(EMAIL);
        showToast('E-mail copiado ✓');
    } catch {
        showToast(EMAIL);
    }
}
