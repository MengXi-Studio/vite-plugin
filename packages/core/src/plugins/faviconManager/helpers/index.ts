import type { HtmlTagDescriptor } from 'vite'
import type { IconOptions } from './type'

/**
 * 根据图标配置生成 HtmlTagDescriptor 数组
 *
 * @param {IconOptions} options - 图标配置选项
 * @returns {HtmlTagDescriptor[]} 生成的 HtmlTagDescriptor 数组
 *
 * @description 根据配置的优先级生成图标标签描述符：
 * 1. 如果提供了 `link`（自定义完整标签），返回空数组，由调用方使用字符串方式处理
 * 2. 如果提供了 `icons` 数组，为每个图标生成对应的 `<link>` 标签
 * 3. 如果提供了 `url`，生成指向该 URL 的标准 favicon 标签
 * 4. 默认使用 `base` 路径拼接 `favicon.ico`
 *
 * @example
 * ```typescript
 * const descriptors = generateIconTagDescriptors({
 *   base: '/assets',
 *   icons: [
 *     { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }
 *   ]
 * })
 * // 返回 [{ tag: 'link', attrs: { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }, injectTo: 'head' }]
 * ```
 */
export function generateIconTagDescriptors(options: IconOptions): HtmlTagDescriptor[] {
	const descriptors: HtmlTagDescriptor[] = []

	// 如果提供了完整的 link 标签，返回空数组，让调用者使用字符串方式处理
	if (options.link) {
		return []
	}

	// 如果提供了自定义图标数组，使用它们
	if (options.icons && options.icons.length > 0) {
		for (const icon of options.icons) {
			const attrs: Record<string, string | boolean> = {
				rel: icon.rel,
				href: icon.href
			}
			if (icon.sizes) attrs.sizes = icon.sizes
			if (icon.type) attrs.type = icon.type

			descriptors.push({
				tag: 'link',
				attrs,
				injectTo: 'head'
			})
		}
	} else if (options.url) {
		// 如果提供了完整 URL，生成标准 link 标签
		descriptors.push({
			tag: 'link',
			attrs: {
				rel: 'icon',
				href: options.url
			},
			injectTo: 'head'
		})
	} else {
		// 使用 base 路径 + 默认 favicon.ico
		const base = options.base || '/'
		const iconUrl = base.endsWith('/') ? `${base}favicon.ico` : `${base}/favicon.ico`
		descriptors.push({
			tag: 'link',
			attrs: {
				rel: 'icon',
				href: iconUrl
			},
			injectTo: 'head'
		})
	}

	return descriptors
}
