import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.WEATHER_API_KEY": JSON.stringify(process.env.WEATHER_API_KEY)
  }
})
