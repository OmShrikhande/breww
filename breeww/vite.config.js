import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/player/api'),
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        activity: resolve(rootDir, 'activity/index.html'),
        promotion: resolve(rootDir, 'promotion/index.html'),
        account: resolve(rootDir, 'account/index.html'),
        wallet: resolve(rootDir, 'wallet/index.html'),
        inviteWheel: resolve(rootDir, 'invite-wheel/index.html'),
        notifications: resolve(rootDir, 'notifications/index.html'),
        login: resolve(rootDir, 'login/index.html'),
        register: resolve(rootDir, 'register/index.html'),
        aviator: resolve(rootDir, 'game/aviator/index.html'),
        colorPrediction: resolve(rootDir, 'game/color-prediction/index.html'),
        mines: resolve(rootDir, 'game/mines/index.html'),
        spinWheel: resolve(rootDir, 'game/spin-wheel/index.html'),
        dice: resolve(rootDir, 'game/dice/index.html'),
        dragonTiger: resolve(rootDir, 'game/dragon-tiger/index.html'),
        plinko: resolve(rootDir, 'game/plinko/index.html'),
        poker: resolve(rootDir, 'game/poker/index.html'),
        chamberRisk: resolve(rootDir, 'game/chamber-risk/index.html'),
        roulette: resolve(rootDir, 'game/roulette/index.html'),
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-physics': ['matter-js'],
        },
      },
    },
  },
})
