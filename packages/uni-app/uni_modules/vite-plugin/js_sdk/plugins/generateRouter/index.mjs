import{createPluginFactory as p,BasePlugin as h}from"../../factory/index.mjs";import{readFileContent as i,writeFileContent as l}from"../../common/fs/index.mjs";import{toCamelCase as g,toPascalCase as F,stripJsonComments as m}from"../../common/format/index.mjs";import{resolve as r}from"path";import{existsSync as n,watch as f}from"fs";import"../../logger/index.mjs";import"../../common/object/index.mjs";import"../../shared/vite-plugin.DcExl6jd.mjs";import"crypto";import"node:path";class E extends h{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"}}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").enum(["ts","js"]).field("nameStrategy").enum(["path","camelCase","pascalCase","custom"]).validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(t){switch(this.options.nameStrategy){case"path":return t.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return g(t);case"pascalCase":return F(t);case"custom":return this.options.customNameGenerator(t);default:return g(t)}}extractMeta(t,u){const e={},s=t.style||{},a=this.options.metaMapping||{};for(const[o,c]of Object.entries(a))s[o]!==void 0&&(e[c]=s[o]);return this.tabBarPages.has(u)&&(e.isTab=!0),e}parsePageToRoute(t,u=""){const e=u?`/${u}/${t.path}`:`/${t.path}`,s=this.generateRouteName(e),a=this.extractMeta(t,e.replace(/^\//,"")),o={path:e,name:s};return Object.keys(a).length>0&&(o.meta=a),o}parsePagesJson(t){const u=[];if(!t.pages||!Array.isArray(t.pages)||t.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),u;if(this.tabBarPages.clear(),t.tabBar?.list)for(const e of t.tabBar.list)this.tabBarPages.add(e.pagePath);for(const e of t.pages)u.push(this.parsePageToRoute(e));if(this.options.includeSubPackages&&t.subPackages){for(const e of t.subPackages)if(e.pages&&Array.isArray(e.pages))for(const s of e.pages)u.push(this.parsePageToRoute(s,e.root))}return u}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
`}generateFileContent(t){const u=this.generateTypeDefinitions(),e=this.options.outputFormat==="ts",s=JSON.stringify(t,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'");return`${u}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${e?": RouteConfig[]":""} = ${s}

export default routes
`}async readPagesJson(){const t=r(this.projectRoot,this.options.pagesJsonPath);if(!n(t))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${t}`),null;try{const u=await i(t),e=m(u);return JSON.parse(e)}catch(u){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${u.message}`),null}}extractExistingRoutes(t){const u=new Map,e=t.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!e)return u;try{let s=e[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const a=JSON.parse(s);for(const o of a)o.path&&u.set(o.path,o)}catch{this.logger.warn("\u89E3\u6790\u73B0\u6709 routes \u914D\u7F6E\u5931\u8D25\uFF0C\u5C06\u5B8C\u5168\u91CD\u65B0\u751F\u6210")}return u}mergeRoutes(t,u){return t.map(e=>{const s=u.get(e.path);if(!s)return e;const a={};return e.meta&&Object.assign(a,e.meta),s.meta&&Object.assign(a,s.meta),{...s,path:e.path,meta:Object.keys(a).length>0?a:void 0}})}async generateRouterConfig(){const t=await this.readPagesJson();if(!t)return;let u=this.parsePagesJson(t);const e=r(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&n(e))try{const a=await i(e),o=this.extractExistingRoutes(a);o.size>0&&(u=this.mergeRoutes(u,o),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const s=this.generateFileContent(u);await l(e,s),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${e}`),this.logger.info(`\u5171\u751F\u6210 ${u.length} \u6761\u8DEF\u7531\u914D\u7F6E`)}startWatching(){if(!this.options.watch)return;const t=r(this.projectRoot,this.options.pagesJsonPath);n(t)&&(this.watcher=f(t,async u=>{u==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${t}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(t){t.configResolved=async u=>{this.projectRoot=u.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),u.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const D=p(E);export{D as generateRouter};
