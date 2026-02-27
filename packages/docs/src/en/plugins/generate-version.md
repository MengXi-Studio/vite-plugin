# generateVersion Plugin

The `generateVersion` plugin automatically generates version numbers during the Vite build process, supporting multiple formats and output methods.

## Features

- Multiple version number formats (timestamp, date, semantic version, hash, etc.)
- Custom format templates
- Output to file or inject into code
- Version number prefix and suffix support
- Additional version information support
- Enable/disable plugin
- Verbose logging support
- Flexible error handling mechanism

## Basic Usage

### Simple Configuration

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [generateVersion()]
})
```

### Full Configuration

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'custom',
			customFormat: '{YYYY}.{MM}.{DD}-{hash}',
			hashLength: 6,
			outputType: 'both',
			outputFile: 'version.json',
			defineName: '__APP_VERSION__',
			prefix: 'v',
			suffix: '-beta',
			enabled: true,
			verbose: true,
			errorStrategy: 'throw',
			extra: {
				environment: 'production',
				author: 'MengXi Studio'
			}
		})
	]
})
```

## Configuration Options

| Option        | Type                         | Default               | Description                                                                       |
| ------------- | ---------------------------- | --------------------- | --------------------------------------------------------------------------------- |
| format        | VersionFormat                | 'timestamp'           | Version number format                                                             |
| customFormat  | string                       | -                     | Custom format template, only valid when format is 'custom'                        |
| semverBase    | string                       | '1.0.0'               | Semantic version base value, used for semver format                               |
| autoIncrement | boolean                      | false                 | Whether to auto-increment patch version                                           |
| outputType    | OutputType                   | 'file'                | Output type: 'file' to file, 'define' inject code, 'both' for both                |
| outputFile    | string                       | 'version.json'        | Output file path (relative to build output directory)                             |
| defineName    | string                       | '\_\_APP_VERSION\_\_' | Global variable name injected into code                                           |
| hashLength    | number                       | 8                     | Hash length, range 1-32                                                           |
| prefix        | string                       | ''                    | Version number prefix                                                             |
| suffix        | string                       | ''                    | Version number suffix                                                             |
| extra         | object                       | -                     | Extra version info, included in output JSON file                                  |
| enabled       | boolean                      | true                  | Whether to enable the plugin                                                      |
| verbose       | boolean                      | true                  | Whether to show verbose logs                                                      |
| errorStrategy | 'throw' \| 'log' \| 'ignore' | 'throw'               | Error handling strategy: 'throw' throws error, 'log' logs error, 'ignore' ignores |

### Version Formats (VersionFormat)

| Format    | Description             | Example               |
| --------- | ----------------------- | --------------------- |
| timestamp | Timestamp format        | 20260203153000        |
| date      | Date format             | 2026.02.03            |
| datetime  | Date-time format        | 2026.02.03.153000     |
| semver    | Semantic version format | 1.0.0                 |
| hash      | Random hash format      | a1b2c3d4              |
| custom    | Custom format           | Based on customFormat |

### Custom Format Placeholders

| Placeholder | Description             | Example    |
| ----------- | ----------------------- | ---------- |
| {YYYY}      | Four-digit year         | 2026       |
| {YY}        | Two-digit year          | 26         |
| {MM}        | Two-digit month         | 02         |
| {DD}        | Two-digit day           | 03         |
| {HH}        | Two-digit hour          | 15         |
| {mm}        | Two-digit minute        | 30         |
| {ss}        | Two-digit second        | 00         |
| {SSS}       | Three-digit millisecond | 123        |
| {timestamp} | Timestamp               | 1738567800 |
| {hash}      | Random hash             | a1b2c3d4   |
| {major}     | Major version           | 1          |
| {minor}     | Minor version           | 0          |
| {patch}     | Patch version           | 0          |

## Examples

### Timestamp Format

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'timestamp'
		})
	]
})
// Output: 20260203153000
```

### Date Format with Prefix

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'date',
			prefix: 'v'
		})
	]
})
// Output: v2026.02.03
```

### Semantic Version Format

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'semver',
			semverBase: '2.0.0',
			prefix: 'v'
		})
	]
})
// Output: v2.0.0
```

### Custom Format

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'custom',
			customFormat: '{YYYY}.{MM}.{DD}-{hash}',
			hashLength: 6
		})
	]
})
// Output: 2026.02.03-a1b2c3
```

### Inject into Code

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			outputType: 'define',
			defineName: '__VERSION__'
		})
	]
})

// Use in code
console.log(__VERSION__) // '20260203153000'
```

### Output File and Inject Code

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			outputType: 'both',
			outputFile: 'build-info.json',
			defineName: '__BUILD_VERSION__',
			extra: {
				environment: 'production',
				author: 'MengXi Studio'
			}
		})
	]
})
```

### Enable Based on Environment

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			enabled: process.env.NODE_ENV === 'production'
		})
	]
})
```

## Output File Format

When `outputType` is `'file'` or `'both'`, a JSON file with the following format will be generated:

```json
{
	"version": "v2026.02.03-a1b2c3",
	"buildTime": "2026-02-03T15:30:00.000Z",
	"timestamp": 1738567800000,
	"format": "custom",
	"environment": "production",
	"author": "MengXi Studio"
}
```

## Notes

- The plugin generates the version number during Vite config resolution phase, ensuring consistency throughout the build process
- When `format` is `'custom'`, the `customFormat` option must be provided
- `hashLength` must be between 1-32
- When `outputType` is `'define'` or `'both'`, both `defineName` and `defineName_INFO` global variables are injected
- Extra information in `extra` is only included in the output JSON file and does not affect the version string
- When `enabled` is `false`, the plugin will not perform any operations
- The `errorStrategy` option determines error handling behavior:
  - `'throw'`: Throws error, interrupts build process
  - `'log'`: Logs error, but does not interrupt build
  - `'ignore'`: Ignores error, continues execution
