import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Enables listening on 0.0.0.0 so devices on local Wi-Fi can access
    port: 5173
  }
});
