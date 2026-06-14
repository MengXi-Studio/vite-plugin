"use strict";const factory_index=require("../../factory/index.cjs"),common_fs_index=require("../../common/fs/index.cjs"),o=require("path"),s$1=require("fs");require("../../logger/index.cjs"),require("../../shared/vite-plugin.Bcg6RW2N.cjs"),require("../../common/concurrency/index.cjs");function toCamelCase(t,e=/[/-]/){return t.replace(/^\/+/,"").split(e).filter(Boolean).map((n,i)=>i===0?n.toLowerCase():n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join("")}function toPascalCase(t,e=/[/-]/){return t.replace(/^\/+/,"").split(e).filter(Boolean).map(n=>n.charAt(0).toUpperCase()+n.slice(1).toLowerCase()).join("")}function stripJsonComments(t){return t.replace(/\/\/.*$/gm,"").replace(/\/\*[\s\S]*?\*\//g,"")}function s(t,e){return typeof e=="string"?"string":typeof e=="boolean"?e?"true":"false":typeof e=="number"?"number":"unknown"}function u(t){const e=Object.entries(t);return e.length===0?"{}":`{ ${e.map(([n,i])=>`${n}: ${s(n,i)}`).join("; ")} }`}function generateRouterDtsContent(t,e="@meng-xi/uni-router"){const n=[];n.push(`import '${e}'`),n.push(""),n.push(`declare module '${e}' {`),n.push("  interface RouteNameMap {");for(const i of t){const a=i.name||i.path;i.meta?.title&&n.push(`    /** ${i.meta.title} */`);const g=i.meta?u(i.meta):"{}";n.push(`    ${a}: { path: '${i.path}'; meta: ${g} }`)}return n.push("  }"),n.push("}"),n.join(`
`)}function serializeRoute(t){return JSON.stringify(t,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'")}function serializeValueCompact(t){return t===null?"null":t===void 0?"undefined":typeof t=="string"?`'${t.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`:typeof t=="number"||typeof t=="boolean"?String(t):Array.isArray(t)?"["+t.map(e=>serializeValueCompact(e)).join(", ")+"]":typeof t=="object"?`{ ${Object.entries(t).map(([e,n])=>`${e}: ${serializeValueCompact(n)}`).join(", ")} }`:String(t)}function extractRouteObjects(t){const e=[];let n=0,i=-1,a=!1,g="";for(let r=0;r<t.length;r++){const l=t[r];if(a){l===g&&t[r-1]!=="\\"&&(a=!1);continue}if(l==="/"&&r+1<t.length&&t[r+1]==="/"){const h=t.indexOf(`
`,r);r=h===-1?t.length-1:h-1;continue}if(l==="/"&&r+1<t.length&&t[r+1]==="*"){const h=t.indexOf("*/",r+2);r=h===-1?t.length-1:h+1;continue}if(l==='"'||l==="'"||l==="`"){a=!0,g=l;continue}l==="{"?(n===0&&(i=r),n++):l==="}"&&(n--,n===0&&i>=0&&(e.push(t.substring(i,r+1)),i=-1))}return e}function replacePropertyValue(t,e,n){const i=new RegExp(`(\\b${e}\\s*:\\s*)`),a=t.match(i);if(!a||a.index===void 0){const c=t.lastIndexOf("}"),p=t.substring(0,c),f=p.lastIndexOf(`
`),m=`
${f>=0?p.substring(f+1).match(/^(\s*)/)?.[1]??"	":"	"}${e}: ${n},`;return t.substring(0,c)+m+`
`+t.substring(c)}const g=a.index+a[0].length;let r=0,l=!1,h="",F=g;for(let c=g;c<t.length;c++){const p=t[c];if(l){p===h&&t[c-1]!=="\\"&&(l=!1);continue}if(p==="/"&&c+1<t.length&&t[c+1]==="/"){const f=t.indexOf(`
`,c);c=f===-1?t.length-1:f-1;continue}if(p==="/"&&c+1<t.length&&t[c+1]==="*"){const f=t.indexOf("*/",c+2);c=f===-1?t.length-1:f+1;continue}if(p==='"'||p==="'"||p==="`"){l=!0,h=p;continue}if(p==="{"||p==="["||p==="(")r++;else if(p==="}"||p==="]"||p===")")if(r>0)r--;else{F=c;break}else if(r===0&&p===","){F=c;break}}return t.substring(0,a.index)+`${e}: ${n}`+t.substring(F)}function removeProperty(t,e){const n=new RegExp(`,?\\s*\\b${e}\\s*:\\s*`),i=t.match(n);if(!i||i.index===void 0)return t;const a=i.index,g=a+i[0].length;let r=0,l=!1,h="",F=g;for(let c=g;c<t.length;c++){const p=t[c];if(l){p===h&&t[c-1]!=="\\"&&(l=!1);continue}if(p==="/"&&c+1<t.length&&t[c+1]==="/"){const f=t.indexOf(`
`,c);c=f===-1?t.length-1:f-1;continue}if(p==="/"&&c+1<t.length&&t[c+1]==="*"){const f=t.indexOf("*/",c+2);c=f===-1?t.length-1:f+1;continue}if(p==='"'||p==="'"||p==="`"){l=!0,h=p;continue}if(p==="{"||p==="["||p==="("){r++;continue}if(p==="}"||p==="]"||p===")"){if(r>0){r--;continue}F=c;break}if(r===0&&p===","){F=c;break}}if(i[0].startsWith(","))return t.substring(0,a)+t.substring(F);{let c=F;return t[c]===","&&c++,t.substring(0,a)+t.substring(c)}}function extractExistingRawRoutes(t){const e=new Map,n=t.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!n)return e;const i=extractRouteObjects(n[1]);for(const a of i){const g=a.match(/path:\s*['"]([^'"]*)['"]/);g&&e.set(g[1],a.trim())}return e}function extractExistingRoutes(t){const e=new Map,n=t.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!n)return e;try{let i=n[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const a=JSON.parse(i);for(const g of a)g.path&&e.set(g.path,g)}catch{}return e}class S extends factory_index.BasePlugin{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"},dts:!1}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").enum(["ts","js"]).field("nameStrategy").enum(["path","camelCase","pascalCase","custom"]).validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(e){switch(this.options.nameStrategy){case"path":return e.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return toCamelCase(e);case"pascalCase":return toPascalCase(e);case"custom":return this.options.customNameGenerator(e);default:return toCamelCase(e)}}extractMeta(e,n){const i={},a=e.style||{},g=this.options.metaMapping||{};for(const[r,l]of Object.entries(g))a[r]!==void 0&&(i[l]=a[r]);return this.tabBarPages.has(n)&&(i.isTab=!0),i}parsePageToRoute(e,n=""){const i=n?`/${n}/${e.path}`:`/${e.path}`,a=this.generateRouteName(i),g=this.extractMeta(e,i.replace(/^\//,"")),r={path:i,name:a};return Object.keys(g).length>0&&(r.meta=g),r}parsePagesJson(e){const n=[];if(!e.pages||!Array.isArray(e.pages)||e.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),n;if(this.tabBarPages.clear(),e.tabBar?.list)for(const i of e.tabBar.list)this.tabBarPages.add(i.pagePath);for(const i of e.pages)n.push(this.parsePageToRoute(i));if(this.options.includeSubPackages&&e.subPackages){for(const i of e.subPackages)if(i.pages&&Array.isArray(i.pages))for(const a of i.pages)n.push(this.parsePageToRoute(a,i.root))}return n}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
	[key: string]: unknown
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
}
`}generateFileContent(e,n){const i=this.generateTypeDefinitions(),a=this.options.outputFormat==="ts"?": RouteConfig[]":"",g=e.map(r=>{const l=n?.get(r.path);if(l){let h=l;if(h=replacePropertyValue(h,"path",`'${r.path}'`),r.name!==void 0&&(h=replacePropertyValue(h,"name",`'${r.name}'`)),r.meta&&Object.keys(r.meta).length>0){const F=serializeValueCompact(r.meta);h=replacePropertyValue(h,"meta",F)}else r.meta&&Object.keys(r.meta).length===0&&(h=removeProperty(h,"meta"));return h}return serializeRoute(r)}).map(r=>"	"+r.split(`
`).join(`
	`)).join(`,
`);return`${i}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${a} = [
${g}
]

export default routes
`}async readPagesJson(){const e=o.resolve(this.projectRoot,this.options.pagesJsonPath);if(!s$1.existsSync(e))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${e}`),null;try{const n=await s$1.promises.readFile(e,"utf-8"),i=stripJsonComments(n);return JSON.parse(i)}catch(n){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${n.message}`),null}}mergeRoutes(e,n){return e.map(i=>{const a=n.get(i.path);if(!a)return i;const g={};return i.meta&&Object.assign(g,i.meta),a.meta&&Object.assign(g,a.meta),{...a,path:i.path,meta:Object.keys(g).length>0?g:void 0}})}async generateRouterConfig(){const e=await this.readPagesJson();if(!e)return;let n=this.parsePagesJson(e),i;const a=o.resolve(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&s$1.existsSync(a))try{const r=await s$1.promises.readFile(a,"utf-8"),l=extractExistingRoutes(r);i=extractExistingRawRoutes(r),l.size>0&&(n=this.mergeRoutes(n,l),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const g=this.generateFileContent(n,i);await common_fs_index.writeFileContent(a,g),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${a}`),this.logger.info(`\u5171\u751F\u6210 ${n.length} \u6761\u8DEF\u7531\u914D\u7F6E`),await this.generateDtsFile(n)}async generateDtsFile(e){if(!this.options.dts)return;const n=o.resolve(this.projectRoot,typeof this.options.dts=="string"?this.options.dts:"src/router.d.ts"),i=generateRouterDtsContent(e);common_fs_index.shouldUpdateFileContent(n,i)&&(await common_fs_index.writeFileContent(n,i),this.logger.success(`\u8DEF\u7531\u7C7B\u578B\u58F0\u660E\u6587\u4EF6\u5DF2\u751F\u6210: ${n}`))}startWatching(){if(!this.options.watch)return;const e=o.resolve(this.projectRoot,this.options.pagesJsonPath);s$1.existsSync(e)&&(this.watcher=s$1.watch(e,async n=>{n==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${e}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(e){e.configResolved=async n=>{this.projectRoot=n.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),n.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const generateRouter=factory_index.createPluginFactory(S);exports.generateRouter=generateRouter;
