# validation

Chainable parameter validator for plugin configuration validation.

```typescript
import { Validator } from '@meng-xi/vite-plugin/common'
```

## Validator

Chainable configuration validator class.

```typescript
class Validator<T extends Record<string, any>, K extends keyof T = any>
```

**Constructor**

```typescript
constructor(options: T)
```

| Parameter | Type | Description          |
| --------- | ---- | -------------------- |
| options   | `T`  | Configuration object |

**Example**

```typescript
const options = { sourceDir: 'src', targetDir: 'dist' }
const validator = new Validator(options)
```

---

## field

Specify the field to validate.

```typescript
field<NextK extends keyof T>(field: NextK): Validator<T, NextK>
```

**Parameters**

| Parameter | Type    | Description |
| --------- | ------- | ----------- |
| field     | `NextK` | Field name  |

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('sourceDir')
```

---

## required

Mark field as required.

```typescript
required(): this
```

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('sourceDir').required()
```

---

## string

Validate field value as string type.

```typescript
string(): this
```

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('sourceDir').string()
```

---

## boolean

Validate field value as boolean type.

```typescript
boolean(): this
```

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('enabled').boolean()
```

---

## number

Validate field value as number type.

```typescript
number(): this
```

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('count').number()
```

---

## array

Validate field value as array type.

```typescript
array(): this
```

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('items').array()
```

---

## object

Validate field value as object type.

```typescript
object(): this
```

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('config').object()
```

---

## default

Set default value for field (only effective when field value is `undefined` or `null`).

```typescript
default(defaultValue: T[K]): this
```

**Parameters**

| Parameter    | Type   | Description   |
| ------------ | ------ | ------------- |
| defaultValue | `T[K]` | Default value |

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('overwrite').default(true)
```

---

## custom

Use custom function to validate field value.

```typescript
custom(validator: (value: T[K]) => boolean, message: string): this
```

**Parameters**

| Parameter | Type                       | Description                      |
| --------- | -------------------------- | -------------------------------- |
| validator | `(value: T[K]) => boolean` | Validation function, true = pass |
| message   | `string`                   | Error message on failure         |

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('count').custom(v => v > 0, 'count must be > 0')
```

---

## validate

Execute validation, throws error on failure.

```typescript
validate(): T
```

**Returns**

`T` - Validated configuration object

**Throws**

`Error` containing all error messages on validation failure

**Example**

```typescript
const validated = validator.validate()
```

---

## Complete Example

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
	.custom(v => v > 0, 'count must be > 0')
	.validate()

console.log(validated)
// { sourceDir: 'src', targetDir: 'dist', count: 5, overwrite: true }
```

**Validation Failure Example**

```typescript
const options = { sourceDir: '' }

new Validator(options).field('sourceDir').required().string().field('targetDir').required().string().validate()

// Error: 配置验证失败：
// - targetDir 是必填字段
```
