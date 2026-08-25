 /* SANSKRITAM - Bhagavad Gita 700 Shloka Loader
   Source: TheAum Bhagavad Gita API (Sanskrit + Hindi + English)
   Gujarati meaning is generated on demand from the Hindi meaning.
*/

const GITA_API = "https://bhagavadgita.theaum.org";
const GUJARATI_API = "https://translate.googleapis.com/translate_a/single";

const GITA_CHAPTERS_FULL = [
  [1,"अर्जुनविषादयोग",47],[2,"सांख्ययोग",72],[3,"कर्मयोग",43],
  [4,"ज्ञानकर्मसंन्यासयोग",42],[5,"कर्मसंन्यासयोग",29],[6,"आत्मसंयमयोग",47],
  [7,"ज्ञानविज्ञानयोग",30],[8,"अक्षरब्रह्मयोग",28],[9,"राजविद्याराजगुह्ययोग",34],
  [10,"विभूतियोग",42],[11,"विश्वरूपदर्शनयोग",55],[12,"भक्तियोग",20],
  [13,"क्षेत्रक्षेत्रज्ञविभागयोग",34],[14,"गुणत्रयविभागयोग",27],[15,"पुरुषोत्तमयोग",20],
  [16,"दैवासुरसम्पद्विभागयोग",24],[17,"श्रद्धात्रयविभागयोग",28],[18,"मोक्षसंन्यासयोग",78]
];

const gitaVerseCount = GITA_CHAPTERS_FULL.map(x => x[2]);

if (typeof gita === "undefined") {
  var gita = {};
}

function escHtml(value) {
  return String(value ?? "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function gitaSection() {
  return document.querySelector('section[id="gita"]');
}

function buildFullGitaLibrary() {
  const section = gitaSection();
  if (!section) return;

  let box = document.getElementById("fullGitaLibrary");
  if (!box) {
    box = document.createElement("div");
    box.id = "fullGitaLibrary";
    const heading = section.querySelector("h2");
    const card = section.querySelector(".card");
    if (card) card.after(box);
    else if (heading) heading.after(box);
    else section.appendChild(box);
  }

  box.innerHTML = `
    <div class="card">
      <h3>📚 ભગવદ્ ગીતા — 18 અધ્યાય • 700 શ્લોક</h3>
      <p style="font:14px Arial;line-height:1.6">
        કોઈપણ અધ્યાય પસંદ કરો. પછી શ્લોક નંબર દબાવતા Sanskrit,
        English, हिन्दी અને ગુજરાતી અર્થ ખુલશે.
      </p>
      <div id="gitaChapterButtons"></div>
    </div>
  `;

  const chaptersBox = document.getElementById("gitaChapterButtons");

  GITA_CHAPTERS_FULL.forEach(([ch,name,count]) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "10px";

    card.innerHTML = `
      <div class="chapter">
        <div class="chapterNo">${ch}</div>
        <div>
          <div class="chapterTitle">અધ્યાય ${ch} — ${escHtml(name)}</div>
          <div class="chapterSub">${count} શ્લોક</div>
        </div>
      </div>
      <div class="gitaVerseGrid" id="gitaGrid${ch}"
           style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:12px"></div>
    `;

    chaptersBox.appendChild(card);

    const grid = card.querySelector(`#gitaGrid${ch}`);

    for (let v = 1; v <= count; v++) {
      const btn = document.createElement("button");
      btn.className = "primary";
      btn.style.margin = "2px";
      btn.style.padding = "9px 5px";
      btn.textContent = `${ch}.${v}`;
      btn.onclick = () => openGitaVerseByNumber(ch, v);
      grid.appendChild(btn);
    }
  });
}

async function getGitaData(chapter, verse) {
  const cacheKey = `sanskritam_gita_${chapter}_${verse}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (_) {}

  const [textRes, translationRes] = await Promise.all([
    fetch(`${GITA_API}/text/${chapter}/${verse}`),
    fetch(`${GITA_API}/text/translations/${chapter}/${verse}`)
  ]);

  if (!textRes.ok || !translationRes.ok) {
    throw new Error("Gita API unavailable");
  }

  const textJson = await textRes.json();
  const transJson = await translationRes.json();
  const text = textJson.data?.[0];
  const translations = transJson.data || [];

  const hindi =
    translations.find(x => x.lang === "hi" &&
      /Tejomayananda|Ramsukhdas/i.test(x.name || "")) ||
    translations.find(x => x.lang === "hi");

  const english =
    translations.find(x => x.lang === "en" &&
      /Sivananda|Purohit/i.test(x.name || "")) ||
    translations.find(x => x.lang === "en");

  const result = {
    chapter,
    verse,
    sanskrit: text?.shloka || "",
    hindi: hindi?.translation || "",
    english: english?.translation || ""
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch (_) {}

  return result;
}

async function translateHindiToGujarati(hindiText) {
  if (!hindiText) return "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

  const cacheKey = "sanskritam_gu_" +
    btoa(unescape(encodeURIComponent(hindiText))).slice(0,80);

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch (_) {}

  const url =
    `${GUJARATI_API}?client=gtx&sl=hi&tl=gu&dt=t&q=${encodeURIComponent(hindiText)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Gujarati translation unavailable");
  }

  const data = await res.json();

  const translated = (data?.[0] || [])
    .map(x => x?.[0] || "")
    .join("")
    .trim();

  if (!translated) {
    throw new Error("Empty Gujarati translation");
  }

  try {
    localStorage.setItem(cacheKey, translated);
  } catch (_) {}

  return translated;
}

async function openGitaVerseByNumber(chapter, verseNumber) {
  let section = document.getElementById("dynamicGitaVerse");

  if (!section) {
    section = document.createElement("section");
    section.id = "dynamicGitaVerse";
    section.className = "view";
    document.querySelector("main")?.appendChild(section);
  }

  document.querySelectorAll(".view")
    .forEach(v => v.classList.remove("active"));

  section.classList.add("active");
  window.scrollTo(0,0);

  section.innerHTML = `
    <div class="back" onclick="show('gita')">
      ← Bhagavad Gita
    </div>

    <div class="card">
      <h2>📖 Bhagavad Gita ${chapter}.${verseNumber}</h2>
      <div class="empty">⏳ શ્લોક લોડ થઈ રહ્યો છે...</div>
    </div>
  `;

  try {
    const data = await getGitaData(chapter, verseNumber);

    let gujarati = "";

    try {
      gujarati = await translateHindiToGujarati(data.hindi);
    } catch (_) {
      gujarati =
        "ગુજરાતી અર્થ લોડ થઈ શક્યો નથી. Internet connection તપાસો.";
    }

    section.innerHTML = `
      <div class="back" onclick="show('gita')">
        ← Bhagavad Gita
      </div>

      <div class="card">

        <h2>📖 Bhagavad Gita ${chapter}.${verseNumber}</h2>

        <div class="shlok">
          ${escHtml(data.sanskrit).replace(/\n/g,"<br>")}
        </div>

        <hr>

        <h3>🇬🇧 English Meaning</h3>

        <p style="font:16px Arial;line-height:1.7">
          ${escHtml(data.english).replace(/\n/g,"<br>")}
        </p>

        <h3>🇮🇳 हिन्दी अर्थ</h3>

        <p style="font:16px Arial;line-height:1.7">
          ${escHtml(data.hindi).replace(/\n/g,"<br>")}
        </p>

        <h3>🇮🇳 ગુજરાતી અર્થ</h3>

        <p style="font:16px Arial;line-height:1.7">
          ${escHtml(gujarati).replace(/\n/g,"<br>")}
        </p>

        <button class="primary"
          onclick="addFavorite('${escHtml(data.sanskrit)}')">
          ❤️ Favorite
        </button>

      </div>
    `;

  } catch (error) {

    section.innerHTML = `
      <div class="back" onclick="show('gita')">
        ← Bhagavad Gita
      </div>

      <div class="card">

        <h2>📖 Bhagavad Gita ${chapter}.${verseNumber}</h2>

        <p style="font:15px Arial;line-height:1.6">
          શ્લોક લોડ થઈ શક્યો નથી.
          Internet connection તપાસો અને ફરી પ્રયાસ કરો.
        </p>

        <button class="primary"
          onclick="openGitaVerseByNumber(${chapter},${verseNumber})">
          🔄 ફરી પ્રયાસ
        </button>

      </div>
    `;
  }
}

/* Existing website compatibility */
function openGitaVerse(key) {

  const verse = gita[key];

  if (verse) {
    return openGitaVerseByNumber(
      verse.chapter,
      verse.verse
    );
  }

  const match = String(key).match(/(\d+)[-.](\d+)/);

  if (match) {
    return openGitaVerseByNumber(
      Number(match[1]),
      Number(match[2])
    );
  }
}

function initFullGita() {
  buildFullGitaLibrary();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initFullGita
  );
} else {
  initFullGita();
}
