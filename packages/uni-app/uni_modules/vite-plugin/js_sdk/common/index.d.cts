export { CopyOptions, CopyResult, checkSourceExists, copySourceToTarget, ensureTargetDir, fileExists, readDirRecursive, readFileContent, readFileSync, runWithConcurrency, shouldUpdateFile, writeFileContent } from './fs/index.cjs';
export { DateFormatOptions, escapeHtmlAttr, formatDate, generateRandomHash, getDateFormatParams, padNumber, parseTemplate, stripJsonComments, toCamelCase, toPascalCase } from './format/index.cjs';
export { DualInjectResult, HtmlInjectResult, injectBeforeTag, injectBeforeTagWithFallback, injectHeadAndBody, injectHtmlByPriority } from './html/index.cjs';
export { deepMerge } from './object/index.cjs';
export { containsScriptTag, makeCallback, validateIdentifierName } from './script/index.cjs';
export { V as Validator } from '../shared/vite-plugin.DRRlWY8P.cjs';
export { validateCallbackFields, validateEnumValue, validateGlobalName, validateNestedDuration, validateNoScriptInTemplate, validateNonNegativeNumber } from './validation/index.cjs';
