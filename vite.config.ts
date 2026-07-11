import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
        suppressWarnings: true
      },
      manifest: {
        name: 'Logistica TMS',
        short_name: 'Logistica',
        description: 'Transportation Management System',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@processes': path.resolve(__dirname, './src/processes'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@features': path.resolve(__dirname, './src/features'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 1700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (id.includes('@react-pdf') || id.includes('pdfjs-dist')) {
            return 'vendor-react-pdf';
          }

          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'vendor-pdf-export';
          }

          if (id.includes('leaflet-routing-machine') || id.includes('leaflet')) {
            return 'vendor-maps';
          }

          if (id.includes('exceljs') || id.includes('file-saver')) {
            return 'vendor-export';
          }

          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'vendor-mui';
          }

          if (id.includes('@tanstack')) {
            return 'vendor-query';
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'vendor-react';
          }
        }
      }
    }
  }
});
