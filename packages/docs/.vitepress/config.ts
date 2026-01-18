import { defineConfig } from 'vitepress'

export default defineConfig({
  // 网站标题和描述
  title: 'Vite 自定义插件',
  description: '一个为 Vite 提供的自定义插件集合',
  
  // 配置多语言
  locales: {
    // 中文（默认语言）
    '/zh-CN/': {
      lang: 'zh-CN',
      title: 'Vite 自定义插件',
      description: '一个为 Vite 提供的自定义插件集合'
    },
    // 英文
    '/en-US/': {
      lang: 'en-US',
      title: 'Vite Custom Plugins',
      description: 'A collection of custom plugins for Vite'
    }
  },
  
  // 默认语言
  defaultLocale: 'zh-CN',
  
  // 主题配置
  themeConfig: {
    // 多语言导航栏和侧边栏
    locales: {
      '/zh-CN/': {
        // 中文导航栏
        nav: [
          { text: '指南', link: '/zh-CN/guide/quick-start' },
          { text: '插件', link: '/zh-CN/plugins/copyFile' },
          { text: '配置参考', link: '/zh-CN/config/' },
          { text: 'GitHub', link: 'https://github.com/MengXi-Studio/vite-plugin' }
        ],
        // 中文侧边栏
        sidebar: {
          '/zh-CN/guide/': [
            { text: '快速开始', link: '/zh-CN/guide/quick-start' }
          ],
          '/zh-CN/plugins/': [
            { text: 'copyFile 插件', link: '/zh-CN/plugins/copyFile' },
            { text: 'injectIco 插件', link: '/zh-CN/plugins/injectIco' }
          ],
          '/zh-CN/config/': [
            { text: '配置参考', link: '/zh-CN/config/' }
          ]
        }
      },
      '/en-US/': {
        // 英文导航栏
        nav: [
          { text: 'Guide', link: '/en-US/guide/quick-start' },
          { text: 'Plugins', link: '/en-US/plugins/copyFile' },
          { text: 'Config Reference', link: '/en-US/config/' },
          { text: 'GitHub', link: 'https://github.com/MengXi-Studio/vite-plugin' }
        ],
        // 英文侧边栏
        sidebar: {
          '/en-US/guide/': [
            { text: 'Quick Start', link: '/en-US/guide/quick-start' }
          ],
          '/en-US/plugins/': [
            { text: 'copyFile Plugin', link: '/en-US/plugins/copyFile' },
            { text: 'injectIco Plugin', link: '/en-US/plugins/injectIco' }
          ],
          '/en-US/config/': [
            { text: 'Config Reference', link: '/en-US/config/' }
          ]
        }
      }
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/MengXi-Studio/vite-plugin' }
    ]
  }
})
