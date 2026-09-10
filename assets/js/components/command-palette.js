import { $, norm } from '../core/dom.js';
import { SOCIAL } from '../core/config.js';
import { scrollToEl, pause, resume } from '../core/smooth-scroll.js';
import { copyEmail } from './toast.js';
import { toggleTheme } from './theme.js';

const openLink = url => open(url, '_blank', 'noopener');

const ACTIONS = [
    { ico: '01', label: 'Ir para Sobre', tag: 'seção', run: () => scrollToEl('#about') },
    { ico: '02', label: 'Ir para Serviços', tag: 'seção', run: () => scrollToEl('#services') },
    { ico: '03', label: 'Ir para Processo', tag: 'seção', run: () => scrollToEl('#process') },
    { ico: '04', label: 'Ir para Stack', tag: 'seção', run: () => scrollToEl('#stack') },
    { ico: '05', label: 'Ir para Trajetória', tag: 'seção', run: () => scrollToEl('#path') },
    { ico: '06', label: 'Ir para Projetos', tag: 'seção', run: () => scrollToEl('#work') },
    { ico: '07', label: 'Ir para GitHub ao vivo', tag: 'seção', run: () => scrollToEl('#github') },
    { ico: '>_', label: 'Abrir o terminal (Lab)', tag: 'seção', run: () => scrollToEl('#playground') },
    { ico: '09', label: 'Ir para Contato', tag: 'seção', run: () => scrollToEl('#contact') },
    { ico: '@', label: 'Copiar e-mail', tag: 'ação', run: copyEmail },
    { ico: '◐', label: 'Alternar tema claro/escuro', tag: 'ação', run: toggleTheme },
    { ico: '↑', label: 'Voltar ao topo', tag: 'ação', run: () => scrollToEl('#top') },
    { ico: '↗', label: 'GitHub', tag: 'link', run: () => openLink(SOCIAL.github) },
    { ico: '↗', label: 'LinkedIn', tag: 'link', run: () => openLink(SOCIAL.linkedin) },
    { ico: '↗', label: 'WhatsApp', tag: 'link', run: () => openLink(SOCIAL.whatsapp) },
    { ico: '↗', label: 'Instagram', tag: 'link', run: () => openLink(SOCIAL.instagram) }
];

export function initCommandPalette() {
    const modal = $('#cmdk');
    const input = $('#cmdkInput');
    const list = $('#cmdkList');
    if (!modal) return;

    let filtered = ACTIONS;
    let selected = 0;

    function render() {
        list.replaceChildren();

        if (!filtered.length) {
            const empty = document.createElement('li');
            empty.className = 'cmdk-empty';
            empty.textContent = 'Nada encontrado por aqui.';
            return list.appendChild(empty);
        }

        filtered.forEach((item, i) => {
            const li = document.createElement('li');
            li.className = `cmdk-item${i === selected ? ' sel' : ''}`;
            li.setAttribute('role', 'option');
            li.innerHTML = '<span class="ci-ico"></span><span class="ci-txt"></span><span class="ci-tag"></span>';
            li.querySelector('.ci-ico').textContent = item.ico;
            li.querySelector('.ci-txt').textContent = item.label;
            li.querySelector('.ci-tag').textContent = item.tag;
            li.addEventListener('click', () => execute(item));
            li.addEventListener('mousemove', () => {
                if (selected === i) return;
                selected = i;
                render();
            });
            list.appendChild(li);
        });
    }

    function openPalette() {
        modal.hidden = false;
        requestAnimationFrame(() => modal.classList.add('open'));
        input.value = '';
        filtered = ACTIONS;
        selected = 0;
        render();
        input.focus();
        pause();
    }

    function closePalette() {
        if (modal.hidden) return;
        modal.classList.remove('open');
        resume();
        setTimeout(() => modal.hidden = true, 250);
    }

    function execute(item) {
        closePalette();
        setTimeout(() => item.run(), 120);
    }

    input.addEventListener('input', () => {
        const q = norm(input.value.trim());
        filtered = q ? ACTIONS.filter(a => norm(a.label + a.tag).includes(q)) : ACTIONS;
        selected = 0;
        render();
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!filtered.length) return;
            selected = e.key === 'ArrowDown'
                ? (selected + 1) % filtered.length
                : (selected - 1 + filtered.length) % filtered.length;
            render();
            list.children[selected]?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[selected]) execute(filtered[selected]);
        }
    });

    modal.addEventListener('click', e => e.target === modal && closePalette());
    $('#cmdkBtn')?.addEventListener('click', openPalette);

    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            modal.hidden ? openPalette() : closePalette();
        } else if (e.key === 'Escape') {
            closePalette();
        }
    });
}
