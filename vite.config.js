import { defineConfig } from 'vite';

export default defineConfig({
  // Относительные пути — билд можно открыть с любого поддомена / из папки
  base: './',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // three живёт отдельным чанком — кэшируется между релизами UI
        manualChunks: { three: ['three'] },
      },
    },
  },
  server: {
    host: true, // доступ с телефона в локальной сети: npm run dev
  },
});
