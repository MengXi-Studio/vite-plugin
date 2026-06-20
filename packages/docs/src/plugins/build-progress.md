# buildProgress

在 Vite 构建过程中实时显示终端构建进度条，支持 bar、spinner、minimal 三种显示格式，支持自定义颜色主题和进度条外观。

## 导入

```typescript
import { buildProgress } from '@meng-xi/vite-plugin'
// 或子模块导入
import { buildProgress } from '@meng-xi/vite-plugin/plugins/build-progress'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { buildProgress } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [buildProgress()]
})
```

## 配置选项

| 选项            | 类型                          | 默认值  | 说明                     |
| --------------- | ----------------------------- | ------- | ------------------------ |
| format          | `ProgressFormat`              | `'bar'` | 进度条显示格式           |
| width           | `number`                      | `30`    | 进度条宽度（字符数）     |
| clearOnComplete | `boolean`                     | `true`  | 构建完成后是否清除进度条 |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### 高级选项

| 选项           | 类型             | 默认值 | 说明                     |
| -------------- | ---------------- | ------ | ------------------------ |
| completeChar   | `string`         | `'█'`  | 已完成部分的填充字符     |
| incompleteChar | `string`         | `'░'`  | 未完成部分的填充字符     |
| showModuleName | `boolean`        | `true` | 是否显示当前处理模块名称 |
| theme          | `ProgressTheme`  | -      | 自定义颜色主题           |

### 显示格式

| 格式    | 说明                                                               |
| ------- | ------------------------------------------------------------------ |
| bar     | 完整进度条模式，显示旋转动画 + 阶段标签 + 进度条 + 百分比 + 模块名 |
| spinner | 旋转动画模式，显示旋转动画 + 阶段标签 + 百分比                     |
| minimal | 精简模式，仅显示阶段标签 + 百分比                                  |

### 构建阶段

插件根据以下阶段计算总体进度：

| 阶段      | 进度范围 | 说明               |
| --------- | -------- | ------------------ |
| config    | 5%       | 读取配置阶段       |
| resolve   | 10%      | 解析模块依赖阶段   |
| transform | 15%-85%  | 转换模块阶段       |
| bundle    | +10%     | 打包阶段（仅生产） |
| write     | +5%      | 写入文件阶段       |
| done      | 100%     | 构建完成           |

## 类型导出

### ProgressTheme

自定义进度条各部分的颜色渲染函数。

```typescript
interface ProgressTheme {
  completeColor: (text: string) => string    // 已完成部分颜色
  incompleteColor: (text: string) => string  // 未完成部分颜色
  percentageColor: (text: string) => string  // 百分比数字颜色
  phaseColor: (text: string) => string       // 阶段标签颜色
  moduleColor: (text: string) => string      // 模块名称颜色
}
```

每个属性是一个接受纯文本字符串并返回带 ANSI 转义码着色字符串的函数。未提供的属性将使用默认主题。

### BuildPhase

构建阶段类型。

```typescript
type BuildPhase = 'idle' | 'config' | 'resolve' | 'transform' | 'bundle' | 'write' | 'done'
```

## 示例

### 精简格式

```typescript
buildProgress({ format: 'minimal' })
// 输出: 转换模块 45%
```

### 旋转动画格式

```typescript
buildProgress({ format: 'spinner' })
// 输出: ⠋ 转换模块 45%
```

### 自定义进度条外观

```typescript
buildProgress({
  width: 40,
  completeChar: '■',
  incompleteChar: '□',
  clearOnComplete: false
})
// 输出: ⠋ 转换模块 ■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□ 45%
```

### 自定义颜色主题

```typescript
buildProgress({
  theme: {
    completeColor: t => `\x1b[32m${t}\x1b[39m`,   // 绿色
    incompleteColor: t => `\x1b[90m${t}\x1b[39m`,  // 灰色
    percentageColor: t => `\x1b[1m${t}\x1b[22m`,   // 粗体
    phaseColor: t => `\x1b[36m${t}\x1b[39m`,       // 青色
    moduleColor: t => `\x1b[90m${t}\x1b[39m`       // 灰色
  }
})
```

### 禁用模块名显示

```typescript
buildProgress({ showModuleName: false })
```

## 注意事项

- 在非 TTY 终端环境下（如 CI/CD 流水线），自动降级为日志输出模式
- Windows 终端使用 ASCII 字符动画，其他平台使用 Unicode Braille 字符动画
- 插件通过 `enabled` 选项完全控制启用/禁用，禁用时零性能开销
- 开发模式下在服务器就绪后自动完成进度显示，生产模式下在 `closeBundle` 时完成
