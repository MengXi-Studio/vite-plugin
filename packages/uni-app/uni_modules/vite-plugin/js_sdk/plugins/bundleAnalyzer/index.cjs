"use strict";const factory_index=require("../../factory/index.cjs"),u=require("node:fs"),l=require("node:path"),g=require("node:zlib"),node_util=require("node:util"),common_fs_index=require("../../common/fs/index.cjs"),common_path_index=require("../../common/path/index.cjs"),common_format_index=require("../../common/format/index.cjs");require("../../logger/index.cjs"),require("../../shared/vite-plugin.Bcg6RW2N.cjs"),require("fs"),require("path");function _interopDefaultCompat(n){return n&&typeof n=="object"&&"default"in n?n.default:n}const u__default=_interopDefaultCompat(u),l__default=_interopDefaultCompat(l),g__default=_interopDefaultCompat(g),M=node_util.promisify(g__default.gzip);async function k(n){const i=Buffer.isBuffer(n)?n:Buffer.from(n,"utf-8");return(await M(i)).length}function p(n){return n.includes("node_modules")||n.startsWith("\0")||n.startsWith("virtual:")}async function scanOutputDirectory(n,i={}){return common_fs_index.scanDirectory(n,{includeExtensions:i.includeExtensions,excludePatterns:i.excludePatterns})}function analyzeFileTypeDistribution(n){const i=n.reduce((o,a)=>o+a.size,0),e=new Map;for(const o of n){const a=o.extension||"(no ext)",t=e.get(a)||{count:0,totalSize:0};t.count++,t.totalSize+=o.size,e.set(a,t)}return Array.from(e.entries()).map(([o,{count:a,totalSize:t}])=>({extension:o,count:a,totalSize:t,percentage:i>0?Number((t/i*100).toFixed(1)):0})).sort((o,a)=>a.totalSize-o.totalSize)}function checkSizeThresholds(n,i){const e=[],o=i*1024;for(const a of n){a.size>o&&e.push({level:"chunk",name:a.name,sizeKB:Number((a.size/1024).toFixed(1)),thresholdKB:i,message:`Chunk "${a.name}" \u8D85\u8FC7\u9608\u503C: ${(a.size/1024).toFixed(1)}KB > ${i}KB`});for(const t of a.modules)t.size>o&&e.push({level:"module",name:t.id,sizeKB:Number((t.size/1024).toFixed(1)),thresholdKB:i,message:`\u6A21\u5757 "${t.id}" \u8D85\u8FC7\u9608\u503C: ${(t.size/1024).toFixed(1)}KB > ${i}KB`})}return e}function getTopModules(n,i,e){const o=[];for(const a of n)for(const t of a.modules)e&&t.isNodeModule||o.push(t);return o.sort((a,t)=>t.size-a.size).slice(0,i)}async function buildChunkStats(n,i,e={}){const{gzipSize:o=!0,excludeNodeModules:a=!1}=e,t=[];for(const r of i){const d=l__default.relative(n,r.filePath),c=common_path_index.normalizePath(d),s=r.extension;let h="chunk";s===".html"?h="entry":[".js",".mjs",".cjs",".css",".html"].includes(s)||(h="asset");let m=0;if(o)try{const y=await u__default.promises.readFile(r.filePath);m=await k(y)}catch{m=0}const f=p(d),z={id:c,size:r.size,gzipSize:m,chunks:[c],imports:[],isEntry:h==="entry",isNodeModule:f};a&&f||t.push({name:c,size:r.size,gzipSize:m,modules:[z],type:h,fileCount:1})}return t.sort((r,d)=>d.size-r.size)}async function analyzeBundle(n,i){const e=Date.now(),o=await scanOutputDirectory(n,{includeExtensions:i.includeExtensions,excludePatterns:i.excludePatterns}),a=await buildChunkStats(n,o,{gzipSize:i.gzipSize,excludeNodeModules:i.excludeNodeModules}),t=i.excludeNodeModules?o.filter(f=>!p(l__default.relative(n,f.filePath))):o,r=analyzeFileTypeDistribution(t),d=getTopModules(a,i.topModules,i.excludeNodeModules),c=checkSizeThresholds(a,i.sizeThreshold),s=a.reduce((f,z)=>f+z.size,0),h=a.reduce((f,z)=>f+z.gzipSize,0),m=Date.now()-e;return{timestamp:new Date().toISOString(),totalSize:s,totalGzipSize:h,chunks:a,topModules:d,fileTypeDistribution:r,warnings:c,comparisonDiffs:[],analysisTime:m}}async function loadPreviousReport(n){try{const i=l__default.isAbsolute(n)?n:l__default.resolve(process.cwd(),n);if(!await u__default.promises.access(i,u__default.constants.F_OK).then(()=>!0).catch(()=>!1))return null;const e=await u__default.promises.readFile(i,"utf-8");return JSON.parse(e)}catch{return null}}function compareWithPrevious(n,i){const e=[],o=new Map;for(const t of i.chunks)o.set(t.name,t.size);const a=new Map;for(const t of n.chunks)a.set(t.name,t.size);for(const[t,r]of a){const d=o.get(t);if(d===void 0)e.push({name:t,previousSize:-1,currentSize:r,diff:r,diffPercentage:100,trend:"added"});else{const c=r-d,s=d>0?Number((c/d*100).toFixed(1)):0;e.push({name:t,previousSize:d,currentSize:r,diff:c,diffPercentage:s,trend:c>0?"increased":c<0?"decreased":"unchanged"})}}for(const[t,r]of o)a.has(t)||e.push({name:t,previousSize:r,currentSize:-1,diff:-r,diffPercentage:-100,trend:"removed"});return e.sort((t,r)=>Math.abs(r.diff)-Math.abs(t.diff))}async function generateJsonReport(n,i,e){const o=l__default.join(n,`${i}.json`),a={timestamp:e.timestamp,summary:{totalSize:e.totalSize,totalGzipSize:e.totalGzipSize,totalSizeFormatted:common_format_index.formatFileSize(e.totalSize),totalGzipSizeFormatted:common_format_index.formatFileSize(e.totalGzipSize),chunkCount:e.chunks.length,warningCount:e.warnings.length,analysisTime:e.analysisTime},chunks:e.chunks.map(t=>({name:t.name,size:t.size,sizeFormatted:common_format_index.formatFileSize(t.size),gzipSize:t.gzipSize,gzipSizeFormatted:common_format_index.formatFileSize(t.gzipSize),type:t.type,fileCount:t.fileCount,modules:t.modules.map(r=>({id:r.id,size:r.size,sizeFormatted:common_format_index.formatFileSize(r.size),gzipSize:r.gzipSize,gzipSizeFormatted:common_format_index.formatFileSize(r.gzipSize),isEntry:r.isEntry,isNodeModule:r.isNodeModule,imports:r.imports}))})),topModules:e.topModules.map(t=>({id:t.id,size:t.size,sizeFormatted:common_format_index.formatFileSize(t.size),gzipSize:t.gzipSize,gzipSizeFormatted:common_format_index.formatFileSize(t.gzipSize),isNodeModule:t.isNodeModule})),fileTypeDistribution:e.fileTypeDistribution,warnings:e.warnings,comparisonDiffs:e.comparisonDiffs};return await common_fs_index.writeJsonReport(o,a),o}async function generateHtmlReport(n,i,e,o={}){const a=l__default.join(n,`${i}.html`),t=o.defaultChartType||"treemap",r=e.chunks.map(f=>({name:f.name,size:f.size,gzipSize:f.gzipSize,type:f.type})),d=e.fileTypeDistribution,c=e.warnings,s=e.comparisonDiffs,h=e.topModules.slice(0,10),m=x(e,r,d,c,s,h,t);return await common_fs_index.writeFileContent(a,m),a}function x(n,i,e,o,a,t,r){const d=common_format_index.formatFileSize(n.totalSize),c=common_format_index.formatFileSize(n.totalGzipSize);return`<!DOCTYPE html>
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
<div class="meta">Generated: ${n.timestamp} | Analysis time: ${n.analysisTime}ms</div>
</div>

<div class="summary-cards">
<div class="card">
<div class="label">Total Size</div>
<div class="value">${d}</div>
<div class="sub">gzip: ${c}</div>
</div>
<div class="card">
<div class="label">Chunks</div>
<div class="value">${n.chunks.length}</div>
<div class="sub">entry: ${n.chunks.filter(s=>s.type==="entry").length} | chunk: ${n.chunks.filter(s=>s.type==="chunk").length} | asset: ${n.chunks.filter(s=>s.type==="asset").length}</div>
</div>
<div class="card">
<div class="label">Warnings</div>
<div class="value">${o.length}</div>
<div class="sub">${o.length>0?"threshold exceeded":"all within limits"}</div>
</div>
<div class="card">
<div class="label">File Types</div>
<div class="value">${e.length}</div>
<div class="sub">extensions detected</div>
</div>
</div>

${o.length>0?`
<div class="section">
<h2>Warnings</h2>
${o.map(s=>`<div class="warning ${s.sizeKB>s.thresholdKB*2?"critical":""}"><strong>${s.level.toUpperCase()}</strong>: ${s.message}</div>`).join("")}
</div>
`:""}

<div class="section">
<h2>Size Distribution</h2>
<div class="chart-tabs">
<button class="chart-tab ${r==="treemap"?"active":""}" onclick="switchChart('treemap')">Treemap</button>
<button class="chart-tab ${r==="sunburst"?"active":""}" onclick="switchChart('sunburst')">Sunburst</button>
<button class="chart-tab ${r==="list"?"active":""}" onclick="switchChart('list')">List</button>
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
${t.map((s,h)=>`<tr><td>${h+1}</td><td title="${s.id}">${s.id.length>60?s.id.slice(0,57)+"...":s.id}</td><td>${common_format_index.formatFileSize(s.size)}</td><td>${common_format_index.formatFileSize(s.gzipSize)}</td><td>${s.isNodeModule?"node_modules":"source"}</td></tr>`).join("")}
</tbody>
</table>
</div>

${a.length>0?`
<div class="section">
<h2>Comparison with Previous Build</h2>
<table>
<thead><tr><th>Name</th><th>Previous</th><th>Current</th><th>Diff</th><th>Trend</th></tr></thead>
<tbody>
${a.slice(0,20).map(s=>{const h=s.trend==="increased"?"diff-positive":s.trend==="decreased"?"diff-negative":s.trend==="added"?"diff-added":s.trend==="removed"?"diff-removed":"diff-unchanged",m=s.trend==="increased"?"&#9650;":s.trend==="decreased"?"&#9660;":s.trend==="added"?"&#10010;":s.trend==="removed"?"&#10006;":"&#9644;";return`<tr><td>${s.name}</td><td>${s.previousSize>=0?common_format_index.formatFileSize(s.previousSize):"-"}</td><td>${s.currentSize>=0?common_format_index.formatFileSize(s.currentSize):"-"}</td><td class="${h}">${s.diff>=0?"+":""}${common_format_index.formatFileSize(Math.abs(s.diff))} (${s.diffPercentage}%)</td><td class="${h}">${m} ${s.trend}</td></tr>`}).join("")}
</tbody>
</table>
</div>
`:""}

<div class="section">
<h2>All Chunks</h2>
<table>
<thead><tr><th>Name</th><th>Size</th><th>gzip</th><th>Type</th><th>Proportion</th></tr></thead>
<tbody>
${n.chunks.map(s=>{const h=n.totalSize>0?s.size/n.totalSize*100:0;return`<tr><td title="${s.name}">${s.name.length>50?s.name.slice(0,47)+"...":s.name}</td><td>${common_format_index.formatFileSize(s.size)}</td><td>${common_format_index.formatFileSize(s.gzipSize)}</td><td>${s.type}</td><td><div class="bar-bg"><div class="bar" style="width:${h}%"></div></div><span style="font-size:11px;color:#888;">${h.toFixed(1)}%</span></td></tr>`}).join("")}
</tbody>
</table>
</div>
</div>

<script>
const chartData = ${JSON.stringify(i)};
const totalSize = ${n.totalSize};
const distributionData = ${JSON.stringify(e)};
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
		return '<div class="treemap-item" style="flex:' + flex + ' ' + flex + ' 0;background:' + COLORS[i % COLORS.length] + ';" title="' + d.name + ': ${common_format_index.formatFileSize(0)}'.replace('0B', formatBytes(d.size)) + '"><span class="name">' + d.name.split('/').pop() + '</span><span class="size">' + formatBytes(d.size) + '</span></div>';
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
	container.innerHTML = '<div style="text-align:center"><svg width="400" height="400" viewBox="0 0 400 400">' + paths + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r1 - 1) + '" fill="white"/><text x="' + cx + '" y="' + cy + '" text-anchor="middle" dy="-6" font-size="14" font-weight="600">${d}</text><text x="' + cx + '" y="' + cy + '" text-anchor="middle" dy="14" font-size="11" fill="#888">total</text></svg></div>';
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

renderChart('${r}');
renderPieChart();
<\/script>
</body>
</html>`}class $ extends factory_index.BasePlugin{analysisResult=null;getDefaultOptions(){return{outputFormat:"json",outputFile:"bundle-analysis",openAnalyzer:!1,sizeThreshold:100,topModules:20,compareWith:null,gzipSize:!0,excludeNodeModules:!1,excludePatterns:[],includeExtensions:[],defaultChartType:"treemap"}}validateOptions(){this.validator.field("outputFormat").enum(["json","html","both"]).field("openAnalyzer").boolean().field("sizeThreshold").number().minValue(0).field("topModules").number().minValue(1).field("gzipSize").boolean().field("excludeNodeModules").boolean().field("defaultChartType").enum(["treemap","sunburst","list"]).validate()}getPluginName(){return"bundle-analyzer"}getEnforce(){return"post"}addPluginHooks(i){i.writeBundle={order:"post",handler:async()=>{await this.safeExecute(()=>this.runAnalysis(),"\u5206\u6790\u6784\u5EFA\u4EA7\u7269")}}}async runAnalysis(){if(!this.viteConfig)return;const i=this.viteConfig.build.outDir;this.analysisResult=await analyzeBundle(i,this.options),this.options.compareWith&&await this.performComparison(),this.logSummary(),this.logWarnings(),await this.generateReports(i),this.options.openAnalyzer&&(this.options.outputFormat==="html"||this.options.outputFormat==="both")&&await this.openHtmlReport(i)}async performComparison(){if(!this.analysisResult||!this.options.compareWith)return;const i=await loadPreviousReport(this.options.compareWith);if(!i){this.logger.info(`\u672A\u627E\u5230\u5BF9\u6BD4\u62A5\u544A: ${this.options.compareWith}\uFF0C\u8DF3\u8FC7\u5BF9\u6BD4\u5206\u6790`);return}const e=compareWithPrevious(this.analysisResult,i);if(this.analysisResult.comparisonDiffs=e,e.length>0){const o=e.filter(d=>d.trend==="increased").length,a=e.filter(d=>d.trend==="decreased").length,t=e.filter(d=>d.trend==="added").length,r=e.filter(d=>d.trend==="removed").length;this.logger.info(`\u6784\u5EFA\u5BF9\u6BD4: ${o} \u4E2A\u589E\u5927, ${a} \u4E2A\u51CF\u5C0F, ${t} \u4E2A\u65B0\u589E, ${r} \u4E2A\u79FB\u9664`)}}async generateReports(i){if(!this.analysisResult)return;const{outputFormat:e,outputFile:o}=this.options;if(e==="json"||e==="both"){const a=await generateJsonReport(i,o,this.analysisResult);this.logger.info(`JSON \u62A5\u544A\u5DF2\u751F\u6210: ${a}`)}if(e==="html"||e==="both"){const a=await generateHtmlReport(i,o,this.analysisResult,{defaultChartType:this.options.defaultChartType});this.logger.info(`HTML \u62A5\u544A\u5DF2\u751F\u6210: ${a}`)}}async openHtmlReport(i){const e=`${i}/${this.options.outputFile}.html`;try{const{exec:o}=await import("node:child_process"),a=process.platform;o(a==="win32"?`start "" "${e}"`:a==="darwin"?`open "${e}"`:`xdg-open "${e}"`),this.logger.info(`\u5DF2\u5728\u6D4F\u89C8\u5668\u4E2D\u6253\u5F00\u62A5\u544A: ${e}`)}catch{this.logger.warn(`\u65E0\u6CD5\u81EA\u52A8\u6253\u5F00\u6D4F\u89C8\u5668\uFF0C\u8BF7\u624B\u52A8\u6253\u5F00: ${e}`)}}logSummary(){if(!this.analysisResult)return;const{chunks:i,totalSize:e,totalGzipSize:o,analysisTime:a}=this.analysisResult;this.logger.success(`\u4EA7\u7269\u5206\u6790\u5B8C\u6210: ${i.length} \u4E2A chunk, \u603B\u4F53\u79EF: ${common_format_index.formatFileSize(e)} (gzip: ${common_format_index.formatFileSize(o)}), \u5206\u6790\u8017\u65F6: ${a}ms`);const t=i.filter(c=>c.type==="entry").length,r=i.filter(c=>c.type==="chunk").length,d=i.filter(c=>c.type==="asset").length;if((t>0||r>0||d>0)&&this.logger.info(`  \u5165\u53E3: ${t} | \u4EE3\u7801\u5757: ${r} | \u8D44\u6E90: ${d}`),this.analysisResult.topModules.length>0){this.logger.info("\u4F53\u79EF Top 5 \u6A21\u5757:");const c=this.analysisResult.topModules.slice(0,5);for(let s=0;s<c.length;s++){const h=c[s],m=h.isNodeModule?"node_modules":"source";this.logger.info(`  ${s+1}. ${common_format_index.formatFileSize(h.size)} (${m}) ${h.id}`)}}}logWarnings(){if(!(!this.analysisResult||this.analysisResult.warnings.length===0)){this.logger.warn(`\u53D1\u73B0 ${this.analysisResult.warnings.length} \u4E2A\u4F53\u79EF\u544A\u8B66:`);for(const i of this.analysisResult.warnings){const e=i.sizeKB>i.thresholdKB*2?"\u{1F534}":"\u{1F7E1}";this.logger.warn(`  ${e} ${i.message}`)}}}getResult(){return this.analysisResult}}const bundleAnalyzer=factory_index.createPluginFactory($);exports.bundleAnalyzer=bundleAnalyzer;
