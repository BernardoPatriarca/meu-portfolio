import { $, norm, root } from '../../core/dom.js';
import { EMAIL, WHATSAPP, SOCIAL, SECTIONS, GH_USER } from '../../core/config.js';
import { scrollToEl } from '../../core/smooth-scroll.js';
import { copyEmail } from '../toast.js';
import { toggleTheme } from '../theme.js';
import { ghData, loadGitHub } from '../github.js';

export const FILES = {
    'about.txt': 'Bernardo Patriarca, 21 anos, Pato Branco/PR.\nFull Stack Developer na IDS Software e Assessoria desde maio de 2026.\nAtuo no módulo de Saúde de soluções de Gestão Pública Municipal.\nCursando Sistemas de Informação na UNIMATER.',
    'skills.json': '{\n  "front": ["Angular", "React", "TypeScript"],\n  "back": ["Java", "Quarkus", "Spring Boot", "Node.js"],\n  "data": ["PostgreSQL", "MongoDB", "Supabase"],\n  "devops": ["Docker", "Kubernetes", "Jenkins", "Redis"],\n  "mobile": ["Flutter", "React Native", "Dart"]\n}',
    'contact.md': `# Contato\n- email: ${EMAIL}\n- whatsapp: +55 (46) 9 8812-0972\n- local: Pato Branco, PR`
};

const JOKES = [
    'Um QA entra num bar. Pede 1 cerveja. Pede 0 cervejas. Pede -1 cerveja. Pede uma lagartixa.',
    'Existem 10 tipos de pessoas: as que entendem binário e as que não entendem.',
    'Meu código não tem bugs, tem funcionalidades não documentadas.',
    'CSS é fácil, dizia ele, antes de centralizar uma div verticalmente.',
    '— Quantos programadores para trocar uma lâmpada?\n— Nenhum, é problema de hardware.'
];

const OPEN_LINKS = {
    catalogo: `${SOCIAL.github}/catalogo-filmes-series`,
    multi: `${SOCIAL.github}/multi-plataform`,
    crm: `${SOCIAL.github}/prime-crm`,
    github: SOCIAL.github,
    linkedin: SOCIAL.linkedin
};

export const ALIASES = { '?': 'help', cls: 'clear', limpar: 'clear', ajuda: 'help', quem: 'whoami' };

/** io: { print, printText, clear, history } */
export function buildCommands(io) {
    const { print, printText, clear, history } = io;

    return {
        help: () => print(
            `Comandos disponíveis — use <b>Tab</b> para autocompletar:\n\n` +
            `  <b>about</b>          quem sou eu\n` +
            `  <b>skills</b>         minha stack\n` +
            `  <b>projects</b>       trabalhos recentes\n` +
            `  <b>experience</b>     formação e carreira\n` +
            `  <b>github</b>         estatísticas do meu GitHub\n` +
            `  <b>contact</b>        como falar comigo\n` +
            `  <b>social</b>         minhas redes\n` +
            `  <b>email</b>          copia meu e-mail\n` +
            `  <b>goto</b> &lt;seção&gt;   navega pelo site (ex: goto projetos)\n` +
            `  <b>open</b> &lt;projeto&gt; abre um projeto (ex: open catalogo)\n` +
            `  <b>ls</b> / <b>cat</b> &lt;arq&gt;  lista e lê arquivos\n` +
            `  <b>neofetch</b>       resumo do sistema\n` +
            `  <b>theme</b> [dark|light]  troca o tema\n` +
            `  <b>matrix</b>         ???\n` +
            `  <b>joke</b>           piada de programador\n` +
            `  <b>coffee</b>         combustível\n` +
            `  <b>date</b> · <b>history</b> · <b>echo</b> · <b>clear</b> · <b>exit</b>`
        ),

        about: () => print(
            `Bernardo Patriarca — 21 anos, Pato Branco/PR.\n` +
            `Desenvolvedor Full Stack na <b>IDS Software e Assessoria</b> desde mai/2026,\n` +
            `atuando no módulo de Saúde de soluções de Gestão Pública Municipal.\n` +
            `Curso Sistemas de Informação na UNIMATER e já participei de 2 hackathons.`
        ),

        skills: () => print(
            `<b>front</b>   Angular · React · TypeScript · JavaScript · Tailwind · PrimeNG\n` +
            `<b>back</b>    Java · Quarkus · Spring Boot · Node.js · JSF · REST APIs · n8n\n` +
            `<b>dados</b>   PostgreSQL · SQL Server · MongoDB · Firestore · Supabase\n` +
            `<b>devops</b>  Docker · Kubernetes · Jenkins · Portainer · RabbitMQ · Redis · Flyway\n` +
            `<b>mobile</b>  Flutter · React Native · Dart\n` +
            `<b>tools</b>   Git · GitHub · Bitbucket · AWS · Testes unitários · Scrum · Kanban`
        ),

        projects: () => print(
            `1. <b>Catálogo de Filmes e Séries</b> — Java · Quarkus · Angular · PostgreSQL\n` +
            `   <a href="${OPEN_LINKS.catalogo}" target="_blank" rel="noopener">github.com/${GH_USER}/catalogo-filmes-series</a>\n` +
            `2. <b>Multi Plataform</b> — Java · Spring Boot · Angular · Ionic\n` +
            `   <a href="${OPEN_LINKS.multi}" target="_blank" rel="noopener">github.com/${GH_USER}/multi-plataform</a>\n` +
            `3. <b>Prime CRM</b> — Java · Spring Boot · Angular · PostgreSQL\n` +
            `   <a href="${OPEN_LINKS.crm}" target="_blank" rel="noopener">github.com/${GH_USER}/prime-crm</a>\n\n` +
            `Use <b>open catalogo</b> (ou multi / crm) para abrir no GitHub.`
        ),

        experience: () => print(
            `mai/2026 — atual   <b>Full Stack</b> @ IDS Software e Assessoria\n` +
            `mai/2024 — mai/2026 <b>Desenvolvedor de Sistemas</b> @ Supera Sistemas\n` +
            `2024 — 2028        Sistemas de Informação · UNIMATER\n` +
            `ago/2022 — dez/2023 Análise de Sistemas de Computação · SENAI\n` +
            `2014 — 2019        Inglês (5 anos) · PBF`
        ),

        contact: () => print(
            `e-mail    <a href="mailto:${EMAIL}">${EMAIL}</a>\n` +
            `whatsapp  <a href="${WHATSAPP}" target="_blank" rel="noopener">+55 (46) 9 8812-0972</a>\n` +
            `local     Pato Branco, PR — Brasil`
        ),

        social: () => print(
            `github     <a href="${SOCIAL.github}" target="_blank" rel="noopener">@${GH_USER}</a>\n` +
            `linkedin   <a href="${SOCIAL.linkedin}" target="_blank" rel="noopener">/in/bernardopatriarca</a>\n` +
            `instagram  <a href="${SOCIAL.instagram}" target="_blank" rel="noopener">@bernardopatriarca</a>`
        ),

        github: async () => {
            if (!ghData()) {
                print('Buscando dados na API do GitHub...');
                await loadGitHub();
            }
            const d = ghData();
            if (!d) return print('Não consegui falar com a API agora. Tenta de novo daqui a pouco.', 'err');
            print(
                `<b>@${GH_USER}</b>\n` +
                `  repositórios  ${d.repos}\n` +
                `  stars         ${d.stars}\n` +
                `  seguidores    ${d.followers}\n` +
                `  desde         ${d.since}\n` +
                `  linguagens    ${d.langs.map(l => `${l.name} ${l.pct}%`).join(' · ')}`
            );
        },

        email: () => {
            copyEmail();
            print(`E-mail copiado para a área de transferência: ${EMAIL}`, 'ok');
        },

        goto: arg => {
            if (!arg) return print('Uso: goto &lt;seção&gt; — ex: goto projetos, goto stack, goto contato', 'err');
            const target = SECTIONS[norm(arg)];
            if (!target) return print(`Seção "${arg}" não existe. Tente: ${Object.keys(SECTIONS).slice(0, 8).join(', ')}`, 'err');
            print(`Indo para ${arg}...`, 'ok');
            setTimeout(() => scrollToEl(target), 350);
        },

        open: arg => {
            const url = OPEN_LINKS[norm(arg || '')];
            if (!url) return print(`Uso: open &lt;projeto&gt; — opções: ${Object.keys(OPEN_LINKS).join(', ')}`, 'err');
            open(url, '_blank', 'noopener');
            print(`Abrindo ${url} ...`, 'ok');
        },

        ls: () => print('about.txt   skills.json   contact.md   projetos/   segredos/'),

        cat: arg => {
            if (!arg) return print('Uso: cat &lt;arquivo&gt; — ex: cat about.txt', 'err');
            const file = FILES[arg.toLowerCase()];
            if (!file) return print(`cat: ${arg}: arquivo não encontrado`, 'err');
            printText(file);
        },

        neofetch: () => print(
            `<b>      ____</b>      visitante@bernardo\n` +
            `<b>     /    \\</b>     ──────────────────\n` +
            `<b>    | BP   |</b>    host      portfolio.dev\n` +
            `<b>    |  __  |</b>    kernel    javascript-vanilla\n` +
            `<b>     \\____/</b>     uptime    ${Math.floor(performance.now() / 1000)}s\n` +
            `                shell     bash-web\n` +
            `                tema      ${root.getAttribute('data-theme')}\n` +
            `                stack     Angular · Java · Quarkus\n` +
            `                local     Pato Branco, PR — BR`,
            'art'
        ),

        theme: arg => {
            const wanted = arg ? norm(arg) : null;
            const current = root.getAttribute('data-theme');
            if (wanted && wanted !== 'dark' && wanted !== 'light') {
                return print('Uso: theme dark | theme light | theme (alterna)', 'err');
            }
            if (wanted === current) return print(`O tema já é ${current}.`);
            toggleTheme();
            print(`Tema alterado para ${root.getAttribute('data-theme')}.`, 'ok');
        },

        matrix: () => {
            const chars = 'アイウエオカキクケコ01アセソタチツテ10ナニヌネノ';
            let ticks = 0;
            const id = setInterval(() => {
                printText(Array.from({ length: 46 }, () => chars[(Math.random() * chars.length) | 0]).join(' '), 'ok art');
                if (++ticks >= 8) {
                    clearInterval(id);
                    print('Acorda, Neo... o portfólio te encontrou. 🕶️');
                }
            }, 110);
        },

        joke: () => printText(JOKES[(Math.random() * JOKES.length) | 0]),

        coffee: () => print(
            `      ( (\n       ) )\n    ........\n    |      |]\n    \\      /\n     \`----'\n` +
            `Café servido. Produtividade +40%.`,
            'art'
        ),

        date: () => print(new Date().toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short'
        })),

        history: () => history.length
            ? printText(history.slice().reverse().map((h, i) => `  ${i + 1}  ${h}`).join('\n'))
            : print('Nenhum comando no histórico ainda.'),

        echo: arg => printText(arg || ''),
        pwd: () => print('/home/bernardo/portfolio'),
        whoami: () => print('visitante — mas pode virar cliente 😉'),
        sudo: () => print('Boa tentativa. Mas aqui quem manda é o café. ☕', 'err'),
        exit: () => print('Não dá pra sair — mas o botão de contato ali em cima aceita visitas. 👋'),
        clear
    };
}
