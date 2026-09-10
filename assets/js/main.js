import { start } from './core/raf.js';
import { bindAnchors } from './core/smooth-scroll.js';

import { initPreloader } from './components/preloader.js';
import { initTheme } from './components/theme.js';
import { initNav } from './components/nav.js';
import { initMenu, closeMenu } from './components/menu.js';
import { initCursor } from './components/cursor.js';
import { initProgress } from './components/progress.js';
import { initBackToTop } from './components/back-to-top.js';
import { initClock } from './components/clock.js';
import { initGitHub } from './components/github.js';
import { initTerminal } from './components/terminal/index.js';
import { initCommandPalette } from './components/command-palette.js';

import { initReveal } from './effects/reveal.js';
import { initCounters } from './effects/counters.js';
import { initLangBars } from './effects/lang-bars.js';
import { initScramble } from './effects/scramble.js';
import { initMagnetic } from './effects/magnetic.js';
import { initSpotlight } from './effects/spotlight.js';
import { initMarquee } from './effects/marquee.js';
import { initParallax } from './effects/parallax.js';
import { initTimeline } from './effects/timeline.js';
import { initManifesto } from './effects/manifesto.js';
import { initProcess } from './effects/process.js';
import { initWorkFloat } from './effects/work-float.js';

initTheme();
initPreloader();

bindAnchors(closeMenu);
initNav();
initMenu();
initProgress();
initBackToTop();
initClock();
initGitHub();
initTerminal();
initCommandPalette();

const cursorPos = initCursor();
initWorkFloat(cursorPos);

initReveal();
initCounters();
initLangBars();
initScramble();
initMagnetic();
initSpotlight();
initMarquee();
initParallax();
initTimeline();
initManifesto();
initProcess();

start();
