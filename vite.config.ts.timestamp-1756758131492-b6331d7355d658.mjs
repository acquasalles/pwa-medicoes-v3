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
        display: "fullscreen",
        display_override: ["window-controls-overlay", "minimal-ui"],
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        id: "/",
        lang: "pt-BR",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png"
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
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
                src: "pwa-192x192.png",
                sizes: "192x192"
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
                src: "pwa-192x192.png",
                sizes: "192x192"
              }
            ]
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICBzdHJhdGVnaWVzOiAnaW5qZWN0TWFuaWZlc3QnLFxuICAgICAgaW5qZWN0UmVnaXN0ZXI6IG51bGwsXG4gICAgICBpbmplY3RNYW5pZmVzdDoge1xuICAgICAgICBpbmplY3Rpb25Qb2ludDogdW5kZWZpbmVkXG4gICAgICB9LFxuICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICB9LFxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnBuZycsICdicm93c2VyY29uZmlnLnhtbCddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ1Npc3RlbWEgZGUgTWVkaVx1MDBFN1x1MDBGNWVzJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ01lZGlcdTAwRTdcdTAwRjVlcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUFdBIHBhcmEgY2FkYXN0cm8gZGUgbWVkaVx1MDBFN1x1MDBGNWVzIGNvbSBmdW5jaW9uYWxpZGFkZSBvZmZsaW5lJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMjAzQjhDJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNCNkYyRUMnLFxuICAgICAgICBkaXNwbGF5OiAnZnVsbHNjcmVlbicsXG4gICAgICAgIGRpc3BsYXlfb3ZlcnJpZGU6IFsnd2luZG93LWNvbnRyb2xzLW92ZXJsYXknLCAnbWluaW1hbC11aSddLFxuICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyxcbiAgICAgICAgc2NvcGU6ICcvJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgIGlkOiAnLycsXG4gICAgICAgIGxhbmc6ICdwdC1CUicsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAncHdhLTY0eDY0LnBuZycsXG4gICAgICAgICAgICBzaXplczogJzY0eDY0JyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdwd2EtMTkyeDE5Mi5wbmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ3B3YS01MTJ4NTEyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55J1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnbWFza2FibGUtaWNvbi01MTJ4NTEyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBjYXRlZ29yaWVzOiBbJ3Byb2R1Y3Rpdml0eScsICd1dGlsaXRpZXMnXSxcbiAgICAgICAgc2hvcnRjdXRzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ05vdmEgTWVkaVx1MDBFN1x1MDBFM28nLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ01lZGlcdTAwRTdcdTAwRTNvJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ2FkYXN0cmFyIG5vdmEgbWVkaVx1MDBFN1x1MDBFM28nLFxuICAgICAgICAgICAgdXJsOiAnL21lZGljb2VzJyxcbiAgICAgICAgICAgIGljb25zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6ICdwd2EtMTkyeDE5Mi5wbmcnLFxuICAgICAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MidcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1NlbGVcdTAwRTdcdTAwRTNvJyxcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdTZWxlXHUwMEU3XHUwMEUzbycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlbGVjaW9uYXIgbG9jYWwnLFxuICAgICAgICAgICAgdXJsOiAnL3NlbGVjYW8nLFxuICAgICAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNyYzogJ3B3YS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixnQkFBZ0I7QUFBQSxNQUNoQixnQkFBZ0I7QUFBQSxRQUNkLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsZUFBZSxDQUFDLGVBQWUsd0JBQXdCLG1CQUFtQjtBQUFBLE1BQzFFLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULGtCQUFrQixDQUFDLDJCQUEyQixZQUFZO0FBQUEsUUFDMUQsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsSUFBSTtBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLFFBQ0EsWUFBWSxDQUFDLGdCQUFnQixXQUFXO0FBQUEsUUFDeEMsV0FBVztBQUFBLFVBQ1Q7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFlBQVk7QUFBQSxZQUNaLGFBQWE7QUFBQSxZQUNiLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxjQUNMO0FBQUEsZ0JBQ0UsS0FBSztBQUFBLGdCQUNMLE9BQU87QUFBQSxjQUNUO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsY0FDTDtBQUFBLGdCQUNFLEtBQUs7QUFBQSxnQkFDTCxPQUFPO0FBQUEsY0FDVDtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLEVBQzFCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
