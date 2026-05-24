import type { HtmlTagDescriptor } from 'vite'
import type { IconOptions } from './type'

/**
 * 生成 HtmlTagDescriptor 数组（Vite 原生 API，更可靠）
 *
 * @param options - 图标配置选项
 * @returns 生成的 HtmlTagDescriptor 数组
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
