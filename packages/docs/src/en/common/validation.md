# validation

Parameter validator, providing a chainable API for validating plugin configuration and a set of common validation functions.

## Import

```typescript
// Submodule import (recommended)
import { Validator, validateGlobalName, validateNoScriptInTemplate, validateCallbackFields } from '@meng-xi/vite-plugin/common/validation'

// Barrel import
import { Validator, validateGlobalName, validateNoScriptInTemplate, validateCallbackFields } from '@meng-xi/vite-plugin/common'
```

---

## Validator

Chainable configuration validator class.

```typescript
class Validator<T extends Record<string, any>, K extends keyof T = any>
```

**Constructor**

```typescript
constructor(options: T)
```

| Parameter | Type | Description                      |
| --------- | ---- | -------------------------------- |
| options   | `T`  | Configuration object to validate |

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

Validate field value is a string type.

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

Validate field value is a boolean type.

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

Validate field value is a number type.

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

Validate field value is an array type.

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

Validate field value is an object type.

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

Set a default value for the field (only takes effect when the field value is `undefined` or `null`).

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

## enum

Validate field value is in the allowed enum list.

When the field value exists (not `undefined`, not `null`, and not empty string), check if it is in the allowed enum list. Empty values skip validation.

```typescript
enum(allowedValues: string[]): this
```

**Parameters**

| Parameter     | Type       | Description            |
| ------------- | ---------- | ---------------------- |
| allowedValues | `string[]` | List of allowed values |

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('position').enum(['center', 'top', 'bottom'])
validator.field('format').enum(['bar', 'spinner', 'minimal'])
```

---

## minValue

Validate numeric field value is not less than the specified minimum.

When the field value exists (not `undefined` and not `null`), check if it is a number type and not less than the minimum. Typically used with `.number()` chaining.

```typescript
minValue(min: number): this
```

**Parameters**

| Parameter | Type     | Description               |
| --------- | -------- | ------------------------- |
| min       | `number` | Minimum value (inclusive) |

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('checkInterval').number().minValue(5000)
validator.field('width').number().minValue(1)
```

---

## maxValue

Validate numeric field value is not greater than the specified maximum.

When the field value exists (not `undefined` and not `null`), check if it is a number type and not greater than the maximum. Typically used with `.number()` chaining.

```typescript
maxValue(max: number): this
```

**Parameters**

| Parameter | Type     | Description               |
| --------- | -------- | ------------------------- |
| max       | `number` | Maximum value (inclusive) |

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('hashLength').number().minValue(1).maxValue(32)
```

---

## custom

Validate field value using a custom function.

```typescript
custom(validator: (value: T[K]) => boolean, message: string): this
```

**Parameters**

| Parameter | Type                       | Description                               |
| --------- | -------------------------- | ----------------------------------------- |
| validator | `(value: T[K]) => boolean` | Validation function, returns true to pass |
| message   | `string`                   | Error message on validation failure       |

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('count').custom(v => v > 0, 'count must be greater than 0')
```

---

## validate

Execute validation, throw an error on failure.

```typescript
validate(): T
```

**Returns**

`T` - Validated configuration object

**Throws**

`Error` containing all error messages when validation fails

**Example**

```typescript
const validated = validator.validate()
```

---

## Full Example

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
	.custom(v => v > 0, 'count must be greater than 0')
	.validate()

console.log(validated)
// { sourceDir: 'src', targetDir: 'dist', count: 5, overwrite: true }
```

**Validation failure example**

```typescript
const options = { sourceDir: '' }

new Validator(options).field('sourceDir').required().string().field('targetDir').required().string().validate()

// Error: 配置验证失败：
// - targetDir 是必填字段
```

---

## Validation Functions

In addition to the `Validator` class, a set of common validation functions are provided for specific scenarios.

---

### validateGlobalName

Validate the legality of a global variable name.

```typescript
function validateGlobalName(name: string | undefined, fieldName: string): void
```

**Parameters**

| Parameter | Type                  | Description                                                                |
| --------- | --------------------- | -------------------------------------------------------------------------- |
| name      | `string \| undefined` | Global variable name                                                       |
| fieldName | `string`              | Field name for error message context (e.g. `'globalName'`, `'defineName'`) |

**Throws**

Error with field context when name is invalid

**Example**

```typescript
validateGlobalName('__LOADING_MANAGER__', 'globalName')
validateGlobalName('__APP_VERSION__', 'defineName')
```

---

### validateNoScriptInTemplate

Validate that a template string does not contain script tags (XSS protection).

```typescript
function validateNoScriptInTemplate(template: string | undefined, fieldName: string): void
```

**Parameters**

| Parameter | Type                  | Description                          |
| --------- | --------------------- | ------------------------------------ |
| template  | `string \| undefined` | Template string                      |
| fieldName | `string`              | Field name for error message context |

**Throws**

Error when template contains `<script>` tags

**Example**

```typescript
validateNoScriptInTemplate('<div>safe</div>', 'customTemplate')
validateNoScriptInTemplate(options.customPromptTemplate, 'customPromptTemplate')
```

---

### validateCallbackFields

Validate that callback fields do not contain script tags.

```typescript
function validateCallbackFields(callbacks: Record<string, any>, fields: string[], objectName: string): void
```

**Parameters**

| Parameter  | Type                  | Description                                  |
| ---------- | --------------------- | -------------------------------------------- |
| callbacks  | `Record<string, any>` | Callback configuration object                |
| fields     | `string[]`            | Array of callback field names to validate    |
| objectName | `string`              | Parent object name for error message context |

**Throws**

- Error when callback field is not a string type
- Error when callback string contains `<script>` tags

**Example**

```typescript
validateCallbackFields(callbacks, ['onShow', 'onHide'], 'callbacks')
validateCallbackFields(options, ['onUpdateAvailable', 'onRefresh'], 'callbacks')
```
