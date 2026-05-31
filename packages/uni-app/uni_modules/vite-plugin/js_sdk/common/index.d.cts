export { calculateGzipSize } from './compress/index.cjs';
export { DateFormatOptions, escapeHtmlAttr, formatDate, formatFileSize, generateRandomHash, getDateFormatParams, getExtension, padNumber, parseTemplate, stripJsonComments, toCamelCase, toPascalCase } from './format/index.cjs';
export { CopyOptions, CopyResult, ScanDirectoryOptions, ScannedFile, checkSourceExists, copySourceToTarget, ensureTargetDir, fileExists, readDirRecursive, readFileContent, readFileSync, runWithConcurrency, scanDirectory, shouldUpdateFile, writeFileContent, writeJsonReport } from './fs/index.cjs';
export { DualInjectResult, HtmlInjectResult, injectBeforeTag, injectBeforeTagWithFallback, injectHeadAndBody, injectHtmlByPriority } from './html/index.cjs';
export { deepMerge } from './object/index.cjs';
export { isNodeModule } from './path/index.cjs';
export { containsScriptTag, makeCallback, validateIdentifierName } from './script/index.cjs';
export { V as Validator } from '../shared/vite-plugin.DRRlWY8P.cjs';
export { validateCallbackFields, validateEnumValue, validateGlobalName, validateNestedDuration, validateNoScriptInTemplate, validateNonNegativeNumber } from './validation/index.cjs';
