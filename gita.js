/* SANSKRITAM — Bhagavad Gita 700 Shloka Engine */
const GITA_DATA_URL="https://cdn.jsdelivr.net/gh/ChiragMirani/gita-quotes@main/docs/data.json";
const GITA_HINDI_URL="https://raw.githubusercontent.com/kashishkhullar/gita_json/master/gita.json";

const GITA_CHAPTERS=[
[1,"अर्जुनविषादयोग",47],[2,"सांख्ययोग",72],[3,"कर्मयोग",43],
[4,"ज्ञानकर्मसंन्यासयोग",42],[5,"कर्मसंन्यासयोग",29],[6,"आत्मसंयमयोग",47],
[7,"ज्ञानविज्ञानयोग",30],[8,"अक्षरब्रह्मयोग",28],[9,"राजविद्याराजगुह्ययोग",34],
[10,"विभूतियोग",42],[11,"विश्वरूपदर्शनयोग",55],[12,"भक्तियोग",20],
[13,"क्षेत्रक्षेत्रज्ञविभागयोग",34],[14,"गुणत्रयविभागयोग",27],
[15,"पुरुषोत्तमयोग",20],[16,"दैवासुरसम्पद्विभागयोग",24],
[17,"श्रद्धात्रयविभागयोग",28],[18,"मोक्षसंन्यासयोग",78]
];

let gita={}; let allVerses=[]; let hindiData=null;

function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}

function normalizeRow(r){
 const c=Number(r?.chapter??r?.chapter_number??r?.chapterNumber);
 const v=Number(r?.verse??r?.verse_number??r?.verseNumber);
 const s=r?.sanskrit??r?.text??r?.devanagari??r?.slok??r?.verse_text??"";
 const e=r?.english??r?.translation??r?.meaning??r?.translation_en??"";
 return c&&v&&s?{chapter:c,verse:v,key:`${c}-${v}`,sanskrit:String(s).trim(),english:String(e||"").trim()}:null;
}

function normalizeData(data){
 let rows=[];
 if(Array.isArray(data)) rows=data;
 else if(Array.isArray(data?.verses)) rows=data.verses;
 else if(Array.isArray(data?.data)) rows=data.data;
 else if(data&&typeof data==="object"){
   if(Array.isArray(data.chapters)) data.chapters.forEach(x=>{if(Array.isArray(x.verses))rows.push(...x.verses)});
   if(!rows.length) Object.entries(data).forEach(([k,x])=>{
     if(/^\d+-\d+$/.test(k)&&x&&typeof x==="object")
       rows.push({...x,chapter:x.chapter??k.split("-")[0],verse:x.verse??k.split("-")[1]});
   });
 }
 return rows.map(normalizeRow).filter(Boolean).sort((a,b)=>a.chapter-b.chapter||a.verse-b.verse);
}

function findHindi(c,v){
 const d=hindiData;if(!d)return "";
 const k=`${c}-${v}`;let x=d[k]||d.verses?.[c]?.[v]||d.chapters?.verses?.[c]?.[v];
 return x?(x.meaning||x.text||x.verse_meaning_hindi||""):"";
}

function buildObject(){
 gita={};
 allVerses.forEach(x=>gita[x.key]={...x,hindi:findHindi(x.chapter,x.verse),gujarati:""});
 window.gita=gita;
}

function injectStyles(){
 if(document.getElementById("sanskritam-gita-style"))return;
 const s=document.createElement("style");s.id="sanskritam-gita-style";
 s.textContent=`#gita700List{margin-top:14px}.gita700-status,.gita700-reader,.gita700-chapter{background:#fffaf0;border:1px solid #e7d9bc;border-radius:18px;padding:16px;margin:14px 0;box-shadow:0 5px 18px #00000012}.gita700-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.gita700-btn{border:0;border-radius:12px;padding:10px 5px;background:#b87909;color:#fff;font-weight:bold}.gita700-sanskrit{font-size:22px;line-height:1.75;white-space:pre-line}.gita700-meaning{font:16px Arial;line-height:1.7}@media(max-width:360px){.gita700-grid{grid-template-columns:repeat(2,1fr)}}`;
 document.head.appendChild(s);
}

function ensureList(){
 const sec=document.getElementById("gita");if(!sec)return null;
 let box=document.getElementById("gita700List");if(box)return box;
 box=document.createElement("div");box.id="gita700List";
 const h=sec.querySelector("h2");h?h.insertAdjacentElement("afterend",box):sec.appendChild(box);
 return box;
}

function renderGita(){
 const box=ensureList();if(!box)return;
 if(!allVerses.length){box.innerHTML=`<div class="gita700-status">📖 શ્લોકો લોડ થઈ રહ્યા છે...</div>`;return}
 let html=`<div class="gita700-status">📚 ભગવદ્ ગીતા — 18 અધ્યાય • ${Math.min(allVerses.length,700)} શ્લોક</div>`;
 GITA_CHAPTERS.forEach(([c,name,count])=>{
   html+=`<div class="gita700-chapter"><h3>અધ્યાય ${c} — ${esc(name)}</h3><div class="gita700-grid">`;
   for(let v=1;v<=count;v++){const k=`${c}-${v}`;if(gita[k])html+=`<button class="gita700-btn" onclick="openGitaVerse('${k}')">શ્લોક ${c}.${v}</button>`}
   html+=`</div></div>`;
 });
 box.innerHTML=html;
}

async function translateGujarati(key){
 const x=gita[key],target=document.getElementById(`gu-${key}`);if(!x||!target)return;
 if(!x.english){target.textContent="ગુજરાતી અર્થ ઉપલબ્ધ નથી.";return}
 try{
   const u="https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=gu&dt=t&q="+encodeURIComponent(x.english);
   const r=await fetch(u);if(!r.ok)throw 0;const d=await r.json();
   const t=Array.isArray(d?.[0])?d[0].map(a=>a?.[0]||"").join(""):"";
   target.textContent=t||"ગુજરાતી અર્થ ઉપલબ્ધ નથી.";
 }catch(e){target.textContent="ગુજરાતી અર્થ મેળવવા માટે Internet જરૂરી છે."}
}

function openGitaVerse(key){
 const x=gita[key];if(!x){alert("આ શ્લોક હાલમાં ઉપલબ્ધ નથી.");return}
 document.getElementById("gitaVerseReader")?.remove();
 const r=document.createElement("div");r.id="gitaVerseReader";r.className="gita700-reader";
 r.innerHTML=`<div class="back" onclick="this.parentElement.remove()">← શ્લોક સૂચિ</div>
 <h2>📖 Bhagavad Gita ${key}</h2>
 <div class="gita700-sanskrit">${esc(x.sanskrit)}</div><hr>
 ${x.english?`<h3>🇬🇧 English Meaning</h3><p class="gita700-meaning">${esc(x.english)}</p>`:""}
 ${x.hindi?`<h3>🇮🇳 हिन्दी अर्थ</h3><p class="gita700-meaning">${esc(x.hindi)}</p>`:""}
 <h3>🇮🇳 ગુજરાતી અર્થ</h3><p id="gu-${key}" class="gita700-meaning">ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...</p>
 <button class="primary" onclick="saveGitaFavorite('${key}')">❤️ Favorite</button>`;
 const sec=document.getElementById("gita"),box=document.getElementById("gita700List");
 if(sec)box?sec.insertBefore(r,box):sec.appendChild(r);
 translateGujarati(key);
}

function saveGitaFavorite(key){
 const x=gita[key];if(!x)return;
 let f=JSON.parse(localStorage.getItem("sanskritamFavorites")||"[]");
 const t=`${key} — ${x.sanskrit}`;if(!f.includes(t))f.push(t);
 localStorage.setItem("sanskritamFavorites",JSON.stringify(f));alert("❤️ Favorite Saved");
}

async function loadGita(){
 injectStyles();renderGita();
 try{
   const res=await fetch(GITA_DATA_URL,{cache:"force-cache"});if(!res.ok)throw 0;
   allVerses=normalizeData(await res.json());
   /* Some editions contain 701 records; keep the standard 700 for this app. */
   if(allVerses.length>700)allVerses=allVerses.filter(x=>!(x.chapter===13&&x.verse===1)).slice(0,700);
   try{const hr=await fetch(GITA_HINDI_URL,{cache:"force-cache"});if(hr.ok)hindiData=await hr.json()}catch(e){}
   buildObject();renderGita();
   console.log("SANSKRITAM: "+allVerses.length+" Gita verses loaded.");
 }catch(e){
   const b=ensureList();if(b)b.innerHTML=`<div class="gita700-status">⚠️ શ્લોકો લોડ થઈ શક્યા નથી. Internet ચાલુ કરીને page ફરી ખોલો.</div>`;
 }
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",loadGita);else loadGita();