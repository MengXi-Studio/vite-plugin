# ui

Terminal UI utilities, providing ANSI escape code handling.

## Import

```typescript
// Submodule import (recommended)
import { ANSI } from '@meng-xi/vite-plugin/common/ui'

// Barrel import
import { ANSI } from '@meng-xi/vite-plugin/common'
```

## ANSI

ANSI escape code toolkit, providing terminal text coloring and cursor control.

### Cursor Control

| Property   | Value         | Description                    |
| ---------- | ------------- | ------------------------------ |
| reset      | `'\x1b[0G'`   | Reset cursor to line beginning |
| clearLine  | `'\x1b[2K'`   | Clear current line content     |
| hideCursor | `'\x1b[?25l'` | Hide terminal cursor           |
| showCursor | `'\x1b[?25h'` | Show terminal cursor           |

### Text Coloring

Each coloring function takes a string parameter and returns a string with ANSI escape codes.

| Function | Signature               | Description  |
| -------- | ----------------------- | ------------ |
| green    | `(t: string) => string` | Green text   |
| cyan     | `(t: string) => string` | Cyan text    |
| gray     | `(t: string) => string` | Gray text    |
| bold     | `(t: string) => string` | Bold text    |
| red      | `(t: string) => string` | Red text     |
| yellow   | `(t: string) => string` | Yellow text  |
| magenta  | `(t: string) => string` | Magenta text |

**Example**

```typescript
// Colored output
console.log(ANSI.green('✓') + ' Build successful')
console.log(ANSI.red('✗') + ' Build failed')
console.log(ANSI.bold(ANSI.cyan('Info:')) + ' Processing...')

// Cursor control
process.stdout.write(ANSI.hideCursor)
// ... animation logic ...
process.stdout.write(ANSI.showCursor)

// Line clearing and rewriting
process.stdout.write(ANSI.clearLine + ANSI.reset + ANSI.green('Done'))
```
