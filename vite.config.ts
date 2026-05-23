import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // amazon-cognito-identity-js references `global` (a Node.js builtin) and
  // some bundlers fail without this shim in a browser-only build.
  define: {
    global: 'globalThis',
  },
})
