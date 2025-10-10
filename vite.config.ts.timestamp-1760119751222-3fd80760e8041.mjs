// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0")
  },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgZGVmaW5lOiB7XG4gICAgX19BUFBfVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5ucG1fcGFja2FnZV92ZXJzaW9uIHx8ICcxLjAuMCcpLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHN0cmF0ZWdpZXM6ICdpbmplY3RNYW5pZmVzdCcsXG4gICAgICBpbmplY3RSZWdpc3RlcjogbnVsbCxcbiAgICAgIGluamVjdE1hbmlmZXN0OiB7XG4gICAgICAgIGluamVjdGlvblBvaW50OiB1bmRlZmluZWRcbiAgICAgIH0sXG4gICAgICBkZXZPcHRpb25zOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWVcbiAgICAgIH0sXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJywgJ2Jyb3dzZXJjb25maWcueG1sJ10sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnU2lzdGVtYSBkZSBNZWRpXHUwMEU3XHUwMEY1ZXMnLFxuICAgICAgICBzaG9ydF9uYW1lOiAnTWVkaVx1MDBFN1x1MDBGNWVzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdQV0EgcGFyYSBjYWRhc3RybyBkZSBtZWRpXHUwMEU3XHUwMEY1ZXMgY29tIGZ1bmNpb25hbGlkYWRlIG9mZmxpbmUnLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyMyMDNCOEMnLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI0I2RjJFQycsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgZGlzcGxheV9vdmVycmlkZTogWyd3aW5kb3ctY29udHJvbHMtb3ZlcmxheScsICdtaW5pbWFsLXVpJywgJ2Z1bGxzY3JlZW4nXSxcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXG4gICAgICAgIHNjb3BlOiAnLycsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBpZDogJy8nLFxuICAgICAgICBsYW5nOiAncHQtQlInLFxuICAgICAgICBwcmVmZXJfcmVsYXRlZF9hcHBsaWNhdGlvbnM6IGZhbHNlLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ3N2Zy1pY29uLWFueS5zdmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICdhbnknLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdzdmctaWNvbi1hbnkuc3ZnJyxcbiAgICAgICAgICAgIHNpemVzOiAnYW55JyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9zdmcreG1sJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdzdmctaWNvbi1hbnkuc3ZnJyxcbiAgICAgICAgICAgIHNpemVzOiAnYW55JyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9zdmcreG1sJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnknXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdzdmctaWNvbi1hbnkuc3ZnJyxcbiAgICAgICAgICAgIHNpemVzOiAnYW55JyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9zdmcreG1sJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdtYXNrYWJsZSdcbiAgICAgICAgICB9XG4gICAgICAgIF0sXG4gICAgICAgIGNhdGVnb3JpZXM6IFsncHJvZHVjdGl2aXR5JywgJ3V0aWxpdGllcyddLFxuICAgICAgICBzaG9ydGN1dHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnTm92YSBNZWRpXHUwMEU3XHUwMEUzbycsXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnTWVkaVx1MDBFN1x1MDBFM28nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDYWRhc3RyYXIgbm92YSBtZWRpXHUwMEU3XHUwMEUzbycsXG4gICAgICAgICAgICB1cmw6ICcvbWVkaWNvZXMnLFxuICAgICAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNyYzogJ3N2Zy1pY29uLWFueS5zdmcnLFxuICAgICAgICAgICAgICAgIHNpemVzOiAnYW55J1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiAnU2VsZVx1MDBFN1x1MDBFM28nLFxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ1NlbGVcdTAwRTdcdTAwRTNvJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2VsZWNpb25hciBsb2NhbCcsXG4gICAgICAgICAgICB1cmw6ICcvc2VsZWNhbycsXG4gICAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3JjOiAnc3ZnLWljb24tYW55LnN2ZycsXG4gICAgICAgICAgICAgICAgc2l6ZXM6ICdhbnknXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9KVxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICAvLyBDb25maWd1cmFyIGZhbGxiYWNrIHBhcmEgU1BBIHJvdXRpbmcgZHVyYW50ZSBkZXNlbnZvbHZpbWVudG9cbiAgICBoaXN0b3J5QXBpRmFsbGJhY2s6IHRydWUsXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04saUJBQWlCLEtBQUssVUFBVSxRQUFRLElBQUksdUJBQXVCLE9BQU87QUFBQSxFQUM1RTtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osZ0JBQWdCO0FBQUEsTUFDaEIsZ0JBQWdCO0FBQUEsUUFDZCxnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLGVBQWUsQ0FBQyxlQUFlLHdCQUF3QixtQkFBbUI7QUFBQSxNQUMxRSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxrQkFBa0IsQ0FBQywyQkFBMkIsY0FBYyxZQUFZO0FBQUEsUUFDeEUsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsSUFBSTtBQUFBLFFBQ0osTUFBTTtBQUFBLFFBQ04sNkJBQTZCO0FBQUEsUUFDN0IsT0FBTztBQUFBLFVBQ0w7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLFFBQ0EsWUFBWSxDQUFDLGdCQUFnQixXQUFXO0FBQUEsUUFDeEMsV0FBVztBQUFBLFVBQ1Q7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFlBQVk7QUFBQSxZQUNaLGFBQWE7QUFBQSxZQUNiLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxjQUNMO0FBQUEsZ0JBQ0UsS0FBSztBQUFBLGdCQUNMLE9BQU87QUFBQSxjQUNUO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsY0FDTDtBQUFBLGdCQUNFLEtBQUs7QUFBQSxnQkFDTCxPQUFPO0FBQUEsY0FDVDtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxRQUFRO0FBQUE7QUFBQSxJQUVOLG9CQUFvQjtBQUFBLEVBQ3RCO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLEVBQzFCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
