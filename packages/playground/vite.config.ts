import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [vue(), vitePlugin.injectIco()]
})
