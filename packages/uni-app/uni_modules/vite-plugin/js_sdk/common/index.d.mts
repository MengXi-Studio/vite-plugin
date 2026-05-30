export { CopyOptions, CopyResult, checkSourceExists, copySourceToTarget, ensureTargetDir, fileExists, readDirRecursive, readFileContent, readFileSync, runWithConcurrency, shouldUpdateFile, writeFileContent } from './fs/index.mjs';
export { DateFormatOptions, escapeHtmlAttr, formatDate, generateRandomHash, getDateFormatParams, padNumber, parseTemplate, stripJsonComments, toCamelCase, toPascalCase } from './format/index.mjs';
export { DualInjectResult, HtmlInjectResult, injectBeforeTag, injectBeforeTagWithFallback, injectHeadAndBody, injectHtmlByPriority } from './html/index.mjs';
export { deepMerge } from './object/index.mjs';
export { containsScriptTag, makeCallback, validateIdentifierName } from './script/index.mjs';
export { V as Validator } from '../shared/vite-plugin.DRRlWY8P.mjs';
export { validateCallbackFields, validateEnumValue, validateGlobalName, validateNestedDuration, validateNoScriptInTemplate, validateNonNegativeNumber } from './validation/index.mjs';
