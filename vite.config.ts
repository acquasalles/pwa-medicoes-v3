import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      injectRegister: null,
      injectManifest: {
        injectionPoint: undefined
      },
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'browserconfig.xml'],
      manifest: {
        name: 'Sistema de Medições',
        short_name: 'Medições',
        description: 'PWA para cadastro de medições com funcionalidade offline',
        theme_color: '#203B8C',
        background_color: '#B6F2EC',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'minimal-ui', 'fullscreen'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        id: '/',
        lang: 'pt-BR',
        prefer_related_applications: false,
        icons: [
          {
            src: 'svg-icon-any.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: 'svg-icon-any.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'svg-icon-any.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'svg-icon-any.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ],
        categories: ['productivity', 'utilities'],
        shortcuts: [
          {
            name: 'Nova Medição',
            short_name: 'Medição',
            description: 'Cadastrar nova medição',
            url: '/medicoes',
            icons: [
              {
                src: 'svg-icon-any.svg',
                sizes: 'any'
              }
            ]
          },
          {
            name: 'Seleção',
            short_name: 'Seleção',
            description: 'Selecionar local',
            url: '/selecao',
            icons: [
              {
                src: 'svg-icon-any.svg',
                sizes: 'any'
              }
            ]
          }
        ]
      }
    })
  ],
  server: {
    // Configurar fallback para SPA routing durante desenvolvimento
    historyApiFallback: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});