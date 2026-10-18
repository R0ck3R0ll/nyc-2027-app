global.window = undefined;
const fs=require('fs');
const C=require('../app/js/core.js');
const ctx={};
new Function('window', fs.readFileSync('app/data/fichas.js','utf8')+fs.readFileSync('app/js/sugerencias.js','utf8'))(ctx);
C.setFichas(ctx.FICHAS);
const S=ctx.SUGERENCIAS;
const fixed=C.TRIP.fijos.map(b=>Object.assign({status:'plan'},b));
function show(g){console.log(`\n== D${g.day} ${g.tema.titulo} [${g.nivel}] score=${g.score}`);
 g.stops.forEach(s=>console.log(' ',C.fmt(s.start),'-',C.fmt(s.end),s.n!=null?('#'+s.n+' '+C.ficha(s.n).nombre):s.titulo,'  tr',s.tr&&s.tr.min,s.sustituye?('(sust '+s.sustituye+')'):''));
 g.dropped.forEach(d=>console.log('  X #'+d.n,C.ficha(d.n).nombre,'-',d.why));}
let errors=0;
for(const day of [1,2,3,4,5,6,7]) for(const lv of ['intenso','equilibrado','relajado']){
  const gs=C.suggestionsFor(day,lv,fixed,'all',S);
  gs.forEach(g=>{ if(process.argv[2]==='v') show(g); if(g.dropped.length) {errors++; if(process.argv[2]!=='v') show(g);} });
}
console.log('\nsugerencias con paradas descartadas:',errors);
// with some visited
const blocks=fixed.concat([{id:'x1',day:2,n:25,start:'18:00',who:'all',status:'done'},{id:'x2',day:2,n:1,start:'16:00',who:'A',status:'done'}]);
show(C.generate(S[0],'equilibrado',4,blocks,'all'));
show(C.generate(S[0],'equilibrado',4,blocks,'B'));
console.log(C.suggestStart(blocks,2,'all',19));
const an=C.analyzeDay(blocks.concat([{id:'y',day:2,n:17,start:'17:00',who:'all',status:'plan'}]),2,'all');
console.log(JSON.stringify(an,null,0).slice(0,1500));
