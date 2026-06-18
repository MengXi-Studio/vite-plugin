"use strict";const factory_index=require("../../factory/index.cjs"),common_fs_index=require("../../common/fs/index.cjs"),o=require("path"),s$1=require("fs");require("../../logger/index.cjs"),require("../../shared/vite-plugin.Bcg6RW2N.cjs"),require("../../common/concurrency/index.cjs");function toCamelCase(t,e=/[/-]/){return t.replace(/^\/+/,"").split(e).filter(Boolean).map((n,i)=>i===0?n.toLowerCase():n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join("")}function toPascalCase(t,e=/[/-]/){return t.replace(/^\/+/,"").split(e).filter(Boolean).map(n=>n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join("")}function stripJsonComments(t){return t.replace(/\/\/.*$/gm,"").replace(/\/\*[\s\S]*?\*\//g,"")}function s(t,e){return typeof e=="string"?"string":typeof e=="boolean"?e?"true":"false":typeof e=="number"?"number":"unknown"}function u(t){const e=Object.entries(t);return e.length===0?"{}":`{ ${e.map(([n,i])=>`${n}: ${s(n,i)}`).join("; ")} }`}function generateRouterDtsContent(t,e="@meng-xi/uni-router"){const n=[];n.push(`import '${e}'`),n.push(""),n.push(`declare module '${e}' {`),n.push("  interface RouteNameMap {");for(const i of t){const r=i.name||i.path;i.meta?.title&&n.push(`    /** ${i.meta.title} */`);const g=i.meta?u(i.meta):"{}";n.push(`    ${r}: { path: '${i.path}'; meta: ${g} }`)}return n.push("  }"),n.push("}"),n.join(`
`)}function serializeRoute(t){return JSON.stringify(t,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'")}function serializeValueCompact(t){return t===null?"null":t===void 0?"undefined":typeof t=="string"?`'${t.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`:typeof t=="number"||typeof t=="boolean"?String(t):Array.isArray(t)?"["+t.map(e=>serializeValueCompact(e)).join(", ")+"]":typeof t=="object"?`{ ${Object.entries(t).map(([e,n])=>`${e}: ${serializeValueCompact(n)}`).join(", ")} }`:String(t)}function extractRouteObjects(t){const e=[];let n=0,i=-1,r=!1,g="";for(let a=0;a<t.length;a++){const l=t[a];if(r){l===g&&t[a-1]!=="\\"&&(r=!1);continue}if(l==="/"&&a+1<t.length&&t[a+1]==="/"){const h=t.indexOf(`
`,a);a=h===-1?t.length-1:h-1;continue}if(l==="/"&&a+1<t.length&&t[a+1]==="*"){const h=t.indexOf("*/",a+2);a=h===-1?t.length-1:h+1;continue}if(l==='"'||l==="'"||l==="`"){r=!0,g=l;continue}l==="{"?(n===0&&(i=a),n++):l==="}"&&(n--,n===0&&i>=0&&(e.push(t.substring(i,a+1)),i=-1))}return e}function replacePropertyValue(t,e,n){const i=new RegExp(`(\\b${e}\\s*:\\s*)`),r=t.match(i);if(!r||r.index===void 0){const c=t.lastIndexOf("}"),p=t.substring(0,c),f=p.lastIndexOf(`
`),m=`
${f>=0?p.substring(f+1).match(/^(\s*)/)?.[1]??"	":"	"}${e}: ${n},`;return t.substring(0,c)+m+`
`+t.substring(c)}const g=r.index+r[0].length;let a=0,l=!1,h="",F=g;for(let c=g;c<t.length;c++){const p=t[c];if(l){p===h&&t[c-1]!=="\\"&&(l=!1);continue}if(p==="/"&&c+1<t.length&&t[c+1]==="/"){const f=t.indexOf(`
`,c);c=f===-1?t.length-1:f-1;continue}if(p==="/"&&c+1<t.length&&t[c+1]==="*"){const f=t.indexOf("*/",c+2);c=f===-1?t.length-1:f+1;continue}if(p==='"'||p==="'"||p==="`"){l=!0,h=p;continue}if(p==="{"||p==="["||p==="(")a++;else if(p==="}"||p==="]"||p===")")if(a>0)a--;else{F=c;break}else if(a===0&&p===","){F=c;break}}return t.substring(0,r.index)+`${e}: ${n}`+t.substring(F)}function removeProperty(t,e){const n=new RegExp(`,?\\s*\\b${e}\\s*:\\s*`),i=t.match(n);if(!i||i.index===void 0)return t;const r=i.index,g=r+i[0].length;let a=0,l=!1,h="",F=g;for(let c=g;c<t.length;c++){const p=t[c];if(l){p===h&&t[c-1]!=="\\"&&(l=!1);continue}if(p==="/"&&c+1<t.length&&t[c+1]==="/"){const f=t.indexOf(`
`,c);c=f===-1?t.length-1:f-1;continue}if(p==="/"&&c+1<t.length&&t[c+1]==="*"){const f=t.indexOf("*/",c+2);c=f===-1?t.length-1:f+1;continue}if(p==='"'||p==="'"||p==="`"){l=!0,h=p;continue}if(p==="{"||p==="["||p==="("){a++;continue}if(p==="}"||p==="]"||p===")"){if(a>0){a--;continue}F=c;break}if(a===0&&p===","){F=c;break}}if(i[0].startsWith(","))return t.substring(0,r)+t.substring(F);{let c=F;return t[c]===","&&c++,t.substring(0,r)+t.substring(c)}}function extractExistingRawRoutes(t){const e=new Map,n=t.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!n)return e;const i=extractRouteObjects(n[1]);for(const r of i){const g=r.match(/path:\s*['"]([^'"]*)['"]/);g&&e.set(g[1],r.trim())}return e}function extractExistingRoutes(t){const e=new Map,n=t.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!n)return e;try{let i=n[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const r=JSON.parse(i);for(const g of r)g.path&&e.set(g.path,g)}catch{}return e}class S extends factory_index.BasePlugin{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"},dts:!1}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").enum(["ts","js"]).field("nameStrategy").enum(["path","camelCase","pascalCase","custom"]).validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(e){switch(this.options.nameStrategy){case"path":return e.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return toCamelCase(e);case"pascalCase":return toPascalCase(e);case"custom":return this.options.customNameGenerator(e);default:return toCamelCase(e)}}extractMeta(e,n){const i={},r=e.style||{},g=this.options.metaMapping||{};for(const[a,l]of Object.entries(g))r[a]!==void 0&&(i[l]=r[a]);return this.tabBarPages.has(n)&&(i.isTab=!0),i}parsePageToRoute(e,n=""){const i=n?`/${n}/${e.path}`:`/${e.path}`,r=this.generateRouteName(i),g=this.extractMeta(e,i.replace(/^\//,"")),a={path:i,name:r};return Object.keys(g).length>0&&(a.meta=g),a}parsePagesJson(e){const n=[];if(!e.pages||!Array.isArray(e.pages)||e.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),n;if(this.tabBarPages.clear(),e.tabBar?.list)for(const i of e.tabBar.list)this.tabBarPages.add(i.pagePath);for(const i of e.pages)n.push(this.parsePageToRoute(i));if(this.options.includeSubPackages&&e.subPackages){for(const i of e.subPackages)if(i.pages&&Array.isArray(i.pages))for(const r of i.pages)n.push(this.parsePageToRoute(r,i.root))}return n}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
/**
 * \u5BFC\u822A\u52A8\u753B\u7C7B\u578B
 *
 * \u7528\u4E8E uni.navigateTo / uni.navigateBack \u7684 animationType \u53C2\u6570\uFF0C
 * \u4EC5 App \u7AEF\u751F\u6548\uFF0C\u5176\u4ED6\u5E73\u53F0\u81EA\u52A8\u5FFD\u7565\u3002
 *
 * \u663E\u793A\u52A8\u753B\uFF08navigateTo\uFF09\uFF1Aslide-in-right / slide-in-left / slide-in-top / slide-in-bottom / pop-in / fade-in / zoom-out / zoom-fade-out / none / auto
 * \u5173\u95ED\u52A8\u753B\uFF08navigateBack\uFF09\uFF1Aslide-out-right / slide-out-left / slide-out-top / slide-out-bottom / pop-out / fade-out / zoom-in / zoom-fade-in / none / auto
 *
 * @see https://en.uniapp.dcloud.io/api/router.html#animation
 */
export type UniAnimationType =
	| 'auto'
	| 'none'
	| 'slide-in-right'
	| 'slide-in-left'
	| 'slide-in-top'
	| 'slide-in-bottom'
	| 'slide-out-right'
	| 'slide-out-left'
	| 'slide-out-top'
	| 'slide-out-bottom'
	| 'fade-in'
	| 'fade-out'
	| 'zoom-out'
	| 'zoom-in'
	| 'zoom-fade-out'
	| 'zoom-fade-in'
	| 'pop-in'
	| 'pop-out'

/**
 * \u5BFC\u822A\u52A8\u753B\u914D\u7F6E
 *
 * \u4EC5 App \u7AEF\u751F\u6548\uFF0C\u5176\u4ED6\u5E73\u53F0\u81EA\u52A8\u5FFD\u7565\u3002
 * \u4F18\u5148\u7EA7\uFF1Apush/replace \u8C03\u7528\u65F6\u4F20\u5165 > meta.animation > uni \u9ED8\u8BA4\u503C
 */
export interface NavigationAnimation {
	/** \u7A97\u53E3\u52A8\u753B\u7C7B\u578B */
	type: UniAnimationType
	/** \u52A8\u753B\u6301\u7EED\u65F6\u95F4\uFF08ms\uFF09\uFF0C\u9ED8\u8BA4 300 */
	duration?: number
}

/**
 * \u8DEF\u7531\u5143\u4FE1\u606F
 */
export interface RouteMeta {
	/** \u9875\u9762\u6807\u9898 */
	title?: string
	/** \u662F\u5426\u4E3ATabBar\u9875\u9762 */
	isTab?: boolean
	/** \u662F\u5426\u9700\u8981\u767B\u5F55 */
	requireAuth?: boolean
	/** \u9ED8\u8BA4\u5BFC\u822A\u52A8\u753B\uFF08\u4EC5 App \u7AEF\u751F\u6548\uFF09\uFF0C\u53EF\u88AB push/replace \u65F6\u7684 animation \u53C2\u6570\u8986\u76D6 */
	animation?: NavigationAnimation
	/** \u81EA\u5B9A\u4E49\u6269\u5C55\u5B57\u6BB5 */
	[key: string]: any
}

/**
 * \u8DEF\u7531\u914D\u7F6E\u9879
 */
export interface RouteConfig {
	/** \u8DEF\u7531\u8DEF\u5F84 */
	path: string
	/** \u8DEF\u7531\u540D\u79F0\uFF08\u7528\u4E8E\u547D\u540D\u8DEF\u7531\u5BFC\u822A\uFF09 */
	name?: string
	/** \u8DEF\u7531\u5143\u4FE1\u606F */
	meta?: RouteMeta
	/** \u7528\u6237\u81EA\u5B9A\u4E49\u6269\u5C55\u5C5E\u6027\uFF08\u5982 beforeEnter\u3001component \u7B49\uFF09 */
	[key: string]: any
}
`}generateFileContent(e,n){const i=this.generateTypeDefinitions(),r=this.options.outputFormat==="ts"?": RouteConfig[]":"",g=e.map(a=>{const l=n?.get(a.path);if(l){let h=l;if(h=replacePropertyValue(h,"path",`'${a.path}'`),a.name!==void 0&&(h=replacePropertyValue(h,"name",`'${a.name}'`)),a.meta&&Object.keys(a.meta).length>0){const F=serializeValueCompact(a.meta);h=replacePropertyValue(h,"meta",F)}else a.meta&&Object.keys(a.meta).length===0&&(h=removeProperty(h,"meta"));return h}return serializeRoute(a)}).map(a=>"	"+a.split(`
`).join(`
	`)).join(`,
`);return`${i}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${r} = [
${g}
]

export default routes
`}async readPagesJson(){const e=o.resolve(this.projectRoot,this.options.pagesJsonPath);if(!s$1.existsSync(e))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${e}`),null;try{const n=await s$1.promises.readFile(e,"utf-8"),i=stripJsonComments(n);return JSON.parse(i)}catch(n){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${n.message}`),null}}mergeRoutes(e,n){return e.map(i=>{const r=n.get(i.path);if(!r)return i;const g={};return i.meta&&Object.assign(g,i.meta),r.meta&&Object.assign(g,r.meta),{...r,path:i.path,meta:Object.keys(g).length>0?g:void 0}})}async generateRouterConfig(){const e=await this.readPagesJson();if(!e)return;let n=this.parsePagesJson(e),i;const r=o.resolve(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&s$1.existsSync(r))try{const a=await s$1.promises.readFile(r,"utf-8"),l=extractExistingRoutes(a);i=extractExistingRawRoutes(a),l.size>0&&(n=this.mergeRoutes(n,l),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const g=this.generateFileContent(n,i);await common_fs_index.writeFileContent(r,g),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${r}`),this.logger.info(`\u5171\u751F\u6210 ${n.length} \u6761\u8DEF\u7531\u914D\u7F6E`),await this.generateDtsFile(n)}async generateDtsFile(e){if(!this.options.dts)return;const n=o.resolve(this.projectRoot,typeof this.options.dts=="string"?this.options.dts:"src/router.d.ts"),i=generateRouterDtsContent(e);common_fs_index.shouldUpdateFileContent(n,i)&&(await common_fs_index.writeFileContent(n,i),this.logger.success(`\u8DEF\u7531\u7C7B\u578B\u58F0\u660E\u6587\u4EF6\u5DF2\u751F\u6210: ${n}`))}startWatching(){if(!this.options.watch)return;const e=o.resolve(this.projectRoot,this.options.pagesJsonPath);s$1.existsSync(e)&&(this.watcher=s$1.watch(e,async n=>{n==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${e}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(e){e.configResolved=async n=>{this.projectRoot=n.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),n.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const generateRouter=factory_index.createPluginFactory(S);exports.generateRouter=generateRouter;
