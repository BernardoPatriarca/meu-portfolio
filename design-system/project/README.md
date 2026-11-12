Identidade do portfólio de Bernardo Patriarca, desenvolvedor Full Stack (Java, Quarkus, Spring Boot, Angular). Escura, técnica e cinematográfica: abertura em WebGL, um corredor ladrilhado em perspectiva, miras de diagramação nos cruzamentos, glitch magenta/ciano e um triângulo vazado que atravessa as letras.

## Voz e texto

- Escreva em português do Brasil, em primeira pessoa, direto: "Fale comigo", "Ver projetos", "Disponível para oportunidades".
- Títulos em CAIXA ALTA com uma palavra em itálico serifado de caixa normal para dar respiro (`sec-title` + `serif`).
- Rótulos e metadados em mono, caixa alta, com numeração de dois dígitos: `01 Sobre`, `06 Projetos`.
- Listas de tecnologia usam ponto médio: `Java 21 · Quarkus · Angular · PostgreSQL`.
- Sem emoji. Sem exclamações. Sem clichês de código (`</>`, chaves, prompt) como decoração.

## Cor

- O tema padrão é o escuro (`dark`); o claro (`light`) espelha os mesmos papéis.
- Página em `bg`; seções alternadas em `bg-2`; cartões e tags em `surface`.
- Texto em `text`; secundário em `muted`.
- Texto sobre bloco violeta: sempre `accent-ink` sobre `accent-surface` (botão sólido, toast, destaque, link ativo).
- Violeta como texto: use `accent-text`, nunca `accent`. No escuro, `accent` (#7A4DFF) sobre `bg` dá 4,1:1 — serve para bordas, pontos e formas grandes, não para texto pequeno.
- `accent-2` (cobalto) é o segundo acento; não disputa com o violeta no mesmo elemento de interface.
- `magenta` é detalhe mínimo. `glitch-m` e `glitch-c` só aparecem como aberração cromática (text-shadow e shaders). `glow-a` e `glow-b` só em brilhos WebGL.
- Separe superfícies por fio (`line`, `line-2`) no escuro. Sombra (`shadow`, `shadow-soft`) existe só no claro.

## Tipografia

Cinco famílias, cada uma com um papel:

| Família | Token | Uso |
| --- | --- | --- |
| Unbounded 900 | `hero` | Só o título da abertura (`intro-title`) e as letras do símbolo. |
| Space Grotesk 500/700 | `display` | Títulos, botões, tags, assinatura do logo. |
| DM Sans 400/500 | `body` | Texto corrido. |
| Instrument Serif itálico | `serif` | Uma palavra por título, nunca um parágrafo. |
| JetBrains Mono 400/500 | `mono` | Rótulos, navegação, números, toast. |

- Títulos fecham a entrelinha (0.84 a 0.95) e o espaçamento (−0.04em). Mono abre o espaçamento (+0.04em a +0.16em).
- Os tamanhos de título são fluidos no código (`clamp`); os tokens guardam o teto.
- As fontes vêm do Google Fonts; não há arquivos de fonte no repositório.

## Forma e layout

- Cartões em `r` (18px); painéis grandes em `r-lg` (28px).
- Tudo que é clicável e pequeno é pílula (99px): botões, tags, toast, links da navegação. Botões de ícone são círculos de 38px.
- Conteúdo dentro de `shell` (`min(1440px, 90vw)`). Seções com respiro vertical `clamp(5rem, 11vw, 10rem)`.
- Fios de 1px. Sem gradientes decorativos na interface; brilho e profundidade ficam na cena WebGL atrás do conteúdo.
- O código não define escala de espaçamento em tokens: os espaços são valores `rem` e `clamp` por componente.

## Movimento

- Entradas e hovers usam `ease`; transições de ida e volta usam `ease-io`.
- Hover de botão: um plano sobe de baixo (0.5s) e troca a cor do texto; a seta desloca 3px na diagonal.
- Respeite `prefers-reduced-motion`: sem glitch, sem rolagem suave, sem animação em laço.

## Ícones

- Ícones são SVG de traço desenhados à mão no HTML, `viewBox 0 0 24 24`, `stroke: currentColor`, espessura 1.5 a 1.7, pontas arredondadas, sem preenchimento. Não há biblioteca de ícones.

## Logo

- O logo é o símbolo Ladrilho: quatro ladrilhos em grade 2×2 que formam B e P, com a mira em cruz no vão. Arquivos em `assets/Logos/`; construção e regras no componente Logo.
- No tema escuro use `simbolo-escuro.svg` e `assinatura-escuro.svg` (corpo #EEEBFF, detalhe #2F7BFF); no claro, as versões `-claro` (corpo #5B2EFF, detalhe #1557E0). Todas passam de 4.5:1 sobre `bg` e `surface`.
- Sobre qualquer outro fundo use a versão `-mono` inline, que herda a cor por `currentColor`.
- Na navegação use `assinatura-compacta-*`; na aba do navegador, `favicon.svg`.
- Tamanho mínimo: símbolo 16px, assinatura 20px de altura. Não recolora, não gire, não aplique gradiente, sombra ou contorno, não redesenhe o nome em outra fonte.
- Na navegação do site o símbolo entra inline e troca de cor com o tema (componente Brand).
- `assets/Logo-direcoes/` guarda as direções descartadas; não use.
