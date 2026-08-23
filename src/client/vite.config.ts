import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwind(), mockDevServerPlugin()],
    publicDir: '../../public',
    build: {
        outDir: '../../dist/client',
        sourcemap: true,
        rolldownOptions: {
            input: {
                index: resolve(import.meta.dirname, 'index.html'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name][extname]',
                sourcemapFileNames: '[name].js.map',
            },
        },
    },
    resolve: {
        alias: {
            '@devvit/web/client': resolve(
                import.meta.dirname,
                './mock/devvit-web.mock.js'
            ),
        },
    },
    server: {
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:7575',
                changeOrigin: true,
            },
        },
    },
});
