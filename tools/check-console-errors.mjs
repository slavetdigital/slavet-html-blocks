#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';
let bad=0;function walk(d){for(const e of fs.readdirSync(d)){const p=path.join(d,e);
if(fs.statSync(p).isDirectory())walk(p);else if(p.endsWith('.js')){const t=fs.readFileSync(p,'utf8');if(t.match(/console\.error|TODO:/))bad++;}}}
if(fs.existsSync('src'))walk('src');if(bad){console.log('console-check: issues',bad);process.exitCode=1;}else console.log('console-check: ok');