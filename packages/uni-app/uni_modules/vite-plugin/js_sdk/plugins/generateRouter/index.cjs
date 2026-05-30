"use strict";const factory_index=require("../../factory/index.cjs"),common_fs_index=require("../../common/fs/index.cjs"),common_format_index=require("../../common/format/index.cjs"),u=require("path"),s=require("fs");require("../../logger/index.cjs"),require("../../common/object/index.cjs"),require("../../shared/vite-plugin.Bcg6RW2N.cjs"),require("crypto");class R extends factory_index.BasePlugin{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"}}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").enum(["ts","js"]).field("nameStrategy").enum(["path","camelCase","pascalCase","custom"]).validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(e){switch(this.options.nameStrategy){case"path":return e.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return common_format_index.toCamelCase(e);case"pascalCase":return common_format_index.toPascalCase(e);case"custom":return this.options.customNameGenerator(e);default:return common_format_index.toCamelCase(e)}}extractMeta(e,a){const t={},r=e.style||{},o=this.options.metaMapping||{};for(const[n,i]of Object.entries(o))r[n]!==void 0&&(t[i]=r[n]);return this.tabBarPages.has(a)&&(t.isTab=!0),t}parsePageToRoute(e,a=""){const t=a?`/${a}/${e.path}`:`/${e.path}`,r=this.generateRouteName(t),o=this.extractMeta(e,t.replace(/^\//,"")),n={path:t,name:r};return Object.keys(o).length>0&&(n.meta=o),n}parsePagesJson(e){const a=[];if(!e.pages||!Array.isArray(e.pages)||e.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),a;if(this.tabBarPages.clear(),e.tabBar?.list)for(const t of e.tabBar.list)this.tabBarPages.add(t.pagePath);for(const t of e.pages)a.push(this.parsePageToRoute(t));if(this.options.includeSubPackages&&e.subPackages){for(const t of e.subPackages)if(t.pages&&Array.isArray(t.pages))for(const r of t.pages)a.push(this.parsePageToRoute(r,t.root))}return a}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
`}generateFileContent(e){const a=this.generateTypeDefinitions(),t=this.options.outputFormat==="ts",r=JSON.stringify(e,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'");return`${a}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${t?": RouteConfig[]":""} = ${r}

export default routes
`}async readPagesJson(){const e=u.resolve(this.projectRoot,this.options.pagesJsonPath);if(!s.existsSync(e))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${e}`),null;try{const a=await common_fs_index.readFileContent(e),t=common_format_index.stripJsonComments(a);return JSON.parse(t)}catch(a){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${a.message}`),null}}extractExistingRoutes(e){const a=new Map,t=e.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!t)return a;try{let r=t[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const o=JSON.parse(r);for(const n of o)n.path&&a.set(n.path,n)}catch{this.logger.warn("\u89E3\u6790\u73B0\u6709 routes \u914D\u7F6E\u5931\u8D25\uFF0C\u5C06\u5B8C\u5168\u91CD\u65B0\u751F\u6210")}return a}mergeRoutes(e,a){return e.map(t=>{const r=a.get(t.path);if(!r)return t;const o={};return t.meta&&Object.assign(o,t.meta),r.meta&&Object.assign(o,r.meta),{...r,path:t.path,meta:Object.keys(o).length>0?o:void 0}})}async generateRouterConfig(){const e=await this.readPagesJson();if(!e)return;let a=this.parsePagesJson(e);const t=u.resolve(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&s.existsSync(t))try{const o=await common_fs_index.readFileContent(t),n=this.extractExistingRoutes(o);n.size>0&&(a=this.mergeRoutes(a,n),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const r=this.generateFileContent(a);await common_fs_index.writeFileContent(t,r),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${t}`),this.logger.info(`\u5171\u751F\u6210 ${a.length} \u6761\u8DEF\u7531\u914D\u7F6E`)}startWatching(){if(!this.options.watch)return;const e=u.resolve(this.projectRoot,this.options.pagesJsonPath);s.existsSync(e)&&(this.watcher=s.watch(e,async a=>{a==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${e}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(e){e.configResolved=async a=>{this.projectRoot=a.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),a.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const generateRouter=factory_index.createPluginFactory(R);exports.generateRouter=generateRouter;
