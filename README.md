<div align="center">

# ⚡ ATAMBEK — Link-in-Bio

**Cyber-Minimalism × Glassmorphism × WebGL**

Личный сайт-визитка нового поколения: асимметричный Bento Grid на матовом стекле,
живой интерактивный WebGL-фон и микровзаимодействия уровня Awwwards.

</div>

---

## ✨ Что внутри

| Эффект | Рализация |
|---|---|
| 🧊 **Glassmorphism** | Полупрозрачные плитки с `backdrop-filter: blur()` , неоновая рамка при ховере |
| 🍱 **Bento Grid** | Асимметричная 4-колоночная сетка, плотно подогнанные скруглённые плитки |
| 🌌 **WebGL-фон** | Three.js шейдер: fbm-noise + domain warping, реагирует на курсор мыши |
| 📱 **Гироскоп** | На мобильных фон реагирует на наклон устройства (с iOS-permission по тапу) |
| 🎬 **Entrance Stagger** | Плитки «выплывают» снизу через GSAP, ease `back.out(1.7)` |
| 🕹 **3D Tilt** | Наклон плиток к курсору с бликом (vanilla-tilt.js) |
| 🧲 **Magnetic UI** | Соц-кнопки притягиваются к курсору, упругий возврат `elastic.out` |
| ⌨️ **Typewriter** | Циклическая печать статуса `Software Engineer` / `Backend & Hardware` |
| 💚 **Live Status** | Пульсирующий зелёный индикатор `Oracle Cloud VPS — Online` |
| 🛡 **A11y / perf** | `prefers-reduced-motion`, safe-area iOS, `sleep`-pause RAF, dither против бандлинга |

## 🧬 Стек

```
Vite (Vanilla JS)  ·  Three.js  ·  GSAP 3  ·  vanilla-tilt.js
Phosphor Icons     ·  Чистый CSS (Custom Properties)  ·  Mobile-First
```

## 📂 Структура проекта

```
.
├── index.html                  # Bento-разметка + инъекция контента
├── vite.config.js              # base: './' — деплой в любую папку
├── package.json
├── README.md
└── src/
    ├── main.js                 # точка входа, оркестрация модулей
    ├── styles/
    │   └── style.css           # токены (CSS Variables), стекло, сетка
    └── animations/
        ├── gsap.js             # entrance · tilt · magnetic · typewriter
        └── webgl-bg.js         # Three.js шейдерный фон
```

## 🚀 Запуск

```bash
# 1. Установить зависимости
npm install

# 2. Dev-сервер (поднят и на локальной сети — можно открыть с телефона)
npm run dev
# → http://localhost:5173

# 3. Продакшн-билд
npm run build
# → dist/

# 4. Локальный просмотр билда
npm run preview
```

## 📦 Деплой для Instagram-bio

1. `npm run build`;
2. папку `dist/` целиком закиньте на любой статик-хостинг:
   **Netlify Drop** (drag-and-drop), **Cloudflare Pages**, **GitHub Pages** или ваш **Oracle Cloud VPS** (nginx);
3. получите короткий домен (например, `atambek.dev`) и ставьте его в шапку профиля.

> ⚠️ `vite.config.js` уже задаёт `base: './'`, поэтому билд откроется
> корректно и из корня домена, и из придаточной подпапки.

## 🎨 Кастомизация

Все визуальные токены — в начале `src/styles/style.css`:

```css
:root {
  --bg: #050505;        /* глубокий тёмный фон */
  --accent: #00f0ff;    /* неоновый кибер-синий */
  --accent-2: #8a2be2;  /* фиолетовый */
  --online: #00e676;    /* зелёный статус VPS */
  --glass: rgba(255, 255, 255, 0.045);
}
```

- **Контент** (ссылки, бейджи, линки) — в `index.html`;
- **Тексты typewriter** — массив `PHRASES` в `src/animations/gsap.js`;
- **Характер WebGL-фона** (скорость, палитра, сила реакции) — юниформы `uTime` и коэффициенты в `src/animations/webgl-bg.js`.

## 📱 Мобильная магия

- лейаут собирается Mobile-First: на iOS/Android интерфейс выглядит как нативное приложение
  (визувальная сетка по safe-area, крупные тач-таргеты);
- фон на телефоне живёт от **гироскопа** — на iOS 13+ разрешение запрашивается по первому касанию;
- `pointer-events` не перехватываются канвасом, весь UI кликабелен поверх фона.

---

<div align="center">
  <sub>© 2026 Atambek · built with WebGL · Crafted with <code>npm run dev</code></sub>
</div>
