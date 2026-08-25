/* =========================================================
   SANSKRITAM — BHAGAVAD GITA 700 SHLOKA ENGINE
   Sanskrit + English + Hindi + Gujarati
   ========================================================= */

const GITA_DATA_URL =
"https://cdn.jsdelivr.net/gh/ChiragMirani/gita-quotes@main/docs/data.json";

const GITA_HINDI_URL =
"https://raw.githubusercontent.com/kashishkhullar/gita_json/master/gita.json";


/* =========================================================
   18 CHAPTERS — 700 SHLOKAS
   ========================================================= */

const GITA_CHAPTERS = [

    [1, "अर्जुनविषादयोग", 47],
    [2, "सांख्ययोग", 72],
    [3, "कर्मयोग", 43],
    [4, "ज्ञानकर्मसंन्यासयोग", 42],
    [5, "कर्मसंन्यासयोग", 29],
    [6, "आत्मसंयमयोग", 47],
    [7, "ज्ञानविज्ञानयोग", 30],
    [8, "अक्षरब्रह्मयोग", 28],
    [9, "राजविद्याराजगुह्ययोग", 34],
    [10, "विभूतियोग", 42],
    [11, "विश्वरूपदर्शनयोग", 55],
    [12, "भक्तियोग", 20],
    [13, "क्षेत्रक्षेत्रज्ञविभागयोग", 34],
    [14, "गुणत्रयविभागयोग", 27],
    [15, "पुरुषोत्तमयोग", 20],
    [16, "दैवासुरसम्पद्विभागयोग", 24],
    [17, "श्रद्धात्रयविभागयोग", 28],
    [18, "मोक्षसंन्यासयोग", 78]

];


let gita = {};
let allVerses = [];
let hindiData = null;


/* =========================================================
   SAFE HTML
   ========================================================= */

function esc(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GET FIRST AVAILABLE VALUE
   ========================================================= */

function firstValue(obj, keys) {

    if (!obj || typeof obj !== "object") {
        return "";
    }

    for (const key of keys) {

        if (
            obj[key] !== undefined &&
            obj[key] !== null &&
            String(obj[key]).trim() !== ""
        ) {

            return obj[key];

        }

    }

    return "";

}


/* =========================================================
   NORMALIZE ONE VERSE
   ========================================================= */

function normalizeRow(row) {

    if (!row || typeof row !== "object") {
        return null;
    }


    const chapter = Number(
        firstValue(row, [
            "chapter",
            "chapter_number",
            "chapterNumber",
            "chapter_no"
        ])
    );


    const verse = Number(
        firstValue(row, [
            "verse",
            "verse_number",
            "verseNumber",
            "verse_no"
        ])
    );


    const sanskrit = firstValue(row, [

        "sanskrit",
        "devanagari",
        "slok",
        "shloka",
        "verse_text",
        "text"

    ]);


    const english = firstValue(row, [

        "english",
        "translation",
        "translation_en",
        "meaning",
        "english_meaning"

    ]);


    if (
        !chapter ||
        !verse ||
        !sanskrit
    ) {

        return null;

    }


    return {

        chapter: chapter,

        verse: verse,

        key: `${chapter}-${verse}`,

        sanskrit: String(sanskrit).trim(),

        english: String(english || "").trim(),

        hindi: "",

        gujarati: ""

    };

}


/* =========================================================
   NORMALIZE DATA
   ========================================================= */

function normalizeData(data) {

    let rows = [];


    /* ARRAY */

    if (Array.isArray(data)) {

        rows = data;

    }


    /* { verses: [] } */

    else if (Array.isArray(data?.verses)) {

        rows = data.verses;

    }


    /* { data: [] } */

    else if (Array.isArray(data?.data)) {

        rows = data.data;

    }


    /* OBJECT */

    else if (
        data &&
        typeof data === "object"
    ) {


        /* CHAPTERS */

        if (Array.isArray(data.chapters)) {

            data.chapters.forEach(function(chapterData) {

                if (
                    Array.isArray(
                        chapterData?.verses
                    )
                ) {

                    chapterData.verses.forEach(
                        function(verseData) {

                            rows.push({

                                ...verseData,

                                chapter:
                                    verseData.chapter ??
                                    chapterData.chapter ??
                                    chapterData.chapter_number

                            });

                        }
                    );

                }

            });

        }


        /* 1-1 FORMAT */

        if (!rows.length) {

            Object.entries(data).forEach(
                function([key, value]) {

                    if (
                        /^\d+-\d+$/.test(key) &&
                        value &&
                        typeof value === "object"
                    ) {

                        const parts =
                            key.split("-");


                        rows.push({

                            ...value,

                            chapter:
                                value.chapter ??
                                parts[0],

                            verse:
                                value.verse ??
                                parts[1]

                        });

                    }

                }
            );

        }

    }


    return rows

        .map(normalizeRow)

        .filter(Boolean)

        .sort(function(a, b) {

            return (
                a.chapter - b.chapter ||
                a.verse - b.verse
            );

        });

}


/* =========================================================
   FIND HINDI MEANING
   ========================================================= */

function findHindi(chapter, verse) {

    if (!hindiData) {

        return "";

    }


    const key =
        `${chapter}-${verse}`;


    let item = null;


    /* DIRECT KEY */

    if (hindiData[key]) {

        item =
            hindiData[key];

    }


    /* VERSES OBJECT */

    if (
        !item &&
        hindiData.verses &&
        hindiData.verses[chapter] &&
        hindiData.verses[chapter][verse]
    ) {

        item =
            hindiData.verses[chapter][verse];

    }


    /* CHAPTER OBJECT */

    if (
        !item &&
        hindiData.chapters &&
        hindiData.chapters[chapter]
    ) {

        const ch =
            hindiData.chapters[chapter];


        if (
            ch.verses &&
            ch.verses[verse]
        ) {

            item =
                ch.verses[verse];

        }

    }


    /* ARRAY */

    if (
        !item &&
        Array.isArray(hindiData)
    ) {

        item =
            hindiData.find(function(row) {

                const c =
                    Number(
                        row?.chapter ??
                        row?.chapter_number ??
                        row?.chapterNumber
                    );


                const v =
                    Number(
                        row?.verse ??
                        row?.verse_number ??
                        row?.verseNumber
                    );


                return (
                    c === chapter &&
                    v === verse
                );

            });

    }


    if (!item) {

        return "";

    }


    /* STRING */

    if (typeof item === "string") {

        return item.trim();

    }


    /* HINDI FIELDS */

    const hindi =
        firstValue(item, [

            "meaning_hindi",
            "hindi_meaning",
            "hindiMeaning",
            "verse_meaning_hindi",
            "translation_hindi",
            "translation_hi",
            "hindi",
            "meaning",
            "text_hindi",
            "text"

        ]);


    return String(
        hindi || ""
    ).trim();

}


/* =========================================================
   BUILD GITA OBJECT
   ========================================================= */

function buildObject() {

    gita = {};


    allVerses.forEach(function(verse) {

        gita[verse.key] = {

            ...verse,

            hindi:
                findHindi(
                    verse.chapter,
                    verse.verse
                ),

            gujarati: ""

        };

    });


    window.gita = gita;

}


/* =========================================================
   STYLES
   ========================================================= */

function injectStyles() {

    if (
        document.getElementById(
            "sanskritam-gita-style"
        )
    ) {

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "sanskritam-gita-style";


    style.textContent = `

        #gita700List {
            margin-top:18px;
        }


        .gita700-status {

            background:#fffaf0;

            border:1px solid #e7d9bc;

            border-radius:18px;

            padding:18px;

            margin:14px 0;

            box-shadow:
                0 5px 18px #00000012;

            font-size:16px;

        }


        .gita700-chapter {

            background:#fffaf0;

            border:1px solid #e7d9bc;

            border-radius:22px;

            padding:18px;

            margin:18px 0;

            box-shadow:
                0 5px 18px #00000012;

        }


        .gita700-chapter h3 {

            font-size:22px;

            margin-top:0;

            margin-bottom:18px;

        }


        .gita700-grid {

            display:grid;

            grid-template-columns:
                repeat(3, 1fr);

            gap:10px;

        }


        .gita700-btn {

            border:0;

            border-radius:14px;

            padding:14px 5px;

            background:#b87909;

            color:#fff;

            font-family:Arial,sans-serif;

            font-size:14px;

            font-weight:bold;

            cursor:pointer;

        }


        .gita700-btn:active {

            transform:scale(.97);

        }


        .gita700-reader {

            background:#fffaf0;

            border:1px solid #e7d9bc;

            border-radius:20px;

            padding:20px;

            margin:18px 0;

            box-shadow:
                0 5px 18px #00000012;

        }


        .gita700-reader h2 {

            font-size:24px;

        }


        .gita700-reader h3 {

            margin-top:20px;

            margin-bottom:8px;

        }


        .gita700-sanskrit {

            font-size:23px;

            line-height:1.9;

            white-space:pre-line;

            font-family:Georgia,serif;

        }


        .gita700-meaning {

            font-family:Arial,sans-serif;

            font-size:17px;

            line-height:1.75;

        }


        .gita700-back {

            display:inline-block;

            cursor:pointer;

            margin-bottom:10px;

            font-weight:bold;

            color:#9a6200;

        }


        .gita700-favorite {

            border:0;

            border-radius:12px;

            padding:12px 18px;

            background:#b87909;

            color:white;

            font-weight:bold;

            cursor:pointer;

        }


        @media(max-width:600px) {

            .gita700-grid {

                grid-template-columns:
                    repeat(2, 1fr);

            }

        }

    `;


    document.head.appendChild(style);

}


/* =========================================================
   CREATE GITA LIST
   ========================================================= */

function ensureList() {

    const section =
        document.getElementById("gita");


    if (!section) {

        console.error(
            "SANSKRITAM: #gita section not found."
        );

        return null;

    }


    let box =
        document.getElementById(
            "gita700List"
        );


    if (box) {

        return box;

    }


    box =
        document.createElement("div");


    box.id =
        "gita700List";


    const heading =
        section.querySelector("h2");


    if (heading) {

        heading.insertAdjacentElement(
            "afterend",
            box
        );

    }

    else {

        section.appendChild(
            box
        );

    }


    return box;

}


/* =========================================================
   RENDER 18 CHAPTERS
   ========================================================= */

function renderGita() {

    const box =
        ensureList();


    if (!box) {

        return;

    }


    if (!allVerses.length) {

        box.innerHTML = `

            <div class="gita700-status">

                📖 શ્લોકો લોડ થઈ રહ્યા છે...

            </div>

        `;

        return;

    }


    let html = `

        <div class="gita700-status">

            📚 <b>ભગવદ્ ગીતા</b>

            <br>

            18 અધ્યાય •
            ${Math.min(allVerses.length, 700)}
            શ્લોક

        </div>

    `;


    GITA_CHAPTERS.forEach(
        function(data) {

            const chapter =
                data[0];

            const name =
                data[1];

            const count =
                data[2];


            html += `

                <div class="gita700-chapter">

                    <h3>

                        અધ્યાય
                        ${chapter}
                        —
                        ${esc(name)}

                    </h3>

                    <div class="gita700-grid">

            `;


            for (
                let verse = 1;
                verse <= count;
                verse++
            ) {

                const key =
                    `${chapter}-${verse}`;


                if (gita[key]) {

                    html += `

                        <button
                            type="button"
                            class="gita700-btn"
                            onclick="openGitaVerse('${key}')"
                        >

                            શ્લોક
                            ${chapter}.${verse}

                        </button>

                    `;

                }

            }


            html += `

                    </div>

                </div>

            `;

        }
    );


    box.innerHTML =
        html;

}


/* =========================================================
   GET SAVED GUJARATI
   ========================================================= */

function getSavedGujarati(key) {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    "sanskritamGujarati"
                ) || "{}"
            );


        return data[key] || "";

    }

    catch (error) {

        return "";

    }

}


/* =========================================================
   SAVE GUJARATI
   ========================================================= */

function saveGujarati(key, text) {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    "sanskritamGujarati"
                ) || "{}"
            );


        data[key] =
            text;


        localStorage.setItem(
            "sanskritamGujarati",
            JSON.stringify(data)
        );

    }

    catch (error) {

        console.warn(
            "Gujarati cache error:",
            error
        );

    }

}


/* =========================================================
   GOOGLE TRANSLATE
   ========================================================= */

async function googleGujarati(text) {

    const url =
        "https://translate.googleapis.com/translate_a/single" +
        "?client=gtx" +
        "&sl=en" +
        "&tl=gu" +
        "&dt=t" +
        "&q=" +
        encodeURIComponent(text);


    const response =
        await fetch(
            url,
            {
                method:"GET",
                cache:"no-cache"
            }
        );


    if (!response.ok) {

        throw new Error(
            "Google translation failed"
        );

    }


    const data =
        await response.json();


    let result = "";


    if (
        Array.isArray(data) &&
        Array.isArray(data[0])
    ) {

        result =
            data[0]
                .map(function(part) {

                    return (
                        part &&
                        part[0]
                    )
                    ?
                    part[0]
                    :
                    "";

                })
                .join("");

    }


    return result.trim();

}


/* =========================================================
   MYMEMORY FALLBACK
   ========================================================= */

async function myMemoryGujarati(text) {

    const url =
        "https://api.mymemory.translated.net/get" +
        "?q=" +
        encodeURIComponent(text) +
        "&langpair=en|gu";


    const response =
        await fetch(
            url,
            {
                method:"GET",
                cache:"no-cache"
            }
        );


    if (!response.ok) {

        throw new Error(
            "MyMemory failed"
        );

    }


    const data =
        await response.json();


    const result =
        data?.responseData?.translatedText || "";


    return result.trim();

}


/* =========================================================
   GUJARATI TRANSLATION
   ========================================================= */

async function translateGujarati(key) {

    const verse =
        gita[key];


    const target =
        document.getElementById(
            "gu-" + key
        );


    if (!verse || !target) {

        return;

    }


    /* CHECK CACHE */

    const saved =
        getSavedGujarati(key);


    if (saved) {

        target.textContent =
            saved;

        return;

    }


    if (!verse.english) {

        target.textContent =
            "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

        return;

    }


    target.textContent =
        "ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";


    /* GOOGLE */

    try {

        const translated =
            await googleGujarati(
                verse.english
            );


        if (translated) {

            target.textContent =
                translated;

            saveGujarati(
                key,
                translated
            );

            return;

        }

    }

    catch (error) {

        console.warn(
            "Google Gujarati failed:",
            error
        );

    }


    /* MYMEMORY */

    try {

        const translated =
            await myMemoryGujarati(
                verse.english
            );


        if (translated) {

            target.textContent =
                translated;

            saveGujarati(
                key,
                translated
            );

            return;

        }

    }

    catch (error) {

        console.warn(
            "MyMemory Gujarati failed:",
            error
        );

    }


    target.textContent =
        "ગુજરાતી અર્થ હાલમાં મેળવી શકાયો નથી. Internet ચાલુ રાખીને ફરી પ્રયાસ કરો.";

}


/* =========================================================
   OPEN ONE VERSE
   ========================================================= */

function openGitaVerse(key) {

    const verse =
        gita[key];


    if (!verse) {

        alert(
            "આ શ્લોક હાલમાં ઉપલબ્ધ નથી."
        );

        return;

    }


    /* REMOVE OLD READER */

    const oldReader =
        document.getElementById(
            "gitaVerseReader"
        );


    if (oldReader) {

        oldReader.remove();

    }


    const reader =
        document.createElement("div");


    reader.id =
        "gitaVerseReader";


    reader.className =
        "gita700-reader";


    reader.innerHTML = `

        <div
            class="gita700-back"
            onclick="
                document
                .getElementById(
                    'gitaVerseReader'
                )
                ?.remove()
            "
        >

            ← શ્લોક સૂચિ

        </div>


        <h2>

            📖 Bhagavad Gita
            ${verse.chapter}.${verse.verse}

        </h2>


        <div>

            અધ્યાય
            ${verse.chapter}
            •
            શ્લોક
            ${verse.verse}

        </div>


        <hr>


        <h3>

            🕉️ संस्कृत श्लोक

        </h3>


        <div
            class="gita700-sanskrit"
        >

            ${esc(verse.sanskrit)}

        </div>


        <hr>


        <h3>

            🇬🇧 English Meaning

        </h3>


        <p
            class="gita700-meaning"
        >

            ${
                verse.english
                ?
                esc(verse.english)
                :
                "English meaning ઉપલબ્ધ નથી."
            }

        </p>


        <hr>


        <h3>

            🇮🇳 हिन्दी अर्थ

        </h3>


        <p
            class="gita700-meaning"
        >

            ${
                verse.hindi
                ?
                esc(verse.hindi)
                :
                "हिन्दी अर्थ ઉપલબ્ધ નથી."
            }

        </p>


        <hr>


        <h3>

            🇮🇳 ગુજરાતી અર્થ

        </h3>


        <p
            id="gu-${key}"
            class="gita700-meaning"
        >

            ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...

        </p>


        <button
            type="button"
            class="gita700-favorite"
            onclick="
                saveGitaFavorite('${key}')
            "
        >

            ❤️ Favorite

        </button>

    `;


    const section =
        document.getElementById(
            "gita"
        );


    const list =
        document.getElementById(
            "gita700List"
        );


    if (!section) {

        return;

    }


    if (list) {

        section.insertBefore(
            reader,
            list
        );

    }

    else {

        section.appendChild(
            reader
        );

    }


    /* LOAD GUJARATI */

    translateGujarati(key);


    /* SCROLL */

    reader.scrollIntoView({
        behavior:"smooth",
        block:"start"
    });

}


/* =========================================================
   FAVORITE
   ========================================================= */

function saveGitaFavorite(key) {

    const verse =
        gita[key];


    if (!verse) {

        return;

    }


    let favorites = [];


    try {

        favorites =
            JSON.parse(
                localStorage.getItem(
                    "sanskritamFavorites"
                ) || "[]"
            );

    }

    catch (error) {

        favorites = [];

    }


    const item =
        `${key} — ${verse.sanskrit}`;


    if (!favorites.includes(item)) {

        favorites.push(item);

    }


    localStorage.setItem(

        "sanskritamFavorites",

        JSON.stringify(
            favorites
        )

    );


    alert(
        "❤️ Favorite Saved"
    );

}


/* =========================================================
   LOAD GITA
   ========================================================= */

async function loadGita() {

    injectStyles();


    renderGita();


    try {

        console.log(
            "SANSKRITAM: Loading Gita..."
        );


        /* =========================================
           LOAD MAIN GITA
           ========================================= */

        const response =
            await fetch(
                GITA_DATA_URL,
                {
                    cache:"no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Gita data HTTP error: " +
                response.status
            );

        }


        const data =
            await response.json();


        allVerses =
            normalizeData(data);


        console.log(
            "Gita records found:",
            allVerses.length
        );


        /* =========================================
           KEEP 700 STANDARD VERSES
           ========================================= */

        if (allVerses.length > 700) {

            const withoutExtra =
                allVerses.filter(
                    function(v) {

                        return !(
                            v.chapter === 13 &&
                            v.verse === 1
                        );

                    }
                );


            allVerses =
                withoutExtra.slice(
                    0,
                    700
                );

        }


        /* =========================================
           LOAD HINDI
           ========================================= */

        try {

            console.log(
                "SANSKRITAM: Loading Hindi..."
            );


            const hindiResponse =
                await fetch(
                    GITA_HINDI_URL,
                    {
                        cache:"no-cache"
                    }
                );


            if (hindiResponse.ok) {

                hindiData =
                    await hindiResponse.json();


                console.log(
                    "SANSKRITAM: Hindi loaded."
                );

            }

            else {

                console.warn(
                    "Hindi HTTP error:",
                    hindiResponse.status
                );

            }

        }

        catch (hindiError) {

            console.warn(
                "Hindi data unavailable:",
                hindiError
            );

        }


        /* =========================================
           BUILD
           ========================================= */

        buildObject();


        /* =========================================
           RENDER
           ========================================= */

        renderGita();


        console.log(
            "SANSKRITAM: " +
            allVerses.length +
            " verses ready."
        );

    }

    catch (error) {

        console.error(
            "SANSKRITAM GITA ERROR:",
            error
        );


        const box =
            ensureList();


        if (box) {

            box.innerHTML = `

                <div
                    class="gita700-status"
                >

                    ⚠️
                    <b>
                        ભગવદ્ ગીતા લોડ થઈ શકી નથી.
                    </b>

                    <br><br>

                    Internet ચાલુ છે કે નહીં
                    તે તપાસો અને page ફરી ખોલો.

                    <br><br>

                    <small>

                        Error:
                        ${esc(
                            error.message ||
                            "Unknown error"
                        )}

                    </small>

                </div>

            `;

        }

    }

}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        loadGita
    );

}

else {

    loadGita();

}