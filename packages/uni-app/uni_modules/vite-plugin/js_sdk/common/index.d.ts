export { CopyOptions, CopyResult, checkSourceExists, copySourceToTarget, ensureTargetDir, fileExists, readDirRecursive, readFileContent, readFileSync, runWithConcurrency, shouldUpdateFile, writeFileContent } from './fs/index.js';
export { DateFormatOptions, escapeHtmlAttr, formatDate, generateRandomHash, getDateFormatParams, padNumber, parseTemplate, stripJsonComments, toCamelCase, toPascalCase } from './format/index.js';
export { DualInjectResult, HtmlInjectResult, injectBeforeTag, injectBeforeTagWithFallback, injectHeadAndBody, injectHtmlByPriority } from './html/index.js';
export { deepMerge } from './object/index.js';
export { containsScriptTag, makeCallback, validateIdentifierName } from './script/index.js';
export { V as Validator } from '../shared/vite-plugin.DRRlWY8P.js';
export { validateCallbackFields, validateEnumValue, validateGlobalName, validateNestedDuration, validateNoScriptInTemplate, validateNonNegativeNumber } from './validation/index.js';
