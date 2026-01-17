module.exports = {
	// 解析器
	parser: '@typescript-eslint/parser',
	// 解析器选项
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		extraFileExtensions: ['.vue']
	},
	// 环境
	env: {
		node: true,
		browser: true,
		es2020: true
	},
	// 规则
	rules: {
		// 基本规则
		'no-console': 'off',
		'no-unused-vars': 'warn',
		'no-undef': 'off'
	}
}
