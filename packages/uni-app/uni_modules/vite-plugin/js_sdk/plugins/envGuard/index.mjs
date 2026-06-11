import{createPluginFactory as v,BasePlugin as F}from"../../factory/index.mjs";import{formatDate as A}from"../../common/format/index.mjs";import{injectBeforeTag as E}from"../../common/html/index.mjs";import{writeFileContent as g}from"../../common/fs/index.mjs";import m from"node:path";import p from"node:fs";import"../../logger/index.mjs";import"../../shared/vite-plugin.DcExl6jd.mjs";import"../../shared/vite-plugin.CuXEJAWX.mjs";import"fs";import"path";import"../../common/concurrency/index.mjs";const C=new Set(["string","url","path","enum","semver",void 0]);function D(t,u){switch(u.type){case"number":{if(isNaN(Number(t))||t.trim()==="")return{valid:!1,status:"type_error",message:`\u73AF\u5883\u53D8\u91CF\u503C "${t}" \u4E0D\u662F\u5408\u6CD5\u6570\u5B57`};break}case"url":{try{new URL(t)}catch{return{valid:!1,status:"type_error",message:`\u73AF\u5883\u53D8\u91CF\u503C "${t}" \u4E0D\u662F\u5408\u6CD5 URL`}}break}case"boolean":{const r=t.toLowerCase();if(!["true","false","1","0","yes","no"].includes(r))return{valid:!1,status:"type_error",message:`\u73AF\u5883\u53D8\u91CF\u503C "${t}" \u4E0D\u662F\u5408\u6CD5\u5E03\u5C14\u503C (true/false/1/0/yes/no)`};break}case"enum":{if(!u.enumValues||u.enumValues.length===0)return{valid:!1,status:"enum_mismatch",message:"enum \u7C7B\u578B\u5FC5\u987B\u6307\u5B9A enumValues"};if(!u.enumValues.includes(t))return{valid:!1,status:"enum_mismatch",message:`\u73AF\u5883\u53D8\u91CF\u503C "${t}" \u4E0D\u5728\u5141\u8BB8\u7684\u679A\u4E3E\u503C\u4E2D: ${u.enumValues.join(", ")}`};break}case"json":{try{JSON.parse(t)}catch{return{valid:!1,status:"type_error",message:"\u73AF\u5883\u53D8\u91CF\u503C\u4E0D\u662F\u5408\u6CD5 JSON"}}break}case"semver":{if(!/^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(t))return{valid:!1,status:"type_error",message:`\u73AF\u5883\u53D8\u91CF\u503C "${t}" \u4E0D\u662F\u5408\u6CD5\u8BED\u4E49\u5316\u7248\u672C\u53F7 (x.y.z)`};break}case"path":{if(!/^(?:[./\\]|(?:[a-zA-Z]:))/.test(t))return{valid:!1,status:"type_error",message:`\u73AF\u5883\u53D8\u91CF\u503C "${t}" \u4E0D\u662F\u5408\u6CD5\u6587\u4EF6\u8DEF\u5F84`};break}}return{valid:!0,status:"pass",message:""}}function y(t,u){if(u.type!=="number")return{valid:!0,status:"pass",message:""};const r=Number(t);return u.minValue!==void 0&&r<u.minValue?{valid:!1,status:"range_error",message:`\u6570\u503C ${r} \u5C0F\u4E8E\u6700\u5C0F\u503C ${u.minValue}`}:u.maxValue!==void 0&&r>u.maxValue?{valid:!1,status:"range_error",message:`\u6570\u503C ${r} \u5927\u4E8E\u6700\u5927\u503C ${u.maxValue}`}:{valid:!0,status:"pass",message:""}}function $(t,u){return C.has(u.type)?u.minLength!==void 0&&t.length<u.minLength?{valid:!1,status:"length_error",message:`\u5B57\u7B26\u4E32\u957F\u5EA6 ${t.length} \u5C0F\u4E8E\u6700\u5C0F\u957F\u5EA6 ${u.minLength}`}:u.maxLength!==void 0&&t.length>u.maxLength?{valid:!1,status:"length_error",message:`\u5B57\u7B26\u4E32\u957F\u5EA6 ${t.length} \u5927\u4E8E\u6700\u5927\u957F\u5EA6 ${u.maxLength}`}:{valid:!0,status:"pass",message:""}:{valid:!0,status:"pass",message:""}}function R(t,u,r){const e={type:"string",required:!0,...r};if(u===void 0||u==="")return e.required!==!1?{key:t,status:"missing",message:e.message||`\u7F3A\u5C11\u5FC5\u9700\u7684\u73AF\u5883\u53D8\u91CF: ${t}`,value:u,rule:e}:{key:t,status:"pass",message:"",value:e.default??u,rule:e};const s=D(u,e);if(!s.valid)return{key:t,status:s.status,message:e.message||s.message,value:u,rule:e};const i=y(u,e);if(!i.valid)return{key:t,status:i.status,message:e.message||i.message,value:u,rule:e};const n=$(u,e);if(!n.valid)return{key:t,status:n.status,message:e.message||n.message,value:u,rule:e};if(e.pattern&&!e.pattern.test(u))return{key:t,status:"custom_error",message:e.message||`\u73AF\u5883\u53D8\u91CF ${t} \u4E0D\u5339\u914D\u6B63\u5219: ${e.pattern.source}`,value:u,rule:e};if(e.validator){const a=e.validator(u);if(a!==!0){const l=typeof a=="string"?a:"";return{key:t,status:"custom_error",message:e.message||l||`\u73AF\u5883\u53D8\u91CF ${t} \u81EA\u5B9A\u4E49\u6821\u9A8C\u5931\u8D25`,value:u,rule:e}}}return{key:t,status:"pass",message:"",value:u,rule:e}}function w(t,u){const r=[];for(const[e,s]of Object.entries(u)){const i=t[e];r.push(R(e,i,s))}return r}function _(t){const u=new Map,r=[];for(const[s,i]of Object.entries(t)){const n={type:"string",required:!0,...i};if(n.group){const a=u.get(n.group)||[];a.push({key:s,rule:n}),u.set(n.group,a)}else r.push({key:s,rule:n})}const e=[];e.push("# \u73AF\u5883\u53D8\u91CF\u6A21\u677F\u6587\u4EF6"),e.push(`# \u751F\u6210\u65F6\u95F4: ${new Date().toISOString()}`),e.push("# \u7531 @meng-xi/vite-plugin envGuard \u81EA\u52A8\u751F\u6210"),e.push(""),r.length>0&&h(e,"\u901A\u7528\u914D\u7F6E",r);for(const[s,i]of u)h(e,s,i);return e.join(`
`)}function h(t,u,r){t.push("# =============================="),t.push(`# ${u}`),t.push("# =============================="),t.push("");for(const{key:e,rule:s}of r){s.description&&t.push(`# ${s.description}`);const i=[];i.push(`\u7C7B\u578B: ${s.type||"string"}`),i.push(s.required!==!1?"\u5FC5\u9700":"\u53EF\u9009"),s.enumValues&&s.enumValues.length>0&&i.push(`\u679A\u4E3E\u503C: ${s.enumValues.join(" | ")}`),s.minValue!==void 0&&i.push(`\u6700\u5C0F\u503C: ${s.minValue}`),s.maxValue!==void 0&&i.push(`\u6700\u5927\u503C: ${s.maxValue}`),s.minLength!==void 0&&i.push(`\u6700\u5C0F\u957F\u5EA6: ${s.minLength}`),s.maxLength!==void 0&&i.push(`\u6700\u5927\u957F\u5EA6: ${s.maxLength}`),s.sensitive&&i.push("\u26A0\uFE0F \u654F\u611F\u4FE1\u606F"),t.push(`# [${i.join(" | ")}]`),s.default!==void 0?t.push(`${e}=${s.sensitive?"********":s.default}`):t.push(`${e}=`),t.push("")}}function k(t,u,r,e){const s=[];for(const[o,d]of Object.entries(t))d.required!==!1&&s.push({key:o,rule:{type:"string",required:!0,...d}});if(s.length===0)return"";const i=e.filter(o=>o.status!=="pass"),n=s.map(({key:o,rule:d})=>({key:o,type:d.type||"string",description:d.description||""})),a=JSON.stringify(n,null,2),l=i.map(o=>o.key),f=JSON.stringify(l),c=B(r);return`<script>
${`
(function() {
  'use strict';
  var GUARD_NAME = ${JSON.stringify(u)};
  var GUARD_DATA = ${a};
  var FAILED_KEYS = ${f};
  var MODE = ${JSON.stringify(r)};

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
<\/script>`}function B(t){switch(t){case"console":return`
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
    document.addEventListener('DOMContentLoaded', function() { document.body.appendChild(overlay); });`;default:return""}}class b extends F{validationResults=[];guardResult=null;getDefaultOptions(){return{required:{},failAction:"error",generateTemplate:!0,templateOutput:".env.template",runtimeGuard:!1,runtimeGlobalName:"__ENV_GUARD__",runtimeGuardMode:"console",envFiles:[".env",".env.local",".env.production",".env.development"],autoLoadEnv:!0,reportOutput:!1,validateBeforeBuild:!0,showSummary:!0}}validateOptions(){this.validator.field("failAction").enum(["error","warn","ignore"]).field("generateTemplate").boolean().field("runtimeGuard").boolean().field("runtimeGuardMode").enum(["console","throw","overlay"]).field("autoLoadEnv").boolean().field("reportOutput").custom(u=>u===!1||typeof u=="string","reportOutput \u5FC5\u987B\u4E3A false \u6216\u5B57\u7B26\u4E32\u8DEF\u5F84").field("validateBeforeBuild").boolean().field("showSummary").boolean().validate()}getPluginName(){return"env-guard"}addPluginHooks(u){this.options.validateBeforeBuild&&(u.configResolved=r=>{this.viteConfig=r,this.runValidation()}),this.options.runtimeGuard&&(u.transformIndexHtml={order:"post",handler:r=>this.safeExecuteSync(()=>this.injectRuntimeGuard(r),"\u6CE8\u5165\u8FD0\u884C\u65F6\u5B88\u536B")||r})}runValidation(){this.options.autoLoadEnv&&this.loadEnvFiles(),this.validationResults=w(process.env,this.options.required),this.guardResult=this.buildResult(),this.options.generateTemplate&&this.writeEnvTemplate(),this.options.reportOutput&&this.writeReport(),this.options.showSummary&&this.logSummary(),this.handleResults()}loadEnvFiles(){if(!this.viteConfig)return;const u=this.viteConfig.root||process.cwd();for(const r of this.options.envFiles){const e=m.resolve(u,r);if(p.existsSync(e))try{this.parseAndLoadEnvFile(e)}catch{this.logger.warn(`\u52A0\u8F7D .env \u6587\u4EF6\u5931\u8D25: ${e}`)}}}parseAndLoadEnvFile(u){const r=p.readFileSync(u,"utf-8").split(`
`);for(const e of r){const s=e.trim();if(!s||s.startsWith("#"))continue;const i=s.indexOf("=");if(i===-1)continue;const n=s.slice(0,i).trim();let a=s.slice(i+1).trim();(a.startsWith('"')&&a.endsWith('"')||a.startsWith("'")&&a.endsWith("'"))&&(a=a.slice(1,-1)),n.startsWith("VITE_")&&process.env[n]===void 0&&(process.env[n]=a)}}buildResult(){const u=this.validationResults.length,r=this.validationResults.filter(i=>i.status==="pass").length,e=this.validationResults.filter(i=>i.status==="missing").length,s=this.validationResults.filter(i=>i.status!=="pass"&&i.status!=="missing").length;return{timestamp:A(new Date,"{YYYY}-{MM}-{DD}T{HH}:{mm}:{ss}"),total:u,passed:r,missing:e,invalid:s,results:this.validationResults,allPassed:e===0&&s===0}}handleResults(){if(!this.guardResult||this.guardResult.allPassed)return;const u=this.validationResults.filter(i=>i.status==="missing").map(i=>i.key),r=this.validationResults.filter(i=>i.status!=="pass"&&i.status!=="missing"),e=[];u.length>0&&e.push(`\u7F3A\u5C11\u5FC5\u9700\u7684\u73AF\u5883\u53D8\u91CF: ${u.join(", ")}`);for(const i of r)e.push(`${i.key}: ${i.message}`);const s=e.join(`
  `);switch(this.options.failAction){case"error":throw new Error(s);case"warn":this.logger.warn(s);break}}writeEnvTemplate(){const u=this.viteConfig?.root||process.cwd(),r=m.resolve(u,this.options.templateOutput),e=_(this.options.required);this.safeExecuteSync(()=>{g(r,e),this.logger.info(`\u73AF\u5883\u53D8\u91CF\u6A21\u677F\u5DF2\u751F\u6210: ${this.options.templateOutput}`)},"\u751F\u6210 .env \u6A21\u677F")}writeReport(){if(!this.guardResult||!this.options.reportOutput)return;const u=this.viteConfig?.build?.outDir||"dist",r=m.resolve(u,this.options.reportOutput);this.safeExecuteSync(()=>{const e=JSON.stringify(this.guardResult,(s,i)=>i instanceof RegExp?i.toString():typeof i=="function"?"[Function]":i,2);g(r,e),this.logger.info(`\u6821\u9A8C\u62A5\u544A\u5DF2\u751F\u6210: ${this.options.reportOutput}`)},"\u751F\u6210\u6821\u9A8C\u62A5\u544A")}logSummary(){if(!this.guardResult)return;const{total:u,passed:r,missing:e,invalid:s,allPassed:i}=this.guardResult;if(i){this.logger.success(`\u73AF\u5883\u53D8\u91CF\u6821\u9A8C\u901A\u8FC7: ${u} \u4E2A\u53D8\u91CF\u5168\u90E8\u5408\u6CD5`);return}this.logger.info(`\u73AF\u5883\u53D8\u91CF\u6821\u9A8C\u7ED3\u679C: \u603B\u8BA1 ${u} | \u901A\u8FC7 ${r} | \u7F3A\u5931 ${e} | \u5931\u8D25 ${s}`);const n=this.validationResults.filter(a=>a.status!=="pass");for(const a of n){const l=a.status==="missing"?"\u7F3A\u5931":"\u5931\u8D25";this.logger.warn(`  [${l}] ${a.key}: ${a.message}`)}}injectRuntimeGuard(u){const r=k(this.options.required,this.options.runtimeGlobalName,this.options.runtimeGuardMode,this.validationResults);if(!r)return u;const e=E(u,"</head>",r);return e.injected?e.html:(this.logger.warn("\u672A\u627E\u5230 </head> \u6807\u7B7E\uFF0C\u8FD0\u884C\u65F6\u5B88\u536B\u4EE3\u7801\u672A\u80FD\u6CE8\u5165"),u)}getResult(){return this.guardResult}getValidationResults(){return[...this.validationResults]}}const x=v(b);export{x as envGuard};
