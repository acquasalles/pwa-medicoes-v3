// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      injectRegister: null,
      injectManifest: {
        injectionPoint: void 0
      },
      devOptions: {
        enabled: true
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "browserconfig.xml"],
      manifest: {
        name: "Sistema de Medi\xE7\xF5es",
        short_name: "Medi\xE7\xF5es",
        description: "PWA para cadastro de medi\xE7\xF5es com funcionalidade offline",
        theme_color: "#203B8C",
        background_color: "#B6F2EC",
        display: "standalone",
        display_override: ["window-controls-overlay", "minimal-ui", "fullscreen"],
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        id: "/",
        lang: "pt-BR",
        prefer_related_applications: false,
        icons: [
          {
            src: "svg-icon-any.svg",
            sizes: "any",
            type: "image/svg+xml"
          },
          {
            src: "svg-icon-any.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "svg-icon-any.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "svg-icon-any.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable"
          }
        ],
        categories: ["productivity", "utilities"],
        shortcuts: [
          {
            name: "Nova Medi\xE7\xE3o",
            short_name: "Medi\xE7\xE3o",
            description: "Cadastrar nova medi\xE7\xE3o",
            url: "/medicoes",
            icons: [
              {
                src: "svg-icon-any.svg",
                sizes: "any"
              }
            ]
          },
          {
            name: "Sele\xE7\xE3o",
            short_name: "Sele\xE7\xE3o",
            description: "Selecionar local",
            url: "/selecao",
            icons: [
              {
                src: "svg-icon-any.svg",
                sizes: "any"
              }
            ]
          }
        ]
      }
    })
  ],
  server: {
    // Configurar fallback para SPA routing durante desenvolvimento
    historyApiFallback: true
  },
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICBzdHJhdGVnaWVzOiAnaW5qZWN0TWFuaWZlc3QnLFxuICAgICAgaW5qZWN0UmVnaXN0ZXI6IG51bGwsXG4gICAgICBpbmplY3RNYW5pZmVzdDoge1xuICAgICAgICBpbmplY3Rpb25Qb2ludDogdW5kZWZpbmVkXG4gICAgICB9LFxuICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICB9LFxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnBuZycsICdicm93c2VyY29uZmlnLnhtbCddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ1Npc3RlbWEgZGUgTWVkaVx1MDBFN1x1MDBGNWVzJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ01lZGlcdTAwRTdcdTAwRjVlcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUFdBIHBhcmEgY2FkYXN0cm8gZGUgbWVkaVx1MDBFN1x1MDBGNWVzIGNvbSBmdW5jaW9uYWxpZGFkZSBvZmZsaW5lJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMjAzQjhDJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNCNkYyRUMnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIGRpc3BsYXlfb3ZlcnJpZGU6IFsnd2luZG93LWNvbnRyb2xzLW92ZXJsYXknLCAnbWluaW1hbC11aScsICdmdWxsc2NyZWVuJ10sXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxuICAgICAgICBzY29wZTogJy8nLFxuICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgaWQ6ICcvJyxcbiAgICAgICAgbGFuZzogJ3B0LUJSJyxcbiAgICAgICAgcHJlZmVyX3JlbGF0ZWRfYXBwbGljYXRpb25zOiBmYWxzZSxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdzdmctaWNvbi1hbnkuc3ZnJyxcbiAgICAgICAgICAgIHNpemVzOiAnYW55JyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9zdmcreG1sJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnc3ZnLWljb24tYW55LnN2ZycsXG4gICAgICAgICAgICBzaXplczogJ2FueScsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnc3ZnLWljb24tYW55LnN2ZycsXG4gICAgICAgICAgICBzaXplczogJ2FueScsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55J1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnc3ZnLWljb24tYW55LnN2ZycsXG4gICAgICAgICAgICBzaXplczogJ2FueScsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBjYXRlZ29yaWVzOiBbJ3Byb2R1Y3Rpdml0eScsICd1dGlsaXRpZXMnXSxcbiAgICAgICAgc2hvcnRjdXRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ05vdmEgTWVkaVx1MDBFN1x1MDBFM28nLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ01lZGlcdTAwRTdcdTAwRTNvJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ2FkYXN0cmFyIG5vdmEgbWVkaVx1MDBFN1x1MDBFM28nLFxuICAgICAgICAgICAgdXJsOiAnL21lZGljb2VzJyxcbiAgICAgICAgICAgIGljb25zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6ICdzdmctaWNvbi1hbnkuc3ZnJyxcbiAgICAgICAgICAgICAgICBzaXplczogJ2FueSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1NlbGVcdTAwRTdcdTAwRTNvJyxcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdTZWxlXHUwMEU3XHUwMEUzbycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlbGVjaW9uYXIgbG9jYWwnLFxuICAgICAgICAgICAgdXJsOiAnL3NlbGVjYW8nLFxuICAgICAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNyYzogJ3N2Zy1pY29uLWFueS5zdmcnLFxuICAgICAgICAgICAgICAgIHNpemVzOiAnYW55J1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgc2VydmVyOiB7XG4gICAgLy8gQ29uZmlndXJhciBmYWxsYmFjayBwYXJhIFNQQSByb3V0aW5nIGR1cmFudGUgZGVzZW52b2x2aW1lbnRvXG4gICAgaGlzdG9yeUFwaUZhbGxiYWNrOiB0cnVlLFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBRXhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLFlBQVk7QUFBQSxNQUNaLGdCQUFnQjtBQUFBLE1BQ2hCLGdCQUFnQjtBQUFBLFFBQ2QsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxNQUNBLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxlQUFlLENBQUMsZUFBZSx3QkFBd0IsbUJBQW1CO0FBQUEsTUFDMUUsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsU0FBUztBQUFBLFFBQ1Qsa0JBQWtCLENBQUMsMkJBQTJCLGNBQWMsWUFBWTtBQUFBLFFBQ3hFLGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLDZCQUE2QjtBQUFBLFFBQzdCLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLFlBQVksQ0FBQyxnQkFBZ0IsV0FBVztBQUFBLFFBQ3hDLFdBQVc7QUFBQSxVQUNUO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsY0FDTDtBQUFBLGdCQUNFLEtBQUs7QUFBQSxnQkFDTCxPQUFPO0FBQUEsY0FDVDtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sWUFBWTtBQUFBLFlBQ1osYUFBYTtBQUFBLFlBQ2IsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLGNBQ0w7QUFBQSxnQkFDRSxLQUFLO0FBQUEsZ0JBQ0wsT0FBTztBQUFBLGNBQ1Q7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBO0FBQUEsSUFFTixvQkFBb0I7QUFBQSxFQUN0QjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
