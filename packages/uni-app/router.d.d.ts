import '@meng-xi/uni-router'

declare module '@meng-xi/uni-router' {
  interface RouteNameMap {
    /** 插件功能验证 */
    pagesIndexIndex: { path: '/pages/index/index'; meta: { title: string; isTab: true } }
    /** 路由导航 */
    pagesNavigationIndex: { path: '/pages/navigation/index'; meta: { title: string } }
    /** 路由守卫 */
    pagesGuardsIndex: { path: '/pages/guards/index'; meta: { title: string } }
    /** 详情页 */
    pagesDetailIndex: { path: '/pages/detail/index'; meta: { title: string } }
    /** 受保护页面 */
    ProtectedPage: { path: '/pages/protected/index'; meta: { title: string; requireAuth: true; role: string } }
    /** 登录 */
    pagesLoginIndex: { path: '/pages/login/index'; meta: { title: string } }
    /** 路由解析 */
    pagesResolveIndex: { path: '/pages/resolve/index'; meta: { title: string } }
    /** 错误页面 */
    pagesErrorIndex: { path: '/pages/error/index'; meta: { title: string } }
    /** 关于 */
    AboutPage: { path: '/pages/about/index'; meta: { title: string; requireAuth: false; isTab: true } }
    /** 个人中心 */
    pagesSubProfileIndex: { path: '/pages-sub/profile/index'; meta: { title: string } }
    /** 设置 */
    pagesSubSettingsIndex: { path: '/pages-sub/settings/index'; meta: { title: string; requireAuth: true } }
  }
}