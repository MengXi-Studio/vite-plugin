import type { IconOptions } from './type'

/**
 * 生成图标标签数组
 *
 * @param options - 图标配置选项
 * @returns 生成的图标标签数组
 */
export function generateIconTags(options: IconOptions): string[] {
	const tags: string[] = []

	// 如果提供了完整的 link 标签，直接使用
	if (options.link) {
		tags.push(options.link)
		return tags
	}

	// 如果提供了自定义图标数组，使用它们
	if (options.icons && options.icons.length > 0) {
		tags.push(
			...options.icons.map(icon => {
				let tag = `<link rel="${icon.rel}" href="${icon.href}"`
				if (icon.sizes) tag += ` sizes="${icon.sizes}"`
				if (icon.type) tag += ` type="${icon.type}"`
				tag += ' />'
				return tag
			})
		)
	} else if (options.url) {
		// 如果提供了完整 URL，生成标准 link 标签
		tags.push(`<link rel="icon" href="${options.url}" />`)
	} else {
		// 使用 base 路径 + 默认 favicon.ico
		const base = options.base || '/'
		const iconUrl = base.endsWith('/') ? `${base}favicon.ico` : `${base}/favicon.ico`
		tags.push(`<link rel="icon" href="${iconUrl}" />`)
	}

	return tags
}
