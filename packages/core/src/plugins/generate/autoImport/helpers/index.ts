// 解析引擎
export { resolveImportsConfig, buildNameLookup } from './resolver'

// 预设
export { BUILTIN_PRESETS, findPreset, expandPreset, resolvePackagePreset } from './presets'

// 扫描
export { resolveWildcardExports, scanDirectories, parseModuleExports, scannedModulesToImports } from './scanner'

// 转换
export {
	detectUsedImports,
	isAlreadyImported,
	generateImportStatements,
	injectImports,
	injectIntoScriptSetup,
	isRawSfc,
	findLastImportEnd,
	detectVueTemplateImports,
	detectVueDirectiveImports,
	hasDisableComment,
} from './transform'

// DTS
export { generateDtsContent, writeDtsFile, shouldUpdateDts, mergeDtsContent } from './dts'

// 缓存
export { AutoImportCache } from './cache'

// Lint 配置
export { generateEslintrc, generateBiomelintrc } from './lint'

// 兼容
export { migrateLegacyOptions, resolvedImportToInline, inlineToResolvedImport, importMappingToInlines } from './compat'
