import{c as _,B as E}from"./vite-plugin.DSb6XzBn.mjs";import{c as M,a as O,t as R,m as ie,i as P,l as ne,w as L,d as ue,g as oe,h as se}from"./vite-plugin.C3ejdBNf.mjs";import"crypto";import{resolve as x,join as re}from"path";import{existsSync as S,watch as ae}from"fs";import{V as le}from"./vite-plugin.B88RyRN8.mjs";const N=process.platform==="win32"?["|","/","-","\\"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"],a={reset:"\x1B[0G",clearLine:"\x1B[2K",hideCursor:"\x1B[?25l",showCursor:"\x1B[?25h",green:n=>`\x1B[32m${n}\x1B[39m`,cyan:n=>`\x1B[36m${n}\x1B[39m`,gray:n=>`\x1B[90m${n}\x1B[39m`,bold:n=>`\x1B[1m${n}\x1B[22m`},k={completeColor:a.green,incompleteColor:a.gray,percentageColor:a.bold,phaseColor:a.cyan,moduleColor:a.gray},de={idle:"\u7B49\u5F85\u4E2D",config:"\u8BFB\u53D6\u914D\u7F6E",resolve:"\u89E3\u6790\u6A21\u5757",transform:"\u8F6C\u6362\u6A21\u5757",bundle:"\u6253\u5305\u4E2D",write:"\u5199\u5165\u6587\u4EF6",done:"\u6784\u5EFA\u5B8C\u6210"};class v extends E{totalModules=0;transformedModules=0;currentModule="";phase="idle";spinnerIndex=0;spinnerTimer=null;isDev=!1;theme=k;lastPercentage=0;static ANSI_REGEX=/\x1b\[[0-9;]*m/g;static stripAnsi(e){return e.replace(v.ANSI_REGEX,"")}getDefaultOptions(){return{width:30,format:"bar",completeChar:"\u2588",incompleteChar:"\u2591",clearOnComplete:!0,showModuleName:!0}}validateOptions(){this.validator.field("width").number().custom(e=>!e||e>0,"width \u5FC5\u987B\u5927\u4E8E 0").field("format").custom(e=>!e||["bar","spinner","minimal"].includes(e),"format \u5FC5\u987B\u662F bar, spinner \u6216 minimal").field("completeChar").string().field("incompleteChar").string().field("clearOnComplete").boolean().field("showModuleName").boolean().validate()}getPluginName(){return"build-progress"}onConfigResolved(e){super.onConfigResolved(e),this.theme=this.options.theme||k}getPercentage(){if(this.phase==="done")return this.lastPercentage=100;if(this.phase==="config")return this.lastPercentage=5;if(this.phase==="resolve")return this.lastPercentage=10;if(this.totalModules===0)return this.lastPercentage=15;const e=Math.min(this.transformedModules/this.totalModules*70,70),t=this.phase==="bundle"?10:0,i=this.phase==="write"?5:0,u=Math.min(Math.floor(15+e+t+i),99);return this.lastPercentage=Math.max(u,this.lastPercentage),this.lastPercentage}renderBar(e){const t=this.options.width||30,i=this.options.completeChar||"\u2588",u=this.options.incompleteChar||"\u2591",o=Math.round(e/100*t),s=t-o;return this.theme.completeColor(i.repeat(o))+this.theme.incompleteColor(u.repeat(s))}renderSpinner(){const e=N[this.spinnerIndex%N.length];return this.spinnerIndex++,this.theme.phaseColor(e)}render(e){const t=this.options.format||"bar",i=this.theme.phaseColor(de[this.phase]),u=this.theme.percentageColor(`${e}%`);let o="";if(t==="bar"?o=`${this.renderSpinner()} ${i} ${this.renderBar(e)} ${u}`:t==="spinner"?o=`${this.renderSpinner()} ${i} ${u}`:o=`${i} ${u}`,this.options.showModuleName&&this.currentModule&&this.phase==="transform"){const s=v.stripAnsi(o).length,r=Math.max((process.stdout.columns||80)-s-3,20),c=this.currentModule.length>r?"..."+this.currentModule.slice(-r+3):this.currentModule;o+=` ${this.theme.moduleColor(c)}`}return o}update(){if(!process.stdout.isTTY)return;const e=this.getPercentage(),t=this.render(e);this.safeExecuteSync(()=>{process.stdout.write(a.clearLine+a.reset+t)},"\u66F4\u65B0\u8FDB\u5EA6\u663E\u793A")}startSpinner(){this.spinnerTimer||process.stdout.isTTY&&(this.spinnerTimer=setInterval(()=>this.update(),80))}stopSpinner(){this.spinnerTimer&&(clearInterval(this.spinnerTimer),this.spinnerTimer=null)}complete(){if(this.phase="done",this.stopSpinner(),!process.stdout.isTTY){this.logger.success("\u6784\u5EFA\u5B8C\u6210");return}if(this.options.clearOnComplete)this.safeExecuteSync(()=>{process.stdout.write(a.clearLine+a.reset)},"\u6E05\u9664\u8FDB\u5EA6\u884C");else{const e=this.render(100);this.safeExecuteSync(()=>{process.stdout.write(a.clearLine+a.reset+e+`
`)},"\u8F93\u51FA\u5B8C\u6210\u8FDB\u5EA6")}this.safeExecuteSync(()=>{process.stdout.write(a.showCursor)},"\u6062\u590D\u5149\u6807\u663E\u793A")}addPluginHooks(e){e.config=(t,{command:i})=>(this.isDev=i==="serve",null),e.configResolved=()=>{this.options.enabled&&(this.phase="config",process.stdout.isTTY&&this.safeExecuteSync(()=>{process.stdout.write(a.hideCursor)},"\u9690\u85CF\u5149\u6807"),this.startSpinner())},e.buildStart=()=>{this.options.enabled&&(this.phase="resolve",this.totalModules=0,this.transformedModules=0)},e.resolveId={handler:t=>{this.options.enabled&&(t.includes("node_modules")||t.includes(".virtual")||this.totalModules++)}},e.transform={handler:(t,i)=>{this.options.enabled&&(i.includes("node_modules")||i.includes(".virtual")||(this.phase="transform",this.transformedModules++,this.currentModule=i))}},e.writeBundle=()=>{this.options.enabled&&(this.phase="write",this.update())},e.closeBundle=()=>{this.options.enabled&&this.complete()},e.buildEnd=()=>{this.options.enabled&&(this.isDev||(this.phase="bundle",this.update()))},e.configureServer=()=>{this.options.enabled&&this.isDev&&this.complete()}}destroy(){super.destroy(),this.stopSpinner(),process.stdout.isTTY&&this.safeExecuteSync(()=>{process.stdout.write(a.showCursor)},"\u6062\u590D\u5149\u6807\u663E\u793A")}}const ce=_(v);class he extends E{getDefaultOptions(){return{overwrite:!0,recursive:!0,incremental:!0}}validateOptions(){this.validator.field("sourceDir").required().string().custom(e=>e.trim()!=="","sourceDir \u4E0D\u80FD\u4E3A\u7A7A\u5B57\u7B26\u4E32").field("targetDir").required().string().custom(e=>e.trim()!=="","targetDir \u4E0D\u80FD\u4E3A\u7A7A\u5B57\u7B26\u4E32").field("overwrite").boolean().field("recursive").boolean().field("incremental").boolean().validate()}getPluginName(){return"copy-file"}getEnforce(){return"post"}async copyFiles(){const{sourceDir:e,targetDir:t,overwrite:i=!0,recursive:u=!0,incremental:o=!0,enabled:s=!0}=this.options;if(!s){this.logger.info(`\u63D2\u4EF6\u5DF2\u7981\u7528\uFF0C\u8DF3\u8FC7\u6267\u884C\uFF1A\u4ECE ${e} \u590D\u5236\u5230 ${t}`);return}await M(e);const r=await O(e,t,{recursive:u,overwrite:i,incremental:o});this.logger.success(`\u590D\u5236\u6587\u4EF6\u6210\u529F\uFF1A\u4ECE ${e} \u5230 ${t}`,`\u590D\u5236\u4E86 ${r.copiedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8DF3\u8FC7\u4E86 ${r.skippedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8017\u65F6 ${r.executionTime}ms`)}addPluginHooks(e){e.writeBundle=async()=>{await this.safeExecute(()=>this.copyFiles(),"\u590D\u5236\u6587\u4EF6")}}}const pe=_(he);class fe extends E{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"}}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").custom(e=>!e||["ts","js"].includes(e),"outputFormat \u5FC5\u987B\u662F ts \u6216 js").field("nameStrategy").custom(e=>!e||["path","camelCase","pascalCase","custom"].includes(e),"nameStrategy \u5FC5\u987B\u662F path, camelCase, pascalCase \u6216 custom").validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(e){switch(this.options.nameStrategy){case"path":return e.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return R(e);case"pascalCase":return ie(e);case"custom":return this.options.customNameGenerator(e);default:return R(e)}}extractMeta(e,t){const i={},u=e.style||{},o=this.options.metaMapping||{};for(const[s,r]of Object.entries(o))u[s]!==void 0&&(i[r]=u[s]);return this.tabBarPages.has(t)&&(i.isTab=!0),i}parsePageToRoute(e,t=""){const i=t?`/${t}/${e.path}`:`/${e.path}`,u=this.generateRouteName(i),o=this.extractMeta(e,i.replace(/^\//,"")),s={path:i,name:u};return Object.keys(o).length>0&&(s.meta=o),s}parsePagesJson(e){const t=[];if(!e.pages||!Array.isArray(e.pages)||e.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),t;if(this.tabBarPages.clear(),e.tabBar?.list)for(const i of e.tabBar.list)this.tabBarPages.add(i.pagePath);for(const i of e.pages)t.push(this.parsePageToRoute(i));if(this.options.includeSubPackages&&e.subPackages){for(const i of e.subPackages)if(i.pages&&Array.isArray(i.pages))for(const u of i.pages)t.push(this.parsePageToRoute(u,i.root))}return t}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
`}generateFileContent(e){const t=this.generateTypeDefinitions(),i=this.options.outputFormat==="ts",u=JSON.stringify(e,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'");return`${t}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${i?": RouteConfig[]":""} = ${u}

export default routes
`}async readPagesJson(){const e=x(this.projectRoot,this.options.pagesJsonPath);if(!S(e))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${e}`),null;try{const t=await P(e),i=ne(t);return JSON.parse(i)}catch(t){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${t.message}`),null}}extractExistingRoutes(e){const t=new Map,i=e.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!i)return t;try{let u=i[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const o=JSON.parse(u);for(const s of o)s.path&&t.set(s.path,s)}catch{this.logger.warn("\u89E3\u6790\u73B0\u6709 routes \u914D\u7F6E\u5931\u8D25\uFF0C\u5C06\u5B8C\u5168\u91CD\u65B0\u751F\u6210")}return t}mergeRoutes(e,t){return e.map(i=>{const u=t.get(i.path);if(!u)return i;const o={};return i.meta&&Object.assign(o,i.meta),u.meta&&Object.assign(o,u.meta),{...u,path:i.path,meta:Object.keys(o).length>0?o:void 0}})}async generateRouterConfig(){const e=await this.readPagesJson();if(!e)return;let t=this.parsePagesJson(e);const i=x(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&S(i))try{const o=await P(i),s=this.extractExistingRoutes(o);s.size>0&&(t=this.mergeRoutes(t,s),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const u=this.generateFileContent(t);await L(i,u),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${i}`),this.logger.info(`\u5171\u751F\u6210 ${t.length} \u6761\u8DEF\u7531\u914D\u7F6E`)}startWatching(){if(!this.options.watch)return;const e=x(this.projectRoot,this.options.pagesJsonPath);S(e)&&(this.watcher=ae(e,async t=>{t==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${e}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(e){e.configResolved=async t=>{this.projectRoot=t.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),t.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const ge=_(fe);class me extends E{version="";buildTime=new Date;getDefaultOptions(){return{format:"timestamp",semverBase:"1.0.0",outputType:"file",outputFile:"version.json",defineName:"__APP_VERSION__",hashLength:8,prefix:"",suffix:""}}validateOptions(){if(this.validator.field("format").custom(e=>!e||["timestamp","date","datetime","semver","hash","custom"].includes(e),"format \u5FC5\u987B\u662F timestamp, date, datetime, semver, hash \u6216 custom").field("outputType").custom(e=>!e||["file","define","both"].includes(e),"outputType \u5FC5\u987B\u662F file, define \u6216 both").field("hashLength").number().custom(e=>!e||e>0&&e<=32,"hashLength \u5FC5\u987B\u5728 1-32 \u4E4B\u95F4").validate(),this.options.format==="custom"&&!this.options.customFormat)throw new Error("\u5F53 format \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customFormat")}getPluginName(){return"generate-version"}generateVersion(){const e=ue(this.buildTime),t=oe(this.options.hashLength);let i;switch(this.options.format){case"timestamp":i=`${e.YYYY}${e.MM}${e.DD}${e.HH}${e.mm}${e.ss}`;break;case"date":i=`${e.YYYY}.${e.MM}.${e.DD}`;break;case"datetime":i=`${e.YYYY}.${e.MM}.${e.DD}.${e.HH}${e.mm}${e.ss}`;break;case"semver":i=this.options.semverBase||"1.0.0";break;case"hash":i=t;break;case"custom":i=this.parseCustomFormat({...e,hash:t});break;default:i=e.timestamp}const u=this.options.prefix||"",o=this.options.suffix||"";return`${u}${i}${o}`}parseCustomFormat(e){const t={...e};if(this.options.semverBase){const[i,u,o]=this.options.semverBase.split(".");t.major=i||"1",t.minor=u||"0",t.patch=o||"0"}return se(this.options.customFormat||"",t)}generateVersionInfo(){return{version:this.version,buildTime:this.buildTime.toISOString(),timestamp:this.buildTime.getTime(),format:this.options.format,...this.options.extra}}async writeVersionFile(e){const t=re(e,this.options.outputFile||"version.json"),i=this.generateVersionInfo();await L(t,JSON.stringify(i,null,2)),this.logger.success(`\u7248\u672C\u6587\u4EF6\u5DF2\u751F\u6210: ${t}`)}addPluginHooks(e){e.configResolved=()=>{this.buildTime=new Date,this.version=this.generateVersion(),this.logger.info(`\u751F\u6210\u7248\u672C\u53F7: ${this.version}`)},(this.options.outputType==="define"||this.options.outputType==="both")&&(e.config=()=>{this.version||(this.buildTime=new Date,this.version=this.generateVersion());const t=this.options.defineName||"__APP_VERSION__";return this.logger.info(`\u6CE8\u5165\u5168\u5C40\u53D8\u91CF: ${t} = "${this.version}"`),{define:{[t]:JSON.stringify(this.version),[`${t}_INFO`]:JSON.stringify(this.generateVersionInfo())}}}),(this.options.outputType==="file"||this.options.outputType==="both")&&(e.writeBundle=async()=>{this.viteConfig&&await this.safeExecute(async()=>{const t=this.viteConfig.build.outDir;await this.writeVersionFile(t)},"\u5199\u5165\u7248\u672C\u6587\u4EF6")})}}const _e=_(me);function Ee(n){const e=[];if(n.link)return[];if(n.icons&&n.icons.length>0)for(const t of n.icons){const i={rel:t.rel,href:t.href};t.sizes&&(i.sizes=t.sizes),t.type&&(i.type=t.type),e.push({tag:"link",attrs:i,injectTo:"head"})}else if(n.url)e.push({tag:"link",attrs:{rel:"icon",href:n.url},injectTo:"head"});else{const t=n.base||"/",i=t.endsWith("/")?`${t}favicon.ico`:`${t}/favicon.ico`;e.push({tag:"link",attrs:{rel:"icon",href:i},injectTo:"head"})}return e}class Fe extends E{getDefaultOptions(){return{base:"/"}}validateOptions(){this.validator.field("base").string().field("url").string().field("link").string().field("icons").array(),this.options?.copyOptions&&(this.validator.field("copyOptions").object(),new le(this.options.copyOptions).field("sourceDir").required().string().field("targetDir").required().string().field("overwrite").boolean().field("recursive").boolean().validate()),this.validator.validate()}getPluginName(){return"inject-ico"}getIconTagDescriptors(){if(!this.options.enabled)return this.logger.info("\u63D2\u4EF6\u5DF2\u7981\u7528\uFF0C\u8DF3\u8FC7\u56FE\u6807\u6CE8\u5165"),[];const e=Ee(this.options);return e.length>0&&this.logger.success(`\u6210\u529F\u6CE8\u5165 ${e.length} \u4E2A\u56FE\u6807\u6807\u7B7E\u5230 HTML \u6587\u4EF6`),e}injectCustomLinkTag(e){if(!this.options.enabled||!this.options.link)return e;const t=this.options.link,i=/<\/head>/i,u=e.match(i);if(u&&u.index!==void 0){const o=e.slice(0,u.index)+t+`
`+e.slice(u.index);return this.logger.success("\u6210\u529F\u6CE8\u5165\u81EA\u5B9A\u4E49\u56FE\u6807\u6807\u7B7E\u5230 HTML \u6587\u4EF6"),this.logger.info(`  - ${t}`),o}return this.logger.warn("\u672A\u627E\u5230 </head> \u6807\u7B7E\uFF0C\u8DF3\u8FC7\u56FE\u6807\u6CE8\u5165"),e}async copyFiles(){if(!this.options.enabled){this.logger.info("\u63D2\u4EF6\u5DF2\u7981\u7528\uFF0C\u8DF3\u8FC7\u6587\u4EF6\u590D\u5236");return}const{copyOptions:e}=this.options;if(!e)return;const{sourceDir:t,targetDir:i,overwrite:u=!0,recursive:o=!0}=e;await M(t);const s=await O(t,i,{recursive:o,overwrite:u,incremental:!0});this.logger.success(`\u56FE\u6807\u6587\u4EF6\u590D\u5236\u6210\u529F\uFF1A\u4ECE ${t} \u5230 ${i}`,`\u590D\u5236\u4E86 ${s.copiedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8DF3\u8FC7\u4E86 ${s.skippedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8017\u65F6 ${s.executionTime}ms`)}addPluginHooks(e){e.transformIndexHtml={order:"pre",handler:t=>{if(this.options.link)return this.injectCustomLinkTag(t);const i=this.getIconTagDescriptors();return i.length>0?{html:t,tags:i}:t}},e.writeBundle=async()=>{await this.safeExecute(()=>this.copyFiles(),"\u56FE\u6807\u6587\u4EF6\u590D\u5236")}}}const ye=_(Fe,n=>typeof n=="string"?{base:n}:n||{}),l="__loading-overlay__",f="__loading-hidden__",g="__loading-visible__",I="__loading-top__",j="__loading-center__",U="__loading-bottom__",d="__loading-spinner__",V="__loading-text__",h="__loading-dot__",A="__loading-root__",J="data-loading-text",q="__loading-spin__",X="__loading-dots__",G="__loading-pulse__",Y="__loading-bar__",Ce={center:j,top:I,bottom:U};function be(n){return n.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function $e(n,e="spinner",t){const{overlayColor:i="rgba(255, 255, 255, 0.7)",spinnerColor:u="#4361ee",spinnerSize:o="40px",textColor:s="#333",textSize:r="14px",zIndex:c=9999,pointerEvents:m=!0,backdropBlur:p=!1,backdropBlurAmount:y=4}=n,w=m?"":"pointer-events: none;",D=p?`backdrop-filter: blur(${y}px);-webkit-backdrop-filter: blur(${y}px);`:"",B=ve(e,u,o),T=t?.enabled!==!1,C=t?.duration??200,b=t?.easing??"ease-out",$=T?`transition: opacity ${C}ms ${b}, visibility ${C}ms ${b};`:"";return`
.${l} {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${i};
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: ${c};
  ${w}
  ${D}
  contain: content;
  will-change: opacity;
}
.${l}.${I} {
  justify-content: flex-start;
  padding-top: 60px;
}
.${l}.${j} {
  justify-content: center;
}
.${l}.${U} {
  justify-content: flex-end;
  padding-bottom: 60px;
}
${B}
.${V} {
  margin-top: 12px;
  color: ${s};
  font-size: ${r};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
}
.${l}.${f} {
  opacity: 0;
  visibility: hidden;
  ${$}
}
.${l}.${f} .${d},
.${l}.${f} .${h},
.${l}.${f} .${d}::after {
  animation-play-state: paused;
}
.${l}.${g} {
  opacity: 1;
  visibility: visible;
  ${$}
}
.${l}.${g} .${d},
.${l}.${g} .${h},
.${l}.${g} .${d}::after {
  animation-play-state: running;
}`}function ve(n,e,t){switch(n){case"dots":return`
.${d} {
  display: flex;
  gap: 6px;
  align-items: center;
}
.${d} .${h} {
  width: calc(${t} / 4);
  height: calc(${t} / 4);
  border-radius: 50%;
  background: ${e};
  animation: ${X} 1.2s ease-in-out infinite;
}
.${d} .${h}:nth-child(2) { animation-delay: 0.15s; }
.${d} .${h}:nth-child(3) { animation-delay: 0.3s; }
@keyframes ${X} {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}`;case"pulse":return`
.${d} {
  width: ${t};
  height: ${t};
  background: ${e};
  border-radius: 50%;
  animation: ${G} 1.2s ease-in-out infinite;
}
@keyframes ${G} {
  0% { transform: scale(0.3); opacity: 0.3; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.3); opacity: 0.3; }
}`;case"bar":return`
.${d} {
  width: calc(${t} * 2.5);
  height: calc(${t} / 5);
  background: rgba(0, 0, 0, 0.08);
  border-radius: calc(${t} / 10);
  overflow: hidden;
  position: relative;
}
.${d}::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  background: ${e};
  border-radius: calc(${t} / 10);
  animation: ${Y} 1.2s ease-in-out infinite;
}
@keyframes ${Y} {
  0% { left: -40%; }
  100% { left: 100%; }
}`;default:return`
.${d} {
  width: ${t};
  height: ${t};
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: ${e};
  border-radius: 50%;
  animation: ${q} 0.8s linear infinite;
}
@keyframes ${q} {
  to { transform: rotate(360deg); }
}`}}function we(n){const e=n.position||"center",t=n.defaultText||"\u52A0\u8F7D\u4E2D...",i=n.spinnerType||"spinner",u=Ce[e],o=n.style?.customClass?` ${n.style.customClass}`:"",s=n.style?.customStyle?` style="${be(n.style.customStyle)}"`:"",r=n.defaultVisible?g:f;if(n.customTemplate)return`<div class="${l} ${u} ${r}${o}" id="${A}"${s}>${n.customTemplate}</div>`;const c=De(i);return`<div class="${l} ${u} ${r}${o}" id="${A}"${s}>
  ${c}
  <div class="${V}" ${J}>${t}</div>
</div>`}function De(n){switch(n){case"dots":return`<div class="${d}"><div class="${h}"></div><div class="${h}"></div><div class="${h}"></div></div>`;default:return`<div class="${d}"></div>`}}function F(n){return n?`function() { try { ${n} } catch(e) { console.error('[injectLoading] callback error:', e); } }`:"function() {}"}function Be(n){return`  var _loadingEl = null;
  var _textEl = null;
  var _styleEl = null;
  var _visible = false;
  var _destroyed = false;
  var _showTimer = null;
  var _hideTimer = null;
  var _debounceTimer = null;
  var _retryTimer = null;
  var _showTime = 0;
  var _pendingCount = 0;
  var _showRetryCount = 0;
  var _maxShowRetries = 20;

  // \u914D\u7F6E
  var _minDisplayTime = ${JSON.stringify(n.minDisplayTime)};
  var _delayShow = ${JSON.stringify(n.delayShow)};
  var _debounceHide = ${JSON.stringify(n.debounceHide)};
  var _transition = ${JSON.stringify(n.transition)};
  var _excludeUrls = ${JSON.stringify(n.excludeUrls.map(e=>({source:e.source,flags:e.flags})))}.map(function(s) { return new RegExp(s.source, s.flags); });
  var _includeUrls = ${JSON.stringify(n.includeUrls.map(e=>({source:e.source,flags:e.flags})))}.map(function(s) { return new RegExp(s.source, s.flags); });
  var _excludeMethods = ${JSON.stringify(n.excludeMethods)};
  var _excludeUrlPrefixes = ${JSON.stringify(n.excludeUrlPrefixes)};

  // \u56DE\u8C03
  var _onBeforeShow = ${n.cbBeforeShow};
  var _onShow = ${n.cbShow};
  var _onBeforeHide = ${n.cbBeforeHide};
  var _onHide = ${n.cbHide};
  var _onDestroy = ${n.cbDestroy};

  // \u4FDD\u5B58\u539F\u59CB\u65B9\u6CD5\u5F15\u7528\uFF0C\u7528\u4E8E destroy \u65F6\u6062\u590D
  var _originalFetch = null;
  var _originalXHROpen = null;
  var _originalXHRSend = null;`}function Te(n){return`  function _findEl() {
    if (!_loadingEl) {
      _loadingEl = document.getElementById('${A}');
    }
    if (!_textEl && _loadingEl) {
      _textEl = _loadingEl.querySelector('[${J}]');
    }
    if (!_styleEl) {
      _styleEl = document.querySelector('style[data-loading-id="${n}"]');
    }
  }

  function _shouldFilter(url, method) {
    if (!url) return false;
    var upperMethod = (method || 'GET').toUpperCase();
    for (var i = 0; i < _excludeMethods.length; i++) {
      if (upperMethod === _excludeMethods[i].toUpperCase()) return true;
    }
    for (var i = 0; i < _excludeUrlPrefixes.length; i++) {
      if (url.indexOf(_excludeUrlPrefixes[i]) === 0) return true;
    }
    if (_includeUrls.length > 0) {
      var included = false;
      for (var i = 0; i < _includeUrls.length; i++) {
        _includeUrls[i].lastIndex = 0;
        if (_includeUrls[i].test(url)) { included = true; break; }
      }
      if (!included) return true;
    }
    for (var i = 0; i < _excludeUrls.length; i++) {
      _excludeUrls[i].lastIndex = 0;
      if (_excludeUrls[i].test(url)) return true;
    }
    return false;
  }

  function _clearTimers() {
    if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
    if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }
    if (_debounceTimer) { clearTimeout(_debounceTimer); _debounceTimer = null; }
    if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null; }
  }

  function _applyTransition(show) {
    if (!_transition.enabled || !_loadingEl) return;
    var d = _transition.duration || 200;
    var e = _transition.easing || 'ease-out';
    _loadingEl.style.transition = 'opacity ' + d + 'ms ' + e + ', visibility ' + d + 'ms ' + e;
  }`}function xe(){return`  function _applyHide() {
    if (!_loadingEl) return;
    _loadingEl.classList.remove('${g}');
    _loadingEl.classList.add('${f}');
    _applyTransition(false);
    _visible = false;
    _showTime = 0;
    _onHide();
  }

  function _doShow(text) {
    if (_destroyed) return;
    _findEl();
    if (!_loadingEl) {
      if (++_showRetryCount > _maxShowRetries) return;
      _retryTimer = setTimeout(function() { _retryTimer = null; _doShow(text); }, 50);
      return;
    }
    _showRetryCount = 0;

    var result = _onBeforeShow();
    if (result === false) return;

    if (_textEl && text) _textEl.textContent = text;
    _loadingEl.classList.remove('${f}');
    _loadingEl.classList.add('${g}');
    _applyTransition(true);
    _visible = true;
    _showTime = Date.now();
    _onShow();
  }

  function _doHide(force) {
    if (_destroyed) return;
    if (!_visible && !force) return;
    _findEl();
    if (!_loadingEl) return;

    if (!force) {
      var result = _onBeforeHide();
      if (result === false) return;
    }

    if (!force && _minDisplayTime.enabled && _showTime > 0) {
      var elapsed = Date.now() - _showTime;
      var remaining = _minDisplayTime.duration - elapsed;
      if (remaining > 0) {
        if (_hideTimer) clearTimeout(_hideTimer);
        _hideTimer = setTimeout(function() { _hideTimer = null; _doHide(true); }, remaining);
        return;
      }
    }

    if (_debounceHide.enabled && !force) {
      if (_debounceTimer) clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(function() { _debounceTimer = null; _applyHide(); }, _debounceHide.duration);
      return;
    }

    _applyHide();
  }

  function _restoreInterceptors() {
    if (_originalFetch && typeof window !== 'undefined' && window.fetch) {
      window.fetch = _originalFetch;
      _originalFetch = null;
    }
    if (_originalXHROpen && typeof window !== 'undefined' && window.XMLHttpRequest) {
      XMLHttpRequest.prototype.open = _originalXHROpen;
      XMLHttpRequest.prototype.send = _originalXHRSend;
      _originalXHROpen = null;
      _originalXHRSend = null;
    }
  }`}function Se(){return`    show: function(text) {
      if (_destroyed) return;
      _clearTimers();
      _showTime = 0;
      _showRetryCount = 0;
      if (_delayShow.enabled && _delayShow.duration > 0) {
        _showTimer = setTimeout(function() { _showTimer = null; _doShow(text); }, _delayShow.duration);
      } else {
        _doShow(text);
      }
    },
    hide: function() {
      if (_destroyed) return;
      if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
      _doHide(false);
    },
    forceHide: function() {
      if (_destroyed) return;
      _clearTimers();
      _doHide(true);
    },
    toggle: function(text) {
      if (_destroyed) return;
      if (_visible) {
        this.hide();
      } else {
        this.show(text);
      }
    },
    enablePointerEvents: function() {
      if (_destroyed) return;
      _findEl();
      if (_loadingEl) _loadingEl.style.pointerEvents = 'auto';
    },
    disablePointerEvents: function() {
      if (_destroyed) return;
      _findEl();
      if (_loadingEl) _loadingEl.style.pointerEvents = 'none';
    },
    togglePointerEvents: function() {
      if (_destroyed) return;
      _findEl();
      if (!_loadingEl) return;
      if (_loadingEl.style.pointerEvents === 'none') {
        this.enablePointerEvents();
      } else {
        this.disablePointerEvents();
      }
    },
    updateText: function(text) {
      if (_destroyed) return;
      _findEl();
      if (_textEl) _textEl.textContent = text;
    },
    isVisible: function() {
      return _visible && !_destroyed;
    },
    isPointerEventsEnabled: function() {
      if (_destroyed) return false;
      _findEl();
      if (!_loadingEl) return false;
      return _loadingEl.style.pointerEvents !== 'none';
    },
    getPendingCount: function() {
      return _pendingCount;
    },
    destroy: function() {
      if (_destroyed) return;
      _destroyed = true;
      _clearTimers();
      _findEl();
      if (_loadingEl && _loadingEl.parentNode) {
        _loadingEl.parentNode.removeChild(_loadingEl);
      }
      if (_styleEl && _styleEl.parentNode) {
        _styleEl.parentNode.removeChild(_styleEl);
      }
      _loadingEl = null;
      _textEl = null;
      _styleEl = null;
      _visible = false;
      _showTime = 0;
      _pendingCount = 0;
      _restoreInterceptors();
      _onDestroy();
    },
    _requestStart: function(url, method) {
      if (_destroyed) return;
      if (_shouldFilter(url, method)) return;
      _pendingCount++;
      if (_pendingCount === 1) this.show();
    },
    _requestEnd: function(url, method) {
      if (_destroyed) return;
      if (_shouldFilter(url, method)) return;
      _pendingCount = Math.max(0, _pendingCount - 1);
      if (_pendingCount === 0) this.hide();
    }`}function Ae(n){let e="";return(n==="fetch"||n==="all")&&(e+=`  // \u81EA\u52A8\u62E6\u622A fetch
  if (typeof window !== 'undefined' && window.fetch) {
    _originalFetch = window.fetch;
    window.fetch = function(input, init) {
      var url = typeof input === 'string' ? input : (input instanceof URL ? input.href : (input && input.url ? input.url : ''));
      var method = (init && init.method) || (input && input.method) || 'GET';
      manager._requestStart(url, method);
      return _originalFetch.apply(this, arguments).then(
        function(response) { manager._requestEnd(url, method); return response; },
        function(error) { manager._requestEnd(url, method); throw error; }
      );
    };
  }
`),(n==="xhr"||n==="all")&&(e+=`  // \u81EA\u52A8\u62E6\u622A XMLHttpRequest
  if (typeof window !== 'undefined' && window.XMLHttpRequest) {
    _originalXHROpen = XMLHttpRequest.prototype.open;
    _originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.__loadingUrl = url || '';
      this.__loadingMethod = method || 'GET';
      return _originalXHROpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function() {
      var self = this;
      manager._requestStart(self.__loadingUrl, self.__loadingMethod);
      self.addEventListener('loadend', function() {
        manager._requestEnd(self.__loadingUrl, self.__loadingMethod);
      });
      return _originalXHRSend.apply(this, arguments);
    };
  }
`),e.trimEnd()}function He(n,e,t){let i="";return i+=`  // defaultVisible: \u540C\u6B65\u521D\u59CB\u53EF\u89C1\u72B6\u6001
  var _defaultVisible = ${JSON.stringify(n)};
  if (_defaultVisible) {
    _visible = true;
    _showTime = Date.now();
  }
`,n&&e!=="manual"&&(i+=`
  // autoHideOn: \u81EA\u52A8\u9690\u85CF\u65F6\u673A
  var _autoHideOn = '${e}';
  function _autoHideHandler() {
    manager.hide();
  }
  if (_autoHideOn === 'load') {
    if (document.readyState === 'complete') {
      _autoHideHandler();
    } else {
      window.addEventListener('load', _autoHideHandler);
    }
  } else {
    if (document.readyState !== 'loading') {
      _autoHideHandler();
    } else {
      document.addEventListener('DOMContentLoaded', _autoHideHandler);
    }
  }
`),i+=`
  // \u66B4\u9732\u5230\u5168\u5C40
  window['${t}'] = manager;`,i}function Me(n){const e=n.globalName||"__LOADING_MANAGER__",t=n.minDisplayTime||{enabled:!0,duration:300},i=n.delayShow||{enabled:!0,duration:200},u=n.debounceHide||{enabled:!1,duration:100},o=n.transition||{enabled:!0,duration:200,easing:"ease-out"},s=n.autoBind||"none",r=n.requestFilter||{},c=n.defaultVisible||!1,m=n.autoHideOn||"DOMContentLoaded",p=n.callbacks||{},y=r.excludeUrls||[],w=r.includeUrls||[],D=r.excludeMethods||[],B=r.excludeUrlPrefixes||[],T=F(p.onBeforeShow),C=F(p.onShow),b=F(p.onBeforeHide),$=F(p.onHide),z=F(p.onDestroy),W=Be({minDisplayTime:t,delayShow:i,debounceHide:u,transition:o,excludeUrls:y,includeUrls:w,excludeMethods:D,excludeUrlPrefixes:B,cbBeforeShow:T,cbShow:C,cbBeforeHide:b,cbHide:$,cbDestroy:z}),Z=Te(e),K=xe(),Q=Se(),ee=Ae(s),te=He(c,m,e);return`(function() {
  'use strict';

  // SSR \u73AF\u5883\u68C0\u6D4B
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

${W}

${Z}

${K}

  var manager = {
${Q}
  };

${ee}

${te}
})();`}function Oe(n){if(!n)return;const{zIndex:e,pointerEvents:t,backdropBlurAmount:i}=n;if(e!==void 0&&(typeof e!="number"||e<0))throw new Error("style.zIndex \u5FC5\u987B\u662F\u975E\u8D1F\u6570");if(t!==void 0&&typeof t!="boolean")throw new Error("style.pointerEvents \u5FC5\u987B\u662F\u5E03\u5C14\u503C");if(i!==void 0&&(typeof i!="number"||i<0))throw new Error("style.backdropBlurAmount \u5FC5\u987B\u662F\u975E\u8D1F\u6570")}function H(n,e){if(n?.duration!==void 0&&(typeof n.duration!="number"||n.duration<0))throw new Error(e)}function Re(n){if(!n)return;const{duration:e,easing:t}=n;if(e!==void 0&&(typeof e!="number"||e<0))throw new Error("transition.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570");if(t!==void 0&&typeof t!="string")throw new Error("transition.easing \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B")}function Pe(n){if(!n)return;const e=["onBeforeShow","onShow","onBeforeHide","onHide","onDestroy"];for(const t of e){if(n[t]!==void 0&&typeof n[t]!="string")throw new Error(`callbacks.${t} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B`);if(n[t]&&/<script\b/i.test(n[t]))throw new Error(`callbacks.${t} \u4E0D\u5141\u8BB8\u5305\u542B <script> \u6807\u7B7E`)}}function Le(n){if(n&&/<script\b/i.test(n))throw new Error("customTemplate \u4E0D\u5141\u8BB8\u5305\u542B <script> \u6807\u7B7E\uFF0C\u8BF7\u4F7F\u7528 callbacks \u914D\u7F6E\u56DE\u8C03\u903B\u8F91")}function Ne(n){if(n){if(!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(n))throw new Error(`globalName "${n}" \u4E0D\u662F\u5408\u6CD5\u7684 JavaScript \u6807\u8BC6\u7B26\uFF0C\u5FC5\u987B\u4EE5\u5B57\u6BCD\u3001\u4E0B\u5212\u7EBF\u6216\u7F8E\u5143\u7B26\u5F00\u5934\uFF0C\u4EC5\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u548C\u7F8E\u5143\u7B26`);if(["__proto__","constructor","prototype"].includes(n))throw new Error(`globalName "${n}" \u662F JavaScript \u5185\u7F6E\u5C5E\u6027\uFF0C\u53EF\u80FD\u5BFC\u81F4\u539F\u578B\u6C61\u67D3\uFF0C\u8BF7\u4F7F\u7528\u5176\u4ED6\u540D\u79F0`)}}function ke(n){return n===""?"defaultText \u4E3A\u7A7A\u5B57\u7B26\u4E32\uFF0Cloading \u5C06\u4E0D\u663E\u793A\u6587\u672C\u5185\u5BB9":null}function Ie(n,e){return!n&&e?"autoHideOn \u4EC5\u5728 defaultVisible \u4E3A true \u65F6\u751F\u6548\uFF0C\u5F53\u524D defaultVisible \u4E3A false\uFF0CautoHideOn \u914D\u7F6E\u5C06\u88AB\u5FFD\u7565":null}class je extends E{getDefaultOptions(){return{position:"center",defaultText:"\u52A0\u8F7D\u4E2D...",spinnerType:"spinner",autoBind:"none",globalName:"__LOADING_MANAGER__",defaultVisible:!1,autoHideOn:"DOMContentLoaded",style:{overlayColor:"rgba(255, 255, 255, 0.7)",spinnerColor:"#4361ee",spinnerSize:"40px",textColor:"#333",textSize:"14px",zIndex:9999,pointerEvents:!0,backdropBlur:!1,backdropBlurAmount:4},transition:{enabled:!0,duration:200,easing:"ease-out"},minDisplayTime:{enabled:!0,duration:300},delayShow:{enabled:!0,duration:200},debounceHide:{enabled:!1,duration:100}}}validateOptions(){this.validator.field("position").custom(i=>!i||["center","top","bottom"].includes(i),"position \u5FC5\u987B\u662F center, top \u6216 bottom").field("defaultText").string().field("spinnerType").custom(i=>!i||["spinner","dots","pulse","bar"].includes(i),"spinnerType \u5FC5\u987B\u662F spinner, dots, pulse \u6216 bar").field("autoBind").custom(i=>!i||["fetch","xhr","all","none"].includes(i),"autoBind \u5FC5\u987B\u662F fetch, xhr, all \u6216 none").field("globalName").string().field("customTemplate").string().field("defaultVisible").boolean().field("autoHideOn").custom(i=>!i||["DOMContentLoaded","load","manual"].includes(i),"autoHideOn \u5FC5\u987B\u662F DOMContentLoaded, load \u6216 manual").validate(),Le(this.options.customTemplate);const e=ke(this.options.defaultText);e&&this.logger.warn(e),Ne(this.options.globalName),Oe(this.options.style),H(this.options.minDisplayTime,"minDisplayTime.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570"),H(this.options.delayShow,"delayShow.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570"),H(this.options.debounceHide,"debounceHide.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570"),Re(this.options.transition),Pe(this.options.callbacks);const t=Ie(this.options.defaultVisible,this.options.autoHideOn);t&&this.logger.warn(t)}getPluginName(){return"inject-loading"}generateLoadingManager(e){return Me(e)}generateHeadInjectCode(){const{css:e,html:t}=this.getCachedAssets();return`<!-- inject-loading: head start -->
<style data-loading-style data-loading-id="${this.options.globalName||"__LOADING_MANAGER__"}">${e}</style>
${t}
<!-- inject-loading: head end -->`}generateBodyInjectCode(e){const t=this.generateLoadingManager(this.options);if(e)return`<!-- inject-loading: body start -->
<script>${t}<\/script>
<!-- inject-loading: body end -->`;const{css:i,html:u}=this.getCachedAssets();return`<!-- inject-loading: start -->
<script>
(function() {
  // SSR \u73AF\u5883\u68C0\u6D4B
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // \u6CE8\u5165 CSS
  var style = document.createElement('style');
  style.setAttribute('data-loading-style', '');
  style.setAttribute('data-loading-id', '${this.options.globalName||"__LOADING_MANAGER__"}');
  style.textContent = ${JSON.stringify(i)};
  document.head.appendChild(style);

  // \u6CE8\u5165 HTML\uFF08\u7B49\u5F85 body \u53EF\u7528\u65F6\u6267\u884C\uFF09
  function injectHTML() {
    var div = document.createElement('div');
    div.innerHTML = ${JSON.stringify(u)};
    while (div.firstChild) {
      document.body.appendChild(div.firstChild);
    }
  }

  if (document.body) {
    injectHTML();
  } else {
    document.addEventListener('DOMContentLoaded', injectHTML);
  }
})();
${t}
<\/script>
<!-- inject-loading: end -->`}_cachedAssets=null;getCachedAssets(){if(!this._cachedAssets){const e=this.options.style||{},t=this.options.spinnerType||"spinner",i=this.options.transition;this._cachedAssets={css:$e(e,t,i),html:we(this.options)}}return this._cachedAssets}addPluginHooks(e){const t=this.options.defaultVisible||!1,i=t?this.generateHeadInjectCode():"",u=this.generateBodyInjectCode(t);e.transformIndexHtml={order:"post",handler:o=>{let s=o;if(i){const m=/<\/head>/i;m.test(s)?s=s.replace(m,`${i}
</head>`):this.logger.warn("\u672A\u627E\u5230 </head> \u6807\u7B7E\uFF0CdefaultVisible \u7684\u767D\u5C4F loading \u5C06\u65E0\u6CD5\u751F\u6548")}const r=/<\/body>/i;if(r.test(s))return s=s.replace(r,`${u}
</body>`),this.logger.success("\u6210\u529F\u6CE8\u5165\u5168\u5C40 Loading \u72B6\u6001\u7BA1\u7406\u4EE3\u7801\u5230 HTML \u6587\u4EF6"),s;const c=/<\/html>/i;return c.test(s)?(s=s.replace(c,`${u}
</html>`),this.logger.success("\u6210\u529F\u6CE8\u5165\u5168\u5C40 Loading \u72B6\u6001\u7BA1\u7406\u4EE3\u7801\u5230 HTML \u6587\u4EF6"),s):(this.logger.warn("\u672A\u627E\u5230 </body> \u6216 </html> \u6807\u7B7E\uFF0CLoading \u4EE3\u7801\u8FFD\u52A0\u5230\u6587\u4EF6\u672B\u5C3E"),s+u)}}}}const Ue=_(je);export{_e as a,ce as b,pe as c,Ue as d,ge as g,ye as i};
