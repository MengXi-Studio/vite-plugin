import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'

interface EntryInfo {
	entry: string
	exportKey: string
	distPath: string
}

const EXCLUDE_PATTERNS: RegExp[] = [/factory\/plugin$/, /plugins\/.+\/helpers$/]

function toKebabCase(str: string): string {
	return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function isExcluded(relPath: string): boolean {
	return EXCLUDE_PATTERNS.some(pattern => pattern.test(relPath))
}

function scanEntries(srcDir: string): EntryInfo[] {
	const results: EntryInfo[] = []

	const rootIndex = join(srcDir, 'index.ts')
	try {
		if (statSync(rootIndex).isFile()) {
			results.push({
				entry: 'src/index',
				exportKey: '.',
				distPath: ''
			})
		}
	} catch {
		// no root index.ts
	}

	function walk(dir: string): void {
		const entries = readdirSync(dir, { withFileTypes: true })

		for (const entry of entries) {
			const fullPath = join(dir, entry.name)

			if (entry.isDirectory()) {
				const indexPath = join(fullPath, 'index.ts')
				try {
					if (statSync(indexPath).isFile()) {
						const relFromSrc = relative(srcDir, fullPath).replace(/\\/g, '/')

						if (!isExcluded(relFromSrc)) {
							const parts = relFromSrc.split('/')
							const kebabParts = parts.map(p => toKebabCase(p))

							results.push({
								entry: `src/${relFromSrc}/index`,
								exportKey: `./${kebabParts.join('/')}`,
								distPath: relFromSrc
							})
						}
					}
				} catch {
					// no index.ts in this directory, continue walking
				}
				walk(fullPath)
			}
		}
	}

	walk(srcDir)

	results.sort((a, b) => {
		if (a.exportKey === '.') return -1
		if (b.exportKey === '.') return 1
		return a.exportKey.localeCompare(b.exportKey)
	})

	return results
}

function generateBuildConfig(entries: EntryInfo[], version: string): string {
	const entryLines = entries.map(e => `\t\t'${e.entry}'`).join(',\n')

	return `import { defineBuildConfig } from 'unbuild'
import { resolve } from 'path'

export default defineBuildConfig({
	entries: [
${entryLines}
	],
	clean: true,
	declaration: true,
	alias: {
		'@': resolve(__dirname, './src')
	},
	replace: {
		__PLUGIN_VERSION__: ${JSON.stringify(JSON.stringify(version))}
	},
	rollup: {
		emitCJS: true,
		esbuild: {
			minify: true
		}
	}
})
`
}

function generateExports(entries: EntryInfo[]): Record<string, { require: string; import: string; types: string }> {
	const exports: Record<string, { require: string; import: string; types: string }> = {}

	for (const entry of entries) {
		const distPrefix = entry.distPath ? `dist/${entry.distPath}/index` : 'dist/index'
		exports[entry.exportKey] = {
			require: `./${distPrefix}.cjs`,
			import: `./${distPrefix}.mjs`,
			types: `./${distPrefix}.d.ts`
		}
	}

	return exports
}

function updatePackageJson(pkgPath: string, newExports: Record<string, unknown>): void {
	const raw = readFileSync(pkgPath, 'utf-8')
	const pkg = JSON.parse(raw)
	const oldExports = JSON.stringify(pkg.exports, null, '\t')
	const updatedExports = JSON.stringify(newExports, null, '\t')

	if (oldExports === updatedExports) {
		console.log('  ℹ package.json exports 无变化，跳过写入')
		return
	}

	pkg.exports = newExports
	writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n')
}

function main(): void {
	const projectRoot = resolve(import.meta.dirname ?? __dirname, '..')
	const srcDir = join(projectRoot, 'src')
	const buildConfigPath = join(projectRoot, 'build.config.ts')
	const packageJsonPath = join(projectRoot, 'package.json')

	const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

	console.log('扫描 src/ 目录，发现入口文件...')
	const entries = scanEntries(srcDir)

	console.log(`\n发现 ${entries.length} 个入口:\n`)
	for (const entry of entries) {
		console.log(`  ${entry.entry}  →  ${entry.exportKey}  →  dist/${entry.distPath}/index.*`)
	}

	console.log('\n生成 build.config.ts...')
	const buildConfigContent = generateBuildConfig(entries, pkg.version)
	writeFileSync(buildConfigPath, buildConfigContent)
	console.log('  ✓ build.config.ts 已更新')

	console.log('\n生成 package.json exports...')
	const exports = generateExports(entries)
	updatePackageJson(packageJsonPath, exports)
	console.log('  ✓ package.json exports 已更新')

	console.log('\n✅ 自动生成完成！')
}

main()
