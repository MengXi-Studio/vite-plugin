# validation

Chainable parameter validator for plugin configuration validation, along with a set of common validation functions.

## Import Methods

```typescript
// Submodule import (recommended)
import { Validator, validateGlobalName, validateNoScriptInTemplate, validateCallbackFields, validateNonNegativeNumber, validateNestedDuration, validateEnumValue } from '@meng-xi/vite-plugin/common/validation'

// Barrel import
import { Validator, validateGlobalName, validateNoScriptInTemplate, validateCallbackFields, validateNonNegativeNumber, validateNestedDuration, validateEnumValue } from '@meng-xi/vite-plugin/common'
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

## enum

Validate field value against an allowed enum list.

When the field value exists (not `undefined`, not `null`, and not empty string), checks whether it is in the allowed enum list. Empty values skip validation.

```typescript
enum(allowedValues: string[]): this
```

**Parameters**

| Parameter     | Type       | Description         |
| ------------- | ---------- | ------------------- |
| allowedValues | `string[]` | Allowed values list |

**Returns**

`Validator` - For chaining

**Example**

```typescript
validator.field('position').enum(['center', 'top', 'bottom'])
validator.field('format').enum(['bar', 'spinner', 'minimal'])
```

---

## minValue

Validate number field value is not less than the specified minimum.

When the field value exists (not `undefined` and not `null`), checks whether it is a number type and not less than the minimum. Typically used in chain with `.number()`.

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

Validate number field value is not greater than the specified maximum.

When the field value exists (not `undefined` and not `null`), checks whether it is a number type and not greater than the maximum. Typically used in chain with `.number()`.

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
	.minValue(1)
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

---

## Validation Functions

In addition to the `Validator` class, a set of common validation functions is provided for specific parameter validation scenarios.

---

### validateGlobalName

Validate the legality of a global variable name (wraps `validateIdentifierName` with field context information).

```typescript
function validateGlobalName(name: string | undefined, fieldName: string): void
```

**Parameters**

| Parameter | Type                  | Description                                                                 |
| --------- | --------------------- | --------------------------------------------------------------------------- |
| name      | `string \| undefined` | Global variable name                                                        |
| fieldName | `string`              | Field name for error message context (e.g., `'globalName'`, `'defineName'`) |

**Throws**

Throws an error with field context when the name is invalid

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

Throws an error when the template contains a `<script>` tag

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

| Parameter  | Type                  | Description                                            |
| ---------- | --------------------- | ------------------------------------------------------ |
| callbacks  | `Record<string, any>` | Callback configuration object                          |
| fields     | `string[]`            | Array of callback field names to validate              |
| objectName | `string`              | Name of the callback's parent object for error context |

**Throws**

- Throws an error when a callback field is not a string type
- Throws an error when a callback string contains a `<script>` tag

**Example**

```typescript
validateCallbackFields(callbacks, ['onShow', 'onHide'], 'callbacks')
validateCallbackFields(options, ['onUpdateAvailable', 'onRefresh'], 'callbacks')
```

---

### validateNonNegativeNumber

Validate that a value is a non-negative number.

```typescript
function validateNonNegativeNumber(value: number | undefined, fieldName: string): void
```

**Parameters**

| Parameter | Type                  | Description                  |
| --------- | --------------------- | ---------------------------- |
| value     | `number \| undefined` | Value to validate            |
| fieldName | `string`              | Field name for error message |

**Throws**

Throws an error when the value exists but is not a number or is negative

**Example**

```typescript
validateNonNegativeNumber(100, 'zIndex')
validateNonNegativeNumber(-1, 'duration') // Throws error
```

---

### validateNestedDuration

Validate the duration property of a nested configuration item.

```typescript
function validateNestedDuration(config: { enabled?: boolean; duration?: number } | undefined, errorMsg: string): void
```

**Parameters**

| Parameter | Type                                                    | Description                         |
| --------- | ------------------------------------------------------- | ----------------------------------- |
| config    | `{ enabled?: boolean; duration?: number } \| undefined` | Nested configuration object         |
| errorMsg  | `string`                                                | Error message when validation fails |

**Throws**

Throws an error when duration exists but is not a non-negative number

**Example**

```typescript
validateNestedDuration({ enabled: true, duration: 300 }, 'minDisplayTime.duration must be a non-negative number')
```

---

### validateEnumValue

Validate that a string value is in the allowed enum list.

```typescript
function validateEnumValue(value: string | undefined, allowedValues: string[], fieldName: string): void
```

**Parameters**

| Parameter     | Type                  | Description                  |
| ------------- | --------------------- | ---------------------------- |
| value         | `string \| undefined` | Value to validate            |
| allowedValues | `string[]`            | Allowed values list          |
| fieldName     | `string`              | Field name for error message |

**Throws**

Throws an error when the value exists but is not in the allowed list

**Example**

```typescript
validateEnumValue('center', ['center', 'top', 'bottom'], 'position')
validateEnumValue('modal', ['modal', 'banner', 'toast'], 'promptStyle')
```
