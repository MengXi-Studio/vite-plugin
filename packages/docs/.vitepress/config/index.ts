import { defineConfig } from 'vitepress'
import { sharedConfig } from './shared'
import { zhConfig } from './zh'
import { enConfig } from './en'

export default defineConfig({
	...sharedConfig,

	/** 网站默认语言 */
	lang: 'zh-CN',

	/** 网站部署基础路径 */
	base: '/vite-plugin/',

	/** 文档源目录 */
	srcDir: './src',

	/** 网站支持的语言 */
	locales: {
		zh: { label: '简体中文', lang: 'zh-CN', link: '/zh-CN/', ...zhConfig },
		en: { label: 'English', lang: 'en-US', link: '/en-US/', ...enConfig }
	}
})
