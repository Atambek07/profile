// ============================================================
// main.js — точка входа. Оркестрирует: WebGL-фон → анимации → UI-мелочи
// ============================================================
import './styles/style.css';

// Иконки Phosphor: webfont-стилиbundl'ятся Vite (woff2 попадает в dist/)
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/fill';

import { initBackground } from './animations/webgl-bg.js';
import {
  initEntrance,
  initTilt,
  initMagnetic,
  initTypewriter,
} from './animations/gsap.js';

// год в футере
document.getElementById('year').textContent = new Date().getFullYear();

// 1. Живой WebGL-фон (не блокирует рендер интерфейса)
let disposeBg = () => {};
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  disposeBg = initBackground();
}

// 2. Анимации интерфейса
initEntrance();
initTilt();
initMagnetic();
initTypewriter();

// горячая перезагрузка фона в dev-режиме
if (import.meta.hot) {
  import.meta.hot.dispose(() => disposeBg());
}
