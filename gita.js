/* =========================================================
   🪷 SANSKRITAM — GITA ENGINE
   Hindi + Gujarati + English
========================================================= */

const GITA_CONFIG = {
  DATA_URL: "https://cdn.jsdelivr.net/gh/ChiragMirani/gita-quotes@main/docs/data.json",
  HINDI_URL: "https://raw.githubusercontent.com/kashishkhullar/gita_json/master/dataset_hindi.json",
  MYMEMORY_URL: "https://api.mymemory.translated.net/get",
  GOOGLE_URL: "https://translate.googleapis.com/translate_a/single",
  CACHE_KEY: "sanskritam_gita_gujarati_v4"
};

const GITA_CHAPTERS = [
  [1,"अर्जुनविषादयोग",47],[2,"सांख्ययोग",72],[3,"कर्मयोग",43],
  [4,"ज्ञानकर्मसंन्यासयोग",42],[5,"कर्मसंन्यासयोग",29],[6,"आत्मसंयमयोग",47],
  [7,"ज्ञानविज्ञानयोग",30],[8,"अक्षरब्रह्मयोग",28],[9,"राजविद्याराजगुह्ययोग",34],
  [10,"विभूतियोग",42],[11,"विश्वरूपदर्शनयोग",55],[12,"भक्तियोग",20],
  [13,"क्षेत्रक्षेत्रज्ञविभागयोग",34],[14,"गुणत्रयविभागयोग",27],
  [15,"पुरुषोत्तमयोग",20],[16,"दैवासुरसम्पद्विभागयोग",24],
  [17,"श्रद्धात्रयविभागयोग",28],[18,"मोक्षसंन्यासयोग",78]
];

let gita = {};
let allVerses = [];
let hindiData = null;
let currentVerse = null;

const gq = id => document.getElementById(id);

function gEsc(v){
  return String(v ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function gClean(v){
  return String(v ?? "").replace(/\r/g,"").replace(/\n{3,}/g,"\n\n").trim();
}

function gValue(obj, keys){
  if(!obj || typeof obj !== "object") return "";
  for(const k of keys){
    if(obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return "";
}

function normalizeVerse(row){
  if(!row || typeof row !== "object") return null;

  const chapter = Number(gValue(row,[
    "chapter","chapter_number","chapterNumber","chapter_id"
  ]));

  const verse = Number(gValue(row,[
    "verse","verse_number","verseNumber","verse_id"
  ]));

  const sanskrit = gClean(gValue(row,[
    "sanskrit","devanagari","slok","shloka",
    "verse_text","text"
  ]));

  const english = gClean(gValue(row,[
    "english","translation","translation_en",
    "meaning","english_meaning"
  ]));

  if(!chapter || !verse || !sanskrit) return null;

  return {
    chapter,
    verse,
    key:`${chapter}-${verse}`,
    sanskrit,
    english,
    hindi:""
  };
}

function normalizeData(data){
  let rows = [];

  if(Array.isArray(data)) rows = data;
  else if(Array.isArray(data?.data)) rows = data.data;
  else if(Array.isArray(data?.verses)) rows = data.verses;
  else if(Array.isArray(data?.chapters)){
    data.chapters.forEach(ch=>{
      const list = ch?.verses;
      if(Array.isArray(list)){
        list.forEach(v=>rows.push({
          ...v,
          chapter:v.chapter ?? ch.chapter ?? ch.chapter_number
        }));
      }else if(list && typeof list === "object"){
        Object.values(list).forEach(v=>rows.push({
          ...v,
          chapter:v.chapter ?? ch.chapter ?? ch.chapter_number
        }));
      }
    });
  }else if(data && typeof data === "object"){
    Object.entries(data).forEach(([key,value])=>{
      if(/^\d+-\d+$/.test(key) && value && typeof value==="object"){
        const [c,v]=key.split("-");
        rows.push({...value,chapter:value.chapter ?? c,verse:value.verse ?? v});
      }
    });
  }

  const map = new Map();
  rows.map(normalizeVerse).filter(Boolean).forEach(v=>{
    if(!map.has(v.key)) map.set(v.key,v);
  });

  return [...map.values()].sort(
    (a,b)=>a.chapter-b.chapter || a.verse-b.verse
  );
}

function findHindi(chapter, verse){
  if(!hindiData) return "";

  const key = `${chapter}-${verse}`;
  let item = null;

  if(hindiData[key]) item = hindiData[key];

  if(!item && Array.isArray(hindiData)){
    item = hindiData.find(row =>
      Number(gValue(row,["chapter","chapter_number","chapterNumber"]))===chapter &&
      Number(gValue(row,["verse","verse_number","verseNumber"]))===verse
    );
  }

  if(!item && hindiData.verses){
    item =
      hindiData.verses?.[chapter]?.[verse] ??
      hindiData.verses?.[String(chapter)]?.[String(verse)];
  }

  if(!item && hindiData.chapters){
    const ch =
      hindiData.chapters?.[chapter] ??
      hindiData.chapters?.[String(chapter)];

    if(ch?.verses){
      item =
        ch.verses?.[verse] ??
        ch.verses?.[String(verse)];

      if(!item && Array.isArray(ch.verses)){
        item = ch.verses.find(row =>
          Number(gValue(row,["verse","verse_number","verseNumber"]))===verse
        );
      }
    }
  }

  if(!item) return "";
  if(typeof item === "string") return gClean(item);

  return gClean(gValue(item,[
    "verse_meaning_hindi",
    "meaning_hindi",
    "hindi_meaning",
    "translation_hindi",
    "translation_hi",
    "hindi",
    "meaning"
  ]));
}

function buildGita(){
  gita = {};
  allVerses.forEach(v=>{
    v.hindi = findHindi(v.chapter,v.verse);
    gita[v.key] = v;
  });
  window.gita = gita;
}

/* ---------- Gujarati cache ---------- */

function getGuCache(){
  try{
    return JSON.parse(localStorage.getItem(GITA_CONFIG.CACHE_KEY)||"{}");
  }catch{
    return {};
  }
}

function saveGuCache(key,text){
  try{
    const c=getGuCache();
    c[key]=text;
    localStorage.setItem(GITA_CONFIG.CACHE_KEY,JSON.stringify(c));
  }catch{}
}

/* MyMemory accepts max 500 bytes per q. */
function splitForTranslation(text){
  const words = String(text).trim().split(/\s+/);
  const chunks=[];
  let current="";

  for(const word of words){
    const next=current ? current+" "+word : word;
    if(new TextEncoder().encode(next).length > 450 && current){
      chunks.push(current);
      current=word;
    }else{
      current=next;
    }
  }
  if(current) chunks.push(current);
  return chunks;
}

async function translateMyMemory(text){
  const chunks=splitForTranslation(text);
  const out=[];

  for(const chunk of chunks){
    const url =
      GITA_CONFIG.MYMEMORY_URL +
      "?q=" + encodeURIComponent(chunk) +
      "&langpair=en|gu";

    const r=await fetch(url,{cache:"no-store"});
    if(!r.ok) throw new Error("MyMemory HTTP "+r.status);

    const data=await r.json();
    const translated =
      data?.responseData?.translatedText ||
      data?.matches?.[0]?.translation ||
      "";

    if(!translated) throw new Error("Empty translation");
    out.push(translated);
  }

  return gClean(out.join(" "));
}

async function translateGoogle(text){
  const url =
    GITA_CONFIG.GOOGLE_URL +
    "?client=gtx&sl=en&tl=gu&dt=t&q=" +
    encodeURIComponent(text);

  const r=await fetch(url,{cache:"no-store"});
  if(!r.ok) throw new Error("Google HTTP "+r.status);

  const data=await r.json();
  const result =
    Array.isArray(data?.[0])
      ? data[0].map(x=>x?.[0]||"").join("")
      : "";

  if(!result.trim()) throw new Error("Empty Google translation");
  return gClean(result);
}

async function translateGujarati(key){
  const verse=gita[key];
  const target=gq(`gu-${key}`);
  if(!verse || !target) return;

  const cached=getGuCache()[key];
  if(cached){
    target.textContent=cached;
    return;
  }

  if(!verse.english){
    target.textContent="ગુજરાતી અર્થ ઉપલબ્ધ નથી.";
    return;
  }

  target.textContent="ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";

  try{
    const translated=await translateMyMemory(verse.english);
    if(!translated) throw new Error("empty");
    saveGuCache(key,translated);
    target.textContent=translated;
  }catch(e1){
    console.warn("MyMemory failed",e1);

    try{
      const translated=await translateGoogle(verse.english);
      saveGuCache(key,translated);
      target.textContent=translated;
    }catch(e2){
      console.warn("Google translation failed",e2);
      target.textContent=
        navigator.onLine
        ? "ગુજરાતી અર્થ મેળવવામાં અત્યારે સમસ્યા છે. થોડા સમય પછી ફરી પ્રયાસ કરો."
        : "📴 Internet વગર આ ગુજરાતી અર્થ ઉપલબ્ધ નથી.";
    }
  }
}

/* ---------- Gita UI ---------- */

function injectGitaCSS(){
  if(gq("sanskritam-gita-extra-css")) return;
  const s=document.createElement("style");
  s.id="sanskritam-gita-extra-css";
  s.textContent=`
    .gita-brand{display:flex;align-items:center;gap:10px;font-size:28px}
    .gita-brand strong{display:block;font-size:21px}
    .gita-brand small{display:block;font:12px Arial;color:#786b5a;margin-top:4px}
    .gita-language-box{display:flex;align-items:center;gap:7px;margin:12px 0}
    .gita-language-box select{border:1px solid #e6d6b7;border-radius:12px;padding:8px;background:#fffaf0}
    .chapter-heading{display:flex;align-items:center;gap:12px;margin-bottom:12px}
    .chapter-number{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#d39a2f,#a96808);color:#fff;font:bold 14px Arial}
    .chapter-heading h3{margin:0}.chapter-heading small{font:12px Arial;color:#786b5a}
    .gita-reader .verse-title{font-size:22px;font-weight:bold}
    .gita-reader .verse-number{color:#a96808;font:13px Arial;margin-top:5px}
    .gita-reader .sanskrit-text{font-size:23px;line-height:1.9;white-space:pre-line;margin:12px 0 20px}
    .gita-reader .gita-back{border:0;background:transparent;padding:0;color:#a96808;font:bold 13px Arial}
    .gita-search-results{margin-top:10px}
    .gita-search-result{padding:9px 0;border-bottom:1px solid #e6d6b7;cursor:pointer}
    @media(max-width:360px){.gita-verse-grid{grid-template-columns:repeat(2,1fr)}.gita-reader .sanskrit-text{font-size:20px}}
  `;
  document.head.appendChild(s);
}

function languageSelector(){
  const current=localStorage.getItem("sanskritam_language")||"gu";
  return `
    <div class="gita-language-box">
      🌐
      <select onchange="localStorage.setItem('sanskritam_language',this.value);renderGita();">
        <option value="gu" ${current==="gu"?"selected":""}>🇮🇳 ગુજરાતી</option>
        <option value="hi" ${current==="hi"?"selected":""}>🇮🇳 हिन्दी</option>
        <option value="en" ${current==="en"?"selected":""}>🇬🇧 English</option>
      </select>
    </div>`;
}

function chapterCard(chapter,name,count){
  let buttons="";
  for(let i=1;i<=count;i++){
    const key=`${chapter}-${i}`;
    if(gita[key]){
      buttons += `
        <button class="gita-verse-btn" onclick="openGitaVerse('${key}')">
          ${chapter}.${i}
        </button>`;
    }
  }

  return `
    <div class="gita700-chapter">
      <div class="chapter-heading">
        <div class="chapter-number">${chapter}</div>
        <div><h3>${gEsc(name)}</h3><small>${count} શ્લોક</small></div>
      </div>
      <div class="gita-verse-grid">${buttons}</div>
    </div>`;
}

function renderGita(){
  injectGitaCSS();
  const box=gq("gita700List");
  if(!box) return;

  if(!allVerses.length){
    box.innerHTML=`<div class="gita-loading-card">📖 શ્લોકો લોડ થઈ રહ્યા છે...</div>`;
    return;
  }

  box.innerHTML=`
    <div class="gita-top-card">
      <div class="gita-brand">
        🕉️
        <div><strong>Bhagavad Gita</strong><small>18 અધ્યાય • ${allVerses.length} શ્લોક</small></div>
      </div>
      ${languageSelector()}
      <div class="gita-search-wrap">
        🔍<input id="gitaSearch" type="search" placeholder="શ્લોક શોધો..." oninput="searchGita()">
      </div>
      <div id="gitaSearchResults" class="gita-search-results"></div>
    </div>
    ${GITA_CHAPTERS.map(x=>chapterCard(x[0],x[1],x[2])).join("")}`;
}

function searchGita(){
  const input=gq("gitaSearch"),out=gq("gitaSearchResults");
  if(!input||!out)return;
  const q=input.value.trim().toLowerCase();
  if(!q){out.innerHTML="";return}

  const results=allVerses.filter(v =>
    v.sanskrit.toLowerCase().includes(q) ||
    v.english.toLowerCase().includes(q) ||
    v.hindi.toLowerCase().includes(q) ||
    v.key.includes(q)
  ).slice(0,20);

  out.innerHTML=results.length
    ? results.map(v=>`
      <div class="gita-search-result" onclick="openGitaVerse('${v.key}')">
        <b>${v.key}</b> — ${gEsc(v.sanskrit.slice(0,80))}
      </div>`).join("")
    : `<div class="empty">કોઈ શ્લોક મળ્યો નથી.</div>`;
}

async function openGitaVerse(key){
  const verse=gita[key];
  if(!verse){return}

  currentVerse=key;
  const old=gq("gitaVerseReader");
  if(old)old.remove();

  const index=allVerses.findIndex(v=>v.key===key);
  const lang=localStorage.getItem("sanskritam_language")||"gu";

  const reader=document.createElement("div");
  reader.id="gitaVerseReader";
  reader.className="gita700-reader gita-reader";

  const meaning =
    lang==="hi" ? verse.hindi :
    lang==="en" ? verse.english :
    "";

  reader.innerHTML=`
    <button class="gita-back" onclick="closeGitaVerse()">← શ્લોકો</button>
    <div class="verse-title">🕉️ Bhagavad Gita</div>
    <div class="verse-number">અધ્યાય ${verse.chapter} • શ્લોક ${verse.verse}</div>
    ${languageSelector()}
    <hr>
    <h3>🕉️ संस्कृत श्लोक</h3>
    <div class="sanskrit-text">${gEsc(verse.sanskrit)}</div>
    <div class="meaning-box">
      <h3>🇬🇧 English Meaning</h3>
      <p>${verse.english?gEsc(verse.english):"English meaning ઉપલબ્ધ નથી."}</p>
    </div>
    <div class="meaning-box">
      <h3>🇮🇳 हिन्दी अर्थ</h3>
      <p id="hi-${key}">${verse.hindi?gEsc(verse.hindi):"हिन्दी अर्थ ઉપલબ્ધ નથી."}</p>
    </div>
    <div class="meaning-box">
      <h3>🇮🇳 ગુજરાતી અર્થ</h3>
      <p id="gu-${key}">ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...</p>
    </div>
    <div class="verse-actions">
      <button onclick="saveGitaFavorite('${key}')">❤️ Favorite</button>
      <button onclick="speakGita('${key}')">🔊 સાંભળો</button>
      <button onclick="copyGita('${key}')">📋 Copy</button>
      <button onclick="shareGita('${key}')">📤 Share</button>
    </div>
    <div class="verse-navigation">
      <button ${index<=0?"disabled":""} onclick="openGitaVerse('${index>0?allVerses[index-1].key:key}')">← પાછો</button>
      <button ${index>=allVerses.length-1?"disabled":""} onclick="openGitaVerse('${index<allVerses.length-1?allVerses[index+1].key:key}')">આગળ →</button>
    </div>`;

  const section=gq("gita"),list=gq("gita700List");
  if(list)section.insertBefore(reader,list); else section.appendChild(reader);

  if(lang==="hi" && verse.hindi){
    const hi=gq(`hi-${key}`);
    if(hi)hi.textContent=verse.hindi;
  }

  await translateGujarati(key);
  window.scrollTo({top:0,behavior:"smooth"});
}

function closeGitaVerse(){
  gq("gitaVerseReader")?.remove();
}

function saveGitaFavorite(key){
  const v=gita[key];
  if(v && typeof addFavorite==="function") addFavorite(`${key} — ${v.sanskrit}`);
}

function copyGita(key){
  const v=gita[key];
  if(!v)return;
  const text=`${key}\n\n${v.sanskrit}\n\n${v.english}`;
  navigator.clipboard?.writeText(text).then(()=>window.toast?.("📋 Text copied"));
}

async function shareGita(key){
  const v=gita[key];
  if(!v)return;
  const text=`🕉️ Bhagavad Gita ${key}\n\n${v.sanskrit}\n\n${v.english}`;
  try{
    if(navigator.share) await navigator.share({title:"SANSKRITAM",text});
    else await navigator.clipboard?.writeText(text);
  }catch{}
}

function speakGita(key){
  const v=gita[key];
  if(!v || !window.speechSynthesis)return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(v.sanskrit);
  u.lang="hi-IN";u.rate=.78;speechSynthesis.speak(u);
}

async function loadGita(){
  const box=gq("gita700List");
  if(box && !allVerses.length)
    box.innerHTML=`<div class="gita-loading-card">📖 ભગવદ્ ગીતા લોડ થઈ રહી છે...</div>`;

  try{
    const r=await fetch(GITA_CONFIG.DATA_URL,{cache:"no-store"});
    if(!r.ok)throw new Error("Gita data HTTP "+r.status);
    allVerses=normalizeData(await r.json());

    if(allVerses.length>700){
      allVerses=allVerses.filter(v=>!(v.chapter===13&&v.verse===1)).slice(0,700);
    }

    try{
      const h=await fetch(GITA_CONFIG.HINDI_URL,{cache:"no-store"});
      if(h.ok)hindiData=await h.json();
    }catch(e){console.warn("Hindi dataset failed",e)}

    buildGita();
    renderGita();
  }catch(e){
    console.error(e);
    if(box)box.innerHTML=`
      <div class="error">
        ⚠️ ભગવદ્ ગીતા લોડ થઈ શકી નથી.<br><br>
        Internet તપાસો અને ફરી પ્રયાસ કરો.<br><br>
        <button class="primary" onclick="loadGita()">🔄 Retry</button>
      </div>`;
  }
}

window.loadGita=loadGita;
window.openGitaVerse=openGitaVerse;
window.closeGitaVerse=closeGitaVerse;
window.saveGitaFavorite=saveGitaFavorite;
window.copyGita=copyGita;
window.shareGita=shareGita;
window.speakGita=speakGita;
window.renderGita=renderGita;
window.searchGita=searchGita;

if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",loadGita);
}else{
  loadGita();
}