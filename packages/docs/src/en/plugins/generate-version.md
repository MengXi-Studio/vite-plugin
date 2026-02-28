# generateVersion

Auto-generate version numbers during Vite build with file output and global variable injection.

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [generateVersion()]
})
```

## Options

| Option        | Type                           | Default             | Description             |
| ------------- | ------------------------------ | ------------------- | ----------------------- |
| format        | `VersionFormat`                | `'timestamp'`       | Version format          |
| customFormat  | `string`                       | -                   | Custom format template  |
| semverBase    | `string`                       | `'1.0.0'`           | Semantic version base   |
| autoIncrement | `boolean`                      | `false`             | Auto-increment patch    |
| outputType    | `OutputType`                   | `'file'`            | Output type             |
| outputFile    | `string`                       | `'version.json'`    | Output file path        |
| defineName    | `string`                       | `'__APP_VERSION__'` | Global variable name    |
| hashLength    | `number`                       | `8`                 | Hash length (1-32)      |
| prefix        | `string`                       | `''`                | Version prefix          |
| suffix        | `string`                       | `''`                | Version suffix          |
| extra         | `Record<string, unknown>`      | -                   | Extra info (JSON only)  |
| enabled       | `boolean`                      | `true`              | Enable the plugin       |
| verbose       | `boolean`                      | `true`              | Show detailed logs      |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'`           | Error handling strategy |

### Version Formats

| Format    | Description      | Example           |
| --------- | ---------------- | ----------------- |
| timestamp | Timestamp        | 20260203153000    |
| date      | Date             | 2026.02.03        |
| datetime  | Date-time        | 2026.02.03.153000 |
| semver    | Semantic version | 1.0.0             |
| hash      | Random hash      | a1b2c3d4          |
| custom    | Custom template  | -                 |

### Output Types

| Type   | Description            |
| ------ | ---------------------- |
| file   | Output to JSON file    |
| define | Inject global variable |
| both   | Both file and variable |

### Custom Format Placeholders

| Placeholder | Description     | Example    |
| ----------- | --------------- | ---------- |
| {YYYY}      | Four-digit year | 2026       |
| {YY}        | Two-digit year  | 26         |
| {MM}        | Two-digit month | 02         |
| {DD}        | Two-digit day   | 03         |
| {HH}        | Two-digit hour  | 15         |
| {mm}        | Two-digit min   | 30         |
| {ss}        | Two-digit sec   | 00         |
| {SSS}       | Milliseconds    | 123        |
| {timestamp} | Timestamp       | 1738567800 |
| {hash}      | Random hash     | a1b2c3d4   |
| {major}     | Major version   | 1          |
| {minor}     | Minor version   | 0          |
| {patch}     | Patch version   | 0          |

## Examples

### Date Format with Prefix

```typescript
generateVersion({
	format: 'date',
	prefix: 'v'
})
// Output: v2026.02.03
```

### Custom Format

```typescript
generateVersion({
	format: 'custom',
	customFormat: '{YYYY}.{MM}.{DD}-{hash}',
	hashLength: 6
})
// Output: 2026.02.03-a1b2c3
```

### Inject Global Variable

```typescript
generateVersion({
	outputType: 'define',
	defineName: '__VERSION__'
})

// Use in code
console.log(__VERSION__) // '20260203153000'
```

### Output File and Inject Code

```typescript
generateVersion({
	outputType: 'both',
	outputFile: 'build-info.json',
	defineName: '__BUILD_VERSION__',
	extra: {
		environment: 'production',
		author: 'MengXi Studio'
	}
})
```

## Output File Format

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

- `customFormat` is required when `format` is `'custom'`
- `hashLength` must be between 1-32
- `outputType` as `'define'` or `'both'` injects both `defineName` and `defineName_INFO`
- `extra` only appears in JSON file, not in version string
