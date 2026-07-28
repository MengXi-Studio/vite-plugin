# AutoImport 插件重构计划

## Context

当前 `autoImport` 插件功能不够完善，与主流的 `unplugin-auto-import` 相比存在诸多不足：
- 无预设(presets)系统，用户必须手动列出每个导入项
- 无别名导入、类型导入支持
- 无 ESLint/Biome 配置生成
- 无缓存机制，构建性能不佳
- 目录扫描不支持 glob、文件模式过滤
- 无 `@unimport-disable` 注释支持
- 无 Vite optimizeDeps 集成
- 无 resolver 支持

本次重构参考 `unplugin-auto-import` 的 API 设计，在保持项目 BasePlugin 框架兼容性的前提下，大幅增强功能和使用便捷性。

## 重构范围

### 文件结构变化

```
autoImport/                          # 重构前
  ├── index.ts
  ├── types.ts
  └── helpers/
      ├── index.ts
      ├── transform.ts
      ├── scanner.ts
      └── dts.ts

autoImport/                          # 重构后
  ├── index.ts                      # 重构：增强 initialize/transformCode，增加 Vite 钩子
  ├── types.ts                      # 重构：扩展类型定义，增加新配置项
  └── helpers/
      ├── index.ts                  # 更新导出
      ├── resolver.ts               # 新增：统一导入解析引擎（从 scanner.ts 拆分）
      ├── presets.ts                # 新增：内置预设注册表（vue/vue-router/pinia 等）
      ├── scanner.ts                # 重构：增强 glob/filePatterns/types 支持
      ├── transform.ts              # 重构：增加别名/类型导入/注释禁用/指令检测
      ├── dts.ts                    # 重构：增加 append/overwrite 模式、ignoreDts
      ├── cache.ts                  # 新增：缓存机制
      ├── lint.ts                   # 新增：ESLint/Biome 配置生成
      └── compat.ts                 # 新增：旧配置兼容转换
```

### 关键文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `types.ts` | 重构 | 新增 ImportInline、PresetDefinition、DirConfig、DtsConfig、EslintrcConfig 等类型 |
| `index.ts` | 重构 | 重写 initialize/transformCode/generateDts，增加 configResolved 中的 optimizeDeps 集成 |
| `helpers/resolver.ts` | 新增 | 统一解析引擎：预设→ImportInline、Record→ImportInline、类型导入、通配符、旧格式兼容 |
| `helpers/presets.ts` | 新增 | BUILTIN_PRESETS 注册表（vue/vue-router/pinia/vue-demi/vue-i18n/rxjs） |
| `helpers/scanner.ts` | 重构 | 增强 glob 展开、filePatterns 过滤、types 标记、defaultExportByFilename |
| `helpers/transform.ts` | 重构 | 增加别名导入、类型导入、@unimport-disable 注释、Vue 指令检测 |
| `helpers/dts.ts` | 重构 | 增加 append/overwrite 模式、ignoreDts 过滤、类型导入声明 |
| `helpers/cache.ts` | 新增 | AutoImportCache 类，基于 mtimeMs 的文件缓存 |
| `helpers/lint.ts` | 新增 | generateEslintrc、generateBiomelintrc |
| `helpers/compat.ts` | 新增 | migrateLegacyOptions、ResolvedImport↔ImportInline 桥接 |

## 实现步骤

### Step 1: 扩展类型定义 (`types.ts`)

1. 新增核心类型 `ImportInline`（含 name/from/as/type/isDefault/meta 字段）
2. 新增预设类型 `PresetDefinition`、`PackagePresetOptions`
3. 新增目录扫描增强类型 `DirConfig`、`DirConfigObject`、`DirsScanOptions`
4. 新增 DTS 增强类型 `DtsConfigObject`，联合类型 `DtsConfig`
5. 新增 lint 配置类型 `EslintrcConfig`、`BiomelintrcConfig`
6. 新增 `Resolver` 接口、`VueDirectivesConfig`、`CacheConfig`
7. 新增 imports 联合类型 `ImportsConfig`、`InlineImportConfig`
8. 更新 `AutoImportOptions`，新增所有新配置字段
9. 保留旧类型 `ResolvedImport`、`ImportMapping`，标记 `@deprecated`

### Step 2: 创建兼容模块 (`helpers/compat.ts`)

1. 实现 `migrateLegacyOptions`：旧配置自动转换（imports Record→数组、fileFilter→include）
2. 实现 `resolvedImportToInline`：ResolvedImport → ImportInline 桥接
3. 实现 `inlineToResolvedImport`：ImportInline → ResolvedImport 桥接（反向兼容）

### Step 3: 创建预设系统 (`helpers/presets.ts`)

1. 实现 `BUILTIN_PRESETS` 注册表，内置以下预设：
   - `vue`：所有 Composition API + 生命周期 + 组件 API + 类型
   - `vue-router`：useRouter/useRoute/RouterLink/RouterView + 类型
   - `pinia`：defineStore/storeToRefs/createPinia + 类型
   - `vue-demi`：Vue 2/3 兼容 API
   - `vue-i18n`：useI18n + 类型
   - `rxjs`：Observable/of/from 等
   - `@vueuse/core`：常用工具函数
2. 实现 `findPreset(name)` 查找函数
3. 实现 `resolvePackagePreset(preset, root)` 从本地包自动发现导出

### Step 4: 创建统一解析引擎 (`helpers/resolver.ts`)

1. 从 `scanner.ts` 中拆分 `resolveImports` 为新的 `resolveImportsConfig`
2. 支持多种 imports 配置格式分发解析：
   - 字符串 → 预设查找 → 展开
   - Record<string, string[]> → 转换（支持 [name, alias] 元组）
   - ImportMapping（旧版）→ 兼容转换
   - InlineImportConfig（含 type）→ 标记 type 后转换
3. 通配符 `'*'` 复用 `scanner.ts` 中的 `resolveWildcardExports`
4. 处理 ignore 过滤
5. 实现 `buildNameLookup(imports: ImportInline[])` → `Map<string, ImportInline>`

### Step 5: 重构目录扫描 (`helpers/scanner.ts`)

1. 修改 `scanDirectories` 接收 `DirConfig[]` 和 `DirsScanOptions`
2. 实现简单 glob 展开（`**` 递归、`*` 单层匹配，不引入外部依赖）
3. 实现 `filePatterns` 过滤
4. `types` 标记传递到 `ScannedModule`，在 `scannedModulesToImports` 时生成 `ImportInline.type = true`
5. 实现 `defaultExportByFilename` 逻辑
6. 修改 `scannedModulesToImports` 返回 `ImportInline[]`

### Step 6: 重构代码转换 (`helpers/transform.ts`)

1. 修改 `detectUsedImports` 支持 `ImportInline`（同时匹配 name 和 as 别名）
2. 修改 `generateImportStatements` 支持：
   - 别名：`import { useFetch as useMyFetch } from '@vueuse/core'`
   - 类型导入：`import type { RouteLocationRaw } from 'vue-router'`
   - 类型导入和值导入分组生成
3. 新增 `hasDisableComment(code, commentsDisable)` 函数
4. 新增 `detectVueDirectiveImports` 函数
5. 修改 `isAlreadyImported` 也检测 `import type` 形式

### Step 7: 重构 DTS 生成 (`helpers/dts.ts`)

1. 修改 `generateDtsContent` 接收 `ImportInline[]`
2. 实现 `ignoreDts` 过滤（字符串和正则）
3. 实现 `append` 模式：保留 `declare global {}` 之外的用户自定义内容
4. 实现 `overwrite` 模式（当前行为，完全覆盖）
5. 类型导入声明标记区分

### Step 8: 创建缓存模块 (`helpers/cache.ts`)

1. 实现 `AutoImportCache` 类
2. 基于 `fs.statSync(filePath).mtimeMs` 判断文件是否变化
3. 预设解析结果只计算一次
4. DTS 内容缓存

### Step 9: 创建 lint 配置生成 (`helpers/lint.ts`)

1. 实现 `generateEslintrc`：生成 `.eslintrc-auto-import.json`（globals 格式）
2. 实现 `generateBiomelintrc`：生成 `.biomelintrc-auto-import.json`

### Step 10: 重构主插件类 (`index.ts`)

1. 更新 `getDefaultOptions()` 增加所有新配置项默认值
2. 更新 `validateOptions()` 校验新配置项
3. 重构 `initialize()`：
   - 调用 `migrateLegacyOptions` 处理旧配置
   - 初始化缓存
   - 使用 `resolveImportsConfig` 替代旧的 `resolveImports`
   - 解析 `packagePresets`
   - 扫描目录（增强版）
   - 合并所有导入源
   - 构建 nameLookup
4. 重构 `transformCode()`：
   - 检查 `@unimport-disable` 注释
   - 使用 `include`/`exclude` 替代 `fileFilter`
   - 支持 resolver 回退解析
   - 支持 Vue 指令自动导入
5. 重构 `generateDts()`：使用增强版 generateDtsContent
6. 增加 `buildEnd` 中调用 lint 配置生成
7. 增加 `configResolved` 中 Vite optimizeDeps 集成
8. 保持 `getResolvedImports()`、`getNameLookup()` 向后兼容

### Step 11: 更新 helpers/index.ts 导出

统一导出所有新增模块的公共接口。

## 配置兼容性

- 旧 `imports: { vue: ['ref'] }` 格式自动包裹为数组
- 旧 `ImportMapping` 格式在 resolver 中兼容处理
- 旧 `fileFilter` 转为 `include`
- 旧类型 `ResolvedImport`、`ImportMapping` 保留导出，标记 `@deprecated`
- `getResolvedImports()`、`getNameLookup()` 返回值兼容旧类型

## 验证方式

1. **单元验证**：在 playground 项目中修改 `vite.config.ts`，将 `autoImport` 配置切换为新格式：
   ```typescript
   autoImport({
     imports: ['vue', 'vue-router', 'pinia'],  // 使用预设
     dts: 'src/auto-imports.d.ts',
     vueTemplate: true,
     eslintrc: { enabled: true },
   })
   ```
2. **构建验证**：执行 `pnpm dev` 确认插件初始化正常，.d.ts 文件正确生成
3. **功能验证**：在 Vue 组件中直接使用 `ref`、`reactive` 等 API，确认自动导入生效
4. **旧配置验证**：保留旧的 `imports: { vue: ['ref'] }` 格式，确认兼容转换正常
5. **ESLint 验证**：确认 `.eslintrc-auto-import.json` 文件生成且 globals 正确
