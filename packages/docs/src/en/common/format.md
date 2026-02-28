# format

Formatting utilities.

```typescript
import { padNumber, generateRandomHash, getDateFormatParams, formatDate, parseTemplate, toCamelCase, toPascalCase, stripJsonComments } from '@meng-xi/vite-plugin/common'
```

## padNumber

Pad number with leading zeros.

```typescript
function padNumber(num: number, length?: number): string

padNumber(5, 2) // '05'
padNumber(12, 3) // '012'
```

---

## generateRandomHash

Generate random hash string (length 1-64).

```typescript
function generateRandomHash(length?: number): string

generateRandomHash(8) // 'a1b2c3d4'
```

---

## formatDate

Format date with placeholders.

```typescript
function formatDate(date: Date, format: string): string

formatDate(new Date(), '{YYYY}-{MM}-{DD}') // '2026-02-03'
```

**Placeholders**: `{YYYY}`, `{YY}`, `{MM}`, `{DD}`, `{HH}`, `{mm}`, `{ss}`, `{SSS}`, `{timestamp}`

---

## parseTemplate

Parse template string with placeholders.

```typescript
function parseTemplate(template: string, values: Record<string, string>): string

parseTemplate('{name}-{version}', { name: 'app', version: '1.0.0' })
// 'app-1.0.0'
```

---

## toCamelCase

Convert string to camelCase.

```typescript
function toCamelCase(str: string, separators?: RegExp): string

toCamelCase('pages/user/profile') // 'pagesUserProfile'
```

---

## toPascalCase

Convert string to PascalCase.

```typescript
function toPascalCase(str: string, separators?: RegExp): string

toPascalCase('pages/user/profile') // 'PagesUserProfile'
```

---

## stripJsonComments

Remove comments from JSON string.

```typescript
function stripJsonComments(jsonString: string): string
```
