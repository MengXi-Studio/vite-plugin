# validation

参数验证器，提供链式 API 用于验证插件配置，以及一组常用验证函数。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { Validator, validateGlobalName, validateNoScriptInTemplate, validateCallbackFields } from '@meng-xi/vite-plugin/common/validation'

// barrel 导入
import { Validator, validateGlobalName, validateNoScriptInTemplate, validateCallbackFields } from '@meng-xi/vite-plugin/common'
```

---

## Validator

链式配置验证器类。

```typescript
class Validator<T extends Record<string, any>, K extends keyof T = any>
```

**构造函数**

```typescript
constructor(options: T)
```

| 参数    | 类型 | 说明             |
| ------- | ---- | ---------------- |
| options | `T`  | 要验证的配置对象 |

**示例**

```typescript
const options = { sourceDir: 'src', targetDir: 'dist' }
const validator = new Validator(options)
```

---

## field

指定要验证的字段。

```typescript
field<NextK extends keyof T>(field: NextK): Validator<T, NextK>
```

**参数**

| 参数  | 类型    | 说明   |
| ----- | ------- | ------ |
| field | `NextK` | 字段名 |

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('sourceDir')
```

---

## required

标记字段为必填。

```typescript
required(): this
```

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('sourceDir').required()
```

---

## string

验证字段值为字符串类型。

```typescript
string(): this
```

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('sourceDir').string()
```

---

## boolean

验证字段值为布尔类型。

```typescript
boolean(): this
```

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('enabled').boolean()
```

---

## number

验证字段值为数字类型。

```typescript
number(): this
```

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('count').number()
```

---

## array

验证字段值为数组类型。

```typescript
array(): this
```

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('items').array()
```

---

## object

验证字段值为对象类型。

```typescript
object(): this
```

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('config').object()
```

---

## default

为字段设置默认值（仅当字段值为 `undefined` 或 `null` 时生效）。

```typescript
default(defaultValue: T[K]): this
```

**参数**

| 参数         | 类型   | 说明   |
| ------------ | ------ | ------ |
| defaultValue | `T[K]` | 默认值 |

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('overwrite').default(true)
```

---

## enum

验证字段值是否在允许的枚举列表中。

当字段值存在（非 `undefined` 且非 `null` 且非空字符串）时，检查其是否在允许的枚举列表中。空值跳过验证。

```typescript
enum(allowedValues: string[]): this
```

**参数**

| 参数          | 类型       | 说明         |
| ------------- | ---------- | ------------ |
| allowedValues | `string[]` | 允许的值列表 |

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('position').enum(['center', 'top', 'bottom'])
validator.field('format').enum(['bar', 'spinner', 'minimal'])
```

---

## minValue

验证数字字段值是否不小于指定最小值。

当字段值存在（非 `undefined` 且非 `null`）时，检查其是否为数字类型且不小于最小值。通常与 `.number()` 链式调用配合使用。

```typescript
minValue(min: number): this
```

**参数**

| 参数 | 类型     | 说明           |
| ---- | -------- | -------------- |
| min  | `number` | 最小值（包含） |

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('checkInterval').number().minValue(5000)
validator.field('width').number().minValue(1)
```

---

## maxValue

验证数字字段值是否不大于指定最大值。

当字段值存在（非 `undefined` 且非 `null`）时，检查其是否为数字类型且不大于最大值。通常与 `.number()` 链式调用配合使用。

```typescript
maxValue(max: number): this
```

**参数**

| 参数 | 类型     | 说明           |
| ---- | -------- | -------------- |
| max  | `number` | 最大值（包含） |

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('hashLength').number().minValue(1).maxValue(32)
```

---

## custom

使用自定义函数验证字段值。

```typescript
custom(validator: (value: T[K]) => boolean, message: string): this
```

**参数**

| 参数      | 类型                       | 说明                       |
| --------- | -------------------------- | -------------------------- |
| validator | `(value: T[K]) => boolean` | 验证函数，返回 true 为通过 |
| message   | `string`                   | 验证失败的错误信息         |

**返回值**

`Validator` - 用于链式调用

**示例**

```typescript
validator.field('count').custom(v => v > 0, 'count 必须大于 0')
```

---

## validate

执行验证，验证失败时抛出错误。

```typescript
validate(): T
```

**返回值**

`T` - 验证后的配置对象

**异常**

验证失败时抛出包含所有错误信息的 `Error`

**示例**

```typescript
const validated = validator.validate()
```

---

## 完整示例

```typescript
const options = {
	sourceDir: 'src',
	targetDir: 'dist',
	count: 5
}

const validated = new Validator(options)
	.field('sourceDir')
	.required()
	.string()
	.field('targetDir')
	.required()
	.string()
	.field('overwrite')
	.boolean()
	.default(true)
	.field('count')
	.number()
	.minValue(1)
	.custom(v => v > 0, 'count 必须大于 0')
	.validate()

console.log(validated)
// { sourceDir: 'src', targetDir: 'dist', count: 5, overwrite: true }
```

**验证失败示例**

```typescript
const options = { sourceDir: '' }

new Validator(options).field('sourceDir').required().string().field('targetDir').required().string().validate()

// Error: 配置验证失败：
// - targetDir 是必填字段
```

---

## 验证函数

除 `Validator` 类外，还提供了一组常用验证函数，用于特定场景的参数校验。

---

### validateGlobalName

验证全局变量名的合法性。

```typescript
function validateGlobalName(name: string | undefined, fieldName: string): void
```

**参数**

| 参数      | 类型                  | 说明                                                              |
| --------- | --------------------- | ----------------------------------------------------------------- |
| name      | `string \| undefined` | 全局变量名                                                        |
| fieldName | `string`              | 字段名称，用于错误消息上下文（如 `'globalName'`、`'defineName'`） |

**异常**

当名称不合法时抛出带字段上下文的错误

**示例**

```typescript
validateGlobalName('__LOADING_MANAGER__', 'globalName')
validateGlobalName('__APP_VERSION__', 'defineName')
```

---

### validateNoScriptInTemplate

验证模板字符串不包含 script 标签（XSS 防护）。

```typescript
function validateNoScriptInTemplate(template: string | undefined, fieldName: string): void
```

**参数**

| 参数      | 类型                  | 说明                         |
| --------- | --------------------- | ---------------------------- |
| template  | `string \| undefined` | 模板字符串                   |
| fieldName | `string`              | 字段名称，用于错误消息上下文 |

**异常**

当模板包含 `<script>` 标签时抛出错误

**示例**

```typescript
validateNoScriptInTemplate('<div>safe</div>', 'customTemplate')
validateNoScriptInTemplate(options.customPromptTemplate, 'customPromptTemplate')
```

---

### validateCallbackFields

验证回调字段不包含 script 标签。

```typescript
function validateCallbackFields(callbacks: Record<string, any>, fields: string[], objectName: string): void
```

**参数**

| 参数       | 类型                  | 说明                                 |
| ---------- | --------------------- | ------------------------------------ |
| callbacks  | `Record<string, any>` | 回调配置对象                         |
| fields     | `string[]`            | 需要验证的回调字段名数组             |
| objectName | `string`              | 回调所属对象名称，用于错误消息上下文 |

**异常**

- 当回调字段非字符串类型时抛出错误
- 当回调字符串包含 `<script>` 标签时抛出错误

**示例**

```typescript
validateCallbackFields(callbacks, ['onShow', 'onHide'], 'callbacks')
validateCallbackFields(options, ['onUpdateAvailable', 'onRefresh'], 'callbacks')
```
