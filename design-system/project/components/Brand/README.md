Marca da navegação: o símbolo Ladrilho a 34px com o nome em duas linhas, ao lado dos links numerados. Fonte: `assets/css/components/nav.css` e `index.html`.

- `.brand-mark`: o símbolo inline, recortado na própria forma (`viewBox="8 8 48 48"`). O corpo (`.bm-a`) usa `text` no tema escuro e `accent` no claro; o detalhe (`.bm-b`) usa `accent-2`. Não gira nem anima no hover.
- `.brand-txt`: Space Grotesk 700, caixa alta, quebra entre nome e sobrenome. É texto vivo, não o path da assinatura, para acompanhar o tema.
- `.nav-links a`: mono em `muted` com o número da seção em `<i>`; o link ativo vira pílula `accent-surface`.

No site a barra é fixa e sem moldura; ao rolar ganha fundo `bg` a 82% com desfoque e um fio `line` embaixo. A moldura em pílula do cartão é só para o preview.
