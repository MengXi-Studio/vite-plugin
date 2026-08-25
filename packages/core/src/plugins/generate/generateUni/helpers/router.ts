import path from 'node:path'
import fs from 'node:fs'
import { writeFileContent } from '@/common/fs'
import type { UniAppPagesJson } from '../../types'
import type { GenerateRouterOptions } from '../../generateRouter/types'
import { parsePagesJson, mergeRoutes, generateFileContent, extractExistingRoutes, extractExistingRawRoutes, generateRouterDtsContent } from '../../generateRouter/helpers'

/**
 * 阶段二：基于内存 pages 对象生成路由配置，并写入 router 文件（+ 可选 dts）
 *
 * @param projectRoot 项目根目录（绝对路径）
 * @param pagesJson 阶段一产出的 pages 对象（内存直传，不重新读盘）
 * @param options 路由生成参数（等价 generateRouter 选项）
 *
 * @description 复用 `generateRouter/helpers` 的解析/合并/生成函数，与 `generateRouter`
 * 唯一差异是 pages 数据来源：此处为内存对象而非读文件。
 */
export async function generateRouterFromPages(projectRoot: string, pagesJson: UniAppPagesJson, options: GenerateRouterOptions): Promise<void> {
	const { routes } = parsePagesJson(pagesJson, options)
	const outputPath = path.resolve(projectRoot, options.outputPath!)

	// 合并用户对路由配置的修改（复用 generateRouter 的保留策略）
	let existingRawTexts: Map<string, string> | undefined
	if (options.preserveRouteChanges && fs.existsSync(outputPath)) {
		try {
			const existingContent = await fs.promises.readFile(outputPath, 'utf-8')
			const existingRoutesMap = extractExistingRoutes(existingContent)
			existingRawTexts = extractExistingRawRoutes(existingContent)
			if (existingRoutesMap.size > 0) {
				const merged = mergeRoutes(routes, existingRoutesMap)
				routes.splice(0, routes.length, ...merged)
			}
		} catch {
			// 读取失败时忽略，继续生成新文件
		}
	}

	// 生成并写入 router 文件
	const content = generateFileContent(routes, options, existingRawTexts)
	await writeFileContent(outputPath, content)

	// 可选：生成路由类型声明
	if (options.dts) {
		const dtsPath = path.resolve(projectRoot, typeof options.dts === 'string' ? options.dts : 'src/router.d.ts')
		const dtsContent = generateRouterDtsContent(routes)
		await writeFileContent(dtsPath, dtsContent)
	}
}
