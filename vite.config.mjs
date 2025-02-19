import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
// import reactRefresh from '@vitejs/plugin-react-refresh'
// import browserslistToEsbuild from 'browserslist-to-esbuild'
// import commonjs from 'vite-plugin-commonjs';
// import svgr from 'vite-plugin-svgr';

import path from 'path'

export default defineConfig({
    // depending on your application, base can also be "/"
    base: './',
    publicDir: 'public',
    plugins: [
        react({
            jsxImportSource: '@emotion/react',
            babel: {
                plugins: ['@emotion/babel-plugin'],
            },
        }),
        viteTsconfigPaths(),
        // reactRefresh(),
        // commonjs(),
        // svgr(),
    ],
    build: {
        // --> ["chrome79", "edge92", "firefox91", "safari13.1"]
        // target: browserslistToEsbuild(),
        outDir: 'build',
    },
    resolve: {
        alias: {
            helpers: path.resolve(__dirname, './src/helpers'),
            components: path.resolve(__dirname, './src/components'),
            public: path.resolve(__dirname, './public'),
        },
    },
    server: {
        // this ensures that the browser opens upon server start
        open: false,
        // this sets a default port to 3000  
        port: 3000,
        hmr: {
            overlay: true,
        },
    },
    optimizeDeps: {
        force: false,
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        css: true,
        reporters: ['verbose'],
        coverage: {
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*'],
            exclude: [],
        }
    },
})
