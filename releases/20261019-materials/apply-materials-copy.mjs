import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const p=JSON.parse(fs.readFileSync('materials-copy.json','utf8'));
const hash=s=>createHash('sha256').update(s).digest('hex');
const file='public/products/index.html';let s=fs.readFileSync(file,'utf8');
assert.equal(hash(s),p.before,'Materials baseline changed');
for(const [before,after] of Object.entries(p.replacements)){assert.equal(s.split(before).length,2);s=s.replace(before,after);}
assert.equal(hash(s),p.after,'Materials output mismatch');fs.writeFileSync(file,s);
console.log('PASS: requested Materials Engineering copy applied; all surrounding Products content unchanged.');
