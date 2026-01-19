# 配置参考

本页面汇总了所有插件的配置选项，方便用户查阅和参考。

## copyFile 插件配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| sourceDir | string | 必填 | 源文件目录的路径 |
| targetDir | string | 必填 | 目标文件目录的路径 |
| overwrite | boolean | true | 是否覆盖同名文件 |
| recursive | boolean | true | 是否支持递归复制 |
| enabled | boolean | true | 是否启用插件 |
| verbose | boolean | true | 是否显示详细日志 |

## injectIco 插件配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------| 
| base | string | / | 图标文件的基础路径 |
| url | string | undefined | 图标的完整 URL |
| link | string | undefined | 自定义的完整 link 标签 HTML |
| icons | array | undefined | 自定义图标数组 |
| verbose | boolean | true | 是否显示详细日志 |
| enabled | boolean | true | 是否启用插件 |
| copyOptions | object | undefined | 图标文件复制配置 |

### injectIco.copyOptions 配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| sourceDir | string | 必填 | 图标源文件目录 |
| targetDir | string | 必填 | 图标目标目录（打包目录） |
| overwrite | boolean | true | 是否覆盖同名文件 |
| recursive | boolean | true | 是否支持递归复制 |

## 插件优先级

如果同时使用多个插件，它们的执行顺序如下：

1. injectIco 插件（transformIndexHtml 钩子）
2. copyFile 插件（writeBundle 钩子）

## 最佳实践

1. **保持配置简洁**：只配置必要的选项，使用默认值处理其他选项
2. **启用日志输出**：在开发阶段启用 verbose 选项，方便调试
3. **合理使用 enabled 选项**：根据环境或条件启用/禁用插件
4. **测试构建输出**：运行构建命令，验证插件是否按照预期工作
5. **参考示例代码**：参考 playground 项目中的示例配置

## 常见问题

### Q: 插件不生效怎么办？

A: 请检查以下几点：
1. 确保插件已正确安装
2. 确保插件已在 vite.config.ts 中正确配置
3. 确保 enabled 选项为 true
4. 启用 verbose 选项，查看详细日志
5. 检查配置选项是否正确

### Q: 如何在生产环境中禁用插件？

A: 可以根据 NODE_ENV 环境变量来控制插件的启用状态：

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets',
  enabled: process.env.NODE_ENV === 'production'
})
```

### Q: 如何处理插件执行顺序？

A: 可以使用 Vite 插件的 enforce 选项来控制执行顺序，或者使用插件内置的 hooks 来控制执行时机。
