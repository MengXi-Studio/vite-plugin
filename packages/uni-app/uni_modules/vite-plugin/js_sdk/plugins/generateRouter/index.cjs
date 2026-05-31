"use strict";const factory_index=require("../../factory/index.cjs"),common_fs_index=require("../../common/fs/index.cjs"),common_format_index=require("../../common/format/index.cjs"),f=require("path"),s=require("fs");require("../../logger/index.cjs"),require("../../common/object/index.cjs"),require("../../shared/vite-plugin.Bcg6RW2N.cjs"),require("crypto"),require("node:path");class R extends factory_index.BasePlugin{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"}}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").enum(["ts","js"]).field("nameStrategy").enum(["path","camelCase","pascalCase","custom"]).validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(e){switch(this.options.nameStrategy){case"path":return e.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return common_format_index.toCamelCase(e);case"pascalCase":return common_format_index.toPascalCase(e);case"custom":return this.options.customNameGenerator(e);default:return common_format_index.toCamelCase(e)}}extractMeta(e,u){const t={},a=e.style||{},r=this.options.metaMapping||{};for(const[o,n]of Object.entries(r))a[o]!==void 0&&(t[n]=a[o]);return this.tabBarPages.has(u)&&(t.isTab=!0),t}parsePageToRoute(e,u=""){const t=u?`/${u}/${e.path}`:`/${e.path}`,a=this.generateRouteName(t),r=this.extractMeta(e,t.replace(/^\//,"")),o={path:t,name:a};return Object.keys(r).length>0&&(o.meta=r),o}parsePagesJson(e){const u=[];if(!e.pages||!Array.isArray(e.pages)||e.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),u;if(this.tabBarPages.clear(),e.tabBar?.list)for(const t of e.tabBar.list)this.tabBarPages.add(t.pagePath);for(const t of e.pages)u.push(this.parsePageToRoute(t));if(this.options.includeSubPackages&&e.subPackages){for(const t of e.subPackages)if(t.pages&&Array.isArray(t.pages))for(const a of t.pages)u.push(this.parsePageToRoute(a,t.root))}return u}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
`}generateFileContent(e){const u=this.generateTypeDefinitions(),t=this.options.outputFormat==="ts",a=JSON.stringify(e,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'");return`${u}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${t?": RouteConfig[]":""} = ${a}

export default routes
`}async readPagesJson(){const e=f.resolve(this.projectRoot,this.options.pagesJsonPath);if(!s.existsSync(e))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${e}`),null;try{const u=await common_fs_index.readFileContent(e),t=common_format_index.stripJsonComments(u);return JSON.parse(t)}catch(u){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${u.message}`),null}}extractExistingRoutes(e){const u=new Map,t=e.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!t)return u;try{let a=t[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const r=JSON.parse(a);for(const o of r)o.path&&u.set(o.path,o)}catch{this.logger.warn("\u89E3\u6790\u73B0\u6709 routes \u914D\u7F6E\u5931\u8D25\uFF0C\u5C06\u5B8C\u5168\u91CD\u65B0\u751F\u6210")}return u}mergeRoutes(e,u){return e.map(t=>{const a=u.get(t.path);if(!a)return t;const r={};return t.meta&&Object.assign(r,t.meta),a.meta&&Object.assign(r,a.meta),{...a,path:t.path,meta:Object.keys(r).length>0?r:void 0}})}async generateRouterConfig(){const e=await this.readPagesJson();if(!e)return;let u=this.parsePagesJson(e);const t=f.resolve(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&s.existsSync(t))try{const r=await common_fs_index.readFileContent(t),o=this.extractExistingRoutes(r);o.size>0&&(u=this.mergeRoutes(u,o),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const a=this.generateFileContent(u);await common_fs_index.writeFileContent(t,a),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${t}`),this.logger.info(`\u5171\u751F\u6210 ${u.length} \u6761\u8DEF\u7531\u914D\u7F6E`)}startWatching(){if(!this.options.watch)return;const e=f.resolve(this.projectRoot,this.options.pagesJsonPath);s.existsSync(e)&&(this.watcher=s.watch(e,async u=>{u==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${e}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(e){e.configResolved=async u=>{this.projectRoot=u.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),u.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const generateRouter=factory_index.createPluginFactory(R);exports.generateRouter=generateRouter;
