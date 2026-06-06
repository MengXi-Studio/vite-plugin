"use strict";const factory_index=require("../../factory/index.cjs"),common_fs_index=require("../../common/fs/index.cjs"),m=require("path"),n=require("fs");require("../../logger/index.cjs"),require("../../shared/vite-plugin.Bcg6RW2N.cjs");function u(i,e=/[/-]/){return i.replace(/^\/+/,"").split(e).filter(Boolean).map((t,s)=>s===0?t.toLowerCase():t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()).join("")}function R(i,e=/[/-]/){return i.replace(/^\/+/,"").split(e).filter(Boolean).map(t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase()).join("")}function P(i){return i.replace(/\/\/.*$/gm,"").replace(/\/\*[\s\S]*?\*\//g,"")}class d extends factory_index.BasePlugin{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"}}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").enum(["ts","js"]).field("nameStrategy").enum(["path","camelCase","pascalCase","custom"]).validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(e){switch(this.options.nameStrategy){case"path":return e.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return u(e);case"pascalCase":return R(e);case"custom":return this.options.customNameGenerator(e);default:return u(e)}}extractMeta(e,t){const s={},a=e.style||{},r=this.options.metaMapping||{};for(const[o,c]of Object.entries(r))a[o]!==void 0&&(s[c]=a[o]);return this.tabBarPages.has(t)&&(s.isTab=!0),s}parsePageToRoute(e,t=""){const s=t?`/${t}/${e.path}`:`/${e.path}`,a=this.generateRouteName(s),r=this.extractMeta(e,s.replace(/^\//,"")),o={path:s,name:a};return Object.keys(r).length>0&&(o.meta=r),o}parsePagesJson(e){const t=[];if(!e.pages||!Array.isArray(e.pages)||e.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),t;if(this.tabBarPages.clear(),e.tabBar?.list)for(const s of e.tabBar.list)this.tabBarPages.add(s.pagePath);for(const s of e.pages)t.push(this.parsePageToRoute(s));if(this.options.includeSubPackages&&e.subPackages){for(const s of e.subPackages)if(s.pages&&Array.isArray(s.pages))for(const a of s.pages)t.push(this.parsePageToRoute(a,s.root))}return t}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
`}generateFileContent(e){const t=this.generateTypeDefinitions(),s=this.options.outputFormat==="ts",a=JSON.stringify(e,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'");return`${t}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${s?": RouteConfig[]":""} = ${a}

export default routes
`}async readPagesJson(){const e=m.resolve(this.projectRoot,this.options.pagesJsonPath);if(!n.existsSync(e))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${e}`),null;try{const t=await n.promises.readFile(e,"utf-8"),s=P(t);return JSON.parse(s)}catch(t){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${t.message}`),null}}extractExistingRoutes(e){const t=new Map,s=e.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!s)return t;try{let a=s[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const r=JSON.parse(a);for(const o of r)o.path&&t.set(o.path,o)}catch{this.logger.warn("\u89E3\u6790\u73B0\u6709 routes \u914D\u7F6E\u5931\u8D25\uFF0C\u5C06\u5B8C\u5168\u91CD\u65B0\u751F\u6210")}return t}mergeRoutes(e,t){return e.map(s=>{const a=t.get(s.path);if(!a)return s;const r={};return s.meta&&Object.assign(r,s.meta),a.meta&&Object.assign(r,a.meta),{...a,path:s.path,meta:Object.keys(r).length>0?r:void 0}})}async generateRouterConfig(){const e=await this.readPagesJson();if(!e)return;let t=this.parsePagesJson(e);const s=m.resolve(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&n.existsSync(s))try{const r=await n.promises.readFile(s,"utf-8"),o=this.extractExistingRoutes(r);o.size>0&&(t=this.mergeRoutes(t,o),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const a=this.generateFileContent(t);await common_fs_index.writeFileContent(s,a),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${s}`),this.logger.info(`\u5171\u751F\u6210 ${t.length} \u6761\u8DEF\u7531\u914D\u7F6E`)}startWatching(){if(!this.options.watch)return;const e=m.resolve(this.projectRoot,this.options.pagesJsonPath);n.existsSync(e)&&(this.watcher=n.watch(e,async t=>{t==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${e}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(e){e.configResolved=async t=>{this.projectRoot=t.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),t.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const generateRouter=factory_index.createPluginFactory(d);exports.generateRouter=generateRouter;
