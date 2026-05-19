# buildProgress

Display a real-time build progress bar in the terminal during Vite builds, with multiple display formats and custom themes.

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { buildProgress } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [buildProgress()]
})
```

## Options

| Option          | Type                           | Default   | Description                        |
| --------------- | ------------------------------ | --------- | ---------------------------------- |
| width           | `number`                       | `30`      | Progress bar width (characters)    |
| format          | `ProgressFormat`               | `'bar'`   | Progress bar display format        |
| completeChar    | `string`                       | `'█'`     | Fill character for completed part  |
| incompleteChar  | `string`                       | `'░'`     | Fill character for incomplete part |
| clearOnComplete | `boolean`                      | `true`    | Clear progress bar on completion   |
| showModuleName  | `boolean`                      | `true`    | Show current module name           |
| theme           | `ProgressTheme`                | -         | Custom color theme                 |
| enabled         | `boolean`                      | `true`    | Enable plugin                      |
| verbose         | `boolean`                      | `true`    | Show detailed logs                 |
| errorStrategy   | `'throw' \| 'log' \| 'ignore'` | `'throw'` | Error handling strategy            |

### Display Formats

| Format  | Description                                                                             |
| ------- | --------------------------------------------------------------------------------------- |
| bar     | Full progress bar with spinner animation + phase label + bar + percentage + module name |
| spinner | Spinner animation with phase label + percentage                                         |
| minimal | Minimal mode with phase label + percentage only                                         |

### Color Theme

Custom color rendering functions for each part of the progress bar.

```typescript
interface ProgressTheme {
	completeColor: (text: string) => string // Completed part color
	incompleteColor: (text: string) => string // Incomplete part color
	percentageColor: (text: string) => string // Percentage number color
	phaseColor: (text: string) => string // Phase label color
	moduleColor: (text: string) => string // Module name color
}
```

Each property is a function that accepts a plain text string and returns a string with ANSI escape codes. Unprovided properties will use the default theme.

### Build Phases

The plugin calculates overall progress based on the following phases:

| Phase     | Progress Range | Description                   |
| --------- | -------------- | ----------------------------- |
| config    | 5%             | Reading configuration         |
| resolve   | 10%            | Resolving module dependencies |
| transform | 15%-85%        | Transforming modules          |
| bundle    | +10%           | Bundling (production only)    |
| write     | +5%            | Writing files                 |
| done      | 100%           | Build complete                |

## Examples

### Minimal Format

```typescript
buildProgress({
	format: 'minimal'
})
// Output: 转换模块 45%
```

### Custom Progress Bar Appearance

```typescript
buildProgress({
	width: 40,
	completeChar: '■',
	incompleteChar: '□',
	clearOnComplete: false
})
// Output: ⠋ 转换模块 ■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□ 45%
```

### Custom Color Theme

```typescript
buildProgress({
	theme: {
		completeColor: t => `\x1b[32m${t}\x1b[39m`, // Green
		incompleteColor: t => `\x1b[90m${t}\x1b[39m`, // Gray
		percentageColor: t => `\x1b[1m${t}\x1b[22m`, // Bold
		phaseColor: t => `\x1b[36m${t}\x1b[39m`, // Cyan
		moduleColor: t => `\x1b[90m${t}\x1b[39m` // Gray
	}
})
```

### Disable Module Name Display

```typescript
buildProgress({
	showModuleName: false
})
```

## Notes

- In non-TTY environments (e.g., CI/CD pipelines), the plugin automatically degrades to log output mode
- Windows terminals use ASCII character animation, other platforms use Unicode Braille character animation
- The `enabled` option fully controls enable/disable behavior with zero performance overhead when disabled
- In development mode, progress completes when the dev server is ready; in production mode, it completes at `closeBundle`
