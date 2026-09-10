import { $ } from '../core/dom.js';
import { GH_USER } from '../core/config.js';

const CACHE_KEY = 'gh-cache-v1';
const TTL = 6 * 60 * 60 * 1000;

const LANG_COLORS = {
    JavaScript: '#F1E05A', TypeScript: '#3178C6', HTML: '#E34C26', CSS: '#563D7C',
    Java: '#B07219', Dart: '#00B4AB', Python: '#3572A5', PHP: '#4F5D95',
    'C#': '#178600', Shell: '#89E051', Vue: '#41B883', SCSS: '#C6538C'
};
const FALLBACK = ['#7C5CFF', '#FF4D8D', '#5EE3C0', '#8BA6FF', '#A392FF'];

let data = null;
export const ghData = () => data;

const langColor = (name, i) => LANG_COLORS[name] || FALLBACK[i % FALLBACK.length];

function timeAgo(iso) {
    const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (days < 1) return 'hoje';
    if (days === 1) return 'ontem';
    if (days < 30) return `há ${days} dias`;
    const months = Math.floor(days / 30);
    if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
    const years = Math.floor(months / 12);
    return `há ${years} ano${years > 1 ? 's' : ''}`;
}

function render(d) {
    const set = (key, value) => {
        const el = $(`[data-gh="${key}"]`);
        if (el) el.textContent = value;
    };
    set('repos', d.repos);
    set('stars', d.stars);
    set('followers', d.followers);
    set('since', d.since);

    const bar = $('#ghBar');
    const legend = $('#ghLegend');
    bar.replaceChildren();
    legend.replaceChildren();

    d.langs.forEach((l, i) => {
        const seg = document.createElement('i');
        seg.style.width = `${l.pct}%`;
        seg.style.background = langColor(l.name, i);
        bar.appendChild(seg);

        const li = document.createElement('li');
        const dot = document.createElement('span');
        dot.className = 'dotc';
        dot.style.background = langColor(l.name, i);
        const name = document.createElement('b');
        name.textContent = l.name;
        li.append(dot, name, document.createTextNode(` ${l.pct}%`));
        legend.appendChild(li);
    });

    const list = $('#ghRepos');
    list.replaceChildren();
    d.recent.forEach((r, i) => {
        const a = document.createElement('a');
        a.className = 'gh-repo';
        a.href = r.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.dataset.cursor = 'link';

        const name = document.createElement('span');
        name.className = 'gh-repo-name';
        name.textContent = r.name;

        const meta = document.createElement('span');
        meta.className = 'gh-repo-meta';
        if (r.lang) {
            const lang = document.createElement('span');
            lang.className = 'gh-repo-lang';
            const dot = document.createElement('span');
            dot.className = 'dotc';
            dot.style.background = langColor(r.lang, i);
            lang.append(dot, document.createTextNode(r.lang));
            meta.appendChild(lang);
        }
        const when = document.createElement('span');
        when.textContent = timeAgo(r.updated);
        meta.appendChild(when);

        a.append(name, meta);
        const li = document.createElement('li');
        li.appendChild(a);
        list.appendChild(li);
    });

    $('#ghWrap').dataset.state = 'ready';
}

export async function loadGitHub() {
    const wrap = $('#ghWrap');
    if (!wrap) return;

    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.t < TTL) {
            data = cached.d;
            return render(data);
        }
    } catch { /* cache inválido: busca na rede */ }

    try {
        const get = url => fetch(url).then(r => r.ok ? r.json() : Promise.reject(r.status));
        const [user, repos] = await Promise.all([
            get(`https://api.github.com/users/${GH_USER}`),
            get(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`)
        ]);

        const counts = {};
        repos.forEach(r => r.language && (counts[r.language] = (counts[r.language] || 0) + 1));
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

        data = {
            repos: user.public_repos,
            followers: user.followers,
            stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
            since: new Date(user.created_at).getFullYear(),
            langs: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
                .map(([name, n]) => ({ name, pct: Math.round((n / total) * 100) })),
            recent: repos.filter(r => !r.fork).slice(0, 5).map(r => ({
                name: r.name, url: r.html_url, lang: r.language, updated: r.updated_at
            }))
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: data }));
        render(data);
    } catch {
        wrap.dataset.state = 'error';
    }
}

export function initGitHub() {
    const wrap = $('#ghWrap');
    if (!wrap) return;
    new IntersectionObserver((entries, obs) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        loadGitHub();
    }, { rootMargin: '300px' }).observe(wrap);
}
