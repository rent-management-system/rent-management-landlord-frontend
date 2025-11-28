import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import { compression } from "vite-plugin-compression2";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@radix-ui/')) {
                return 'radix';
              }
              if (id.includes('lucide-react')) {
                return 'lucide';
              }
              return 'vendor';
            }
          },
        },
      },
      commonjsOptions: {
        include: [/node_modules/],
      },
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin']
        }
      }),
      isProduction && visualizer({
        open: true,
        filename: 'bundle-analyzer.html',
        gzipSize: true,
        brotliSize: true,
      }),
      isProduction && compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginalAssets: false,
        threshold: 1024,
        skipIfLarger: true
      } as any), // Type assertion to bypass type checking
      isProduction && compression({
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginalAssets: false,
        threshold: 1024,
        skipIfLarger: true
      } as any), // Type assertion to bypass type checking
      isProduction && VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Rent Management System',
          short_name: 'RentMgmt',
          description: 'Landlord Property Management System',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
      esbuildOptions: {
        treeShaking: true,
      },
    },
  };
});
