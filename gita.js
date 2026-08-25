/*
 SANSKRITAM - Bhagavad Gita 700 Verse Engine

 Sanskrit + English source:
 https://github.com/ChiragMirani/gita-quotes
 Hindi source:
 https://github.com/kashishkhullar/gita_json

 Note:
 The source dataset contains 701 records because it includes BG 13.1
 in an edition where that verse is separately numbered. This app
 intentionally excludes BG 13.1 so the displayed total is 700.
*/

const GITA_EN_URL =
"https://raw.githubusercontent.com/ChiragMirani/gita-quotes/main/docs/data.json";

const GITA_HI_URL =
"https://raw.githubusercontent.com/kashishkhullar/gita_json/master/dataset_hindi.json";

const chapterNames = [
"अर्जुनविषादयोग","सांख्ययोग","कर्मयोग","ज्ञानकर्मसंन्यासयोग",
"कर्मसंन्यासयोग","आत्मसंयमयोग","ज्ञानविज्ञानयोग","अक्षरब्रह्मयोग",
"राजविद्याराजगुह्ययोग","विभूतियोग","विश्वरूपदर्शनयोग","भक्तियोग",
"क्षेत्रक्षेत्रज्ञविभागयोग","गुणत्रयविभागयोग","पुरुषोत्तमयोग",
"दैवासुरसम्पद्विभागयोग","श्रद्धात्रयविभागयोग","मोक्षसंन्यासयोग"
];

let gita = {};
let hindiData = null;
let allVerses = [];
let currentLang = "gu";

const canonicalCounts = [
47,72,43,42,29,47,30,28,34,42,55,20,34,27,20,24,28,78
];

async function loadGita(){

 const status=document.getElementById("loadStatus");

 try{
   const [enRes,hiRes]=await Promise.all([
     fetch(GITA_EN_URL),
     fetch(GITA_HI_URL)
   ]);

   if(!enRes.ok) throw new Error("English dataset failed");

   const en=await enRes.json();

   if(hiRes.ok) hindiData=await hiRes.json();

   const rows=en.verses.filter(v =>
     !(v.chapter===13 && v.verse===1)
   );

   allVerses=rows;

   rows.forEach(v=>{
     const key=`${v.chapter}-${v.verse}`;
     gita[key]={
       chapter:v.chapter,
       verse:v.verse,
       sanskrit:v.sanskrit || "",
       english:(v.english_alt || v.english || "").replace(/^\d+\.\d+\s*/,""),
       hindi:getHindi(v.chapter,v.verse)
     };
   });

   buildChapters();

   status.innerHTML=
     `✅ <b>${rows.length} શ્લોક તૈયાર છે</b><br>
      18 અધ્યાય • Sanskrit • English • हिन्दी<br>
      ગુજરાતી અર્થ શ્લોક ખોલતી વખતે તૈયાર થશે.`;

 }catch(err){
   console.error(err);
   status.innerHTML=
     `❌ શ્લોક data લોડ થઈ શક્યો નથી.<br>
      Internet connection તપાસો અને page ફરી ખોલો.`;
 }
}

function getHindi(ch,vs){

 if(!hindiData || !hindiData.chapters) return "";

 const c=hindiData.chapters[String(ch)];
 if(!c || !c.verses) return "";

 const v=c.verses[String(vs)];
 if(!v) return "";

 return v.meaning || v.verse_meaning_hindi || "";
}

function buildChapters(){

 const box=document.getElementById("chapterList");
 box.innerHTML="";

 for(let ch=1;ch<=18;ch++){

   const verses=allVerses.filter(v=>v.chapter===ch);

   const card=document.createElement("div");
   card.className="card";

   card.innerHTML=`
    <div class="chapter">
      <div class="chapterNo">${ch}</div>
      <div>
       <div class="chapterTitle">
        અધ્યાય ${ch} — ${chapterNames[ch-1]}
       </div>
       <div class="chapterSub">
        ${verses.length} શ્લોક
       </div>
      </div>
    </div>
    <div class="verseGrid"></div>
   `;

   box.appendChild(card);

   const grid=card.querySelector(".verseGrid");

   verses.forEach(v=>{
     const b=document.createElement("button");
     b.className="primary";
     b.textContent=`${ch}.${v.verse}`;
     b.onclick=()=>openVerse(ch,v.verse);
     grid.appendChild(b);
   });
 }
}

async function openVerse(ch,vs){

 const key=`${ch}-${vs}`;
 const v=gita[key];

 if(!v){
   alert("આ શ્લોક ઉપલબ્ધ નથી.");
   return;
 }

 show("verse");

 document.getElementById("verseTitle").textContent=
   `📖 Bhagavad Gita ${ch}.${vs}`;

 document.getElementById("verseSource").textContent=
   `અધ્યાય ${ch} • શ્લોક ${vs}`;

 document.getElementById("verseSanskrit").textContent=v.sanskrit;
 document.getElementById("verseEnglish").textContent=v.english;
 document.getElementById("verseHindi").textContent=v.hindi || "हिन्दी अर्थ उपलब्ध नहीं है।";

 document.getElementById("verseGujarati").textContent=
   "⏳ ગુજરાતી અર્થ તૈયાર થઈ રહ્યો છે...";

 try{
   const gu=await translateToGujarati(v.hindi || v.english);
   document.getElementById("verseGujarati").textContent=gu;
 }catch(e){
   document.getElementById("verseGujarati").textContent=
     "ગુજરાતી અર્થ માટે Internet connection જરૂરી છે.";
 }

 document.getElementById("favoriteBtn").onclick=
   ()=>addFavorite(v.sanskrit);
}

async function translateToGujarati(text){

 if(!text) return "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

 const cacheKey="gujarati_"+btoa(unescape(encodeURIComponent(text))).slice(0,80);

 const old=localStorage.getItem(cacheKey);
 if(old)return old;

 const url=
 "https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=gu&dt=t&q="+
 encodeURIComponent(text);

 const res=await fetch(url);

 if(!res.ok) throw new Error("translation failed");

 const data=await res.json();

 const result=(data[0]||[]).map(x=>x[0]||"").join("").trim();

 if(!result) throw new Error("empty translation");

 localStorage.setItem(cacheKey,result);

 return result;
}

function searchGita(){

 const q=document.getElementById("searchBox").value.trim().toLowerCase();

 if(!q){
   document.getElementById("chapterList").style.display="";
   return;
 }

 const matches=allVerses.filter(v=>{
   const key=`${v.chapter}.${v.verse}`;
   return key.includes(q) ||
          v.sanskrit.toLowerCase().includes(q) ||
          (v.english||"").toLowerCase().includes(q);
 });

 const box=document.getElementById("chapterList");
 box.innerHTML="";

 if(!matches.length){
   box.innerHTML='<div class="card empty">કોઈ શ્લોક મળ્યો નથી.</div>';
   return;
 }

 const card=document.createElement("div");
 card.className="card";
 card.innerHTML="<h3>🔎 Search Results</h3><div class='verseGrid'></div>";
 box.appendChild(card);

 const grid=card.querySelector(".verseGrid");

 matches.slice(0,100).forEach(v=>{
   const b=document.createElement("button");
   b.className="primary";
   b.textContent=`${v.chapter}.${v.verse}`;
   b.onclick=()=>openVerse(v.chapter,v.verse);
   grid.appendChild(b);
 });
}

window.gita=gita;
window.openGitaVerse=openVerse;
window.loadGita=loadGita;

document.addEventListener("DOMContentLoaded",loadGita);
