import{createPluginFactory as l,BasePlugin as F}from"../../factory/index.mjs";import{writeFileContent as p,shouldUpdateFileContent as m}from"../../common/fs/index.mjs";import{resolve as n}from"path";import{existsSync as i,promises as c,watch as f}from"fs";import"../../logger/index.mjs";import"../../shared/vite-plugin.DcExl6jd.mjs";function g(r,t=/[/-]/){return r.replace(/^\/+/,"").split(t).filter(Boolean).map((e,u)=>u===0?e.toLowerCase():e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join("")}function E(r,t=/[/-]/){return r.replace(/^\/+/,"").split(t).filter(Boolean).map(e=>e.charAt(0).toUpperCase()+e.slice(1).toLowerCase()).join("")}function D(r){return r.replace(/\/\/.*$/gm,"").replace(/\/\*[\s\S]*?\*\//g,"")}function C(r,t){return typeof t=="string"?"string":typeof t=="boolean"?t?"true":"false":typeof t=="number"?"number":"unknown"}function d(r){const t=Object.entries(r);return t.length===0?"{}":`{ ${t.map(([e,u])=>`${e}: ${C(e,u)}`).join("; ")} }`}function y(r,t="@meng-xi/uni-router"){const e=[];e.push(`import '${t}'`),e.push(""),e.push(`declare module '${t}' {`),e.push("  interface RouteNameMap {");for(const u of r){const s=u.name||u.path;u.meta?.title&&e.push(`    /** ${u.meta.title} */`);const a=u.meta?d(u.meta):"{}";e.push(`    ${s}: { path: '${u.path}'; meta: ${a} }`)}return e.push("  }"),e.push("}"),e.join(`
`)}class w extends F{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"},dts:!1}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").enum(["ts","js"]).field("nameStrategy").enum(["path","camelCase","pascalCase","custom"]).validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(t){switch(this.options.nameStrategy){case"path":return t.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return g(t);case"pascalCase":return E(t);case"custom":return this.options.customNameGenerator(t);default:return g(t)}}extractMeta(t,e){const u={},s=t.style||{},a=this.options.metaMapping||{};for(const[o,h]of Object.entries(a))s[o]!==void 0&&(u[h]=s[o]);return this.tabBarPages.has(e)&&(u.isTab=!0),u}parsePageToRoute(t,e=""){const u=e?`/${e}/${t.path}`:`/${t.path}`,s=this.generateRouteName(u),a=this.extractMeta(t,u.replace(/^\//,"")),o={path:u,name:s};return Object.keys(a).length>0&&(o.meta=a),o}parsePagesJson(t){const e=[];if(!t.pages||!Array.isArray(t.pages)||t.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),e;if(this.tabBarPages.clear(),t.tabBar?.list)for(const u of t.tabBar.list)this.tabBarPages.add(u.pagePath);for(const u of t.pages)e.push(this.parsePageToRoute(u));if(this.options.includeSubPackages&&t.subPackages){for(const u of t.subPackages)if(u.pages&&Array.isArray(u.pages))for(const s of u.pages)e.push(this.parsePageToRoute(s,u.root))}return e}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
`}generateFileContent(t){const e=this.generateTypeDefinitions(),u=this.options.outputFormat==="ts",s=JSON.stringify(t,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'");return`${e}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${u?": RouteConfig[]":""} = ${s}

export default routes
`}async readPagesJson(){const t=n(this.projectRoot,this.options.pagesJsonPath);if(!i(t))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${t}`),null;try{const e=await c.readFile(t,"utf-8"),u=D(e);return JSON.parse(u)}catch(e){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${e.message}`),null}}extractExistingRoutes(t){const e=new Map,u=t.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!u)return e;try{let s=u[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const a=JSON.parse(s);for(const o of a)o.path&&e.set(o.path,o)}catch{this.logger.warn("\u89E3\u6790\u73B0\u6709 routes \u914D\u7F6E\u5931\u8D25\uFF0C\u5C06\u5B8C\u5168\u91CD\u65B0\u751F\u6210")}return e}mergeRoutes(t,e){return t.map(u=>{const s=e.get(u.path);if(!s)return u;const a={};return u.meta&&Object.assign(a,u.meta),s.meta&&Object.assign(a,s.meta),{...s,path:u.path,meta:Object.keys(a).length>0?a:void 0}})}async generateRouterConfig(){const t=await this.readPagesJson();if(!t)return;let e=this.parsePagesJson(t);const u=n(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&i(u))try{const a=await c.readFile(u,"utf-8"),o=this.extractExistingRoutes(a);o.size>0&&(e=this.mergeRoutes(e,o),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const s=this.generateFileContent(e);await p(u,s),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${u}`),this.logger.info(`\u5171\u751F\u6210 ${e.length} \u6761\u8DEF\u7531\u914D\u7F6E`),await this.generateDtsFile(e)}async generateDtsFile(t){if(!this.options.dts)return;const e=n(this.projectRoot,typeof this.options.dts=="string"?this.options.dts:"src/router.d.ts"),u=y(t);m(e,u)&&(await p(e,u),this.logger.success(`\u8DEF\u7531\u7C7B\u578B\u58F0\u660E\u6587\u4EF6\u5DF2\u751F\u6210: ${e}`))}startWatching(){if(!this.options.watch)return;const t=n(this.projectRoot,this.options.pagesJsonPath);i(t)&&(this.watcher=f(t,async e=>{e==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${t}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(t){t.configResolved=async e=>{this.projectRoot=e.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),e.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const B=l(w);export{B as generateRouter};
