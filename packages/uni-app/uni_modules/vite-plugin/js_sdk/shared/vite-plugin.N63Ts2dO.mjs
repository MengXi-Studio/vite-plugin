import{c as m,B as F}from"./vite-plugin.DSb6XzBn.mjs";import{c as H,a as M,t as O,m as Z,i as L,l as ee,w as R,d as te,g as ie,h as ue}from"./vite-plugin.C3ejdBNf.mjs";import"crypto";import{resolve as x,join as ne}from"path";import{existsSync as S,watch as oe}from"fs";import{V as se}from"./vite-plugin.B88RyRN8.mjs";const N=process.platform==="win32"?["|","/","-","\\"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"],a={reset:"\x1B[0G",clearLine:"\x1B[2K",hideCursor:"\x1B[?25l",showCursor:"\x1B[?25h",green:s=>`\x1B[32m${s}\x1B[39m`,cyan:s=>`\x1B[36m${s}\x1B[39m`,gray:s=>`\x1B[90m${s}\x1B[39m`,bold:s=>`\x1B[1m${s}\x1B[22m`},k={completeColor:a.green,incompleteColor:a.gray,percentageColor:a.bold,phaseColor:a.cyan,moduleColor:a.gray},re={idle:"\u7B49\u5F85\u4E2D",config:"\u8BFB\u53D6\u914D\u7F6E",resolve:"\u89E3\u6790\u6A21\u5757",transform:"\u8F6C\u6362\u6A21\u5757",bundle:"\u6253\u5305\u4E2D",write:"\u5199\u5165\u6587\u4EF6",done:"\u6784\u5EFA\u5B8C\u6210"};class v extends F{totalModules=0;transformedModules=0;currentModule="";phase="idle";spinnerIndex=0;spinnerTimer=null;isDev=!1;theme=k;lastPercentage=0;static ANSI_REGEX=/\x1b\[[0-9;]*m/g;static stripAnsi(e){return e.replace(v.ANSI_REGEX,"")}getDefaultOptions(){return{width:30,format:"bar",completeChar:"\u2588",incompleteChar:"\u2591",clearOnComplete:!0,showModuleName:!0}}validateOptions(){this.validator.field("width").number().custom(e=>!e||e>0,"width \u5FC5\u987B\u5927\u4E8E 0").field("format").custom(e=>!e||["bar","spinner","minimal"].includes(e),"format \u5FC5\u987B\u662F bar, spinner \u6216 minimal").field("completeChar").string().field("incompleteChar").string().field("clearOnComplete").boolean().field("showModuleName").boolean().validate()}getPluginName(){return"build-progress"}onConfigResolved(e){super.onConfigResolved(e),this.theme=this.options.theme||k}getPercentage(){if(this.phase==="done")return this.lastPercentage=100;if(this.phase==="config")return this.lastPercentage=5;if(this.phase==="resolve")return this.lastPercentage=10;if(this.totalModules===0)return this.lastPercentage=15;const e=Math.min(this.transformedModules/this.totalModules*70,70),t=this.phase==="bundle"?10:0,i=this.phase==="write"?5:0,u=Math.min(Math.floor(15+e+t+i),99);return this.lastPercentage=Math.max(u,this.lastPercentage),this.lastPercentage}renderBar(e){const t=this.options.width||30,i=this.options.completeChar||"\u2588",u=this.options.incompleteChar||"\u2591",n=Math.round(e/100*t),o=t-n;return this.theme.completeColor(i.repeat(n))+this.theme.incompleteColor(u.repeat(o))}renderSpinner(){const e=N[this.spinnerIndex%N.length];return this.spinnerIndex++,this.theme.phaseColor(e)}render(e){const t=this.options.format||"bar",i=this.theme.phaseColor(re[this.phase]),u=this.theme.percentageColor(`${e}%`);let n="";if(t==="bar"?n=`${this.renderSpinner()} ${i} ${this.renderBar(e)} ${u}`:t==="spinner"?n=`${this.renderSpinner()} ${i} ${u}`:n=`${i} ${u}`,this.options.showModuleName&&this.currentModule&&this.phase==="transform"){const o=v.stripAnsi(n).length,r=Math.max((process.stdout.columns||80)-o-3,20),l=this.currentModule.length>r?"..."+this.currentModule.slice(-r+3):this.currentModule;n+=` ${this.theme.moduleColor(l)}`}return n}update(){if(!process.stdout.isTTY)return;const e=this.getPercentage(),t=this.render(e);this.safeExecuteSync(()=>{process.stdout.write(a.clearLine+a.reset+t)},"\u66F4\u65B0\u8FDB\u5EA6\u663E\u793A")}startSpinner(){this.spinnerTimer||process.stdout.isTTY&&(this.spinnerTimer=setInterval(()=>this.update(),80))}stopSpinner(){this.spinnerTimer&&(clearInterval(this.spinnerTimer),this.spinnerTimer=null)}complete(){if(this.phase="done",this.stopSpinner(),!process.stdout.isTTY){this.logger.success("\u6784\u5EFA\u5B8C\u6210");return}if(this.options.clearOnComplete)this.safeExecuteSync(()=>{process.stdout.write(a.clearLine+a.reset)},"\u6E05\u9664\u8FDB\u5EA6\u884C");else{const e=this.render(100);this.safeExecuteSync(()=>{process.stdout.write(a.clearLine+a.reset+e+`
`)},"\u8F93\u51FA\u5B8C\u6210\u8FDB\u5EA6")}this.safeExecuteSync(()=>{process.stdout.write(a.showCursor)},"\u6062\u590D\u5149\u6807\u663E\u793A")}addPluginHooks(e){e.config=(t,{command:i})=>(this.isDev=i==="serve",null),e.configResolved=()=>{this.options.enabled&&(this.phase="config",process.stdout.isTTY&&this.safeExecuteSync(()=>{process.stdout.write(a.hideCursor)},"\u9690\u85CF\u5149\u6807"),this.startSpinner())},e.buildStart=()=>{this.options.enabled&&(this.phase="resolve",this.totalModules=0,this.transformedModules=0)},e.resolveId={handler:t=>{this.options.enabled&&(t.includes("node_modules")||t.includes(".virtual")||this.totalModules++)}},e.transform={handler:(t,i)=>{this.options.enabled&&(i.includes("node_modules")||i.includes(".virtual")||(this.phase="transform",this.transformedModules++,this.currentModule=i))}},e.writeBundle=()=>{this.options.enabled&&(this.phase="write",this.update())},e.closeBundle=()=>{this.options.enabled&&this.complete()},e.buildEnd=()=>{this.options.enabled&&(this.isDev||(this.phase="bundle",this.update()))},e.configureServer=()=>{this.options.enabled&&this.isDev&&this.complete()}}destroy(){super.destroy(),this.stopSpinner(),process.stdout.isTTY&&this.safeExecuteSync(()=>{process.stdout.write(a.showCursor)},"\u6062\u590D\u5149\u6807\u663E\u793A")}}const ae=m(v);class le extends F{getDefaultOptions(){return{overwrite:!0,recursive:!0,incremental:!0}}validateOptions(){this.validator.field("sourceDir").required().string().custom(e=>e.trim()!=="","sourceDir \u4E0D\u80FD\u4E3A\u7A7A\u5B57\u7B26\u4E32").field("targetDir").required().string().custom(e=>e.trim()!=="","targetDir \u4E0D\u80FD\u4E3A\u7A7A\u5B57\u7B26\u4E32").field("overwrite").boolean().field("recursive").boolean().field("incremental").boolean().validate()}getPluginName(){return"copy-file"}getEnforce(){return"post"}async copyFiles(){const{sourceDir:e,targetDir:t,overwrite:i=!0,recursive:u=!0,incremental:n=!0,enabled:o=!0}=this.options;if(!o){this.logger.info(`\u63D2\u4EF6\u5DF2\u7981\u7528\uFF0C\u8DF3\u8FC7\u6267\u884C\uFF1A\u4ECE ${e} \u590D\u5236\u5230 ${t}`);return}await H(e);const r=await M(e,t,{recursive:u,overwrite:i,incremental:n});this.logger.success(`\u590D\u5236\u6587\u4EF6\u6210\u529F\uFF1A\u4ECE ${e} \u5230 ${t}`,`\u590D\u5236\u4E86 ${r.copiedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8DF3\u8FC7\u4E86 ${r.skippedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8017\u65F6 ${r.executionTime}ms`)}addPluginHooks(e){e.writeBundle=async()=>{await this.safeExecute(()=>this.copyFiles(),"\u590D\u5236\u6587\u4EF6")}}}const de=m(le);class ce extends F{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"}}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").custom(e=>!e||["ts","js"].includes(e),"outputFormat \u5FC5\u987B\u662F ts \u6216 js").field("nameStrategy").custom(e=>!e||["path","camelCase","pascalCase","custom"].includes(e),"nameStrategy \u5FC5\u987B\u662F path, camelCase, pascalCase \u6216 custom").validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(e){switch(this.options.nameStrategy){case"path":return e.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return O(e);case"pascalCase":return Z(e);case"custom":return this.options.customNameGenerator(e);default:return O(e)}}extractMeta(e,t){const i={},u=e.style||{},n=this.options.metaMapping||{};for(const[o,r]of Object.entries(n))u[o]!==void 0&&(i[r]=u[o]);return this.tabBarPages.has(t)&&(i.isTab=!0),i}parsePageToRoute(e,t=""){const i=t?`/${t}/${e.path}`:`/${e.path}`,u=this.generateRouteName(i),n=this.extractMeta(e,i.replace(/^\//,"")),o={path:i,name:u};return Object.keys(n).length>0&&(o.meta=n),o}parsePagesJson(e){const t=[];if(!e.pages||!Array.isArray(e.pages)||e.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),t;if(this.tabBarPages.clear(),e.tabBar?.list)for(const i of e.tabBar.list)this.tabBarPages.add(i.pagePath);for(const i of e.pages)t.push(this.parsePageToRoute(i));if(this.options.includeSubPackages&&e.subPackages){for(const i of e.subPackages)if(i.pages&&Array.isArray(i.pages))for(const u of i.pages)t.push(this.parsePageToRoute(u,i.root))}return t}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
`}async readPagesJson(){const e=x(this.projectRoot,this.options.pagesJsonPath);if(!S(e))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${e}`),null;try{const t=await L(e),i=ee(t);return JSON.parse(i)}catch(t){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${t.message}`),null}}extractExistingRoutes(e){const t=new Map,i=e.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!i)return t;try{let u=i[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const n=JSON.parse(u);for(const o of n)o.path&&t.set(o.path,o)}catch{this.logger.warn("\u89E3\u6790\u73B0\u6709 routes \u914D\u7F6E\u5931\u8D25\uFF0C\u5C06\u5B8C\u5168\u91CD\u65B0\u751F\u6210")}return t}mergeRoutes(e,t){return e.map(i=>{const u=t.get(i.path);if(!u)return i;const n={};return i.meta&&Object.assign(n,i.meta),u.meta&&Object.assign(n,u.meta),{...u,path:i.path,meta:Object.keys(n).length>0?n:void 0}})}async generateRouterConfig(){const e=await this.readPagesJson();if(!e)return;let t=this.parsePagesJson(e);const i=x(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&S(i))try{const n=await L(i),o=this.extractExistingRoutes(n);o.size>0&&(t=this.mergeRoutes(t,o),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const u=this.generateFileContent(t);await R(i,u),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${i}`),this.logger.info(`\u5171\u751F\u6210 ${t.length} \u6761\u8DEF\u7531\u914D\u7F6E`)}startWatching(){if(!this.options.watch)return;const e=x(this.projectRoot,this.options.pagesJsonPath);S(e)&&(this.watcher=oe(e,async t=>{t==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${e}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(e){e.configResolved=async t=>{this.projectRoot=t.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),t.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const he=m(ce);class pe extends F{version="";buildTime=new Date;getDefaultOptions(){return{format:"timestamp",semverBase:"1.0.0",outputType:"file",outputFile:"version.json",defineName:"__APP_VERSION__",hashLength:8,prefix:"",suffix:""}}validateOptions(){if(this.validator.field("format").custom(e=>!e||["timestamp","date","datetime","semver","hash","custom"].includes(e),"format \u5FC5\u987B\u662F timestamp, date, datetime, semver, hash \u6216 custom").field("outputType").custom(e=>!e||["file","define","both"].includes(e),"outputType \u5FC5\u987B\u662F file, define \u6216 both").field("hashLength").number().custom(e=>!e||e>0&&e<=32,"hashLength \u5FC5\u987B\u5728 1-32 \u4E4B\u95F4").validate(),this.options.format==="custom"&&!this.options.customFormat)throw new Error("\u5F53 format \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customFormat")}getPluginName(){return"generate-version"}generateVersion(){const e=te(this.buildTime),t=ie(this.options.hashLength);let i;switch(this.options.format){case"timestamp":i=`${e.YYYY}${e.MM}${e.DD}${e.HH}${e.mm}${e.ss}`;break;case"date":i=`${e.YYYY}.${e.MM}.${e.DD}`;break;case"datetime":i=`${e.YYYY}.${e.MM}.${e.DD}.${e.HH}${e.mm}${e.ss}`;break;case"semver":i=this.options.semverBase||"1.0.0";break;case"hash":i=t;break;case"custom":i=this.parseCustomFormat({...e,hash:t});break;default:i=e.timestamp}const u=this.options.prefix||"",n=this.options.suffix||"";return`${u}${i}${n}`}parseCustomFormat(e){const t={...e};if(this.options.semverBase){const[i,u,n]=this.options.semverBase.split(".");t.major=i||"1",t.minor=u||"0",t.patch=n||"0"}return ue(this.options.customFormat||"",t)}generateVersionInfo(){return{version:this.version,buildTime:this.buildTime.toISOString(),timestamp:this.buildTime.getTime(),format:this.options.format,...this.options.extra}}async writeVersionFile(e){const t=ne(e,this.options.outputFile||"version.json"),i=this.generateVersionInfo();await R(t,JSON.stringify(i,null,2)),this.logger.success(`\u7248\u672C\u6587\u4EF6\u5DF2\u751F\u6210: ${t}`)}addPluginHooks(e){e.configResolved=()=>{this.buildTime=new Date,this.version=this.generateVersion(),this.logger.info(`\u751F\u6210\u7248\u672C\u53F7: ${this.version}`)},(this.options.outputType==="define"||this.options.outputType==="both")&&(e.config=()=>{this.version||(this.buildTime=new Date,this.version=this.generateVersion());const t=this.options.defineName||"__APP_VERSION__";return this.logger.info(`\u6CE8\u5165\u5168\u5C40\u53D8\u91CF: ${t} = "${this.version}"`),{define:{[t]:JSON.stringify(this.version),[`${t}_INFO`]:JSON.stringify(this.generateVersionInfo())}}}),(this.options.outputType==="file"||this.options.outputType==="both")&&(e.writeBundle=async()=>{this.viteConfig&&await this.safeExecute(async()=>{const t=this.viteConfig.build.outDir;await this.writeVersionFile(t)},"\u5199\u5165\u7248\u672C\u6587\u4EF6")})}}const fe=m(pe);function ge(s){const e=[];if(s.link)return[];if(s.icons&&s.icons.length>0)for(const t of s.icons){const i={rel:t.rel,href:t.href};t.sizes&&(i.sizes=t.sizes),t.type&&(i.type=t.type),e.push({tag:"link",attrs:i,injectTo:"head"})}else if(s.url)e.push({tag:"link",attrs:{rel:"icon",href:s.url},injectTo:"head"});else{const t=s.base||"/",i=t.endsWith("/")?`${t}favicon.ico`:`${t}/favicon.ico`;e.push({tag:"link",attrs:{rel:"icon",href:i},injectTo:"head"})}return e}class me extends F{getDefaultOptions(){return{base:"/"}}validateOptions(){this.validator.field("base").string().field("url").string().field("link").string().field("icons").array(),this.options?.copyOptions&&(this.validator.field("copyOptions").object(),new se(this.options.copyOptions).field("sourceDir").required().string().field("targetDir").required().string().field("overwrite").boolean().field("recursive").boolean().validate()),this.validator.validate()}getPluginName(){return"inject-ico"}getIconTagDescriptors(){if(!this.options.enabled)return this.logger.info("\u63D2\u4EF6\u5DF2\u7981\u7528\uFF0C\u8DF3\u8FC7\u56FE\u6807\u6CE8\u5165"),[];const e=ge(this.options);return e.length>0&&this.logger.success(`\u6210\u529F\u6CE8\u5165 ${e.length} \u4E2A\u56FE\u6807\u6807\u7B7E\u5230 HTML \u6587\u4EF6`),e}injectCustomLinkTag(e){if(!this.options.enabled||!this.options.link)return e;const t=this.options.link,i=/<\/head>/i,u=e.match(i);if(u&&u.index!==void 0){const n=e.slice(0,u.index)+t+`
`+e.slice(u.index);return this.logger.success("\u6210\u529F\u6CE8\u5165\u81EA\u5B9A\u4E49\u56FE\u6807\u6807\u7B7E\u5230 HTML \u6587\u4EF6"),this.logger.info(`  - ${t}`),n}return this.logger.warn("\u672A\u627E\u5230 </head> \u6807\u7B7E\uFF0C\u8DF3\u8FC7\u56FE\u6807\u6CE8\u5165"),e}async copyFiles(){if(!this.options.enabled){this.logger.info("\u63D2\u4EF6\u5DF2\u7981\u7528\uFF0C\u8DF3\u8FC7\u6587\u4EF6\u590D\u5236");return}const{copyOptions:e}=this.options;if(!e)return;const{sourceDir:t,targetDir:i,overwrite:u=!0,recursive:n=!0}=e;await H(t);const o=await M(t,i,{recursive:n,overwrite:u,incremental:!0});this.logger.success(`\u56FE\u6807\u6587\u4EF6\u590D\u5236\u6210\u529F\uFF1A\u4ECE ${t} \u5230 ${i}`,`\u590D\u5236\u4E86 ${o.copiedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8DF3\u8FC7\u4E86 ${o.skippedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8017\u65F6 ${o.executionTime}ms`)}addPluginHooks(e){e.transformIndexHtml={order:"pre",handler:t=>{if(this.options.link)return this.injectCustomLinkTag(t);const i=this.getIconTagDescriptors();return i.length>0?{html:t,tags:i}:t}},e.writeBundle=async()=>{await this.safeExecute(()=>this.copyFiles(),"\u56FE\u6807\u6587\u4EF6\u590D\u5236")}}}const Fe=m(me,s=>typeof s=="string"?{base:s}:s||{}),f="__loading-overlay__",E="__loading-hidden__",y="__loading-visible__",P="__loading-top__",I="__loading-center__",j="__loading-bottom__",d="__loading-spinner__",q="__loading-text__",_="__loading-dot__",A="__loading-root__",J="data-loading-text",V="__loading-spin__",X="__loading-dots__",U="__loading-pulse__",Y="__loading-bar__",_e={center:I,top:P,bottom:j};function G(s,e="spinner",t){const{overlayColor:i="rgba(255, 255, 255, 0.7)",spinnerColor:u="#4361ee",spinnerSize:n="40px",textColor:o="#333",textSize:r="14px",zIndex:l=9999,pointerEvents:g=!1,backdropBlur:D=!1,backdropBlurAmount:c=4}=s,$=g?"":"pointer-events: none;",w=D?`backdrop-filter: blur(${c}px);-webkit-backdrop-filter: blur(${c}px);`:"",B=Ee(e,u,n),T=t?.enabled!==!1,h=t?.duration??200,C=t?.easing??"ease-out",b=T?`transition: opacity ${h}ms ${C}, visibility ${h}ms ${C};`:"";return`
.${f} {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${i};
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: ${l};
  ${$}
  ${w}
  contain: layout style paint;
  will-change: opacity;
}
.${f}.${P} {
  justify-content: flex-start;
  padding-top: 60px;
}
.${f}.${I} {
  justify-content: center;
}
.${f}.${j} {
  justify-content: flex-end;
  padding-bottom: 60px;
}
${B}
.${q} {
  margin-top: 12px;
  color: ${o};
  font-size: ${r};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
}
.${f}.${E} {
  opacity: 0;
  visibility: hidden;
  ${b}
}
.${f}.${y} {
  opacity: 1;
  visibility: visible;
  ${b}
}`}function Ee(s,e,t){switch(s){case"dots":return`
.${d} {
  display: flex;
  gap: 6px;
  align-items: center;
}
.${d} .${_} {
  width: calc(${t} / 4);
  height: calc(${t} / 4);
  border-radius: 50%;
  background: ${e};
  animation: ${X} 1.2s ease-in-out infinite;
}
.${d} .${_}:nth-child(2) { animation-delay: 0.15s; }
.${d} .${_}:nth-child(3) { animation-delay: 0.3s; }
@keyframes ${X} {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}`;case"pulse":return`
.${d} {
  width: ${t};
  height: ${t};
  background: ${e};
  border-radius: 50%;
  animation: ${U} 1.2s ease-in-out infinite;
}
@keyframes ${U} {
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
  animation: ${V} 0.8s linear infinite;
}
@keyframes ${V} {
  to { transform: rotate(360deg); }
}`}}function z(s){const e=s.position||"center",t=s.defaultText||"\u52A0\u8F7D\u4E2D...",i=s.spinnerType||"spinner",u=_e[e],n=s.style?.customClass?` ${s.style.customClass}`:"",o=s.style?.customStyle?` style="${s.style.customStyle}"`:"",r=s.defaultVisible?y:E;if(s.customTemplate)return`<div class="${f} ${u} ${r}${n}" id="${A}"${o}>${s.customTemplate}</div>`;const l=ye(i);return`<div class="${f} ${u} ${r}${n}" id="${A}"${o}>
  ${l}
  <div class="${q}" ${J}="">${t}</div>
</div>`}function ye(s){switch(s){case"dots":return`<div class="${d}"><div class="${_}"></div><div class="${_}"></div><div class="${_}"></div></div>`;default:return`<div class="${d}"></div>`}}class Ce extends F{getDefaultOptions(){return{position:"center",defaultText:"\u52A0\u8F7D\u4E2D...",spinnerType:"spinner",autoBind:"none",globalName:"__LOADING_MANAGER__",defaultVisible:!1,autoHideOn:"DOMContentLoaded",style:{overlayColor:"rgba(255, 255, 255, 0.7)",spinnerColor:"#4361ee",spinnerSize:"40px",textColor:"#333",textSize:"14px",zIndex:9999,pointerEvents:!1,backdropBlur:!1,backdropBlurAmount:4},transition:{enabled:!0,duration:200,easing:"ease-out"},minDisplayTime:{enabled:!0,duration:300},delayShow:{enabled:!0,duration:200},debounceHide:{enabled:!1,duration:100}}}validateOptions(){this.validator.field("position").custom(e=>!e||["center","top","bottom"].includes(e),"position \u5FC5\u987B\u662F center, top \u6216 bottom").field("defaultText").string().field("spinnerType").custom(e=>!e||["spinner","dots","pulse","bar"].includes(e),"spinnerType \u5FC5\u987B\u662F spinner, dots, pulse \u6216 bar").field("autoBind").custom(e=>!e||["fetch","xhr","all","none"].includes(e),"autoBind \u5FC5\u987B\u662F fetch, xhr, all \u6216 none").field("globalName").string().field("customTemplate").string().field("defaultVisible").boolean().field("autoHideOn").custom(e=>!e||["DOMContentLoaded","load","manual"].includes(e),"autoHideOn \u5FC5\u987B\u662F DOMContentLoaded, load \u6216 manual").validate(),this.validateStyle(),this.validateNestedConfig("minDisplayTime","minDisplayTime.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570"),this.validateNestedConfig("delayShow","delayShow.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570"),this.validateNestedConfig("debounceHide","debounceHide.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570"),this.validateTransition(),this.validateCallbacks()}validateStyle(){if(!this.options.style)return;const{zIndex:e}=this.options.style;if(e!==void 0&&(typeof e!="number"||e<0))throw new Error("style.zIndex \u5FC5\u987B\u662F\u975E\u8D1F\u6570");if(this.options.style.backdropBlurAmount!==void 0&&(typeof this.options.style.backdropBlurAmount!="number"||this.options.style.backdropBlurAmount<0))throw new Error("style.backdropBlurAmount \u5FC5\u987B\u662F\u975E\u8D1F\u6570")}validateNestedConfig(e,t){const i=this.options[e];if(i?.duration!==void 0&&(typeof i.duration!="number"||i.duration<0))throw new Error(t)}validateTransition(){if(!this.options.transition)return;const{duration:e}=this.options.transition;if(e!==void 0&&(typeof e!="number"||e<0))throw new Error("transition.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570")}validateCallbacks(){if(!this.options.callbacks)return;const{callbacks:e}=this.options,t=["onBeforeShow","onShow","onBeforeHide","onHide","onDestroy"];for(const i of t)if(e[i]!==void 0&&typeof e[i]!="string")throw new Error(`callbacks.${i} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B`)}getPluginName(){return"inject-loading"}generateLoadingManager(e){const t=e.globalName||"__LOADING_MANAGER__",i=e.minDisplayTime||{enabled:!0,duration:300},u=e.delayShow||{enabled:!0,duration:200},n=e.debounceHide||{enabled:!1,duration:100},o=e.transition||{enabled:!0,duration:200,easing:"ease-out"},r=e.autoBind||"none",l=e.requestFilter||{},g=e.defaultVisible||!1,D=e.autoHideOn||"DOMContentLoaded",c=e.callbacks||{},$=l.excludeUrls||[],w=l.includeUrls||[],B=l.excludeMethods||[],T=l.excludeUrlPrefixes||[],h=p=>p?`function() { try { ${p} } catch(e) { console.error('[injectLoading] callback error:', e); } }`:"function() {}",C=h(c.onBeforeShow),b=h(c.onShow),W=h(c.onBeforeHide),K=h(c.onHide),Q=h(c.onDestroy);return`(function() {
  'use strict';

  // SSR \u73AF\u5883\u68C0\u6D4B
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var _loadingEl = null;
  var _textEl = null;
  var _styleEl = null;
  var _visible = false;
  var _destroyed = false;
  var _showTimer = null;
  var _hideTimer = null;
  var _debounceTimer = null;
  var _showTime = 0;
  var _pendingCount = 0;

  // \u914D\u7F6E
  var _minDisplayTime = ${JSON.stringify(i)};
  var _delayShow = ${JSON.stringify(u)};
  var _debounceHide = ${JSON.stringify(n)};
  var _transition = ${JSON.stringify(o)};
  var _excludeUrls = ${JSON.stringify($.map(p=>({source:p.source,flags:p.flags})))}.map(function(s) { return new RegExp(s.source, s.flags); });
  var _includeUrls = ${JSON.stringify(w.map(p=>({source:p.source,flags:p.flags})))}.map(function(s) { return new RegExp(s.source, s.flags); });
  var _excludeMethods = ${JSON.stringify(B)};
  var _excludeUrlPrefixes = ${JSON.stringify(T)};

  // \u56DE\u8C03
  var _onBeforeShow = ${C};
  var _onShow = ${b};
  var _onBeforeHide = ${W};
  var _onHide = ${K};
  var _onDestroy = ${Q};

  // \u4FDD\u5B58\u539F\u59CB\u65B9\u6CD5\u5F15\u7528\uFF0C\u7528\u4E8E destroy \u65F6\u6062\u590D
  var _originalFetch = null;
  var _originalXHROpen = null;
  var _originalXHRSend = null;

  function _findEl() {
    if (!_loadingEl) {
      _loadingEl = document.getElementById('${A}');
    }
    if (!_textEl && _loadingEl) {
      _textEl = _loadingEl.querySelector('[${J}]');
    }
    // \u67E5\u627E\u5E76\u7F13\u5B58\u6CE8\u5165\u7684 style \u5143\u7D20\uFF0C\u786E\u4FDD destroy \u65F6\u80FD\u6B63\u786E\u6E05\u7406
    if (!_styleEl) {
      _styleEl = document.querySelector('style[data-loading-id="${t}"]');
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
        if (_includeUrls[i].test(url)) { included = true; break; }
      }
      if (!included) return true;
    }
    for (var i = 0; i < _excludeUrls.length; i++) {
      if (_excludeUrls[i].test(url)) return true;
    }
    return false;
  }

  function _clearTimers() {
    if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
    if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }
    if (_debounceTimer) { clearTimeout(_debounceTimer); _debounceTimer = null; }
  }

  function _applyTransition(show) {
    if (!_transition.enabled || !_loadingEl) return;
    var d = _transition.duration || 200;
    var e = _transition.easing || 'ease-out';
    _loadingEl.style.transition = 'opacity ' + d + 'ms ' + e + ', visibility ' + d + 'ms ' + e;
  }

  function _doShow(text) {
    if (_destroyed) return;
    _findEl();
    if (!_loadingEl) return;

    // onBeforeShow \u56DE\u8C03\uFF0C\u8FD4\u56DE false \u53EF\u963B\u6B62\u663E\u793A\uFF08makeCallback \u5DF2\u63D0\u4F9B try-catch \u4FDD\u62A4\uFF09
    var result = _onBeforeShow();
    if (result === false) return;

    if (_textEl && text) _textEl.textContent = text;
    _loadingEl.classList.remove('${E}');
    _loadingEl.classList.add('${y}');
    _applyTransition(true);
    _visible = true;
    _showTime = Date.now();
    _onShow();
  }

  function _doHide(force) {
    if (_destroyed) return;
    _findEl();
    if (!_loadingEl) return;

    if (!force) {
      // onBeforeHide \u56DE\u8C03\uFF0C\u8FD4\u56DE false \u53EF\u963B\u6B62\u9690\u85CF\uFF08makeCallback \u5DF2\u63D0\u4F9B try-catch \u4FDD\u62A4\uFF09
      var result = _onBeforeHide();
      if (result === false) return;
    }

    if (!force && _minDisplayTime.enabled && _showTime > 0) {
      var elapsed = Date.now() - _showTime;
      var remaining = _minDisplayTime.duration - elapsed;
      if (remaining > 0) {
        _hideTimer = setTimeout(function() { _doHide(true); }, remaining);
        return;
      }
    }

    if (_debounceHide.enabled && !force) {
      _debounceTimer = setTimeout(function() {
        _loadingEl.classList.remove('${y}');
        _loadingEl.classList.add('${E}');
        _applyTransition(false);
        _visible = false;
        _showTime = 0;
        _onHide();
      }, _debounceHide.duration);
      return;
    }

    _loadingEl.classList.remove('${y}');
    _loadingEl.classList.add('${E}');
    _applyTransition(false);
    _visible = false;
    _showTime = 0;
    _onHide();
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
  }

  var manager = {
    show: function(text) {
      if (_destroyed) return;
      _clearTimers();
      // \u91CD\u7F6E _showTime\uFF0C\u786E\u4FDD\u91CD\u65B0 show \u65F6\u6700\u5C0F\u663E\u793A\u65F6\u95F4\u4ECE\u65B0\u663E\u793A\u65F6\u523B\u5F00\u59CB\u8BA1\u7B97
      _showTime = 0;
      if (_delayShow.enabled && _delayShow.duration > 0) {
        _showTimer = setTimeout(function() { _doShow(text); }, _delayShow.duration);
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
    updateText: function(text) {
      if (_destroyed) return;
      _findEl();
      if (_textEl) _textEl.textContent = text;
    },
    isVisible: function() {
      return _visible && !_destroyed;
    },
    getPendingCount: function() {
      return _pendingCount;
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
    }
  };

  // \u81EA\u52A8\u62E6\u622A fetch
  var _autoBind = '${r}';
  if (_autoBind === 'fetch' || _autoBind === 'all') {
    if (typeof window !== 'undefined' && window.fetch) {
      _originalFetch = window.fetch;
      window.fetch = function(input, init) {
        // \u652F\u6301 string / Request / URL \u4E09\u79CD\u8F93\u5165\u7C7B\u578B
        var url = typeof input === 'string' ? input : (input instanceof URL ? input.href : (input && input.url ? input.url : ''));
        var method = (init && init.method) || (input && input.method) || 'GET';
        manager._requestStart(url, method);
        return _originalFetch.apply(this, arguments).then(
          function(response) { manager._requestEnd(url, method); return response; },
          function(error) { manager._requestEnd(url, method); throw error; }
        );
      };
    }
  }

  // \u81EA\u52A8\u62E6\u622A XMLHttpRequest
  if (_autoBind === 'xhr' || _autoBind === 'all') {
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
        // \u53EA\u4F7F\u7528 onloadend\uFF0C\u5B83\u5728\u6240\u6709\u7EC8\u6B62\u573A\u666F\uFF08\u6210\u529F/\u9519\u8BEF/\u4E2D\u6B62/\u8D85\u65F6\uFF09\u540E\u90FD\u4F1A\u89E6\u53D1\uFF0C
        // \u907F\u514D\u540C\u65F6\u76D1\u542C onerror/onabort/ontimeout \u5BFC\u81F4 _requestEnd \u88AB\u591A\u6B21\u8C03\u7528
        var _origLoadEnd = self.onloadend;
        self.onloadend = function() {
          manager._requestEnd(self.__loadingUrl, self.__loadingMethod);
          if (_origLoadEnd) _origLoadEnd.apply(this, arguments);
        };
        return _originalXHRSend.apply(this, arguments);
      };
    }
  }

  // defaultVisible: \u540C\u6B65\u521D\u59CB\u53EF\u89C1\u72B6\u6001
  var _defaultVisible = ${JSON.stringify(g)};
  if (_defaultVisible) {
    _visible = true;
    _showTime = Date.now();
  }

  // autoHideOn: \u81EA\u52A8\u9690\u85CF\u65F6\u673A
  var _autoHideOn = '${D}';
  if (_defaultVisible && _autoHideOn !== 'manual') {
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
      // DOMContentLoaded: readyState \u4E3A 'interactive' \u65F6\u8868\u793A\u4E8B\u4EF6\u5DF2\u89E6\u53D1\uFF0C\u9700\u7ACB\u5373\u6267\u884C
      if (document.readyState !== 'loading') {
        _autoHideHandler();
      } else {
        document.addEventListener('DOMContentLoaded', _autoHideHandler);
      }
    }
  }

  // \u66B4\u9732\u5230\u5168\u5C40
  window['${t}'] = manager;
})();`}generateHeadInjectCode(){const e=this.options.style||{},t=this.options.spinnerType||"spinner",i=this.options.transition,u=G(e,t,i),n=z(this.options);return`<!-- inject-loading: head start -->
<style data-loading-style data-loading-id="${this.options.globalName||"__LOADING_MANAGER__"}">${u}</style>
${n}
<!-- inject-loading: head end -->`}generateBodyInjectCode(e){const t=this.options.style||{},i=this.options.spinnerType||"spinner",u=this.options.transition,n=G(t,i,u),o=z(this.options),r=this.generateLoadingManager(this.options);return e?`/* inject-loading: body start */
${r}
/* inject-loading: body end */`:`/* inject-loading: start */
(function() {
  // SSR \u73AF\u5883\u68C0\u6D4B
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // \u6CE8\u5165 CSS
  var style = document.createElement('style');
  style.setAttribute('data-loading-style', '');
  style.setAttribute('data-loading-id', '${this.options.globalName||"__LOADING_MANAGER__"}');
  style.textContent = ${JSON.stringify(n)};
  document.head.appendChild(style);

  // \u6CE8\u5165 HTML\uFF08\u7B49\u5F85 body \u53EF\u7528\u65F6\u6267\u884C\uFF09
  function injectHTML() {
    var div = document.createElement('div');
    div.innerHTML = ${JSON.stringify(o)};
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
${r}
/* inject-loading: end */`}addPluginHooks(e){const t=this.options.defaultVisible||!1,i=t?this.generateHeadInjectCode():"",u=this.generateBodyInjectCode(t);e.transformIndexHtml={order:"post",handler:n=>{let o=n;if(i){const g=/<\/head>/i;g.test(o)?o=o.replace(g,`${i}
</head>`):this.logger.warn("\u672A\u627E\u5230 </head> \u6807\u7B7E\uFF0CdefaultVisible \u7684\u767D\u5C4F loading \u5C06\u65E0\u6CD5\u751F\u6548")}const r=/<\/body>/i;if(r.test(o))return o=o.replace(r,`${u}
</body>`),this.logger.success("\u6210\u529F\u6CE8\u5165\u5168\u5C40 Loading \u72B6\u6001\u7BA1\u7406\u4EE3\u7801\u5230 HTML \u6587\u4EF6"),o;const l=/<\/html>/i;return l.test(o)?(o=o.replace(l,`${u}
</html>`),this.logger.success("\u6210\u529F\u6CE8\u5165\u5168\u5C40 Loading \u72B6\u6001\u7BA1\u7406\u4EE3\u7801\u5230 HTML \u6587\u4EF6"),o):(this.logger.warn("\u672A\u627E\u5230 </body> \u6216 </html> \u6807\u7B7E\uFF0CLoading \u4EE3\u7801\u8FFD\u52A0\u5230\u6587\u4EF6\u672B\u5C3E"),o+u)}}}}const be=m(Ce);export{fe as a,ae as b,de as c,be as d,he as g,Fe as i};
