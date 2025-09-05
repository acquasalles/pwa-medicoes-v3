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
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgVml0ZVBXQSh7XG4gICAgICBzdHJhdGVnaWVzOiAnaW5qZWN0TWFuaWZlc3QnLFxuICAgICAgaW5qZWN0UmVnaXN0ZXI6IG51bGwsXG4gICAgICBpbmplY3RNYW5pZmVzdDoge1xuICAgICAgICBpbmplY3Rpb25Qb2ludDogdW5kZWZpbmVkXG4gICAgICB9LFxuICAgICAgZGV2T3B0aW9uczoge1xuICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICB9LFxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnBuZycsICdicm93c2VyY29uZmlnLnhtbCddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ1Npc3RlbWEgZGUgTWVkaVx1MDBFN1x1MDBGNWVzJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ01lZGlcdTAwRTdcdTAwRjVlcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUFdBIHBhcmEgY2FkYXN0cm8gZGUgbWVkaVx1MDBFN1x1MDBGNWVzIGNvbSBmdW5jaW9uYWxpZGFkZSBvZmZsaW5lJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMjAzQjhDJyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNCNkYyRUMnLFxuICAgICAgICBkaXNwbGF5OiAnZnVsbHNjcmVlbicsXG4gICAgICAgIGRpc3BsYXlfb3ZlcnJpZGU6IFsnd2luZG93LWNvbnRyb2xzLW92ZXJsYXknLCAnbWluaW1hbC11aSddLFxuICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyxcbiAgICAgICAgc2NvcGU6ICcvJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgIGlkOiAnLycsXG4gICAgICAgIGxhbmc6ICdwdC1CUicsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnc3ZnLWljb24tYW55LnN2ZycsXG4gICAgICAgICAgICBzaXplczogJ2FueScsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2Uvc3ZnK3htbCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ3N2Zy1pY29uLWFueS5zdmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICdhbnknLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ3N2Zy1pY29uLWFueS5zdmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICdhbnknLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ3N2Zy1pY29uLWFueS5zdmcnLFxuICAgICAgICAgICAgc2l6ZXM6ICdhbnknLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnLFxuICAgICAgICAgICAgcHVycG9zZTogJ21hc2thYmxlJ1xuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgY2F0ZWdvcmllczogWydwcm9kdWN0aXZpdHknLCAndXRpbGl0aWVzJ10sXG4gICAgICAgIHNob3J0Y3V0czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdOb3ZhIE1lZGlcdTAwRTdcdTAwRTNvJyxcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdNZWRpXHUwMEU3XHUwMEUzbycsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0NhZGFzdHJhciBub3ZhIG1lZGlcdTAwRTdcdTAwRTNvJyxcbiAgICAgICAgICAgIHVybDogJy9tZWRpY29lcycsXG4gICAgICAgICAgICBpY29uczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3JjOiAnc3ZnLWljb24tYW55LnN2ZycsXG4gICAgICAgICAgICAgICAgc2l6ZXM6ICdhbnknXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdTZWxlXHUwMEU3XHUwMEUzbycsXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnU2VsZVx1MDBFN1x1MDBFM28nLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTZWxlY2lvbmFyIGxvY2FsJyxcbiAgICAgICAgICAgIHVybDogJy9zZWxlY2FvJyxcbiAgICAgICAgICAgIGljb25zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBzcmM6ICdzdmctaWNvbi1hbnkuc3ZnJyxcbiAgICAgICAgICAgICAgICBzaXplczogJ2FueSdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0pXG4gIF0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osZ0JBQWdCO0FBQUEsTUFDaEIsZ0JBQWdCO0FBQUEsUUFDZCxnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLGVBQWUsQ0FBQyxlQUFlLHdCQUF3QixtQkFBbUI7QUFBQSxNQUMxRSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxrQkFBa0IsQ0FBQywyQkFBMkIsWUFBWTtBQUFBLFFBQzFELGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLElBQUk7QUFBQSxRQUNKLE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLFlBQVksQ0FBQyxnQkFBZ0IsV0FBVztBQUFBLFFBQ3hDLFdBQVc7QUFBQSxVQUNUO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsY0FDTDtBQUFBLGdCQUNFLEtBQUs7QUFBQSxnQkFDTCxPQUFPO0FBQUEsY0FDVDtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sWUFBWTtBQUFBLFlBQ1osYUFBYTtBQUFBLFlBQ2IsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLGNBQ0w7QUFBQSxnQkFDRSxLQUFLO0FBQUEsZ0JBQ0wsT0FBTztBQUFBLGNBQ1Q7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
