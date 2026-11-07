// ============================================================
// webgl-bg.js — Three.js интерактивный фон
// Тёмная «жидкая» абстракция: fbm-шум + domain warping,
// неоновые акценты cyan/violet. Реакция: курсор мыши / гироскоп.
// ============================================================
import * as THREE from 'three';

const VERT = /* glsl */`
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */`
  precision highp float;

  uniform vec2  uRes;
  uniform float uTime;
  uniform vec2  uMouse;   // -1..1, сглаженный
  uniform float uPointer; // 1.0 если есть pointer (был ввод)

  // ---- value noise + fbm ----
  float noise2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = fract(sin(dot(i + vec2(0.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
    float b = fract(sin(dot(i + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
    float c = fract(sin(dot(i + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
    float d = fract(sin(dot(i + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * noise2(p);
      p = rot * p * 2.0 + vec2(3.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
    float t = uTime * 0.06;

    // курсор как «гравитация» — притягивает и растягивает поле
    vec2 m = uMouse * 0.55;
    vec2 d = uv - m;
    float md = length(d);
    vec2 drag = normalize(d + 1e-4) * exp(-md * 3.5) * 0.35 * uPointer;

    vec2 p = uv + drag;

    // domain warping: fbm(p1) искажает fbm(p2)
    vec2 q = vec2(fbm(p * 1.6 + t), fbm(p * 1.6 + 5.2 - t * 0.7));
    vec2 r = vec2(
      fbm(p * 1.8 + 3.0 * q + vec2(1.7, 9.2) + t * 0.8),
      fbm(p * 1.8 + 3.0 * q + vec2(8.3, 2.8) - t * 0.6)
    );
    float f = fbm(p * 2.0 + 4.0 * r);

    // блик курсора — мягкая линза
    float lens = exp(-md * 2.0) * 0.18 * uPointer;

    // палитра: глубокий чёрный -> violet -> cyan
    vec3 bg      = vec3(0.012, 0.012, 0.016);
    vec3 cyan    = vec3(0.0, 0.94, 1.0);
    vec3 violet  = vec3(0.54, 0.17, 0.886);

    float band1 = smoothstep(0.15, 0.95, f);           // основная масса
    float edge  = smoothstep(0.45, 0.75, abs(r.x - r.y)); // «филаменты»

    vec3 col = bg;
    col += violet * band1 * 0.13 * (0.6 + 0.4 * sin(t * 2.0 + uv.x * 3.0));
    col += cyan  * edge * 0.07;
    col += cyan  * lens * 0.8 + violet * lens * 0.6;

    // виньетка, чтобы центр экрана оставался глубоким
    float vig = 1.0 - dot(uv * 0.9, uv * 0.9) * 0.6;
    col *= vig;

    // мягкий dither — против бандлинга на тёмных градиентах
    float dith = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) * uTime) * 43758.5453);
    col += (dith - 0.5) * 0.012;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function initBackground() {
  const canvas = document.getElementById('webgl-bg');
  if (!canvas) return () => {};

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uRes:     { value: new THREE.Vector2(1, 1) },
    uTime:    { value: 0 },
    uMouse:   { value: new THREE.Vector2(0, 0) },
    uPointer: { value: 0 },
  };

  scene.add(new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms }),
  ));

  // ---- размер ----
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  }
  resize();

  // ---- pointer: мышь + гироскоп ----
  const target = new THREE.Vector2(0, 0);
  const current = new THREE.Vector2(0, 0);
  let pointerSeen = false;

  window.addEventListener('pointermove', (e) => {
    target.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1),
    );
    pointerSeen = true;
  }, { passive: true });

  // Mobile: гироскоп управляет полем вместо курсора.
  // iOS требует разрешения — запускаем по первому касанию.
  const onOrient = (e) => {
    const { gamma = 0, beta = 0 } = e; // gamma ±90 (влево/вправо), beta -180..180
    target.set(
      Math.max(-1, Math.min(1, gamma / 45)),
      Math.max(-1, Math.min(1, -((beta - 45) / 45))),
    );
    pointerSeen = true;
  };

  const requestGyro = () => {
    if (typeof DeviceOrientationEvent !== 'undefined'
      && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((s) => { if (s === 'granted') window.addEventListener('deviceorientation', onOrient, { passive: true }); })
        .catch(() => {});
    } else {
      window.addEventListener('deviceorientation', onOrient, { passive: true });
    }
    window.removeEventListener('touchend', requestGyro);
    window.removeEventListener('click', requestGyro);
  };
  if (window.matchMedia('(pointer: coarse)').matches) {
    window.addEventListener('touchend', requestGyro, { passive: true });
    window.addEventListener('click', requestGyro, { passive: true });
  }

  // ---- анимация ----
  const clock = new THREE.Clock();
  let raf = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    const t = reduced ? 0 : clock.getElapsedTime();

    // экспоненциальное сглаживание курсора
    current.lerp(target, 0.04);
    uniforms.uMouse.value.copy(current);

    const pTarget = pointerSeen && !reduced ? 1 : 0;
    uniforms.uPointer.value += (pTarget - uniforms.uPointer.value) * 0.05;

    uniforms.uTime.value = t;
    renderer.render(scene, camera);
  }

  // ---- lifecycle ----
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      clock.getElapsedTime(); // сброс дельты
      tick();
    }
  });

  tick();
  canvas.classList.add('is-ready');

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    renderer.dispose();
  };
}
