Logo oficial: o símbolo Ladrilho e a assinatura "BERNARDO PATRIARCA". Quatro ladrilhos numa grade 2×2 — a coluna esquerda empilha os dois bojos do B, a direita faz o P (bojo + haste) — e o vão entre eles desenha a mira em cruz.

## Construção

- Símbolo em viewBox 64×64: margem de 8, ladrilhos de 22, vão de 4, bojos de raio 11, haste do P com 9 de largura.
- Assinatura em uma linha: Space Grotesk 700 convertida em paths, espaçamento +0.04em, altura de versal igual a um ladrilho (22), centrada no símbolo, a 16 de distância.
- Assinatura compacta: duas linhas com versal de 14, cada linha centrada num ladrilho.
- A margem de 8 já está em cada arquivo: é a área de respiro mínima. Não encoste nada nela.

## Qual arquivo usar

| Situação | Arquivo em `assets/Logos/` |
| --- | --- |
| Sobre `bg` ou `surface` do tema escuro | `simbolo-escuro.svg`, `assinatura-escuro.svg` |
| Sobre `bg` ou `surface` do tema claro | `simbolo-claro.svg`, `assinatura-claro.svg` |
| Uma cor só, ou sobre foto e cor de terceiros | `*-mono.svg`, inline, com a cor herdada por `currentColor` |
| Navegação e espaços estreitos | `assinatura-compacta-*.svg` |
| Aba do navegador, ícone de app | `favicon.svg` |

## Regras

- Tamanho mínimo: símbolo a 16px; assinatura com 20px de altura; compacta com 32px.
- Abaixo disso, use só o símbolo.
- Não troque as cores, não aplique gradiente, sombra, contorno ou rotação, e não redesenhe o nome em outra fonte.
- Não use a versão escura sobre fundo claro nem o contrário: o corpo #EEEBFF some no claro.
