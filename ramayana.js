/* =========================================================
   SANSKRITAM - VALMIKI RAMAYANA ENGINE
   ========================================================= */

const RAMAYANA_SOURCE = "https://raw.githubusercontent.com/bhavykhatri/DharmicData/main/ValmikiRamayana/";

const RAMAYANA_FILES = [
    { id: 1, gu: "બાલકાંડ", en: "Bala Kanda", file: "1_balakanda.json", subtitle: "શ્રી રામનો જન્મ, બાળપણ અને વિવાહ" },
    { id: 2, gu: "અયોધ્યાકાંડ", en: "Ayodhya Kanda", file: "2_ayodhyakanda.json", subtitle: "રાજ્યાભિષેક અને વનવાસ" },
    { id: 3, gu: "અરણ્યકાંડ", en: "Aranya Kanda", file: "3_aranyakanda.json", subtitle: "વનવાસ અને સીતા હરણ" },
    { id: 4, gu: "કિષ્કિંધાકાંડ", en: "Kishkindha Kanda", file: "4_kishkindhakanda.json", subtitle: "હનુમાનજી અને સુગ્રીવ સાથે મૈત્રી" },
    { id: 5, gu: "સુંદરકાંડ", en: "Sundara Kanda", file: "5_sundarakanda.json", subtitle: "હનુમાનજીની લંકા યાત્રા" },
    { id: 6, gu: "યુદ્ધકાંડ", en: "Yuddha Kanda", file: "6_yudhhakanda.json", subtitle: "રામ-રાવણ યુદ્ધ" },
    { id: 7, gu: "ઉત્તરકાંડ", en: "Uttara Kanda", file: "7_uttarakanda.json", subtitle: "અયોધ્યા પરત અને ઉત્તરકથા" }
];

let ramayanaAll = [];
let ramayanaByKanda = {};
let ramayanaLoaded = false;

/* =========================================================
   ESCAPE HTML
   ========================================================= */
function ramEsc(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (m) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[m];
    });
}

/* =========================================================
   NORMALIZE DATA
   ========================================================= */
function normalizeRamayanaRow(row, kandaId) {
    if (!row || typeof row !== "object") return null;

    const sarga = Number(row.sarga ?? row.sarga_number ?? row.chapter ?? row.chapterId ?? row.chapter_id ?? row.CHAPTERID);
    let verse = row.shloka ?? row.verse ?? row.verse_number ?? row.verseId ?? row.verse_id ?? row.VERSEID;
    
    const sanskrit = row.shloka_text ?? row.verseSanskrit ?? row.versesanskrit ?? row.sanskrit ?? row.text ?? row.verse_text ?? row.VERSESANSKRIT ?? "";
    const english = row.translation ?? row.english ?? row.verseTranslationInEng ?? row.englishTranslation ?? row.VERSEENGTRANSLATION ?? row.meaning ?? "";

    if (!sarga || !sanskrit) return null;

    return {
        id: `${kandaId}-${sarga}-${verse ?? ""}`,
        kanda: Number(kandaId),
        sarga: sarga,
        verse: String(verse ?? ""),
        sanskrit: String(sanskrit).replace(/<br\s*\/?>/gi, "\n").trim(),
        english: String(english).replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim(),
        hindi: "",
        gujarati: ""
    };
}

/* =========================================================
   EXTRACT JSON
   ========================================================= */
function extractRamayanaRows(data) {
    let rows = [];

    if (Array.isArray(data)) {
        rows = data;
    } else if (Array.isArray(data?.verses)) {
        rows = data.verses;
    } else if (Array.isArray(data?.data)) {
        rows = data.data;
    } else if (Array.isArray(data?.book?.verse)) {
        rows = data.book.verse;
    } else if (data && typeof data === "object") {
        Object.values(data).forEach(value => {
            if (Array.isArray(value)) {
                rows.push(...value);
            } else if (value && typeof value === "object") {
                if (value.sanskrit || value.shloka_text || value.verseSanskrit || value.VERSESANSKRIT) {
                    rows.push(value);
                }
            }
        });
    }

    return rows;
}

/* =========================================================
   LOAD ONE KANDA
   ========================================================= */
async function loadRamayanaKanda(kanda) {
    const url = RAMAYANA_SOURCE + kanda.file;
    try {
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const rows = extractRamayanaRows(data);
        
        return rows.map(row => normalizeRamayanaRow(row, kanda.id)).filter(Boolean);
    } catch (error) {
        console.error("Ramayana Kanda error:", kanda.file, error);
        return [];
    }
}

/* =========================================================
   LOAD COMPLETE RAMAYANA
   ========================================================= */
async function loadRamayana() {
    const box = document.getElementById("ramayanaList");
    if (!box) return;

    box.innerHTML = `
        <div class="granth-status">
            <div class="loading">
                🚩 વાલ્મીકિ રામાયણ લોડ થઈ રહ્યું છે...<br><br>
                7 કાંડના શ્લોકો તૈયાર થઈ રહ્યા છે.<br>
                કૃપા કરીને થોડી ક્ષણ રાહ જુઓ...
            </div>
        </div>
    `;

    ramayanaAll = [];
    ramayanaByKanda = {};

    const results = await Promise.all(RAMAYANA_FILES.map(kanda => loadRamayanaKanda(kanda)));

    results.forEach((verses, index) => {
        const kandaId = RAMAYANA_FILES[index].id;
        ramayanaByKanda[kandaId] = verses;
        ramayanaAll.push(...verses);
    });

    ramayanaAll.sort((a, b) => {
        if (a.kanda !== b.kanda) return a.kanda - b.kanda;
        if (a.sarga !== b.sarga) return a.sarga - b.sarga;
        return String(a.verse).localeCompare(String(b.verse), undefined, { numeric: true });
    });

    ramayanaLoaded = true;
    renderRamayana();
}

/* =========================================================
   RENDER RAMAYANA HOME (7 KANDA)
   ========================================================= */
function renderRamayana() {
    const box = document.getElementById("ramayanaList");
    if (!box) return;

    let total = ramayanaAll.length;
    let html = `
        <div class="granth-status">
            <b>🚩 વાલ્મીકિ રામાયણ</b><br>
            <span class="source">7 કાંડ • ${total.toLocaleString("en-IN")} શ્લોક</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
    `;

    RAMAYANA_FILES.forEach(kanda => {
        const verses = ramayanaByKanda[kanda.id] || [];
        const sargas = new Set(verses.map(v => v.sarga)).size;

        html += `
            <div class="card chapter" onclick="openRamayanaKanda(${kanda.id})" style="margin-bottom:0;">
                <div class="chapterNo" style="background: linear-gradient(145deg, #e74c3c, #c0392b);">
                    ${kanda.id}
                </div>
                <div>
                    <div class="chapterTitle">${ramEsc(kanda.gu)}</div>
                    <div class="chapterSub">
                        ${ramEsc(kanda.en)} • ${sargas} સર્ગ • ${verses.length.toLocaleString("en-IN")} શ્લોક
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    box.innerHTML = html;
}

/* =========================================================
   OPEN KANDA
   ========================================================= */
function openRamayanaKanda(kandaId) {
    const box = document.getElementById("ramayanaList");
    if (!box) return;

    const kanda = RAMAYANA_FILES.find(x => x.id === Number(kandaId));
    if (!kanda) return;

    const verses = ramayanaByKanda[kandaId] || [];

    if (!verses.length) {
        box.innerHTML = `
            <div class="error">
                ⚠️ આ કાંડના શ્લોકો લોડ થઈ શક્યા નથી.<br><br>
                Internet connection તપાસો.
            </div>
        `;
        return;
    }

    const sargaMap = {};
    verses.forEach(v => {
        if (!sargaMap[v.sarga]) sargaMap[v.sarga] = [];
        sargaMap[v.sarga].push(v);
    });

    let html = `
        <div class="back" onclick="renderRamayana()">← બધા કાંડ</div>
        <div class="granth-status">
            <b>🚩 ${ramEsc(kanda.gu)}</b><br>
            <span class="source">${ramEsc(kanda.en)} • ${verses.length.toLocaleString("en-IN")} શ્લોક</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
    `;

    Object.keys(sargaMap).sort((a, b) => Number(a) - Number(b)).forEach(sarga => {
        const list = sargaMap[sarga];
        html += `
            <div class="card chapter" onclick="openRamayanaSarga(${kandaId}, ${sarga})" style="margin-bottom:0;">
                <div class="chapterNo">${sarga}</div>
                <div>
                    <div class="chapterTitle">સર્ગ ${sarga}</div>
                    <div class="chapterSub">${list.length} શ્લોક</div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    box.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   OPEN SARGA
   ========================================================= */
function openRamayanaSarga(kandaId, sargaId) {
    const box = document.getElementById("ramayanaList");
    if (!box) return;

    const kanda = RAMAYANA_FILES.find(x => x.id === Number(kandaId));
    const verses = (ramayanaByKanda[kandaId] || []).filter(v => Number(v.sarga) === Number(sargaId));

    let html = `
        <div class="back" onclick="openRamayanaKanda(${kandaId})">← બધા સર્ગ</div>
        <div class="granth-status">
            <b>🚩 ${ramEsc(kanda?.gu)}</b><br>
            <span class="source">સર્ગ ${sargaId} • ${verses.length} શ્લોક</span>
        </div>
        <div class="granth-grid">
    `;

    verses.forEach(v => {
        html += `
            <button type="button" class="granth-btn" onclick="openRamayanaVerse('${ramEsc(v.id)}')">
                ${v.sarga}.${ramEsc(v.verse)}
            </button>
        `;
    });

    html += `</div>`;
    box.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   OPEN VERSE (READER)
   ========================================================= */
async function openRamayanaVerse(id) {
    const verse = ramayanaAll.find(v => v.id === id);

    if (!verse) {
        if (typeof toast === "function") toast("આ શ્લોક મળ્યો નથી.");
        return;
    }

    const old = document.getElementById("granthVerseReader");
    if (old) old.remove();

    const reader = document.createElement("div");
    reader.id = "granthVerseReader";
    reader.className = "granth-reader";

    // Create favorite text properly
    const favText = `Ramayana ${verse.kanda}.${verse.sarga}.${verse.verse} — ${verse.sanskrit}`;

    reader.innerHTML = `
        <div class="back" onclick="document.getElementById('granthVerseReader')?.remove()">← શ્લોક સૂચિ</div>
        <div style="font-size:20px; font-weight:bold;">
            🚩 Valmiki Ramayana ${verse.kanda}.${verse.sarga}.${ramEsc(verse.verse)}
        </div>
        <div class="source">
            કાંડ ${verse.kanda} • સર્ગ ${verse.sarga} • શ્લોક ${ramEsc(verse.verse)}
        </div>
        <hr>
        
        <h3>🕉️ संस्कृत श्लोक</h3>
        <div class="granth-sanskrit">${ramEsc(verse.sanskrit)}</div>
        <hr>
        
        <h3>🇬🇧 English Meaning</h3>
        <p class="meaning">${verse.english ? ramEsc(verse.english) : "English meaning ઉપલબ્ધ નથી."}</p>
        <hr>
        
        <h3>🇮🇳 हिन्दी अर्थ</h3>
        <p id="hi-${ramEsc(verse.id)}" class="meaning">हिन्दी अर्थ મેળવવામાં આવી રહ્યો છે...</p>
        <hr>
        
        <h3>🇮🇳 ગુજરાતી અર્થ</h3>
        <p id="gu-${ramEsc(verse.id)}" class="meaning">ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...</p>

        <div class="actions">
            <!-- Using data attributes for safety to avoid quotation mark escaping issues -->
            <button data-fav="${ramEsc(favText)}" onclick="if(typeof addFavorite === 'function') addFavorite(this.dataset.fav)">
                ❤️ Favorite
            </button>
            <button data-text="${ramEsc(verse.sanskrit)}" onclick="if(typeof speakText === 'function') speakText(this.dataset.text)">
                🔊 સાંભળો
            </button>
            <button data-text="${ramEsc(verse.sanskrit)}" onclick="if(typeof shareText === 'function') shareText(this.dataset.text)">
                📤 Share
            </button>
        </div>
    `;

    const page = document.getElementById("ramayana");
    page.insertBefore(reader, document.getElementById("ramayanaList"));

    /* ==========================================
       AUTOMATIC TRANSLATION
       ========================================== */
    if (typeof translateText === "function" && verse.english) {
        try {
            const [hindi, gujarati] = await Promise.all([
                translateText(verse.english, "hi"),
                translateText(verse.english, "gu")
            ]);

            const hiElem = document.getElementById(`hi-${verse.id}`);
            const guElem = document.getElementById(`gu-${verse.id}`);

            if (hiElem) hiElem.textContent = hindi || "हिन्दी अर्थ उपलब्ध नहीं है।";
            if (guElem) guElem.textContent = gujarati || "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";
        } catch (error) {
            console.error("Translation error:", error);
        }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   START
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
    loadRamayana();
});
