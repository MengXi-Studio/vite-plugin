# validation

参数验证器，提供链式 API 用于验证插件配置。

```typescript
import { Validator } from '@meng-xi/vite-plugin/common'
```

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
