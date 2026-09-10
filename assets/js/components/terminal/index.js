import { $ } from '../../core/dom.js';
import { buildCommands, ALIASES } from './commands.js';

const PROMPT = 'visitante@bernardo:~$';

export function initTerminal() {
    const body = $('#termBody');
    const form = $('#termForm');
    const input = $('#termInput');
    if (!body) return;

    const history = [];
    let histIndex = -1;

    const append = (cls, build) => {
        const line = document.createElement('div');
        line.className = `term-line ${cls}`.trim();
        build(line);
        body.appendChild(line);
        body.scrollTop = body.scrollHeight;
    };

    const io = {
        print: (html, cls = '') => append(cls, l => l.innerHTML = html),
        printText: (text, cls = '') => append(cls, l => l.textContent = text),
        clear: () => body.replaceChildren(),
        history
    };

    const echo = value => append('cmd', line => {
        const prompt = document.createElement('span');
        prompt.textContent = PROMPT;
        line.append(prompt, document.createTextNode(value));
    });

    const commands = buildCommands(io);
    const names = Object.keys(commands);

    const run = raw => {
        const [first, ...rest] = raw.trim().split(/\s+/);
        const name = ALIASES[first.toLowerCase()] || first.toLowerCase();
        if (commands[name]) return commands[name](rest.join(' '));
        io.print(`comando não encontrado: ${first} — digite <b>help</b> para ver as opções`, 'err');
    };

    io.print('Bem-vindo ao terminal do portfólio. Digite <b>help</b> para começar — <b>Tab</b> autocompleta.', 'ok');

    form.addEventListener('submit', e => {
        e.preventDefault();
        const value = input.value;
        if (!value.trim()) return;
        echo(value);
        history.unshift(value);
        histIndex = -1;
        run(value);
        input.value = '';
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const typed = input.value.trim().toLowerCase();
            if (!typed || typed.includes(' ')) return;
            const matches = names.filter(n => n.startsWith(typed));
            if (matches.length === 1) input.value = matches[0] + ' ';
            else if (matches.length > 1) {
                echo(input.value);
                io.printText(matches.join('   '));
            }
            return;
        }

        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        e.preventDefault();
        histIndex = e.key === 'ArrowUp'
            ? Math.min(histIndex + 1, history.length - 1)
            : Math.max(histIndex - 1, -1);
        input.value = histIndex >= 0 ? history[histIndex] : '';
    });

    $('#term').addEventListener('click', e => {
        if (!e.target.closest('a, button')) input.focus();
    });

    $('#termClear').addEventListener('click', io.clear);
}
