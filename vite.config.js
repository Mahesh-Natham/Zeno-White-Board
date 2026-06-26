import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],

  // ─── Path Aliases ────────────────────────────────────────────────────────
  // Eliminates ../../../../ relative import hell throughout the codebase.
  // Usage: import Foo from '@/components/Foo'
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages':      resolve(__dirname, 'src/pages'),
      '@store':      resolve(__dirname, 'src/store'),
      '@hooks':      resolve(__dirname, 'src/hooks'),
      '@services':   resolve(__dirname, 'src/services'),
      '@utils':      resolve(__dirname, 'src/utils'),
      '@config':     resolve(__dirname, 'src/config'),
    },
  },

  // ─── Dev Server ──────────────────────────────────────────────────────────
  server: {
    port: 5173,
    strictPort: true,         // Fail clearly if port is taken instead of silently moving
    open: false,
    hmr: {
      overlay: true,          // Show runtime errors as overlay in the browser
    },
  },

  // ─── Build Optimizations ─────────────────────────────────────────────────
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',  // Sourcemaps only in dev builds
    minify: 'esbuild',
    target: 'es2020',

    // ── Chunk Splitting Strategy ──────────────────────────────────────────
    // Without this, the entire app ships as one 1.6 MB bundle.
    // With splitting, the initial load is only the app shell + React.
    // Heavy libraries (Firebase, Konva, framer-motion) load in parallel.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/')) return 'vendor-react';
            if (id.includes('firebase/')) return 'vendor-firebase';
            if (id.includes('konva/') || id.includes('react-konva')) return 'vendor-konva';
            if (id.includes('framer-motion/')) return 'vendor-motion';
            if (id.includes('lucide-react/') || id.includes('react-hot-toast/') || id.includes('clsx/') || id.includes('tailwind-merge/')) return 'vendor-ui';
            if (id.includes('react-hook-form/') || id.includes('@hookform/') || id.includes('zod/')) return 'vendor-forms';
            if (id.includes('date-fns/')) return 'vendor-date';
            if (id.includes('zustand/')) return 'vendor-state';
          }
        },
        // Consistent file naming for long-term caching
        chunkFileNames:  'assets/[name]-[hash].js',
        entryFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash].[ext]',
      },
    },

    // Warn when any individual chunk exceeds 500kB (down from Vite's 1MB default)
    chunkSizeWarningLimit: 500,

    // Ensure CSS is also code-split per chunk
    cssCodeSplit: true,
  },

  // ─── Preview Server (vite preview) ───────────────────────────────────────
  preview: {
    port: 4173,
    strictPort: true,
  },
}));
