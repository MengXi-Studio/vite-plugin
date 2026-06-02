"use strict";const factory_index=require("../../factory/index.cjs"),env=require("../../shared/vite-plugin.vwox4bU0.cjs"),common_html_index=require("../../common/html/index.cjs"),common_fs_index=require("../../common/fs/index.cjs"),common_format_index=require("../../common/format/index.cjs"),a=require("node:path"),a$1=require("node:fs");require("../../logger/index.cjs"),require("../../common/object/index.cjs"),require("../../shared/vite-plugin.Bcg6RW2N.cjs"),require("../../shared/vite-plugin.BrI73DHA.cjs"),require("../../common/script/index.cjs"),require("fs"),require("path"),require("crypto");function _interopDefaultCompat(n){return n&&typeof n=="object"&&"default"in n?n.default:n}const a__default=_interopDefaultCompat(a),a__default$1=_interopDefaultCompat(a$1);function generateTemplate(n){const i=new Map,s=[];for(const[e,t]of Object.entries(n)){const l={type:"string",required:!0,...t};if(l.group){const r=i.get(l.group)||[];r.push({key:e,rule:l}),i.set(l.group,r)}else s.push({key:e,rule:l})}const u=[];u.push("# \u73AF\u5883\u53D8\u91CF\u6A21\u677F\u6587\u4EF6"),u.push(`# \u751F\u6210\u65F6\u95F4: ${new Date().toISOString()}`),u.push("# \u7531 @meng-xi/vite-plugin envGuard \u81EA\u52A8\u751F\u6210"),u.push(""),s.length>0&&o(u,"\u901A\u7528\u914D\u7F6E",s);for(const[e,t]of i)o(u,e,t);return u.join(`
`)}function o(n,i,s){n.push("# =============================="),n.push(`# ${i}`),n.push("# =============================="),n.push("");for(const{key:u,rule:e}of s){e.description&&n.push(`# ${e.description}`);const t=[];t.push(`\u7C7B\u578B: ${e.type||"string"}`),t.push(e.required!==!1?"\u5FC5\u9700":"\u53EF\u9009"),e.enumValues&&e.enumValues.length>0&&t.push(`\u679A\u4E3E\u503C: ${e.enumValues.join(" | ")}`),e.minValue!==void 0&&t.push(`\u6700\u5C0F\u503C: ${e.minValue}`),e.maxValue!==void 0&&t.push(`\u6700\u5927\u503C: ${e.maxValue}`),e.minLength!==void 0&&t.push(`\u6700\u5C0F\u957F\u5EA6: ${e.minLength}`),e.maxLength!==void 0&&t.push(`\u6700\u5927\u957F\u5EA6: ${e.maxLength}`),e.sensitive&&t.push("\u26A0\uFE0F \u654F\u611F\u4FE1\u606F"),n.push(`# [${t.join(" | ")}]`),e.default!==void 0?n.push(`${u}=${e.sensitive?"********":e.default}`):n.push(`${u}=`),n.push("")}}function generateRuntimeGuard(n,i,s,u){const e=[];for(const[d,h]of Object.entries(n))h.required!==!1&&e.push({key:d,rule:{type:"string",required:!0,...h}});if(e.length===0)return"";const t=u.filter(d=>d.status!=="pass"),l=e.map(({key:d,rule:h})=>({key:d,type:h.type||"string",description:h.description||""})),r=JSON.stringify(l,null,2),c=t.map(d=>d.key),p=JSON.stringify(c),g=m(s);return`<script>
${`
(function() {
  'use strict';
  var GUARD_NAME = ${JSON.stringify(i)};
  var GUARD_DATA = ${r};
  var FAILED_KEYS = ${p};
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
    ${g}
  }
})();
`.trim()}
<\/script>`}function m(n){switch(n){case"console":return`
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
    document.addEventListener('DOMContentLoaded', function() { document.body.appendChild(overlay); });`;default:return""}}class R extends factory_index.BasePlugin{validationResults=[];guardResult=null;getDefaultOptions(){return{required:{},failAction:"error",generateTemplate:!0,templateOutput:".env.template",runtimeGuard:!1,runtimeGlobalName:"__ENV_GUARD__",runtimeGuardMode:"console",envFiles:[".env",".env.local",".env.production",".env.development"],autoLoadEnv:!0,reportOutput:!1,validateBeforeBuild:!0,showSummary:!0}}validateOptions(){this.validator.field("failAction").enum(["error","warn","ignore"]).field("generateTemplate").boolean().field("runtimeGuard").boolean().field("runtimeGuardMode").enum(["console","throw","overlay"]).field("autoLoadEnv").boolean().field("reportOutput").custom(i=>i===!1||typeof i=="string","reportOutput \u5FC5\u987B\u4E3A false \u6216\u5B57\u7B26\u4E32\u8DEF\u5F84").field("validateBeforeBuild").boolean().field("showSummary").boolean().validate()}getPluginName(){return"env-guard"}addPluginHooks(i){this.options.validateBeforeBuild&&(i.configResolved=s=>{this.viteConfig=s,this.runValidation()}),this.options.runtimeGuard&&(i.transformIndexHtml={order:"post",handler:s=>this.safeExecuteSync(()=>this.injectRuntimeGuard(s),"\u6CE8\u5165\u8FD0\u884C\u65F6\u5B88\u536B")||s})}runValidation(){this.options.autoLoadEnv&&this.loadEnvFiles(),this.validationResults=env.validateEnvironment(process.env,this.options.required),this.guardResult=this.buildResult(),this.options.generateTemplate&&this.writeEnvTemplate(),this.options.reportOutput&&this.writeReport(),this.options.showSummary&&this.logSummary(),this.handleResults()}loadEnvFiles(){if(!this.viteConfig)return;const i=this.viteConfig.root||process.cwd();for(const s of this.options.envFiles){const u=a__default.resolve(i,s);if(a__default$1.existsSync(u))try{this.parseAndLoadEnvFile(u)}catch{this.logger.warn(`\u52A0\u8F7D .env \u6587\u4EF6\u5931\u8D25: ${u}`)}}}parseAndLoadEnvFile(i){const s=a__default$1.readFileSync(i,"utf-8").split(`
`);for(const u of s){const e=u.trim();if(!e||e.startsWith("#"))continue;const t=e.indexOf("=");if(t===-1)continue;const l=e.slice(0,t).trim();let r=e.slice(t+1).trim();(r.startsWith('"')&&r.endsWith('"')||r.startsWith("'")&&r.endsWith("'"))&&(r=r.slice(1,-1)),l.startsWith("VITE_")&&process.env[l]===void 0&&(process.env[l]=r)}}buildResult(){const i=this.validationResults.length,s=this.validationResults.filter(t=>t.status==="pass").length,u=this.validationResults.filter(t=>t.status==="missing").length,e=this.validationResults.filter(t=>t.status!=="pass"&&t.status!=="missing").length;return{timestamp:common_format_index.formatDate(new Date,"{YYYY}-{MM}-{DD}T{HH}:{mm}:{ss}"),total:i,passed:s,missing:u,invalid:e,results:this.validationResults,allPassed:u===0&&e===0}}handleResults(){if(!this.guardResult||this.guardResult.allPassed)return;const i=this.validationResults.filter(t=>t.status==="missing").map(t=>t.key),s=this.validationResults.filter(t=>t.status!=="pass"&&t.status!=="missing"),u=[];i.length>0&&u.push(`\u7F3A\u5C11\u5FC5\u9700\u7684\u73AF\u5883\u53D8\u91CF: ${i.join(", ")}`);for(const t of s)u.push(`${t.key}: ${t.message}`);const e=u.join(`
  `);switch(this.options.failAction){case"error":throw new Error(e);case"warn":this.logger.warn(e);break}}writeEnvTemplate(){const i=this.viteConfig?.root||process.cwd(),s=a__default.resolve(i,this.options.templateOutput),u=generateTemplate(this.options.required);this.safeExecuteSync(()=>{common_fs_index.writeFileContent(s,u),this.logger.info(`\u73AF\u5883\u53D8\u91CF\u6A21\u677F\u5DF2\u751F\u6210: ${this.options.templateOutput}`)},"\u751F\u6210 .env \u6A21\u677F")}writeReport(){if(!this.guardResult||!this.options.reportOutput)return;const i=this.viteConfig?.build?.outDir||"dist",s=a__default.resolve(i,this.options.reportOutput);this.safeExecuteSync(()=>{const u=JSON.stringify(this.guardResult,(e,t)=>t instanceof RegExp?t.toString():typeof t=="function"?"[Function]":t,2);common_fs_index.writeFileContent(s,u),this.logger.info(`\u6821\u9A8C\u62A5\u544A\u5DF2\u751F\u6210: ${this.options.reportOutput}`)},"\u751F\u6210\u6821\u9A8C\u62A5\u544A")}logSummary(){if(!this.guardResult)return;const{total:i,passed:s,missing:u,invalid:e,allPassed:t}=this.guardResult;if(t){this.logger.success(`\u73AF\u5883\u53D8\u91CF\u6821\u9A8C\u901A\u8FC7: ${i} \u4E2A\u53D8\u91CF\u5168\u90E8\u5408\u6CD5`);return}this.logger.info(`\u73AF\u5883\u53D8\u91CF\u6821\u9A8C\u7ED3\u679C: \u603B\u8BA1 ${i} | \u901A\u8FC7 ${s} | \u7F3A\u5931 ${u} | \u5931\u8D25 ${e}`);const l=this.validationResults.filter(r=>r.status!=="pass");for(const r of l){const c=r.status==="missing"?"\u7F3A\u5931":"\u5931\u8D25";this.logger.warn(`  [${c}] ${r.key}: ${r.message}`)}}injectRuntimeGuard(i){const s=generateRuntimeGuard(this.options.required,this.options.runtimeGlobalName,this.options.runtimeGuardMode,this.validationResults);if(!s)return i;const u=common_html_index.injectBeforeTag(i,"</head>",s);return u.injected?u.html:(this.logger.warn("\u672A\u627E\u5230 </head> \u6807\u7B7E\uFF0C\u8FD0\u884C\u65F6\u5B88\u536B\u4EE3\u7801\u672A\u80FD\u6CE8\u5165"),i)}getResult(){return this.guardResult}getValidationResults(){return[...this.validationResults]}}const envGuard=factory_index.createPluginFactory(R);exports.envGuard=envGuard;
