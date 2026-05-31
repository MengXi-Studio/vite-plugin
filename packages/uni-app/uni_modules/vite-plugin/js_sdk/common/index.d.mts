export { calculateGzipSize } from './compress/index.mjs';
export { DateFormatOptions, escapeHtmlAttr, formatDate, formatFileSize, generateRandomHash, getDateFormatParams, getExtension, padNumber, parseTemplate, stripJsonComments, toCamelCase, toPascalCase } from './format/index.mjs';
export { CopyOptions, CopyResult, ScanDirectoryOptions, ScannedFile, checkSourceExists, copySourceToTarget, ensureTargetDir, fileExists, readDirRecursive, readFileContent, readFileSync, runWithConcurrency, scanDirectory, shouldUpdateFile, writeFileContent, writeJsonReport } from './fs/index.mjs';
export { DualInjectResult, HtmlInjectResult, injectBeforeTag, injectBeforeTagWithFallback, injectHeadAndBody, injectHtmlByPriority } from './html/index.mjs';
export { deepMerge } from './object/index.mjs';
export { isNodeModule } from './path/index.mjs';
export { containsScriptTag, makeCallback, validateIdentifierName } from './script/index.mjs';
export { V as Validator } from '../shared/vite-plugin.DRRlWY8P.mjs';
export { validateCallbackFields, validateEnumValue, validateGlobalName, validateNestedDuration, validateNoScriptInTemplate, validateNonNegativeNumber } from './validation/index.mjs';
