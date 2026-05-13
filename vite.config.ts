import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  base: '/cookbook-page/', // 必须与仓库名完全一致
  plugins: [
    uni()
  ],
  server: {
    host: '0.0.0.0',
    port: 5174
  }
})
