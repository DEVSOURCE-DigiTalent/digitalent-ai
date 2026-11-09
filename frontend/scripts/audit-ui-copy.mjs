import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
const root='src';
const catalog=['messages','owner-messages','assessment-messages'].map(name=>fs.readFileSync(`src/lib/i18n/${name}.ts`,'utf8')).join('\n');
const keys=new Set([...catalog.matchAll(/^([^\n|]+)\|/gm)].map(match=>match[1].toLocaleLowerCase('vi')));
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?(['__tests__','test','i18n'].includes(f.name)?[]:files(path.join(dir,f.name))):f.name.endsWith('.tsx')&&!f.name.includes('.test.')?[path.join(dir,f.name)]:[]);}
const result=new Set();
const scope=process.argv[2]??'organization';
for(const file of files(root).filter(f=>f.includes(`features\\${scope}\\`))){
 const source=fs.readFileSync(file,'utf8');const ast=ts.createSourceFile(file,source,99,true,ts.ScriptKind.TSX);
 function visit(n){
 if(ts.isCallExpression(n)&&n.expression.getText(ast)==='translateUi')return;
 if(ts.isJsxText(n)||ts.isStringLiteral(n)){
 const text=n.text.trim().replace(/\s+/g,' ');
 const display=ts.isJsxText(n)||ts.isJsxAttribute(n.parent)||ts.isJsxExpression(n.parent)||(ts.isPropertyAssignment(n.parent)&&['label','title','description','message','placeholder'].includes(n.parent.name.getText(ast)));
 if(display&&/[À-ỹ]/.test(text)&&!keys.has(text.toLocaleLowerCase('vi')))result.add(text);
 }
 ts.forEachChild(n,visit);
 }visit(ast);
}
console.log(JSON.stringify([...result].sort(),null,2));
