import path from 'node:path'
import type { BundleAnalysisResult, ComparisonDiff, FileTypeDistribution, SizeWarning } from '../types'
import { writeFileContent, writeJsonReport } from '@/common/fs'
import { formatFileSize } from '@/common/format'

/**
 * 生成 JSON 格式的分析报告
 *
 * @async
 * @param {string} outDir - 构建输出目录
 * @param {string} outputFileName - 输出文件名（不含扩展名）
 * @param {BundleAnalysisResult} result - 分析结果
 * @returns {Promise<string>} 生成的报告文件路径
 *
 * @description 将分析结果序列化为 JSON 格式并写入文件，
 * 包含时间戳、总体统计、chunk 详情、模块排行、文件类型分布、告警和对比差异。
 *
 * @example
 * ```typescript
 * const reportPath = await generateJsonReport('dist', 'bundle-analysis', result)
 * console.log(`报告已生成: ${reportPath}`)
 * ```
 */
export async function generateJsonReport(outDir: string, outputFileName: string, result: BundleAnalysisResult): Promise<string> {
	const outputPath = path.join(outDir, `${outputFileName}.json`)

	const report = {
		timestamp: result.timestamp,
		summary: {
			totalSize: result.totalSize,
			totalGzipSize: result.totalGzipSize,
			totalSizeFormatted: formatFileSize(result.totalSize),
			totalGzipSizeFormatted: formatFileSize(result.totalGzipSize),
			chunkCount: result.chunks.length,
			warningCount: result.warnings.length,
			analysisTime: result.analysisTime
		},
		chunks: result.chunks.map(chunk => ({
			name: chunk.name,
			size: chunk.size,
			sizeFormatted: formatFileSize(chunk.size),
			gzipSize: chunk.gzipSize,
			gzipSizeFormatted: formatFileSize(chunk.gzipSize),
			type: chunk.type,
			fileCount: chunk.fileCount,
			modules: chunk.modules.map(mod => ({
				id: mod.id,
				size: mod.size,
				sizeFormatted: formatFileSize(mod.size),
				gzipSize: mod.gzipSize,
				gzipSizeFormatted: formatFileSize(mod.gzipSize),
				isEntry: mod.isEntry,
				isNodeModule: mod.isNodeModule,
				imports: mod.imports
			}))
		})),
		topModules: result.topModules.map(mod => ({
			id: mod.id,
			size: mod.size,
			sizeFormatted: formatFileSize(mod.size),
			gzipSize: mod.gzipSize,
			gzipSizeFormatted: formatFileSize(mod.gzipSize),
			isNodeModule: mod.isNodeModule
		})),
		fileTypeDistribution: result.fileTypeDistribution,
		warnings: result.warnings,
		comparisonDiffs: result.comparisonDiffs
	}

	await writeJsonReport(outputPath, report)
	return outputPath
}

/**
 * 生成 HTML 格式的可视化分析报告
 *
 * @async
 * @param {string} outDir - 构建输出目录
 * @param {string} outputFileName - 输出文件名（不含扩展名）
 * @param {BundleAnalysisResult} result - 分析结果
 * @param {object} options - 生成选项
 * @param {'treemap' | 'sunburst' | 'list'} [options.defaultChartType] - 默认图表类型
 * @returns {Promise<string>} 生成的报告文件路径
 *
 * @description 生成包含内联 SVG 可视化图表的 HTML 报告，
 * 支持树状图（treemap）、旭日图（sunburst）和列表（list）三种展示形式。
 * 所有 CSS 和 JavaScript 均内联，无需额外依赖。
 */
export async function generateHtmlReport(outDir: string, outputFileName: string, result: BundleAnalysisResult, options: { defaultChartType?: 'treemap' | 'sunburst' | 'list' } = {}): Promise<string> {
	const outputPath = path.join(outDir, `${outputFileName}.html`)
	const chartType = options.defaultChartType || 'treemap'

	const chartData = result.chunks.map(chunk => ({
		name: chunk.name,
		size: chunk.size,
		gzipSize: chunk.gzipSize,
		type: chunk.type
	}))

	const distributionData = result.fileTypeDistribution
	const warningsData = result.warnings
	const comparisonData = result.comparisonDiffs
	const topModulesData = result.topModules.slice(0, 10)

	const html = buildHtmlTemplate(result, chartData, distributionData, warningsData, comparisonData, topModulesData, chartType)

	await writeFileContent(outputPath, html)
	return outputPath
}

/**
 * 构建完整的 HTML 报告模板
 *
 * @param {BundleAnalysisResult} result - 分析结果数据
 * @param {Array<{ name: string; size: number; gzipSize: number; type: string }>} chartData - 图表渲染数据，包含每个 chunk 的名称、大小、gzip 大小和类型
 * @param {FileTypeDistribution[]} distributionData - 文件类型分布统计数据，用于饼图渲染
 * @param {SizeWarning[]} warningsData - 体积阈值告警列表，用于告警区域渲染
 * @param {ComparisonDiff[]} comparisonData - 构建对比差异列表，用于对比区域渲染
 * @param {Array<{ id: string; size: number; gzipSize: number; isNodeModule: boolean }>} topModulesData - Top N 大模块数据，用于模块排行表渲染
 * @param {string} defaultChartType - 默认图表展示类型（'treemap' | 'sunburst' | 'list'）
 * @returns {string} 完整的 HTML 报告字符串，包含内联 CSS 和 JavaScript
 *
 * @description 生成自包含的 HTML 报告页面，所有样式和脚本均内联。
 * 报告包含：概览卡片、告警列表、尺寸分布图表（支持三种展示形式切换）、
 * 文件类型分布饼图、Top 模块排行表、构建对比差异表和完整 chunk 列表。
 */
function buildHtmlTemplate(
	result: BundleAnalysisResult,
	chartData: Array<{ name: string; size: number; gzipSize: number; type: string }>,
	distributionData: FileTypeDistribution[],
	warningsData: SizeWarning[],
	comparisonData: ComparisonDiff[],
	topModulesData: Array<{ id: string; size: number; gzipSize: number; isNodeModule: boolean }>,
	defaultChartType: string
): string {
	const totalSizeFormatted = formatFileSize(result.totalSize)
	const totalGzipFormatted = formatFileSize(result.totalGzipSize)

	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bundle Analysis Report</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f7fa; color: #333; line-height: 1.6; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 24px; }
.header h1 { font-size: 24px; margin-bottom: 8px; }
.header .meta { font-size: 14px; opacity: 0.9; }
.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.card .label { font-size: 13px; color: #888; margin-bottom: 4px; }
.card .value { font-size: 24px; font-weight: 700; color: #333; }
.card .sub { font-size: 12px; color: #aaa; margin-top: 2px; }
.section { background: white; border-radius: 10px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.section h2 { font-size: 18px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #f0f0f0; }
.chart-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.chart-tab { padding: 6px 16px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.chart-tab.active { background: #667eea; color: white; border-color: #667eea; }
.chart-container { min-height: 400px; position: relative; }
.treemap { display: flex; flex-wrap: wrap; gap: 2px; }
.treemap-item { border-radius: 4px; padding: 8px; color: white; font-size: 11px; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; cursor: pointer; transition: opacity 0.2s; min-width: 40px; min-height: 40px; }
.treemap-item:hover { opacity: 0.85; }
.treemap-item .name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.treemap-item .size { font-size: 10px; opacity: 0.9; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f0f0f0; }
th { background: #fafafa; font-weight: 600; color: #555; position: sticky; top: 0; }
tr:hover { background: #f8f9ff; }
.bar { height: 8px; border-radius: 4px; background: #667eea; transition: width 0.3s; }
.bar-bg { width: 100%; height: 8px; border-radius: 4px; background: #f0f0f0; }
.warning { background: #fff8e1; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-bottom: 8px; font-size: 13px; }
.warning.critical { background: #ffebee; border-left-color: #f44336; }
.diff-positive { color: #f44336; }
.diff-negative { color: #4caf50; }
.diff-added { color: #2196f3; }
.diff-removed { color: #9e9e9e; }
.diff-unchanged { color: #bbb; }
.pie-chart { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.pie-svg { flex-shrink: 0; }
.pie-legend { flex: 1; min-width: 200px; }
.legend-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; }
.legend-color { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.empty-state { text-align: center; padding: 40px; color: #aaa; }
@media (max-width: 768px) { .container { padding: 12px; } .summary-cards { grid-template-columns: repeat(2, 1fr); } }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>Bundle Analysis Report</h1>
<div class="meta">Generated: ${result.timestamp} | Analysis time: ${result.analysisTime}ms</div>
</div>

<div class="summary-cards">
<div class="card">
<div class="label">Total Size</div>
<div class="value">${totalSizeFormatted}</div>
<div class="sub">gzip: ${totalGzipFormatted}</div>
</div>
<div class="card">
<div class="label">Chunks</div>
<div class="value">${result.chunks.length}</div>
<div class="sub">entry: ${result.chunks.filter(c => c.type === 'entry').length} | chunk: ${result.chunks.filter(c => c.type === 'chunk').length} | asset: ${result.chunks.filter(c => c.type === 'asset').length}</div>
</div>
<div class="card">
<div class="label">Warnings</div>
<div class="value">${warningsData.length}</div>
<div class="sub">${warningsData.length > 0 ? 'threshold exceeded' : 'all within limits'}</div>
</div>
<div class="card">
<div class="label">File Types</div>
<div class="value">${distributionData.length}</div>
<div class="sub">extensions detected</div>
</div>
</div>

${
	warningsData.length > 0
		? `
<div class="section">
<h2>Warnings</h2>
${warningsData.map(w => `<div class="warning ${w.sizeKB > w.thresholdKB * 2 ? 'critical' : ''}"><strong>${w.level.toUpperCase()}</strong>: ${w.message}</div>`).join('')}
</div>
`
		: ''
}

<div class="section">
<h2>Size Distribution</h2>
<div class="chart-tabs">
<button class="chart-tab ${defaultChartType === 'treemap' ? 'active' : ''}" onclick="switchChart('treemap')">Treemap</button>
<button class="chart-tab ${defaultChartType === 'sunburst' ? 'active' : ''}" onclick="switchChart('sunburst')">Sunburst</button>
<button class="chart-tab ${defaultChartType === 'list' ? 'active' : ''}" onclick="switchChart('list')">List</button>
</div>
<div class="chart-container" id="chartContainer"></div>
</div>

<div class="section">
<h2>File Type Distribution</h2>
<div class="pie-chart">
<div class="pie-svg" id="pieChart"></div>
<div class="pie-legend" id="pieLegend"></div>
</div>
</div>

<div class="section">
<h2>Top Modules</h2>
<table>
<thead><tr><th>#</th><th>Module</th><th>Size</th><th>gzip</th><th>Type</th></tr></thead>
<tbody>
${topModulesData.map((m, i) => `<tr><td>${i + 1}</td><td title="${m.id}">${m.id.length > 60 ? m.id.slice(0, 57) + '...' : m.id}</td><td>${formatFileSize(m.size)}</td><td>${formatFileSize(m.gzipSize)}</td><td>${m.isNodeModule ? 'node_modules' : 'source'}</td></tr>`).join('')}
</tbody>
</table>
</div>

${
	comparisonData.length > 0
		? `
<div class="section">
<h2>Comparison with Previous Build</h2>
<table>
<thead><tr><th>Name</th><th>Previous</th><th>Current</th><th>Diff</th><th>Trend</th></tr></thead>
<tbody>
${comparisonData
	.slice(0, 20)
	.map(d => {
		const trendClass = d.trend === 'increased' ? 'diff-positive' : d.trend === 'decreased' ? 'diff-negative' : d.trend === 'added' ? 'diff-added' : d.trend === 'removed' ? 'diff-removed' : 'diff-unchanged'
		const trendIcon = d.trend === 'increased' ? '&#9650;' : d.trend === 'decreased' ? '&#9660;' : d.trend === 'added' ? '&#10010;' : d.trend === 'removed' ? '&#10006;' : '&#9644;'
		return `<tr><td>${d.name}</td><td>${d.previousSize >= 0 ? formatFileSize(d.previousSize) : '-'}</td><td>${d.currentSize >= 0 ? formatFileSize(d.currentSize) : '-'}</td><td class="${trendClass}">${d.diff >= 0 ? '+' : ''}${formatFileSize(Math.abs(d.diff))} (${d.diffPercentage}%)</td><td class="${trendClass}">${trendIcon} ${d.trend}</td></tr>`
	})
	.join('')}
</tbody>
</table>
</div>
`
		: ''
}

<div class="section">
<h2>All Chunks</h2>
<table>
<thead><tr><th>Name</th><th>Size</th><th>gzip</th><th>Type</th><th>Proportion</th></tr></thead>
<tbody>
${result.chunks
	.map(c => {
		const pct = result.totalSize > 0 ? (c.size / result.totalSize) * 100 : 0
		return `<tr><td title="${c.name}">${c.name.length > 50 ? c.name.slice(0, 47) + '...' : c.name}</td><td>${formatFileSize(c.size)}</td><td>${formatFileSize(c.gzipSize)}</td><td>${c.type}</td><td><div class="bar-bg"><div class="bar" style="width:${pct}%"></div></div><span style="font-size:11px;color:#888;">${pct.toFixed(1)}%</span></td></tr>`
	})
	.join('')}
</tbody>
</table>
</div>
</div>

<script>
const chartData = ${JSON.stringify(chartData)};
const totalSize = ${result.totalSize};
const distributionData = ${JSON.stringify(distributionData)};
const COLORS = ['#667eea','#764ba2','#f093fb','#f5576c','#4facfe','#00f2fe','#43e97b','#fa709a','#fee140','#a18cd1','#fbc2eb','#a6c1ee','#ffecd2','#fcb69f','#ff9a9e','#fad0c4'];

function switchChart(type) {
	document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
	event.target.classList.add('active');
	renderChart(type);
}

function renderChart(type) {
	const container = document.getElementById('chartContainer');
	if (type === 'treemap') renderTreemap(container);
	else if (type === 'sunburst') renderSunburst(container);
	else renderList(container);
}

function renderTreemap(container) {
	const items = chartData.map((d, i) => {
		const pct = totalSize > 0 ? (d.size / totalSize * 100) : 0;
		const flex = Math.max(pct * 3, 2);
		return '<div class="treemap-item" style="flex:' + flex + ' ' + flex + ' 0;background:' + COLORS[i % COLORS.length] + ';" title="' + d.name + ': ${formatFileSize(0)}'.replace('0B', formatBytes(d.size)) + '"><span class="name">' + d.name.split('/').pop() + '</span><span class="size">' + formatBytes(d.size) + '</span></div>';
	});
	container.innerHTML = '<div class="treemap">' + items.join('') + '</div>';
}

function renderSunburst(container) {
	const cx = 200, cy = 200, r1 = 80, r2 = 160;
	let paths = '';
	let startAngle = 0;
	const sorted = [...chartData].sort((a, b) => b.size - a.size);
	sorted.forEach((d, i) => {
		const angle = totalSize > 0 ? (d.size / totalSize) * Math.PI * 2 : 0;
		const endAngle = startAngle + angle;
		const x1 = cx + r1 * Math.cos(startAngle);
		const y1 = cy + r1 * Math.sin(startAngle);
		const x2 = cx + r2 * Math.cos(startAngle);
		const y2 = cy + r2 * Math.sin(startAngle);
		const x3 = cx + r2 * Math.cos(endAngle);
		const y3 = cy + r2 * Math.sin(endAngle);
		const x4 = cx + r1 * Math.cos(endAngle);
		const y4 = cy + r1 * Math.sin(endAngle);
		const largeArc = angle > Math.PI ? 1 : 0;
		paths += '<path d="M' + x1 + ',' + y1 + 'L' + x2 + ',' + y2 + 'A' + r2 + ',' + r2 + ' 0 ' + largeArc + ',1 ' + x3 + ',' + y3 + 'L' + x4 + ',' + y4 + 'A' + r1 + ',' + r1 + ' 0 ' + largeArc + ',0 ' + x1 + ',' + y1 + '" fill="' + COLORS[i % COLORS.length] + '" opacity="0.85" style="cursor:pointer" title="' + d.name + ': ' + formatBytes(d.size) + '"/>';
		startAngle = endAngle;
	});
	container.innerHTML = '<div style="text-align:center"><svg width="400" height="400" viewBox="0 0 400 400">' + paths + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r1 - 1) + '" fill="white"/><text x="' + cx + '" y="' + cy + '" text-anchor="middle" dy="-6" font-size="14" font-weight="600">${totalSizeFormatted}</text><text x="' + cx + '" y="' + cy + '" text-anchor="middle" dy="14" font-size="11" fill="#888">total</text></svg></div>';
}

function renderList(container) {
	const rows = [...chartData].sort((a, b) => b.size - a.size).map((d, i) => {
		const pct = totalSize > 0 ? (d.size / totalSize * 100).toFixed(1) : '0.0';
		return '<tr><td>' + (i+1) + '</td><td title="' + d.name + '">' + d.name + '</td><td>' + formatBytes(d.size) + '</td><td>' + formatBytes(d.gzipSize) + '</td><td>' + d.type + '</td><td><div class="bar-bg"><div class="bar" style="width:' + pct + '%"></div></div>' + pct + '%</td></tr>';
	});
	container.innerHTML = '<table><thead><tr><th>#</th><th>Name</th><th>Size</th><th>gzip</th><th>Type</th><th>Proportion</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>';
}

function formatBytes(bytes) {
	if (bytes < 1024) return bytes + 'B';
	if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
	return (bytes / 1048576).toFixed(2) + 'MB';
}

function renderPieChart() {
	const svg = document.getElementById('pieChart');
	const legend = document.getElementById('pieLegend');
	const cx = 100, cy = 100, r = 90;
	let paths = '';
	let startAngle = -Math.PI / 2;
	const items = distributionData.slice(0, 8);
	const otherPct = distributionData.slice(8).reduce((s, d) => s + d.percentage, 0);
	if (otherPct > 0) items.push({ extension: '(other)', count: 0, totalSize: 0, percentage: otherPct });

	items.forEach((d, i) => {
		const angle = (d.percentage / 100) * Math.PI * 2;
		const endAngle = startAngle + angle;
		const x1 = cx + r * Math.cos(startAngle);
		const y1 = cy + r * Math.sin(startAngle);
		const x2 = cx + r * Math.cos(endAngle);
		const y2 = cy + r * Math.sin(endAngle);
		const largeArc = angle > Math.PI ? 1 : 0;
		paths += '<path d="M' + cx + ',' + cy + 'L' + x1 + ',' + y1 + 'A' + r + ',' + r + ' 0 ' + largeArc + ',1 ' + x2 + ',' + y2 + 'Z" fill="' + COLORS[i % COLORS.length] + '" opacity="0.85"/>';
		startAngle = endAngle;
	});

	svg.innerHTML = '<svg width="200" height="200" viewBox="0 0 200 200">' + paths + '</svg>';
	legend.innerHTML = items.map((d, i) => '<div class="legend-item"><div class="legend-color" style="background:' + COLORS[i % COLORS.length] + '"></div><span>' + d.extension + ' (' + d.percentage.toFixed(1) + '%)</span></div>').join('');
}

renderChart('${defaultChartType}');
renderPieChart();
</script>
</body>
</html>`
}
