import fs from 'node:fs';
import crypto from 'node:crypto';
const checks=JSON.parse(fs.readFileSync('scripts/deployed-baseline.json','utf8'));
const failures=checks.filter(row=>crypto.createHash('sha256').update(fs.readFileSync('public/'+row.file)).digest('hex')!==row.sha256);
if(failures.length){console.error('Pages differ from the 19 October 2026 live baseline:',failures);process.exit(1);}
console.log(`PASS: all ${checks.length} route destinations match the verified live website exactly.`);
