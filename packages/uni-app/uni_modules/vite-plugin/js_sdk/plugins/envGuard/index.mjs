import{createPluginFactory as v,BasePlugin as F}from"../../factory/index.mjs";import{v as A}from"../../shared/vite-plugin.DnFDPjNf.mjs";import{injectBeforeTag as E}from"../../common/html/index.mjs";import{writeFileContent as h}from"../../common/fs/index.mjs";import{formatDate as y}from"../../common/format/index.mjs";import p from"node:path";import m from"node:fs";import"../../logger/index.mjs";import"../../common/object/index.mjs";import"../../shared/vite-plugin.DcExl6jd.mjs";import"../../shared/vite-plugin.BCuhU1au.mjs";import"../../common/script/index.mjs";import"fs";import"path";import"crypto";function D(r){const i=new Map,s=[];for(const[t,e]of Object.entries(r)){const o={type:"string",required:!0,...e};if(o.group){const n=i.get(o.group)||[];n.push({key:t,rule:o}),i.set(o.group,n)}else s.push({key:t,rule:o})}const u=[];u.push("# \u73AF\u5883\u53D8\u91CF\u6A21\u677F\u6587\u4EF6"),u.push(`# \u751F\u6210\u65F6\u95F4: ${new Date().toISOString()}`),u.push("# \u7531 @meng-xi/vite-plugin envGuard \u81EA\u52A8\u751F\u6210"),u.push(""),s.length>0&&g(u,"\u901A\u7528\u914D\u7F6E",s);for(const[t,e]of i)g(u,t,e);return u.join(`
`)}function g(r,i,s){r.push("# =============================="),r.push(`# ${i}`),r.push("# =============================="),r.push("");for(const{key:u,rule:t}of s){t.description&&r.push(`# ${t.description}`);const e=[];e.push(`\u7C7B\u578B: ${t.type||"string"}`),e.push(t.required!==!1?"\u5FC5\u9700":"\u53EF\u9009"),t.enumValues&&t.enumValues.length>0&&e.push(`\u679A\u4E3E\u503C: ${t.enumValues.join(" | ")}`),t.minValue!==void 0&&e.push(`\u6700\u5C0F\u503C: ${t.minValue}`),t.maxValue!==void 0&&e.push(`\u6700\u5927\u503C: ${t.maxValue}`),t.minLength!==void 0&&e.push(`\u6700\u5C0F\u957F\u5EA6: ${t.minLength}`),t.maxLength!==void 0&&e.push(`\u6700\u5927\u957F\u5EA6: ${t.maxLength}`),t.sensitive&&e.push("\u26A0\uFE0F \u654F\u611F\u4FE1\u606F"),r.push(`# [${e.join(" | ")}]`),t.default!==void 0?r.push(`${u}=${t.sensitive?"********":t.default}`):r.push(`${u}=`),r.push("")}}function C(r,i,s,u){const t=[];for(const[a,l]of Object.entries(r))l.required!==!1&&t.push({key:a,rule:{type:"string",required:!0,...l}});if(t.length===0)return"";const e=u.filter(a=>a.status!=="pass"),o=t.map(({key:a,rule:l})=>({key:a,type:l.type||"string",description:l.description||""})),n=JSON.stringify(o,null,2),d=e.map(a=>a.key),f=JSON.stringify(d),c=R(s);return`<script>
${`
(function() {
  'use strict';
  var GUARD_NAME = ${JSON.stringify(i)};
  var GUARD_DATA = ${n};
  var FAILED_KEYS = ${f};
  var MODE = ${JSON.stringify(s)};

  var missing = [];
  var invalid = [];

  for (var i = 0; i < GUARD_DATA.length; i++) {
    var item = GUARD_DATA[i];
    var el = document.querySelector('meta[name="env:' + item.key + '"]');
    if (!el) {
      var attr = document.querySelector('[' + item.key + ']');
      if (!attr) {
        missing.push(item.key);
      }
    }
  }

  for (var j = 0; j < FAILED_KEYS.length; j++) {
    if (invalid.indexOf(FAILED_KEYS[j]) === -1 && missing.indexOf(FAILED_KEYS[j]) === -1) {
      invalid.push(FAILED_KEYS[j]);
    }
  }

  var hasIssues = missing.length > 0 || invalid.length > 0;

  var guard = {
    missing: missing,
    invalid: invalid,
    allPassed: !hasIssues,
    data: GUARD_DATA
  };

  if (typeof window !== 'undefined') {
    window[GUARD_NAME] = guard;
  }

  if (hasIssues) {
    ${c}
  }
})();
`.trim()}
<\/script>`}function R(r){switch(r){case"console":return`
    var msgs = [];
    if (missing.length > 0) msgs.push('[EnvGuard] \u7F3A\u5C11\u73AF\u5883\u53D8\u91CF: ' + missing.join(', '));
    if (invalid.length > 0) msgs.push('[EnvGuard] \u73AF\u5883\u53D8\u91CF\u6821\u9A8C\u5931\u8D25: ' + invalid.join(', '));
    for (var k = 0; k < msgs.length; k++) console.warn(msgs[k]);`;case"throw":return`
    var errMsg = '';
    if (missing.length > 0) errMsg += '\u7F3A\u5C11\u73AF\u5883\u53D8\u91CF: ' + missing.join(', ') + '; ';
    if (invalid.length > 0) errMsg += '\u73AF\u5883\u53D8\u91CF\u6821\u9A8C\u5931\u8D25: ' + invalid.join(', ');
    throw new Error('[EnvGuard] ' + errMsg);`;case"overlay":return`
    var overlay = document.createElement('div');
    overlay.id = '__env_guard_overlay__';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fff3cd;color:#856404;padding:12px 20px;font-size:14px;font-family:monospace;border-bottom:3px solid #ffc107;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
    var html = '<strong>\u26A0\uFE0F EnvGuard \u8B66\u544A</strong><br>';
    if (missing.length > 0) html += '\u7F3A\u5C11: ' + missing.join(', ') + '<br>';
    if (invalid.length > 0) html += '\u6821\u9A8C\u5931\u8D25: ' + invalid.join(', ');
    overlay.innerHTML = html;
    document.addEventListener('DOMContentLoaded', function() { document.body.appendChild(overlay); });`;default:return""}}class $ extends F{validationResults=[];guardResult=null;getDefaultOptions(){return{required:{},failAction:"error",generateTemplate:!0,templateOutput:".env.template",runtimeGuard:!1,runtimeGlobalName:"__ENV_GUARD__",runtimeGuardMode:"console",envFiles:[".env",".env.local",".env.production",".env.development"],autoLoadEnv:!0,reportOutput:!1,validateBeforeBuild:!0,showSummary:!0}}validateOptions(){this.validator.field("failAction").enum(["error","warn","ignore"]).field("generateTemplate").boolean().field("runtimeGuard").boolean().field("runtimeGuardMode").enum(["console","throw","overlay"]).field("autoLoadEnv").boolean().field("reportOutput").custom(i=>i===!1||typeof i=="string","reportOutput \u5FC5\u987B\u4E3A false \u6216\u5B57\u7B26\u4E32\u8DEF\u5F84").field("validateBeforeBuild").boolean().field("showSummary").boolean().validate()}getPluginName(){return"env-guard"}addPluginHooks(i){this.options.validateBeforeBuild&&(i.configResolved=s=>{this.viteConfig=s,this.runValidation()}),this.options.runtimeGuard&&(i.transformIndexHtml={order:"post",handler:s=>this.safeExecuteSync(()=>this.injectRuntimeGuard(s),"\u6CE8\u5165\u8FD0\u884C\u65F6\u5B88\u536B")||s})}runValidation(){this.options.autoLoadEnv&&this.loadEnvFiles(),this.validationResults=A(process.env,this.options.required),this.guardResult=this.buildResult(),this.options.generateTemplate&&this.writeEnvTemplate(),this.options.reportOutput&&this.writeReport(),this.options.showSummary&&this.logSummary(),this.handleResults()}loadEnvFiles(){if(!this.viteConfig)return;const i=this.viteConfig.root||process.cwd();for(const s of this.options.envFiles){const u=p.resolve(i,s);if(m.existsSync(u))try{this.parseAndLoadEnvFile(u)}catch{this.logger.warn(`\u52A0\u8F7D .env \u6587\u4EF6\u5931\u8D25: ${u}`)}}}parseAndLoadEnvFile(i){const s=m.readFileSync(i,"utf-8").split(`
`);for(const u of s){const t=u.trim();if(!t||t.startsWith("#"))continue;const e=t.indexOf("=");if(e===-1)continue;const o=t.slice(0,e).trim();let n=t.slice(e+1).trim();(n.startsWith('"')&&n.endsWith('"')||n.startsWith("'")&&n.endsWith("'"))&&(n=n.slice(1,-1)),o.startsWith("VITE_")&&process.env[o]===void 0&&(process.env[o]=n)}}buildResult(){const i=this.validationResults.length,s=this.validationResults.filter(e=>e.status==="pass").length,u=this.validationResults.filter(e=>e.status==="missing").length,t=this.validationResults.filter(e=>e.status!=="pass"&&e.status!=="missing").length;return{timestamp:y(new Date,"{YYYY}-{MM}-{DD}T{HH}:{mm}:{ss}"),total:i,passed:s,missing:u,invalid:t,results:this.validationResults,allPassed:u===0&&t===0}}handleResults(){if(!this.guardResult||this.guardResult.allPassed)return;const i=this.validationResults.filter(e=>e.status==="missing").map(e=>e.key),s=this.validationResults.filter(e=>e.status!=="pass"&&e.status!=="missing"),u=[];i.length>0&&u.push(`\u7F3A\u5C11\u5FC5\u9700\u7684\u73AF\u5883\u53D8\u91CF: ${i.join(", ")}`);for(const e of s)u.push(`${e.key}: ${e.message}`);const t=u.join(`
  `);switch(this.options.failAction){case"error":throw new Error(t);case"warn":this.logger.warn(t);break}}writeEnvTemplate(){const i=this.viteConfig?.root||process.cwd(),s=p.resolve(i,this.options.templateOutput),u=D(this.options.required);this.safeExecuteSync(()=>{h(s,u),this.logger.info(`\u73AF\u5883\u53D8\u91CF\u6A21\u677F\u5DF2\u751F\u6210: ${this.options.templateOutput}`)},"\u751F\u6210 .env \u6A21\u677F")}writeReport(){if(!this.guardResult||!this.options.reportOutput)return;const i=this.viteConfig?.build?.outDir||"dist",s=p.resolve(i,this.options.reportOutput);this.safeExecuteSync(()=>{const u=JSON.stringify(this.guardResult,(t,e)=>e instanceof RegExp?e.toString():typeof e=="function"?"[Function]":e,2);h(s,u),this.logger.info(`\u6821\u9A8C\u62A5\u544A\u5DF2\u751F\u6210: ${this.options.reportOutput}`)},"\u751F\u6210\u6821\u9A8C\u62A5\u544A")}logSummary(){if(!this.guardResult)return;const{total:i,passed:s,missing:u,invalid:t,allPassed:e}=this.guardResult;if(e){this.logger.success(`\u73AF\u5883\u53D8\u91CF\u6821\u9A8C\u901A\u8FC7: ${i} \u4E2A\u53D8\u91CF\u5168\u90E8\u5408\u6CD5`);return}this.logger.info(`\u73AF\u5883\u53D8\u91CF\u6821\u9A8C\u7ED3\u679C: \u603B\u8BA1 ${i} | \u901A\u8FC7 ${s} | \u7F3A\u5931 ${u} | \u5931\u8D25 ${t}`);const o=this.validationResults.filter(n=>n.status!=="pass");for(const n of o){const d=n.status==="missing"?"\u7F3A\u5931":"\u5931\u8D25";this.logger.warn(`  [${d}] ${n.key}: ${n.message}`)}}injectRuntimeGuard(i){const s=C(this.options.required,this.options.runtimeGlobalName,this.options.runtimeGuardMode,this.validationResults);if(!s)return i;const u=E(i,"</head>",s);return u.injected?u.html:(this.logger.warn("\u672A\u627E\u5230 </head> \u6807\u7B7E\uFF0C\u8FD0\u884C\u65F6\u5B88\u536B\u4EE3\u7801\u672A\u80FD\u6CE8\u5165"),i)}getResult(){return this.guardResult}getValidationResults(){return[...this.validationResults]}}const w=v($);export{w as envGuard};
