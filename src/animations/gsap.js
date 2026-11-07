// ============================================================
// gsap.js — вся анимационная логика сайта
// 1) Entrance: Bento-плитки «выплывают» снизу, ease back.out(1.7)
// 2) 3D Tilt: vanilla-tilt на каждой интерактивной плитке
// 3) Magnetic UI: иконки/кнопки притягиваются к курсору
// 4) Typewriter: статус «Software Engineer | Backend & Hardware»
// ============================================================
import gsap from 'gsap';
import VanillaTilt from 'vanilla-tilt';

/* ---------- 1. Entrance stagger ---------- */
export function initEntrance() {
  const tiles = gsap.utils.toArray('.bento [data-gsap]');
  const foot = document.querySelector('[data-gsap-fade]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    gsap.set(tiles, { opacity: 1 });
    if (foot) gsap.set(foot, { opacity: 1 });
    return;
  }

  gsap.timeline({ defaults: { ease: 'back.out(1.7)', duration: 0.9 } })
    .set(tiles, { opacity: 0, y: 90, scale: 0.94, transformOrigin: '50% 50%' })
    .to(tiles, {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: { each: 0.09, from: 'start' },
      delay: 0.15,
    })
    .fromTo(foot,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: 'power2.out' },
      '-=0.4');
}

/* ---------- 2. 3D Tilt ---------- */
export function initTilt() {
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isCoarse || reduced) return; // на тач-устройствах tilt не нужен

  VanillaTilt.init(document.querySelectorAll('.tilt'), {
    max: 7,
    speed: 500,
    perspective: 900,
    perspectiveOnly: false,
    scale: 1.015,
    glare: true,
    'max-glare': 0.18,
    'glare-prerequisites': false,
    gyroscope: false,
  });
}

/* ---------- 3. Magnetic UI ---------- */
export function initMagnetic() {
  const els = gsap.utils.toArray('.magnetic');
  if (!els.length || window.matchMedia('(pointer: coarse)').matches) return;

  els.forEach((el) => {
    // сила притяжения и радиус действия
    const strength = 28;
    let leaveTl = null;

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const relX = (e.clientX - (r.left + r.width / 2)) / r.width;  // -0.5..0.5
      const relY = (e.clientY - (r.top + r.height / 2)) / r.height;

      if (leaveTl) leaveTl.kill();
      gsap.to(el, {
        x: relX * strength,
        y: relY * strength,
        duration: 0.4,
        ease: 'power3.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      // упругий «возврат на место»
      leaveTl = gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: 'elastic.out(1, 0.4)',
      });
    });
  });
}

/* ---------- 4. Typewriter ---------- */
const PHRASES = ['Software Engineer', 'Backend & Hardware'];
const TYPE_SPEED = 65;
const ERASE_SPEED = 32;
const HOLD_MS = 2200;

export function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    el.textContent = PHRASES.join(' | ');
    return;
  }

  let phrase = 0;
  let chars = 0;
  let erasing = false;

  function step() {
    const text = PHRASES[phrase];

    if (!erasing) {
      chars++;
      el.textContent = text.slice(0, chars);
      if (chars === text.length) {
        erasing = true;
        setTimeout(step, HOLD_MS);
        return;
      }
      setTimeout(step, TYPE_SPEED);
    } else {
      chars--;
      el.textContent = text.slice(0, chars);
      if (chars === 0) {
        erasing = false;
        phrase = (phrase + 1) % PHRASES.length;
        setTimeout(step, 500);
        return;
      }
      setTimeout(step, ERASE_SPEED);
    }
  }

  // разделяем("|") визуально через паузу между фразами
  setTimeout(step, 600);
}
