#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';
const issues=[];function walk(d){for(const e of fs.readdirSync(d)){const p=path.join(d,e);
if(fs.statSync(p).isDirectory())walk(p);else if(p.endsWith('render.php')||p.endsWith('edit.js')){
  const s=fs.readFileSync(p,'utf8');if(s.includes('<section')&&!s.includes('aria-label')){
    issues.push({file:p,rule:'section-aria-label',msg:'Consider aria-label for repeated regions.'});}}}}
if(fs.existsSync('src'))walk('src');if(issues.length){console.log(JSON.stringify({issues},null,2));process.exitCode=1;}else console.log('a11y: ok');