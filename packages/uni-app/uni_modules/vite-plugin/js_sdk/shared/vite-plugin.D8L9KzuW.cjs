"use strict";const index=require("./vite-plugin.CawoITTT.cjs"),script=require("./vite-plugin.Tab4qcIM.cjs");require("crypto");const validation=require("./vite-plugin.IGZeStMa.cjs"),u=require("path"),o$1=require("fs"),SPINNER_FRAMES=process.platform==="win32"?["|","/","-","\\"]:["\u280B","\u2819","\u2839","\u2838","\u283C","\u2834","\u2826","\u2827","\u2807","\u280F"],ANSI={reset:"\x1B[0G",clearLine:"\x1B[2K",hideCursor:"\x1B[?25l",showCursor:"\x1B[?25h",green:n=>`\x1B[32m${n}\x1B[39m`,cyan:n=>`\x1B[36m${n}\x1B[39m`,gray:n=>`\x1B[90m${n}\x1B[39m`,bold:n=>`\x1B[1m${n}\x1B[22m`},DEFAULT_THEME={completeColor:ANSI.green,incompleteColor:ANSI.gray,percentageColor:ANSI.bold,phaseColor:ANSI.cyan,moduleColor:ANSI.gray},PHASE_LABELS={idle:"\u7B49\u5F85\u4E2D",config:"\u8BFB\u53D6\u914D\u7F6E",resolve:"\u89E3\u6790\u6A21\u5757",transform:"\u8F6C\u6362\u6A21\u5757",bundle:"\u6253\u5305\u4E2D",write:"\u5199\u5165\u6587\u4EF6",done:"\u6784\u5EFA\u5B8C\u6210"};class o extends index.BasePlugin{totalModules=0;transformedModules=0;currentModule="";phase="idle";spinnerIndex=0;spinnerTimer=null;isDev=!1;theme=DEFAULT_THEME;lastPercentage=0;static ANSI_REGEX=/\x1b\[[0-9;]*m/g;static stripAnsi(e){return e.replace(o.ANSI_REGEX,"")}getDefaultOptions(){return{width:30,format:"bar",completeChar:"\u2588",incompleteChar:"\u2591",clearOnComplete:!0,showModuleName:!0}}validateOptions(){this.validator.field("width").number().custom(e=>!e||e>0,"width \u5FC5\u987B\u5927\u4E8E 0").field("format").custom(e=>!e||["bar","spinner","minimal"].includes(e),"format \u5FC5\u987B\u662F bar, spinner \u6216 minimal").field("completeChar").string().field("incompleteChar").string().field("clearOnComplete").boolean().field("showModuleName").boolean().validate()}getPluginName(){return"build-progress"}onConfigResolved(e){super.onConfigResolved(e),this.theme=this.options.theme||DEFAULT_THEME}getPercentage(){if(this.phase==="done")return this.lastPercentage=100;if(this.phase==="config")return this.lastPercentage=5;if(this.phase==="resolve")return this.lastPercentage=10;if(this.totalModules===0)return this.lastPercentage=15;const e=Math.min(this.transformedModules/this.totalModules*70,70),t=this.phase==="bundle"?10:0,i=this.phase==="write"?5:0,r=Math.min(Math.floor(15+e+t+i),99);return this.lastPercentage=Math.max(r,this.lastPercentage),this.lastPercentage}renderBar(e){const t=this.options.width||30,i=this.options.completeChar||"\u2588",r=this.options.incompleteChar||"\u2591",s=Math.round(e/100*t),a=t-s;return this.theme.completeColor(i.repeat(s))+this.theme.incompleteColor(r.repeat(a))}renderSpinner(){const e=SPINNER_FRAMES[this.spinnerIndex%SPINNER_FRAMES.length];return this.spinnerIndex++,this.theme.phaseColor(e)}render(e){const t=this.options.format||"bar",i=this.theme.phaseColor(PHASE_LABELS[this.phase]),r=this.theme.percentageColor(`${e}%`);let s="";if(t==="bar"?s=`${this.renderSpinner()} ${i} ${this.renderBar(e)} ${r}`:t==="spinner"?s=`${this.renderSpinner()} ${i} ${r}`:s=`${i} ${r}`,this.options.showModuleName&&this.currentModule&&this.phase==="transform"){const a=o.stripAnsi(s).length,l=Math.max((process.stdout.columns||80)-a-3,20),d=this.currentModule.length>l?"..."+this.currentModule.slice(-l+3):this.currentModule;s+=` ${this.theme.moduleColor(d)}`}return s}update(){if(!process.stdout.isTTY)return;const e=this.getPercentage(),t=this.render(e);this.safeExecuteSync(()=>{process.stdout.write(ANSI.clearLine+ANSI.reset+t)},"\u66F4\u65B0\u8FDB\u5EA6\u663E\u793A")}startSpinner(){this.spinnerTimer||process.stdout.isTTY&&(this.spinnerTimer=setInterval(()=>this.update(),80))}stopSpinner(){this.spinnerTimer&&(clearInterval(this.spinnerTimer),this.spinnerTimer=null)}complete(){if(this.phase="done",this.stopSpinner(),!process.stdout.isTTY){this.logger.success("\u6784\u5EFA\u5B8C\u6210");return}if(this.options.clearOnComplete)this.safeExecuteSync(()=>{process.stdout.write(ANSI.clearLine+ANSI.reset)},"\u6E05\u9664\u8FDB\u5EA6\u884C");else{const e=this.render(100);this.safeExecuteSync(()=>{process.stdout.write(ANSI.clearLine+ANSI.reset+e+`
`)},"\u8F93\u51FA\u5B8C\u6210\u8FDB\u5EA6")}this.safeExecuteSync(()=>{process.stdout.write(ANSI.showCursor)},"\u6062\u590D\u5149\u6807\u663E\u793A")}addPluginHooks(e){e.config=(t,{command:i})=>(this.isDev=i==="serve",null),e.configResolved=()=>{this.options.enabled&&(this.phase="config",process.stdout.isTTY&&this.safeExecuteSync(()=>{process.stdout.write(ANSI.hideCursor)},"\u9690\u85CF\u5149\u6807"),this.startSpinner())},e.buildStart=()=>{this.options.enabled&&(this.phase="resolve",this.totalModules=0,this.transformedModules=0)},e.resolveId={handler:t=>{this.options.enabled&&(t.includes("node_modules")||t.includes(".virtual")||this.totalModules++)}},e.transform={handler:(t,i)=>{this.options.enabled&&(i.includes("node_modules")||i.includes(".virtual")||(this.phase="transform",this.transformedModules++,this.currentModule=i))}},e.writeBundle=()=>{this.options.enabled&&(this.phase="write",this.update())},e.closeBundle=()=>{this.options.enabled&&this.complete()},e.buildEnd=()=>{this.options.enabled&&(this.isDev||(this.phase="bundle",this.update()))},e.configureServer=()=>{this.options.enabled&&this.isDev&&this.complete()}}destroy(){super.destroy(),this.stopSpinner(),process.stdout.isTTY&&this.safeExecuteSync(()=>{process.stdout.write(ANSI.showCursor)},"\u6062\u590D\u5149\u6807\u663E\u793A")}}const buildProgress=index.createPluginFactory(o);class p extends index.BasePlugin{getDefaultOptions(){return{overwrite:!0,recursive:!0,incremental:!0}}validateOptions(){this.validator.field("sourceDir").required().string().custom(e=>e.trim()!=="","sourceDir \u4E0D\u80FD\u4E3A\u7A7A\u5B57\u7B26\u4E32").field("targetDir").required().string().custom(e=>e.trim()!=="","targetDir \u4E0D\u80FD\u4E3A\u7A7A\u5B57\u7B26\u4E32").field("overwrite").boolean().field("recursive").boolean().field("incremental").boolean().validate()}getPluginName(){return"copy-file"}getEnforce(){return"post"}async copyFiles(){const{sourceDir:e,targetDir:t,overwrite:i=!0,recursive:r=!0,incremental:s=!0,enabled:a=!0}=this.options;if(!a){this.logger.info(`\u63D2\u4EF6\u5DF2\u7981\u7528\uFF0C\u8DF3\u8FC7\u6267\u884C\uFF1A\u4ECE ${e} \u590D\u5236\u5230 ${t}`);return}await script.checkSourceExists(e);const l=await script.copySourceToTarget(e,t,{recursive:r,overwrite:i,incremental:s});this.logger.success(`\u590D\u5236\u6587\u4EF6\u6210\u529F\uFF1A\u4ECE ${e} \u5230 ${t}`,`\u590D\u5236\u4E86 ${l.copiedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8DF3\u8FC7\u4E86 ${l.skippedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8017\u65F6 ${l.executionTime}ms`)}addPluginHooks(e){e.writeBundle=async()=>{await this.safeExecute(()=>this.copyFiles(),"\u590D\u5236\u6587\u4EF6")}}}const copyFile=index.createPluginFactory(p);function generateIconTagDescriptors(n){const e=[];if(n.link)return[];if(n.icons&&n.icons.length>0)for(const t of n.icons){const i={rel:t.rel,href:t.href};t.sizes&&(i.sizes=t.sizes),t.type&&(i.type=t.type),e.push({tag:"link",attrs:i,injectTo:"head"})}else if(n.url)e.push({tag:"link",attrs:{rel:"icon",href:n.url},injectTo:"head"});else{const t=n.base||"/",i=t.endsWith("/")?`${t}favicon.ico`:`${t}/favicon.ico`;e.push({tag:"link",attrs:{rel:"icon",href:i},injectTo:"head"})}return e}let f$1=class extends index.BasePlugin{getDefaultOptions(){return{base:"/"}}validateOptions(){this.validator.field("base").string().field("url").string().field("link").string().field("icons").array(),this.options?.copyOptions&&(this.validator.field("copyOptions").object(),new validation.Validator(this.options.copyOptions).field("sourceDir").required().string().field("targetDir").required().string().field("overwrite").boolean().field("recursive").boolean().validate()),this.validator.validate()}getPluginName(){return"favicon-manager"}getIconTagDescriptors(){if(!this.options.enabled)return this.logger.info("\u63D2\u4EF6\u5DF2\u7981\u7528\uFF0C\u8DF3\u8FC7\u56FE\u6807\u6CE8\u5165"),[];const e=generateIconTagDescriptors(this.options);return e.length>0&&this.logger.success(`\u6210\u529F\u6CE8\u5165 ${e.length} \u4E2A\u56FE\u6807\u6807\u7B7E\u5230 HTML \u6587\u4EF6`),e}injectCustomLinkTag(e){if(!this.options.enabled||!this.options.link)return e;const t=this.options.link,i=script.injectBeforeTag(e,"</head>",t);return i.injected?(this.logger.success("\u6210\u529F\u6CE8\u5165\u81EA\u5B9A\u4E49\u56FE\u6807\u6807\u7B7E\u5230 HTML \u6587\u4EF6"),this.logger.info(`  - ${t}`),i.html):(this.logger.warn("\u672A\u627E\u5230 </head> \u6807\u7B7E\uFF0C\u8DF3\u8FC7\u56FE\u6807\u6CE8\u5165"),e)}async copyFiles(){if(!this.options.enabled){this.logger.info("\u63D2\u4EF6\u5DF2\u7981\u7528\uFF0C\u8DF3\u8FC7\u6587\u4EF6\u590D\u5236");return}const{copyOptions:e}=this.options;if(!e)return;const{sourceDir:t,targetDir:i,overwrite:r=!0,recursive:s=!0}=e;await script.checkSourceExists(t);const a=await script.copySourceToTarget(t,i,{recursive:s,overwrite:r,incremental:!0});this.logger.success(`\u56FE\u6807\u6587\u4EF6\u590D\u5236\u6210\u529F\uFF1A\u4ECE ${t} \u5230 ${i}`,`\u590D\u5236\u4E86 ${a.copiedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8DF3\u8FC7\u4E86 ${a.skippedFiles} \u4E2A\u6587\u4EF6\uFF0C\u8017\u65F6 ${a.executionTime}ms`)}addPluginHooks(e){e.transformIndexHtml={order:"pre",handler:t=>{if(this.options.link)return this.injectCustomLinkTag(t);const i=this.getIconTagDescriptors();return i.length>0?{html:t,tags:i}:t}},e.writeBundle=async()=>{await this.safeExecute(()=>this.copyFiles(),"\u56FE\u6807\u6587\u4EF6\u590D\u5236")}}};const faviconManager=index.createPluginFactory(f$1,n=>typeof n=="string"?{base:n}:n||{});class R extends index.BasePlugin{projectRoot=process.cwd();tabBarPages=new Set;watcher=null;getDefaultOptions(){return{pagesJsonPath:"src/pages.json",outputPath:"src/router.config.ts",outputFormat:"ts",nameStrategy:"camelCase",includeSubPackages:!0,watch:!0,exportTypes:!0,preserveRouteChanges:!0,metaMapping:{navigationBarTitleText:"title",requireAuth:"requireAuth"}}}validateOptions(){if(this.validator.field("pagesJsonPath").string().field("outputPath").string().field("outputFormat").custom(e=>!e||["ts","js"].includes(e),"outputFormat \u5FC5\u987B\u662F ts \u6216 js").field("nameStrategy").custom(e=>!e||["path","camelCase","pascalCase","custom"].includes(e),"nameStrategy \u5FC5\u987B\u662F path, camelCase, pascalCase \u6216 custom").validate(),this.options.nameStrategy==="custom"&&!this.options.customNameGenerator)throw new Error("\u5F53 nameStrategy \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customNameGenerator")}getPluginName(){return"generate-router"}generateRouteName(e){switch(this.options.nameStrategy){case"path":return e.replace(/\//g,"_").replace(/^_/,"");case"camelCase":return script.toCamelCase(e);case"pascalCase":return script.toPascalCase(e);case"custom":return this.options.customNameGenerator(e);default:return script.toCamelCase(e)}}extractMeta(e,t){const i={},r=e.style||{},s=this.options.metaMapping||{};for(const[a,l]of Object.entries(s))r[a]!==void 0&&(i[l]=r[a]);return this.tabBarPages.has(t)&&(i.isTab=!0),i}parsePageToRoute(e,t=""){const i=t?`/${t}/${e.path}`:`/${e.path}`,r=this.generateRouteName(i),s=this.extractMeta(e,i.replace(/^\//,"")),a={path:i,name:r};return Object.keys(s).length>0&&(a.meta=s),a}parsePagesJson(e){const t=[];if(!e.pages||!Array.isArray(e.pages)||e.pages.length===0)return this.logger.warn("pages.json \u4E2D\u6CA1\u6709\u6709\u6548\u7684\u9875\u9762\u914D\u7F6E"),t;if(this.tabBarPages.clear(),e.tabBar?.list)for(const i of e.tabBar.list)this.tabBarPages.add(i.pagePath);for(const i of e.pages)t.push(this.parsePageToRoute(i));if(this.options.includeSubPackages&&e.subPackages){for(const i of e.subPackages)if(i.pages&&Array.isArray(i.pages))for(const r of i.pages)t.push(this.parsePageToRoute(r,i.root))}return t}generateTypeDefinitions(){return!this.options.exportTypes||this.options.outputFormat==="js"?"":`
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
`}generateFileContent(e){const t=this.generateTypeDefinitions(),i=this.options.outputFormat==="ts",r=JSON.stringify(e,null,"	").replace(/"(\w+)":/g,"$1:").replace(/: "([^"]+)"/g,": '$1'");return`${t}
/**
 * \u8DEF\u7531\u914D\u7F6E\u5217\u8868
 * @description \u7531 pages.json \u81EA\u52A8\u751F\u6210
 */
export const routes${i?": RouteConfig[]":""} = ${r}

export default routes
`}async readPagesJson(){const e=u.resolve(this.projectRoot,this.options.pagesJsonPath);if(!o$1.existsSync(e))return this.logger.warn(`pages.json \u6587\u4EF6\u4E0D\u5B58\u5728: ${e}`),null;try{const t=await script.readFileContent(e),i=script.stripJsonComments(t);return JSON.parse(i)}catch(t){return this.logger.error(`\u89E3\u6790 pages.json \u5931\u8D25: ${t.message}`),null}}extractExistingRoutes(e){const t=new Map,i=e.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/);if(!i)return t;try{let r=i[1].replace(/(\w+)(?=\s*:)/g,'"$1"').replace(/'([^']*)'/g,'"$1"').replace(/,\s*([\]\}])/g,"$1");const s=JSON.parse(r);for(const a of s)a.path&&t.set(a.path,a)}catch{this.logger.warn("\u89E3\u6790\u73B0\u6709 routes \u914D\u7F6E\u5931\u8D25\uFF0C\u5C06\u5B8C\u5168\u91CD\u65B0\u751F\u6210")}return t}mergeRoutes(e,t){return e.map(i=>{const r=t.get(i.path);if(!r)return i;const s={};return i.meta&&Object.assign(s,i.meta),r.meta&&Object.assign(s,r.meta),{...r,path:i.path,meta:Object.keys(s).length>0?s:void 0}})}async generateRouterConfig(){const e=await this.readPagesJson();if(!e)return;let t=this.parsePagesJson(e);const i=u.resolve(this.projectRoot,this.options.outputPath);if(this.options.preserveRouteChanges&&o$1.existsSync(i))try{const s=await script.readFileContent(i),a=this.extractExistingRoutes(s);a.size>0&&(t=this.mergeRoutes(t,a),this.logger.info("\u5DF2\u5408\u5E76\u7528\u6237\u5BF9\u8DEF\u7531\u914D\u7F6E\u7684\u4FEE\u6539"))}catch{}const r=this.generateFileContent(t);await script.writeFileContent(i,r),this.logger.success(`\u8DEF\u7531\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${i}`),this.logger.info(`\u5171\u751F\u6210 ${t.length} \u6761\u8DEF\u7531\u914D\u7F6E`)}startWatching(){if(!this.options.watch)return;const e=u.resolve(this.projectRoot,this.options.pagesJsonPath);o$1.existsSync(e)&&(this.watcher=o$1.watch(e,async t=>{t==="change"&&(this.logger.info("\u68C0\u6D4B\u5230 pages.json \u53D8\u5316\uFF0C\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E..."),await this.safeExecute(()=>this.generateRouterConfig(),"\u91CD\u65B0\u751F\u6210\u8DEF\u7531\u914D\u7F6E"))}),this.logger.info(`\u6B63\u5728\u76D1\u542C pages.json \u53D8\u5316: ${e}`))}stopWatching(){this.watcher&&(this.watcher.close(),this.watcher=null)}addPluginHooks(e){e.configResolved=async t=>{this.projectRoot=t.root,await this.safeExecute(()=>this.generateRouterConfig(),"\u751F\u6210\u8DEF\u7531\u914D\u7F6E"),t.command==="serve"&&this.startWatching()}}destroy(){super.destroy(),this.stopWatching()}}const generateRouter=index.createPluginFactory(R);class f extends index.BasePlugin{version="";buildTime=new Date;getDefaultOptions(){return{format:"timestamp",semverBase:"1.0.0",outputType:"file",outputFile:"version.json",defineName:"__APP_VERSION__",hashLength:8,prefix:"",suffix:""}}validateOptions(){if(this.validator.field("format").custom(e=>!e||["timestamp","date","datetime","semver","hash","custom"].includes(e),"format \u5FC5\u987B\u662F timestamp, date, datetime, semver, hash \u6216 custom").field("outputType").custom(e=>!e||["file","define","both"].includes(e),"outputType \u5FC5\u987B\u662F file, define \u6216 both").field("hashLength").number().custom(e=>!e||e>0&&e<=32,"hashLength \u5FC5\u987B\u5728 1-32 \u4E4B\u95F4").validate(),this.options.format==="custom"&&!this.options.customFormat)throw new Error("\u5F53 format \u4E3A custom \u65F6\uFF0C\u5FC5\u987B\u63D0\u4F9B customFormat")}getPluginName(){return"generate-version"}generateVersion(){const e=script.getDateFormatParams(this.buildTime),t=script.generateRandomHash(this.options.hashLength);let i;switch(this.options.format){case"timestamp":i=`${e.YYYY}${e.MM}${e.DD}${e.HH}${e.mm}${e.ss}`;break;case"date":i=`${e.YYYY}.${e.MM}.${e.DD}`;break;case"datetime":i=`${e.YYYY}.${e.MM}.${e.DD}.${e.HH}${e.mm}${e.ss}`;break;case"semver":i=this.options.semverBase||"1.0.0";break;case"hash":i=t;break;case"custom":i=this.parseCustomFormat({...e,hash:t});break;default:i=e.timestamp}const r=this.options.prefix||"",s=this.options.suffix||"";return`${r}${i}${s}`}parseCustomFormat(e){const t={...e};if(this.options.semverBase){const[i,r,s]=this.options.semverBase.split(".");t.major=i||"1",t.minor=r||"0",t.patch=s||"0"}return script.parseTemplate(this.options.customFormat||"",t)}generateVersionInfo(){return{version:this.version,buildTime:this.buildTime.toISOString(),timestamp:this.buildTime.getTime(),format:this.options.format,...this.options.extra}}async writeVersionFile(e){const t=u.join(e,this.options.outputFile||"version.json"),i=this.generateVersionInfo();await script.writeFileContent(t,JSON.stringify(i,null,2)),this.logger.success(`\u7248\u672C\u6587\u4EF6\u5DF2\u751F\u6210: ${t}`)}addPluginHooks(e){e.configResolved=()=>{this.buildTime=new Date,this.version=this.generateVersion(),this.logger.info(`\u751F\u6210\u7248\u672C\u53F7: ${this.version}`)},(this.options.outputType==="define"||this.options.outputType==="both")&&(e.config=()=>{this.version||(this.buildTime=new Date,this.version=this.generateVersion());const t=this.options.defineName||"__APP_VERSION__";return this.logger.info(`\u6CE8\u5165\u5168\u5C40\u53D8\u91CF: ${t} = "${this.version}"`),{define:{[t]:JSON.stringify(this.version),[`${t}_INFO`]:JSON.stringify(this.generateVersionInfo())}}}),(this.options.outputType==="file"||this.options.outputType==="both")&&(e.writeBundle=async()=>{this.viteConfig&&await this.safeExecute(async()=>{const t=this.viteConfig.build.outDir;await this.writeVersionFile(t)},"\u5199\u5165\u7248\u672C\u6587\u4EF6")})}}const generateVersion=index.createPluginFactory(f),CLS_OVERLAY="__loading-overlay__",CLS_HIDDEN="__loading-hidden__",CLS_VISIBLE="__loading-visible__",CLS_TOP="__loading-top__",CLS_CENTER="__loading-center__",CLS_BOTTOM="__loading-bottom__",CLS_SPINNER="__loading-spinner__",CLS_TEXT="__loading-text__",CLS_DOT="__loading-dot__",ID_ROOT="__loading-root__",ATTR_TEXT="data-loading-text",ANIM_SPIN="__loading-spin__",ANIM_DOTS="__loading-dots__",ANIM_PULSE="__loading-pulse__",ANIM_BAR="__loading-bar__",POSITION_CLASS_MAP={center:CLS_CENTER,top:CLS_TOP,bottom:CLS_BOTTOM};function P(n){return n.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function generateCSS$1(n,e="spinner",t){const{overlayColor:i="rgba(255, 255, 255, 0.7)",spinnerColor:r="#4361ee",spinnerSize:s="40px",textColor:a="#333",textSize:l="14px",zIndex:d=9999,pointerEvents:_=!0,backdropBlur:c=!1,backdropBlurAmount:g=4}=n,v=_?"":"pointer-events: none;",b=c?`backdrop-filter: blur(${g}px);-webkit-backdrop-filter: blur(${g}px);`:"",y=getSpinnerCSS(e,r,s),C=t?.enabled!==!1,m=t?.duration??200,F=t?.easing??"ease-out",E=C?`transition: opacity ${m}ms ${F}, visibility ${m}ms ${F};`:"";return`
.${CLS_OVERLAY} {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${i};
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: ${d};
  ${v}
  ${b}
  contain: content;
  will-change: opacity;
}
.${CLS_OVERLAY}.${CLS_TOP} {
  justify-content: flex-start;
  padding-top: 60px;
}
.${CLS_OVERLAY}.${CLS_CENTER} {
  justify-content: center;
}
.${CLS_OVERLAY}.${CLS_BOTTOM} {
  justify-content: flex-end;
  padding-bottom: 60px;
}
${y}
.${CLS_TEXT} {
  margin-top: 12px;
  color: ${a};
  font-size: ${l};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
}
.${CLS_OVERLAY}.${CLS_HIDDEN} {
  opacity: 0;
  visibility: hidden;
  ${E}
}
.${CLS_OVERLAY}.${CLS_HIDDEN} .${CLS_SPINNER},
.${CLS_OVERLAY}.${CLS_HIDDEN} .${CLS_DOT},
.${CLS_OVERLAY}.${CLS_HIDDEN} .${CLS_SPINNER}::after {
  animation-play-state: paused;
}
.${CLS_OVERLAY}.${CLS_VISIBLE} {
  opacity: 1;
  visibility: visible;
  ${E}
}
.${CLS_OVERLAY}.${CLS_VISIBLE} .${CLS_SPINNER},
.${CLS_OVERLAY}.${CLS_VISIBLE} .${CLS_DOT},
.${CLS_OVERLAY}.${CLS_VISIBLE} .${CLS_SPINNER}::after {
  animation-play-state: running;
}`}function getSpinnerCSS(n,e,t){switch(n){case"dots":return`
.${CLS_SPINNER} {
  display: flex;
  gap: 6px;
  align-items: center;
}
.${CLS_SPINNER} .${CLS_DOT} {
  width: calc(${t} / 4);
  height: calc(${t} / 4);
  border-radius: 50%;
  background: ${e};
  animation: ${ANIM_DOTS} 1.2s ease-in-out infinite;
}
.${CLS_SPINNER} .${CLS_DOT}:nth-child(2) { animation-delay: 0.15s; }
.${CLS_SPINNER} .${CLS_DOT}:nth-child(3) { animation-delay: 0.3s; }
@keyframes ${ANIM_DOTS} {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}`;case"pulse":return`
.${CLS_SPINNER} {
  width: ${t};
  height: ${t};
  background: ${e};
  border-radius: 50%;
  animation: ${ANIM_PULSE} 1.2s ease-in-out infinite;
}
@keyframes ${ANIM_PULSE} {
  0% { transform: scale(0.3); opacity: 0.3; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.3); opacity: 0.3; }
}`;case"bar":return`
.${CLS_SPINNER} {
  width: calc(${t} * 2.5);
  height: calc(${t} / 5);
  background: rgba(0, 0, 0, 0.08);
  border-radius: calc(${t} / 10);
  overflow: hidden;
  position: relative;
}
.${CLS_SPINNER}::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  background: ${e};
  border-radius: calc(${t} / 10);
  animation: ${ANIM_BAR} 1.2s ease-in-out infinite;
}
@keyframes ${ANIM_BAR} {
  0% { left: -40%; }
  100% { left: 100%; }
}`;default:return`
.${CLS_SPINNER} {
  width: ${t};
  height: ${t};
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: ${e};
  border-radius: 50%;
  animation: ${ANIM_SPIN} 0.8s linear infinite;
}
@keyframes ${ANIM_SPIN} {
  to { transform: rotate(360deg); }
}`}}function generateHTMLTemplate$1(n){const e=n.position||"center",t=n.defaultText||"\u52A0\u8F7D\u4E2D...",i=n.spinnerType||"spinner",r=POSITION_CLASS_MAP[e],s=n.style?.customClass?` ${n.style.customClass}`:"",a=n.style?.customStyle?` style="${P(n.style.customStyle)}"`:"",l=n.defaultVisible?CLS_VISIBLE:CLS_HIDDEN;if(n.customTemplate)return`<div class="${CLS_OVERLAY} ${r} ${l}${s}" id="${ID_ROOT}"${a}>${n.customTemplate}</div>`;const d=getSpinnerHTML(i);return`<div class="${CLS_OVERLAY} ${r} ${l}${s}" id="${ID_ROOT}"${a}>
  ${d}
  <div class="${CLS_TEXT}" ${ATTR_TEXT}>${t}</div>
</div>`}function getSpinnerHTML(n){switch(n){case"dots":return`<div class="${CLS_SPINNER}"><div class="${CLS_DOT}"></div><div class="${CLS_DOT}"></div><div class="${CLS_DOT}"></div></div>`;default:return`<div class="${CLS_SPINNER}"></div>`}}function generateVarsCode(n){return`  var _loadingEl = null;
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
  var _originalXHRSend = null;`}function generateHelpersCode(n){return`  function _findEl() {
    if (!_loadingEl) {
      _loadingEl = document.getElementById('${ID_ROOT}');
    }
    if (!_textEl && _loadingEl) {
      _textEl = _loadingEl.querySelector('[${ATTR_TEXT}]');
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
  }`}function generateCoreLogicCode(){return`  function _applyHide() {
    if (!_loadingEl) return;
    _loadingEl.classList.remove('${CLS_VISIBLE}');
    _loadingEl.classList.add('${CLS_HIDDEN}');
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
    _loadingEl.classList.remove('${CLS_HIDDEN}');
    _loadingEl.classList.add('${CLS_VISIBLE}');
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
  }`}function generateManagerObjectCode(){return`    show: function(text) {
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
    }`}function generateInterceptorsCode(n){let e="";return(n==="fetch"||n==="all")&&(e+=`  // \u81EA\u52A8\u62E6\u622A fetch
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
`),e.trimEnd()}function generateInitCode(n,e,t){let i="";return i+=`  // defaultVisible: \u540C\u6B65\u521D\u59CB\u53EF\u89C1\u72B6\u6001
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
  window['${t}'] = manager;`,i}function generateLoadingManagerCode(n){const e=n.globalName||"__LOADING_MANAGER__",t=n.minDisplayTime||{enabled:!0,duration:300},i=n.delayShow||{enabled:!0,duration:200},r=n.debounceHide||{enabled:!1,duration:100},s=n.transition||{enabled:!0,duration:200,easing:"ease-out"},a=n.autoBind||"none",l=n.requestFilter||{},d=n.defaultVisible||!1,_=n.autoHideOn||"DOMContentLoaded",c=n.callbacks||{},g=l.excludeUrls||[],v=l.includeUrls||[],b=l.excludeMethods||[],y=l.excludeUrlPrefixes||[],C=script.makeCallback(c.onBeforeShow,"loadingManager"),m=script.makeCallback(c.onShow,"loadingManager"),F=script.makeCallback(c.onBeforeHide,"loadingManager"),E=script.makeCallback(c.onHide,"loadingManager"),w=script.makeCallback(c.onDestroy,"loadingManager"),B=generateVarsCode({minDisplayTime:t,delayShow:i,debounceHide:r,transition:s,excludeUrls:g,includeUrls:v,excludeMethods:b,excludeUrlPrefixes:y,cbBeforeShow:C,cbShow:m,cbBeforeHide:F,cbHide:E,cbDestroy:w}),x=generateHelpersCode(e),$=generateCoreLogicCode(),D=generateManagerObjectCode(),T=generateInterceptorsCode(a),S=generateInitCode(d,_,e);return`(function() {
  'use strict';

  // SSR \u73AF\u5883\u68C0\u6D4B
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

${B}

${x}

${$}

  var manager = {
${D}
  };

${T}

${S}
})();`}function validateStyle(n){if(!n)return;const{zIndex:e,pointerEvents:t,backdropBlurAmount:i}=n;if(e!==void 0&&(typeof e!="number"||e<0))throw new Error("style.zIndex \u5FC5\u987B\u662F\u975E\u8D1F\u6570");if(t!==void 0&&typeof t!="boolean")throw new Error("style.pointerEvents \u5FC5\u987B\u662F\u5E03\u5C14\u503C");if(i!==void 0&&(typeof i!="number"||i<0))throw new Error("style.backdropBlurAmount \u5FC5\u987B\u662F\u975E\u8D1F\u6570")}function validateNestedConfig(n,e){if(n?.duration!==void 0&&(typeof n.duration!="number"||n.duration<0))throw new Error(e)}function validateTransition(n){if(!n)return;const{duration:e,easing:t}=n;if(e!==void 0&&(typeof e!="number"||e<0))throw new Error("transition.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570");if(t!==void 0&&typeof t!="string")throw new Error("transition.easing \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B")}function validateCallbacks$1(n){if(!n)return;const e=["onBeforeShow","onShow","onBeforeHide","onHide","onDestroy"];for(const t of e){if(n[t]!==void 0&&typeof n[t]!="string")throw new Error(`callbacks.${t} \u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B`);if(n[t]&&script.containsScriptTag(n[t]))throw new Error(`callbacks.${t} \u4E0D\u5141\u8BB8\u5305\u542B <script> \u6807\u7B7E`)}}function validateCustomTemplate$1(n){if(n&&script.containsScriptTag(n))throw new Error("customTemplate \u4E0D\u5141\u8BB8\u5305\u542B <script> \u6807\u7B7E\uFF0C\u8BF7\u4F7F\u7528 callbacks \u914D\u7F6E\u56DE\u8C03\u903B\u8F91")}function validateGlobalName(n){if(n)try{script.validateIdentifierName(n)}catch(e){throw new Error(`globalName ${e.message}`)}}function validateDefaultText(n){return n===""?"defaultText \u4E3A\u7A7A\u5B57\u7B26\u4E32\uFF0Cloading \u5C06\u4E0D\u663E\u793A\u6587\u672C\u5185\u5BB9":null}function validateAutoHideOn(n,e){return!n&&e?"autoHideOn \u4EC5\u5728 defaultVisible \u4E3A true \u65F6\u751F\u6548\uFF0C\u5F53\u524D defaultVisible \u4E3A false\uFF0CautoHideOn \u914D\u7F6E\u5C06\u88AB\u5FFD\u7565":null}class M extends index.BasePlugin{getDefaultOptions(){return{position:"center",defaultText:"\u52A0\u8F7D\u4E2D...",spinnerType:"spinner",autoBind:"none",globalName:"__LOADING_MANAGER__",defaultVisible:!1,autoHideOn:"DOMContentLoaded",style:{overlayColor:"rgba(255, 255, 255, 0.7)",spinnerColor:"#4361ee",spinnerSize:"40px",textColor:"#333",textSize:"14px",zIndex:9999,pointerEvents:!0,backdropBlur:!1,backdropBlurAmount:4},transition:{enabled:!0,duration:200,easing:"ease-out"},minDisplayTime:{enabled:!0,duration:300},delayShow:{enabled:!0,duration:200},debounceHide:{enabled:!1,duration:100}}}validateOptions(){this.validator.field("position").custom(i=>!i||["center","top","bottom"].includes(i),"position \u5FC5\u987B\u662F center, top \u6216 bottom").field("defaultText").string().field("spinnerType").custom(i=>!i||["spinner","dots","pulse","bar"].includes(i),"spinnerType \u5FC5\u987B\u662F spinner, dots, pulse \u6216 bar").field("autoBind").custom(i=>!i||["fetch","xhr","all","none"].includes(i),"autoBind \u5FC5\u987B\u662F fetch, xhr, all \u6216 none").field("globalName").string().field("customTemplate").string().field("defaultVisible").boolean().field("autoHideOn").custom(i=>!i||["DOMContentLoaded","load","manual"].includes(i),"autoHideOn \u5FC5\u987B\u662F DOMContentLoaded, load \u6216 manual").validate(),validateCustomTemplate$1(this.options.customTemplate);const e=validateDefaultText(this.options.defaultText);e&&this.logger.warn(e),validateGlobalName(this.options.globalName),validateStyle(this.options.style),validateNestedConfig(this.options.minDisplayTime,"minDisplayTime.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570"),validateNestedConfig(this.options.delayShow,"delayShow.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570"),validateNestedConfig(this.options.debounceHide,"debounceHide.duration \u5FC5\u987B\u662F\u975E\u8D1F\u6570"),validateTransition(this.options.transition),validateCallbacks$1(this.options.callbacks);const t=validateAutoHideOn(this.options.defaultVisible,this.options.autoHideOn);t&&this.logger.warn(t)}getPluginName(){return"loading-manager"}generateLoadingManager(e){return generateLoadingManagerCode(e)}generateHeadInjectCode(){const{css:e,html:t}=this.getCachedAssets();return`<!-- loading-manager: head start -->
<style data-loading-style data-loading-id="${this.options.globalName||"__LOADING_MANAGER__"}">${e}</style>
${t}
<!-- loading-manager: head end -->`}generateBodyInjectCode(e){const t=this.generateLoadingManager(this.options);if(e)return`<!-- loading-manager: body start -->
<script>${t}<\/script>
<!-- loading-manager: body end -->`;const{css:i,html:r}=this.getCachedAssets();return`<!-- loading-manager: start -->
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
    div.innerHTML = ${JSON.stringify(r)};
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
<!-- loading-manager: end -->`}_cachedAssets=null;getCachedAssets(){if(!this._cachedAssets){const e=this.options.style||{},t=this.options.spinnerType||"spinner",i=this.options.transition;this._cachedAssets={css:generateCSS$1(e,t,i),html:generateHTMLTemplate$1(this.options)}}return this._cachedAssets}addPluginHooks(e){const t=this.options.defaultVisible||!1,i=t?this.generateHeadInjectCode():"",r=this.generateBodyInjectCode(t);e.transformIndexHtml={order:"post",handler:s=>{let a=s;if(i){const _=script.injectBeforeTag(a,"</head>",i);_.injected?a=_.html:this.logger.warn("\u672A\u627E\u5230 </head> \u6807\u7B7E\uFF0CdefaultVisible \u7684\u767D\u5C4F loading \u5C06\u65E0\u6CD5\u751F\u6548")}const l=script.injectBeforeTag(a,"</body>",r);if(l.injected)return this.logger.success("\u6210\u529F\u6CE8\u5165\u5168\u5C40 Loading \u72B6\u6001\u7BA1\u7406\u4EE3\u7801\u5230 HTML \u6587\u4EF6"),l.html;const d=script.injectBeforeTag(a,"</html>",r);return d.injected?(this.logger.success("\u6210\u529F\u6CE8\u5165\u5168\u5C40 Loading \u72B6\u6001\u7BA1\u7406\u4EE3\u7801\u5230 HTML \u6587\u4EF6"),d.html):(this.logger.warn("\u672A\u627E\u5230 </body> \u6216 </html> \u6807\u7B7E\uFF0CLoading \u4EE3\u7801\u8FFD\u52A0\u5230\u6587\u4EF6\u672B\u5C3E"),a+r)}}}}const loadingManager=index.createPluginFactory(M);function generateCSS(n,e){const t=".__vuc-overlay__{position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;pointer-events:none;}";let i="";switch(n){case"modal":i=`.__vuc-modal__{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.15);padding:32px;max-width:420px;width:90%;z-index:100000;pointer-events:auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;}
.__vuc-modal-title__{font-size:18px;font-weight:600;color:#1a1a2e;margin:0 0 12px 0;}
.__vuc-modal-body__{font-size:14px;color:#555;line-height:1.6;margin:0 0 8px 0;}
.__vuc-modal-version__{font-size:12px;color:#999;margin:0 0 24px 0;}
.__vuc-modal-version__ span{font-family:Consolas,'Courier New',monospace;background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:11px;}
.__vuc-modal-actions__{display:flex;gap:12px;justify-content:center;}
.__vuc-btn__{padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;border:none;transition:all 0.2s ease;}
.__vuc-btn-refresh__{background:#4361ee;color:#fff;}
.__vuc-btn-refresh__:hover{background:#3451d1;}
.__vuc-btn-dismiss__{background:#f0f0f0;color:#666;}
.__vuc-btn-dismiss__:hover{background:#e0e0e0;}`;break;case"banner":i=`.__vuc-banner__{position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#4361ee,#7c3aed);color:#fff;padding:12px 20px;z-index:100000;pointer-events:auto;display:flex;align-items:center;justify-content:space-between;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-shadow:0 2px 12px rgba(67,97,238,0.3);}
.__vuc-banner-text__{font-size:14px;flex:1;}
.__vuc-banner-actions__{display:flex;gap:8px;flex-shrink:0;}
.__vuc-btn-banner-refresh__{background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3);padding:6px 16px;border-radius:6px;font-size:13px;cursor:pointer;transition:all 0.2s ease;}
.__vuc-btn-banner-refresh__:hover{background:rgba(255,255,255,0.3);}
.__vuc-btn-banner-dismiss__{background:transparent;color:rgba(255,255,255,0.8);border:none;padding:6px 12px;font-size:13px;cursor:pointer;}
.__vuc-btn-banner-dismiss__:hover{color:#fff;}`;break;case"toast":i=`.__vuc-toast__{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:14px 24px;border-radius:10px;z-index:100000;pointer-events:auto;display:flex;align-items:center;gap:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.2);max-width:90%;}
.__vuc-toast-text__{font-size:14px;white-space:nowrap;}
.__vuc-btn-toast-refresh__{background:#4361ee;color:#fff;border:none;padding:6px 16px;border-radius:6px;font-size:13px;cursor:pointer;white-space:nowrap;transition:all 0.2s ease;}
.__vuc-btn-toast-refresh__:hover{background:#3451d1;}
.__vuc-btn-toast-dismiss__{background:transparent;color:rgba(255,255,255,0.6);border:none;padding:6px 12px;font-size:13px;cursor:pointer;white-space:nowrap;transition:all 0.2s ease;}
.__vuc-btn-toast-dismiss__:hover{color:#fff;}`;break}return`<style data-vuc-style>${t}${i}${e||""}</style>`}function generateHTMLTemplate(n){const e=n.promptStyle||"modal",t=n.promptMessage||"\u53D1\u73B0\u65B0\u7248\u672C\uFF0C\u662F\u5426\u7ACB\u5373\u5237\u65B0\u83B7\u53D6\u6700\u65B0\u5185\u5BB9\uFF1F",i=n.refreshButtonText||"\u7ACB\u5373\u5237\u65B0",r=n.dismissButtonText||"\u7A0D\u540E\u518D\u8BF4";if(n.customPromptTemplate)return n.customPromptTemplate.replace(/\{\{message\}\}/g,t).replace(/\{\{currentVersion\}\}/g,'<span id="__vuc-current__"></span>').replace(/\{\{newVersion\}\}/g,'<span id="__vuc-new__"></span>').replace(/\{\{refreshButton\}\}/g,`<button class="__vuc-btn-refresh__" onclick="window.__VUC_REFRESH__()">${i}</button>`).replace(/\{\{dismissButton\}\}/g,`<button class="__vuc-btn-dismiss__" onclick="window.__VUC_DISMISS__()">${r}</button>`);switch(e){case"modal":return`<div class="__vuc-overlay__"><div class="__vuc-modal__">
<p class="__vuc-modal-title__">\u7248\u672C\u66F4\u65B0</p>
<p class="__vuc-modal-body__">${t}</p>
<p class="__vuc-modal-version__"><span id="__vuc-current__"></span> \u2192 <span id="__vuc-new__"></span></p>
<div class="__vuc-modal-actions__">
<button class="__vuc-btn__ __vuc-btn-dismiss__" onclick="window.__VUC_DISMISS__()">${r}</button>
<button class="__vuc-btn__ __vuc-btn-refresh__" onclick="window.__VUC_REFRESH__()">${i}</button>
</div></div></div>`;case"banner":return`<div class="__vuc-overlay__"><div class="__vuc-banner__">
<span class="__vuc-banner-text__">${t}</span>
<div class="__vuc-banner-actions__">
<button class="__vuc-btn-banner-dismiss__" onclick="window.__VUC_DISMISS__()">${r}</button>
<button class="__vuc-btn-banner-refresh__" onclick="window.__VUC_REFRESH__()">${i}</button>
</div></div></div>`;case"toast":return`<div class="__vuc-overlay__"><div class="__vuc-toast__">
<span class="__vuc-toast-text__">${t}</span>
<button class="__vuc-btn-toast-dismiss__" onclick="window.__VUC_DISMISS__()">${r}</button>
<button class="__vuc-btn-toast-refresh__" onclick="window.__VUC_REFRESH__()">${i}</button>
</div></div>`;default:return`<div class="__vuc-overlay__"><div class="__vuc-modal__">
<p class="__vuc-modal-title__">\u7248\u672C\u66F4\u65B0</p>
<p class="__vuc-modal-body__">${t}</p>
<p class="__vuc-modal-version__"><span id="__vuc-current__"></span> \u2192 <span id="__vuc-new__"></span></p>
<div class="__vuc-modal-actions__">
<button class="__vuc-btn__ __vuc-btn-dismiss__" onclick="window.__VUC_DISMISS__()">${r}</button>
<button class="__vuc-btn__ __vuc-btn-refresh__" onclick="window.__VUC_REFRESH__()">${i}</button>
</div></div></div>`}}function generateCheckerCode(n){const e=n.versionSource||"auto",t=n.defineName||"__APP_VERSION__",i=n.checkUrl||"/version.json",r=n.checkInterval||3e5,s=n.checkOnVisibilityChange!==!1,a=n.enableInDev||!1,l=script.makeCallback(n.onUpdateAvailable,"versionUpdateChecker","currentVersion, newVersion"),d=script.makeCallback(n.onRefresh,"versionUpdateChecker","currentVersion, newVersion"),_=script.makeCallback(n.onDismiss,"versionUpdateChecker","currentVersion, newVersion");let c="";return(e==="define"||e==="auto")&&(c=`
    // \u4F18\u5148\u4ECE define \u5168\u5C40\u53D8\u91CF\u8BFB\u53D6
    if (typeof ${t} !== 'undefined') return ${t};`),(e==="file"||e==="auto")&&(c+=`
    // \u4ECE\u9875\u9762 meta \u6807\u7B7E\u8BFB\u53D6
    var metaEl = document.querySelector('meta[name="app-version"]');
    if (metaEl && metaEl.getAttribute('content')) return metaEl.getAttribute('content');`),c+=`
    return null;`,`;(function() {
  'use strict';

  // SSR \u73AF\u5883\u68C0\u6D4B
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // \u5F00\u53D1\u6A21\u5F0F\u68C0\u6D4B
  var _isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
  if (_isDev && !${JSON.stringify(a)}) return;

  // \u72B6\u6001
  var _currentVersion = null;
  var _latestVersion = null;
  var _promptVisible = false;
  var _dismissed = false;
  var _delayTimer = null;
  var _intervalTimer = null;
  var _destroyed = false;

  // \u83B7\u53D6\u5F53\u524D\u7248\u672C\u53F7
  function _getCurrentVersion() {${c}
  }

  // \u68C0\u67E5\u7248\u672C\u66F4\u65B0
  function _checkForUpdate() {
    if (_destroyed || _dismissed || _promptVisible) return;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', ${JSON.stringify(i)} + '?_t=' + Date.now(), true);
    xhr.timeout = 10000;
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200) return;
      try {
        var data = JSON.parse(xhr.responseText);
        _latestVersion = data.version || data;
        if (!_currentVersion) _currentVersion = _getCurrentVersion();
        if (!_currentVersion || !_latestVersion) return;
        if (_currentVersion === _latestVersion) return;

        // \u7248\u672C\u4E0D\u4E00\u81F4\uFF0C\u53D1\u73B0\u66F4\u65B0
        var shouldShow = ${l}(_currentVersion, _latestVersion);
        if (shouldShow !== false) {
          _showPrompt();
        }
      } catch(e) {
        // \u89E3\u6790\u5931\u8D25\uFF0C\u9759\u9ED8\u5FFD\u7565
      }
    };
    xhr.send();
  }

  // \u663E\u793A\u66F4\u65B0\u63D0\u793A
  function _showPrompt() {
    if (_promptVisible || _destroyed) return;
    _promptVisible = true;

    var container = document.getElementById('__vuc-root__');
    if (!container) return;

    container.style.display = '';

    // \u586B\u5145\u7248\u672C\u53F7
    var currentEl = document.getElementById('__vuc-current__');
    var newEl = document.getElementById('__vuc-new__');
    if (currentEl) currentEl.textContent = _currentVersion;
    if (newEl) newEl.textContent = _latestVersion;
  }

  // \u9690\u85CF\u66F4\u65B0\u63D0\u793A
  function _hidePrompt() {
    _promptVisible = false;
    var container = document.getElementById('__vuc-root__');
    if (container) container.style.display = 'none';
  }

  // \u5237\u65B0\u9875\u9762
  window.__VUC_REFRESH__ = function() {
    ${d}(_currentVersion, _latestVersion);
    window.location.reload();
  };

  // \u5FFD\u7565\u66F4\u65B0
  window.__VUC_DISMISS__ = function() {
    ${_}(_currentVersion, _latestVersion);
    _dismissed = true;
    _hidePrompt();
  };

  // \u542F\u52A8\u5B9A\u65F6\u68C0\u67E5
  function _startChecking() {
    _currentVersion = _getCurrentVersion();
    if (!_currentVersion) {
      console.warn('[versionUpdateChecker] \u65E0\u6CD5\u83B7\u53D6\u5F53\u524D\u7248\u672C\u53F7\uFF0C\u7248\u672C\u68C0\u67E5\u5DF2\u8DF3\u8FC7\u3002\u8BF7\u786E\u8BA4 generateVersion \u63D2\u4EF6\u5DF2\u6B63\u786E\u914D\u7F6E\u3002');
      return;
    }

    // \u9996\u6B21\u5EF6\u8FDF 10 \u79D2\u68C0\u67E5\uFF0C\u907F\u514D\u9875\u9762\u521A\u52A0\u8F7D\u5C31\u5F39\u51FA
    _delayTimer = setTimeout(function() {
      _checkForUpdate();
      // \u4E4B\u540E\u6309\u95F4\u9694\u5B9A\u671F\u68C0\u67E5
      _intervalTimer = setInterval(_checkForUpdate, ${r});
    }, 10000);
  }

  // \u9500\u6BC1\u68C0\u67E5\u5668\uFF0C\u6E05\u7406\u5B9A\u65F6\u5668\u548C DOM
  function _destroy() {
    _destroyed = true;
    if (_delayTimer) { clearTimeout(_delayTimer); _delayTimer = null; }
    if (_intervalTimer) { clearInterval(_intervalTimer); _intervalTimer = null; }
    var container = document.getElementById('__vuc-root__');
    if (container) container.parentNode.removeChild(container);
    var styleEl = document.querySelector('style[data-vuc-style]');
    if (styleEl) styleEl.parentNode.removeChild(styleEl);
    delete window.__VUC_REFRESH__;
    delete window.__VUC_DISMISS__;
  }

  // \u9875\u9762\u53EF\u89C1\u6027\u53D8\u5316\u65F6\u68C0\u67E5
  ${s?`
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !_destroyed && !_dismissed && !_promptVisible) {
      _checkForUpdate();
    }
  });`:""}

  // DOM \u5C31\u7EEA\u540E\u542F\u52A8
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _startChecking);
  } else {
    _startChecking();
  }
})();`}function generateMetaTag(n){const e=n.versionSource||"auto";return e!=="file"&&e!=="auto"?"":`<meta name="app-version" content="${n.defineName||"__APP_VERSION__"}">`}function generateFullInjectCode(n){const e=generateCSS(n.promptStyle||"modal",n.customStyle),t=generateHTMLTemplate(n),i=generateCheckerCode(n);return`${e}
<div id="__vuc-root__" style="display:none">${t}</div>
<script>${i}<\/script>`}function validateCustomTemplate(n){if(n.customPromptTemplate&&script.containsScriptTag(n.customPromptTemplate))throw new Error("customPromptTemplate \u4E0D\u5141\u8BB8\u5305\u542B <script> \u6807\u7B7E")}function validateCallbacks(n){const e=["onUpdateAvailable","onRefresh","onDismiss"];for(const t of e)if(n[t]&&script.containsScriptTag(n[t]))throw new Error(`callbacks.${t} \u4E0D\u5141\u8BB8\u5305\u542B <script> \u6807\u7B7E`)}function validateDefineName(n){if(n.defineName)try{script.validateIdentifierName(n.defineName)}catch(e){throw new Error(`defineName ${e.message}`)}}function validateAll(n){validateCustomTemplate(n),validateCallbacks(n),validateDefineName(n)}class h extends index.BasePlugin{getDefaultOptions(){return{versionSource:"auto",defineName:"__APP_VERSION__",checkUrl:"/version.json",checkInterval:3e5,checkOnVisibilityChange:!0,enableInDev:!1,promptStyle:"modal",promptMessage:"\u53D1\u73B0\u65B0\u7248\u672C\uFF0C\u662F\u5426\u7ACB\u5373\u5237\u65B0\u83B7\u53D6\u6700\u65B0\u5185\u5BB9\uFF1F",refreshButtonText:"\u7ACB\u5373\u5237\u65B0",dismissButtonText:"\u7A0D\u540E\u518D\u8BF4"}}validateOptions(){this.validator.field("versionSource").custom(e=>!e||["define","file","auto"].includes(e),"versionSource \u5FC5\u987B\u662F define, file \u6216 auto").field("promptStyle").custom(e=>!e||["modal","banner","toast"].includes(e),"promptStyle \u5FC5\u987B\u662F modal, banner \u6216 toast").field("checkInterval").custom(e=>!e||typeof e=="number"&&e>=5e3,"checkInterval \u5FC5\u987B\u662F\u5927\u4E8E\u7B49\u4E8E 5000 \u7684\u6570\u5B57\uFF08\u6BEB\u79D2\uFF09").validate(),validateAll(this.options)}getPluginName(){return"version-update-checker"}addPluginHooks(e){const t=generateFullInjectCode(this.options),i=generateMetaTag(this.options);e.transformIndexHtml={order:"post",handler:r=>{let s=r;if(i){const d=script.injectBeforeTag(s,"</head>",i);d.injected&&(s=d.html)}const a=script.injectBeforeTag(s,"</body>",t);if(a.injected)return this.logger.success("\u6210\u529F\u6CE8\u5165\u7248\u672C\u66F4\u65B0\u68C0\u67E5\u4EE3\u7801\u5230 HTML \u6587\u4EF6"),a.html;const l=script.injectBeforeTag(s,"</html>",t);return l.injected?(this.logger.success("\u6210\u529F\u6CE8\u5165\u7248\u672C\u66F4\u65B0\u68C0\u67E5\u4EE3\u7801\u5230 HTML \u6587\u4EF6"),l.html):(this.logger.warn("\u672A\u627E\u5230 </body> \u6216 </html> \u6807\u7B7E\uFF0C\u7248\u672C\u66F4\u65B0\u68C0\u67E5\u4EE3\u7801\u8FFD\u52A0\u5230\u6587\u4EF6\u672B\u5C3E"),s+t)}}}}const versionUpdateChecker=index.createPluginFactory(h);exports.buildProgress=buildProgress,exports.copyFile=copyFile,exports.faviconManager=faviconManager,exports.generateRouter=generateRouter,exports.generateVersion=generateVersion,exports.loadingManager=loadingManager,exports.versionUpdateChecker=versionUpdateChecker;
