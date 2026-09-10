# Portfólio — Bernardo Patriarca

Site estático, sem build e sem framework. HTML + CSS modular + JavaScript em ES Modules.

## Rodando

```bash
python3 -m http.server 4173
```

Precisa de um servidor HTTP: os ES Modules não carregam via `file://`.

## Estrutura

```
index.html                 marcação de todas as seções
assets/
├── css/
│   ├── main.css           importa todo o resto, nesta ordem
│   ├── base/              tokens, reset, tipografia, layout
│   ├── components/        nav, menu, botão, cursor, terminal, ⌘K, marquee...
│   ├── sections/          hero, sobre, processo, stack, projetos, contato...
│   └── utils/             reveal, responsivo, reduced-motion
└── js/
    ├── main.js            inicializa tudo
    ├── core/              dom, config, loop de rAF, smooth scroll
    ├── components/        preloader, nav, tema, terminal, ⌘K, GitHub...
    └── effects/           parallax, reveal, marquee, processo, scramble...
```

## Como funciona

**Um loop só.** Todo efeito de scroll passa por `core/raf.js`. Os módulos registram callbacks com `onScroll` (roda quando o scroll muda) ou `onFrame` (roda todo frame), em vez de criar seus próprios `requestAnimationFrame`.

**Conteúdo em um lugar.** Dados que mudam com frequência — e-mail, redes, projetos, usuário do GitHub — ficam em `core/config.js`.

**Temas.** Tudo vem de custom properties em `base/tokens.css`. `--accent` é para detalhes gráficos; `--accent-surface` é para blocos com texto por cima (mais escuro, garante contraste).

## Notas

- O CSS usa `@import`, que carrega em cascata. Para produção com muita latência, vale concatenar os arquivos em um só.
- `assets/js/components/terminal/commands.js` concentra os comandos do terminal — é só adicionar uma chave ao objeto para criar um novo.
