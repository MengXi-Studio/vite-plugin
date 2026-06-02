# ui

Terminal UI utilities providing ANSI escape code handling, spinner animation frames, and string sanitization.

## Import Methods

```typescript
// Submodule import (recommended)
import { ANSI, SPINNER_FRAMES, stripAnsi } from '@meng-xi/vite-plugin/common/ui'

// Barrel import
import { ANSI, SPINNER_FRAMES, stripAnsi } from '@meng-xi/vite-plugin/common'
```

## ANSI

ANSI escape code toolkit providing terminal text coloring and cursor control.

### Cursor Control

| Property   | Value         | Description                |
| ---------- | ------------- | -------------------------- |
| reset      | `'\x1b[0G'`   | Reset cursor to line start |
| clearLine  | `'\x1b[2K'`   | Clear current line content |
| hideCursor | `'\x1b[?25l'` | Hide terminal cursor       |
| showCursor | `'\x1b[?25h'` | Show terminal cursor       |

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

**Examples**

```typescript
// Colored output
console.log(ANSI.green('✓') + ' Build succeeded')
console.log(ANSI.red('✗') + ' Build failed')
console.log(ANSI.bold(ANSI.cyan('Info:')) + ' Processing...')

// Cursor control
process.stdout.write(ANSI.hideCursor)
// ... animation logic ...
process.stdout.write(ANSI.showCursor)

// Line clear and rewrite
process.stdout.write(ANSI.clearLine + ANSI.reset + ANSI.green('Done'))
```

---

## SPINNER_FRAMES

Spinner animation frame sequence, automatically selecting appropriate frames based on OS platform:

- **Windows**: Uses ASCII characters `|`, `/`, `-`, `\` for traditional terminal compatibility
- **Other platforms**: Uses Unicode Braille characters `⠋`-`⠏` for smoother visual effect

**Type**

```typescript
const SPINNER_FRAMES: string[]
```

**Example**

```typescript
let frameIndex = 0
setInterval(() => {
	process.stdout.write(`\r${SPINNER_FRAMES[frameIndex]} Loading...`)
	frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length
}, 80)
```

---

## stripAnsi

Remove all ANSI escape codes from a string.

```typescript
function stripAnsi(str: string): string
```

**Parameters**

| Parameter | Type     | Description                               |
| --------- | -------- | ----------------------------------------- |
| str       | `string` | String that may contain ANSI escape codes |

**Returns**

`string` - Plain text string without any ANSI escape codes

**Description**

Uses a regular expression to match and remove all ANSI escape sequences in the form `\x1b[...m`. Commonly used to calculate actual display width or convert colored output to plain text.

**Examples**

```typescript
const colored = ANSI.green('hello') + ' ' + ANSI.red('world')
stripAnsi(colored) // 'hello world'

// Calculate terminal display width
const text = ANSI.bold(ANSI.cyan('Status:')) + ' Done'
stripAnsi(text).length // 7 (actual character count without escape codes)
```
