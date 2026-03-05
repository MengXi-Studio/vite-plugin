# validation

Chainable parameter validator.

```typescript
import { Validator } from '@meng-xi/vite-plugin/common'
```

## Validator

```typescript
class Validator<T extends Record<string, any>, K extends keyof T = any>
```

## Methods

| Method                | Description         |
| --------------------- | ------------------- |
| `field(name)`         | Specify field       |
| `required()`          | Mark as required    |
| `string()`            | Validate as string  |
| `boolean()`           | Validate as boolean |
| `number()`            | Validate as number  |
| `array()`             | Validate as array   |
| `object()`            | Validate as object  |
| `default(value)`      | Set default value   |
| `custom(fn, message)` | Custom validator    |
| `validate()`          | Execute and return  |

## Example

```typescript
const options = { sourceDir: 'src', targetDir: 'dist' }

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
```
