import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const projectRootDir = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRootDir, '')
  // Proxy target order:
  //   1. VITE_PROXY_TARGET in .env(.development) — explicit override
  //   2. http://127.0.0.1:5000                   — default local backend
  // The brochure / billing / etc. routes you build locally need to land here,
  // so the default is the local backend rather than a deployed one.
  // We use 127.0.0.1 instead of "localhost" because Node 18+ on Windows
  // resolves "localhost" to ::1 (IPv6) first, and Express by default only
  // listens on IPv4 — causing intermittent ECONNREFUSED → vite 500.
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000'
  const isHttps = proxyTarget.startsWith('https://')

  return {
    envPrefix: ['VITE_', 'REACT_APP_'],
    plugins: [
      react(),
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: 'all',  // Allow tunnel domains
      proxy: {
        '/api-proxy': {
          target: proxyTarget,
          changeOrigin: true,
          secure: isHttps,
          rewrite: (p) => p.replace(/^\/api-proxy/, ''),
          cookieDomainRewrite: { '*': '' },
          cookiePathRewrite: { '*': '/' },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
            proxy.on('proxyRes', (proxyRes) => {
              const sc = proxyRes.headers['set-cookie'];
              if (Array.isArray(sc)) {
                proxyRes.headers['set-cookie'] = sc.map((c) =>
                  c
                    .replace(/;\s*Secure/gi, '')
                    .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
                    .replace(/;\s*Domain=[^;]+/gi, '')
                );
              }
            });
          },
        },
        '/socket.io': {
          target: proxyTarget,
          changeOrigin: true,
          secure: isHttps,
          ws: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
            proxy.on('proxyReqWs', (proxyReq) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
            });
          },
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 900,
      // Strip console.* and debugger statements from production bundles.
      // Keep console.error/warn so genuine runtime issues still surface
      // (Sentry captures them too).
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-mui': ['@mui/material', '@emotion/react', '@emotion/styled'],
            'vendor-editor': ['react-syntax-highlighter'],
            'vendor-redux': ['react-redux', '@reduxjs/toolkit'],
            'vendor-helmet': ['react-helmet-async'],
            'vendor-icons': ['react-icons/pi', 'react-icons/tb', 'react-icons/ai', 'react-icons/bs', 'react-icons/fc', 'react-icons/fi', 'react-icons/md'],
          },
        },
      },
    },
    esbuild: {
      // Drop console.log/info/debug from prod. console.error and .warn stay.
      pure: process.env.NODE_ENV === 'production'
        ? ['console.log', 'console.info', 'console.debug', 'console.trace']
        : [],
      drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    },
    resolve: {
      alias: {
        react: path.resolve(projectRootDir, 'node_modules/react'),
        'react-dom': path.resolve(projectRootDir, 'node_modules/react-dom'),
        'react/jsx-runtime': path.resolve(
          projectRootDir,
          'node_modules/react/jsx-runtime.js'
        ),
        'react/jsx-dev-runtime': path.resolve(
          projectRootDir,
          'node_modules/react/jsx-dev-runtime.js'
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
  }
})
