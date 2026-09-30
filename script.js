/* ---------- ข้อมูล ---------- */
const P=[
 {id:1,n:"ศูนย์บริการนักท่องเที่ยว",t:"บริการ",e:"🏠",x:14,y:82,el:400,d:"จุดเริ่มต้น ลงทะเบียน เช่าจักรยาน ซ่อมบำรุง ห้องน้ำ และร้านอาหาร",a:["ลงทะเบียน","เช่าจักรยาน","ซ่อมจักรยาน"]},
 {id:2,n:"ลานกางเต็นท์ป่าสน",t:"พักแรม",e:"⛺",x:30,y:58,el:620,d:"ลานกางเต็นท์ร่มรื่น มีห้องน้ำและจุดล็อกจักรยาน",a:["กางเต็นท์","ก่อกองไฟ","ดูดาว"]},
 {id:3,n:"ลำธารใส",t:"ลำธาร",e:"🏞️",x:22,y:32,el:700,d:"ลำธารน้ำใสไหลผ่านป่า จุดพักเติมน้ำและล้างจักรยาน",a:["พักผ่อน","ถ่ายภาพ"]},
 {id:4,n:"น้ำตกดอยหลวง",t:"น้ำตก",e:"💦",x:50,y:24,el:850,d:"น้ำตกหลายชั้นกลางป่า ทางปั่นผ่านป่าร่มรื่น",a:["ชมน้ำตก","ถ่ายภาพ","ปิกนิก"]},
 {id:5,n:"ถ้ำหินงาม",t:"ถ้ำ",e:"🕳️",x:58,y:58,el:780,d:"ถ้ำหินงอกหินย้อย ต้องจอดจักรยานแล้วเดินเข้าชม (ควรพกไฟฉาย)",a:["สำรวจถ้ำ","ศึกษาธรรมชาติ"]},
 {id:6,n:"จุดชมวิวผาเงื้อม",t:"จุดชมวิว",e:"🌄",x:80,y:42,el:1100,d:"ชมทะเลหมอกและพระอาทิตย์ขึ้น ทางขึ้นค่อนข้างชัน",a:["ชมวิว","ทะเลหมอก","ถ่ายภาพ"]},
 {id:7,n:"ยอดดอยหลวง",t:"ยอดดอย",e:"⛰️",x:86,y:14,el:1450,d:"จุดสูงสุดของอุทยาน สำหรับนักปั่นที่มีประสบการณ์",a:["พิชิตยอดดอย","ชมวิว 360°"]}
];
const E=[[1,2,2.5],[1,5,4.8],[2,3,3.0],[2,5,3.2],[2,4,5.0],[3,4,2.4],[4,7,5.5],[4,6,4.0],[5,6,3.6],[6,7,2.8]];
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
const adj={};P.forEach(p=>adj[p.id]=[]);E.forEach(([a,b,k])=>{adj[a].push([b,k]);adj[b].push([a,k])});
const SPEED=10,STOP_MIN=5; // กม./ชม. เฉลี่ยบนเส้นทางออฟโรด, นาทีต่อจุดแวะ
const km=(a,b)=>adj[a].find(x=>x[0]===b)[1];
const $=s=>document.querySelector(s);

/* ---------- ค้นหาเส้นทาง ---------- */
function allPaths(s,t){const out=[];(function dfs(u,path){if(u===t){out.push(path.slice());return}
  for(const[v]of adj[u])if(!path.includes(v)){path.push(v);dfs(v,path);path.pop()}})(s,[s]);return out}
const dist=p=>p.slice(1).reduce((s,v,i)=>s+km(p[i],v),0);
function findRoute(s,t,mode){
  const ps=allPaths(s,t);
  const key={short:p=>[dist(p)],fewest:p=>[p.length,dist(p)],nature:p=>[-p.length,dist(p)]}[mode];
  return ps.sort((a,b)=>{const x=key(a),y=key(b);return x[0]-y[0]||(x[1]||0)-(y[1]||0)})[0];
}
function climb(p){let up=0;p.slice(1).forEach((v,i)=>{const d=byId[v].el-byId[p[i]].el;if(d>0)up+=d});return up}

/* ---------- แผนที่ SVG ---------- */
function drawMap(box,{path=[],from,to,onClick}={}){
  let s=`<svg viewBox="0 0 100 100" role="img" aria-label="แผนที่เส้นทางปั่นจักรยาน">
  <rect width="100" height="100" fill="#e0f2fe"/>
  <path d="M0 70 Q25 55 45 68 T100 60 V100 H0Z" fill="#bae6fd" opacity=".5"/>
  <path d="M60 0 Q75 20 100 25 V0Z" fill="#a7f3d0" opacity=".6"/>`;
  E.forEach(([a,b,k])=>{const A=byId[a],B=byId[b];
    s+=`<line class="ed" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/><text class="ekm" x="${(A.x+B.x)/2}" y="${(A.y+B.y)/2-1}">${k}</text>`});
  if(path.length>1)s+=`<polyline class="rt" points="${path.map(i=>byId[i].x+','+byId[i].y).join(' ')}"/>`;
  P.forEach(p=>{const c=(p.id===from?' s':'')+(p.id===to?' e':'');
    s+=`<g class="n${c}" data-id="${p.id}"><circle cx="${p.x}" cy="${p.y}" r="4"/><text x="${p.x}" y="${p.y+1.4}" font-size="4" text-anchor="middle">${p.e}</text><text class="l" x="${p.x}" y="${p.y+8}">${p.n}</text></g>`});
  box.innerHTML=s+'</svg>';
  box.querySelectorAll('.n').forEach(g=>g.onclick=()=>onClick&&onClick(+g.dataset.id));
}

/* ---------- หน้าวางแผนทริป ---------- */
const TIPS={short:"<b>เส้นทางสั้นที่สุด:</b> เลือกเส้นทางที่ระยะทางรวมน้อยที่สุด ประหยัดแรงและเวลา",
 fewest:"<b>แวะพักน้อยที่สุด:</b> ผ่านจุดระหว่างทางน้อยที่สุด เหมาะกับการปั่นต่อเนื่อง",
 nature:"<b>ปั่นชมธรรมชาติ:</b> ผ่านจุดเช็คอินให้มากที่สุดเพื่อสำรวจรายทาง"};
const opts=P.map(p=>`<option value="${p.id}">${p.e} ${p.n}</option>`).join('');
$('#from').innerHTML=opts;$('#to').innerHTML=opts;$('#to').value=4;
const mode=()=>document.querySelector('[name=mode]:checked').value;
function plan(){
  const s=+$('#from').value,t=+$('#to').value;
  if(s===t){drawMap($('#rmap'),{from:s,to:t,onClick:setTo});$('#res').innerHTML='<div class="note">กรุณาเลือกจุดเริ่มต้นและปลายทางให้ต่างกัน</div>';return}
  const p=findRoute(s,t,mode()),d=dist(p),stops=p.length-2;
  const min=Math.round(d/SPEED*60+stops*STOP_MIN);
  drawMap($('#rmap'),{path:p,from:s,to:t,onClick:setTo});
  $('#tip').innerHTML=TIPS[mode()];
  $('#res').innerHTML=`<div class="sum"><div><b>${d.toFixed(1)} กม.</b>ระยะทางรวม</div><div><b>${Math.floor(min/60)} ชม. ${min%60} น.</b>เวลาโดยประมาณ</div><div><b>${stops}</b>จุดแวะพัก</div><div><b>${climb(p)} ม.</b>ความสูงสะสมขึ้น</div></div>
  <h3>ลำดับจุดแวะพักและการเดินทาง</h3><ol class="steps">${p.map((id,i)=>`<li><div><b>${byId[id].e} ${byId[id].n}</b><div class="leg">${i?`ปั่นจาก ${byId[p[i-1]].n} · ${km(p[i-1],id)} กม.`:'จุดเริ่มต้น'} · สูง ${byId[id].el} ม.</div></div></li>`).join('')}</ol>
  <div class="note">🚲 คำนวณจากความเร็วเฉลี่ย ${SPEED} กม./ชม. + ${STOP_MIN} นาทีต่อจุดแวะ · ต้องเริ่มปั่นก่อน 15:00 น.</div>`;
}
function setTo(id){$('#to').value=id;plan()}
$('#go').onclick=plan;
document.querySelectorAll('[name=mode]').forEach(r=>r.onchange=plan);
$('#from').onchange=$('#to').onchange=plan;

/* ---------- หน้าแผนที่ ---------- */
function showInfo(id){const p=byId[id];
  drawMap($('#fmap'),{from:id,onClick:showInfo});
  $('#info').innerHTML=`<h3>${p.e} ${p.n}</h3><p class="leg">${p.t} · ความสูง ${p.el} ม.</p><p>${p.d}</p><p>เส้นทางเชื่อมต่อ: ${adj[id].map(([v,k])=>byId[v].n+' ('+k+' กม.)').join(', ')}</p><button class="btn" onclick="goPlan(${id})">ปั่นไปที่นี่</button>`}
function goPlan(id){$('#to').value=id;location.hash='#route'}

/* ---------- หน้าสถานที่ ---------- */
let cat='ทั้งหมด';
const cats=['ทั้งหมด',...new Set(P.map(p=>p.t))];
$('#chips').innerHTML=cats.map(c=>`<button class="chip${c===cat?' on':''}">${c}</button>`).join('');
$('#chips').onclick=e=>{if(e.target.classList.contains('chip')){cat=e.target.textContent;document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c.textContent===cat));list()}};
$('#q').oninput=list;
function list(){const q=$('#q').value.trim();
  const r=P.filter(p=>(cat==='ทั้งหมด'||p.t===cat)&&(!q||(p.n+p.d+p.a.join(' ')).includes(q)));
  $('#plist').innerHTML=r.map(p=>`<div class="card click" onclick="goPlan(${p.id})"><div class="em">${p.e}</div><h3>${p.n}</h3><p>${p.d}</p><p class="leg">${p.a.join(' · ')}</p></div>`).join('')||'<p class="sub">ไม่พบสถานที่ที่ค้นหา</p>'}

/* ---------- หน้าแรก ---------- */
$('#hl').innerHTML=P.slice(2,7).map(p=>`<div class="card click" onclick="goPlan(${p.id})"><div class="em">${p.e}</div><h3>${p.n}</h3><p>${p.d}</p></div>`).join('');

/* ---------- Router ---------- */
function route(){
  const h=(location.hash||'#home').slice(1);const id=['home','route','map','places'].includes(h)?h:'home';
  document.querySelectorAll('.page').forEach(s=>s.classList.toggle('on',s.id===id));
  document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id));
  if(id==='route')plan();if(id==='map')showInfo(4);if(id==='places')list();
  scrollTo(0,0);
}
addEventListener('hashchange',route);route();
