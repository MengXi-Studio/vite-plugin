export { calculateGzipSize } from './compress/index.js';
export { DateFormatOptions, escapeHtmlAttr, formatDate, formatFileSize, generateRandomHash, getDateFormatParams, getExtension, padNumber, parseTemplate, stripJsonComments, toCamelCase, toPascalCase } from './format/index.js';
export { CopyOptions, CopyResult, ScanDirectoryOptions, ScannedFile, checkSourceExists, copySourceToTarget, ensureTargetDir, fileExists, readDirRecursive, readFileContent, readFileSync, runWithConcurrency, scanDirectory, shouldUpdateFile, writeFileContent, writeJsonReport } from './fs/index.js';
export { DualInjectResult, HtmlInjectResult, injectBeforeTag, injectBeforeTagWithFallback, injectHeadAndBody, injectHtmlByPriority } from './html/index.js';
export { deepMerge } from './object/index.js';
export { isNodeModule } from './path/index.js';
export { containsScriptTag, makeCallback, validateIdentifierName } from './script/index.js';
export { V as Validator } from '../shared/vite-plugin.DRRlWY8P.js';
export { validateCallbackFields, validateEnumValue, validateGlobalName, validateNestedDuration, validateNoScriptInTemplate, validateNonNegativeNumber } from './validation/index.js';
