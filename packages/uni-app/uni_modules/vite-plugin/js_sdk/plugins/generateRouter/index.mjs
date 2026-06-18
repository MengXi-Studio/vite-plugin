import{createPluginFactory as A,BasePlugin as b}from"../../factory/index.mjs";import{writeFileContent as d,shouldUpdateFileContent as y}from"../../common/fs/index.mjs";import{resolve as h}from"path";import{existsSync as f,promises as E,watch as B}from"fs";import"../../logger/index.mjs";import"../../shared/vite-plugin.DcExl6jd.mjs";import"../../common/concurrency/index.mjs";function C(t,e=/[/-]/){return t.replace(/^\/+/,"").split(e).filter(Boolean).map((u,o)=>o===0?u.toLowerCase():u.charAt(0).toUpperCase()+u.slice(1).toLowerCase()).join("")}function $(t,e=/[/-]/){return t.replace(/^\/+/,"").split(e).filter(Boolean).map(u=>u.charAt(0).toUpperCase()+u.slice(1).toLowerCase()).join("")}function x(t){return t.replace(/\/\/.*$/gm,"").replace(/\/\*[\s\S]*?\*\//g,"")}function w(t,e){return typeof e=="string"?"string":typeof e=="boolean"?e?"true":"false":typeof e=="number"?"number":"unknown"}function j(t){const e=Object.entries(t);return e.length===0?"{}":`{ ${e.map(([u,o])=>`${u}: ${w(u,o)}`).join("; ")} }`}function R(t,e="@meng-xi/uni-router"){const u=[];u.push(`import '${e}'`),u.push(""),u.push(`declare module '${e}' {`),u.push("  interface RouteNameMap {");for(const o of t){const n=o.name||o.path;o.meta?.title&&u.push(`    /** ${o.meta.title} */`);const r=o.meta?j(o.meta):"{}";u.push(`    ${n}: { path: '${o.path}'; meta: ${r} }`)}return u.push("  }"),u.push("}"),u.join(`
`)}function P(t){return JSON.stringify(t,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'")}function F(t){return t===null?"null":t===void 0?"undefined":typeof t=="string"?`'${t.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`:typeof t=="number"||typeof t=="boolean"?String(t):Array.isArray(t)?"["+t.map(e=>F(e)).join(", ")+"]":typeof t=="object"?`{ ${Object.entries(t).map(([e,u])=>`${e}: ${F(u)}`).join(", ")} }`:String(t)}function O(t){const e=[];let u=0,o=-1,n=!1,r="";for(let s=0;s<t.length;s++){const c=t[s];if(n){c===r&&t[s-1]!=="\\"&&(n=!1);continue}if(c==="/"&&s+1<t.length&&t[s+1]==="/"){const p=t.indexOf(`
`,s);s=p===-1?t.length-1:p-1;continue}if(c==="/"&&s+1<t.length&&t[s+1]==="*"){const p=t.indexOf("*/",s+2);s=p===-1?t.length-1:p+1;continue}if(c==='"'||c==="'"||c==="`"){n=!0,r=c;continue}c==="{"?(u===0&&(o=s),u++):c==="}"&&(u--,u===0&&o>=0&&(e.push(t.substring(o,s+1)),o=-1))}return e}function m(t,e,u){const o=new RegExp(`(\\b${e}\\s*:\\s*)`),n=t.match(o);if(!n||n.index===void 0){const a=t.lastIndexOf("}"),i=t.substring(0,a),g=i.lastIndexOf(`
`),D=`
${g>=0?i.substring(g+1).match(/^(\s*)/)?.[1]??"	":"	"}${e}: ${u},`;return t.substring(0,a)+D+`
`+t.substring(a)}const r=n.index+n[0].length;let s=0,c=!1,p="",l=r;for(let a=r;a<t.length;a++){const i=t[a];if(c){i===p&&t[a-1]!=="\\"&&(c=!1);continue}if(i==="/"&&a+1<t.length&&t[a+1]==="/"){const g=t.indexOf(`
`,a);a=g===-1?t.length-1:g-1;continue}if(i==="/"&&a+1<t.length&&t[a+1]==="*"){const g=t.indexOf("*/",a+2);a=g===-1?t.length-1:g+1;continue}if(i==='"'||i==="'"||i==="`"){c=!0,p=i;continue}if(i==="{"||i==="["||i==="(")s++;else if(i==="}"||i==="]"||i===")")if(s>0)s--;else{l=a;break}else if(s===0&&i===","){l=a;break}}return t.substring(0,n.index)+`${e}: ${u}`+t.substring(l)}function v(t,e){const u=new RegExp(`,?\\s*\\b${e}\\s*:\\s*`),o=t.match(u);if(!o||o.index===void 0)return t;const n=o.index,r=n+o[0].length;let s=0,c=!1,p="",l=r;for(let a=r;a<t.length;a++){const i=t[a];if(c){i===p&&t[a-1]!=="\\"&&(c=!1);continue}if(i==="/"&&a+1<t.length&&t[a+1]==="/"){const g=t.indexOf(`
`,a);a=g===-1?t.length-1:g-1;continue}if(i==="/"&&a+1<t.length&&t[a+1]==="*"){const g=t.indexOf("*/",a+2);a=g===-1?t.length-1:g+1;continue}if(i==='"'||i==="'"||i==="`"){c=!0,p=i;continue}if(i==="{"||i==="["||i==="("){s++;continue}if(i==="}"||i==="]"||i===")"){if(s>0){s--;continue}l=a;break}if(s===0&&i===","){l=a;break}}if(o[0].startsWith(","))return t.substring(0,n)+t.substring(l);{let a=l;return t[a]===","&&a++,t.substring(0,n)+t.substring(a)}}function k(t){const e=new Map,u=t.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!u)return e;const o=O(u[1]);for(const n of o){const r=n.match(/path:\s*['"]([^'"]*)['"]/);r&&e.set(r[1],n.trim())}return e}function S(t){const e=new Map,u=t.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!u)return e;try{let o=u[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const n=JSON.parse(o);for(const r of n)r.path&&e.set(r.path,r)}catch{}return e}class T extends b{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"},dts:!1}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").enum(["ts","js"]).field("nameStrategy").enum(["path","camelCase","pascalCase","custom"]).validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(e){switch(this.options.nameStrategy){case"path":return e.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return C(e);case"pascalCase":return $(e);case"custom":return this.options.customNameGenerator(e);default:return C(e)}}extractMeta(e,u){const o={},n=e.style||{},r=this.options.metaMapping||{};for(const[s,c]of Object.entries(r))n[s]!==void 0&&(o[c]=n[s]);return this.tabBarPages.has(u)&&(o.isTab=!0),o}parsePageToRoute(e,u=""){const o=u?`/${u}/${e.path}`:`/${e.path}`,n=this.generateRouteName(o),r=this.extractMeta(e,o.replace(/^\//,"")),s={path:o,name:n};return Object.keys(r).length>0&&(s.meta=r),s}parsePagesJson(e){const u=[];if(!e.pages||!Array.isArray(e.pages)||e.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),u;if(this.tabBarPages.clear(),e.tabBar?.list)for(const o of e.tabBar.list)this.tabBarPages.add(o.pagePath);for(const o of e.pages)u.push(this.parsePageToRoute(o));if(this.options.includeSubPackages&&e.subPackages){for(const o of e.subPackages)if(o.pages&&Array.isArray(o.pages))for(const n of o.pages)u.push(this.parsePageToRoute(n,o.root))}return u}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
`}generateFileContent(e,u){const o=this.generateTypeDefinitions(),n=this.options.outputFormat==="ts"?": RouteConfig[]":"",r=e.map(s=>{const c=u?.get(s.path);if(c){let p=c;if(p=m(p,"path",`'${s.path}'`),s.name!==void 0&&(p=m(p,"name",`'${s.name}'`)),s.meta&&Object.keys(s.meta).length>0){const l=F(s.meta);p=m(p,"meta",l)}else s.meta&&Object.keys(s.meta).length===0&&(p=v(p,"meta"));return p}return P(s)}).map(s=>"	"+s.split(`
`).join(`
	`)).join(`,
`);return`${o}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${n} = [
${r}
]

export default routes
`}async readPagesJson(){const e=h(this.projectRoot,this.options.pagesJsonPath);if(!f(e))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${e}`),null;try{const u=await E.readFile(e,"utf-8"),o=x(u);return JSON.parse(o)}catch(u){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${u.message}`),null}}mergeRoutes(e,u){return e.map(o=>{const n=u.get(o.path);if(!n)return o;const r={};return o.meta&&Object.assign(r,o.meta),n.meta&&Object.assign(r,n.meta),{...n,path:o.path,meta:Object.keys(r).length>0?r:void 0}})}async generateRouterConfig(){const e=await this.readPagesJson();if(!e)return;let u=this.parsePagesJson(e),o;const n=h(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&f(n))try{const s=await E.readFile(n,"utf-8"),c=S(s);o=k(s),c.size>0&&(u=this.mergeRoutes(u,c),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const r=this.generateFileContent(u,o);await d(n,r),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${n}`),this.logger.info(`\u5171\u751F\u6210 ${u.length} \u6761\u8DEF\u7531\u914D\u7F6E`),await this.generateDtsFile(u)}async generateDtsFile(e){if(!this.options.dts)return;const u=h(this.projectRoot,typeof this.options.dts=="string"?this.options.dts:"src/router.d.ts"),o=R(e);y(u,o)&&(await d(u,o),this.logger.success(`\u8DEF\u7531\u7C7B\u578B\u58F0\u660E\u6587\u4EF6\u5DF2\u751F\u6210: ${u}`))}startWatching(){if(!this.options.watch)return;const e=h(this.projectRoot,this.options.pagesJsonPath);f(e)&&(this.watcher=B(e,async u=>{u==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${e}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(e){e.configResolved=async u=>{this.projectRoot=u.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),u.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const J=A(T);export{J as generateRouter};
