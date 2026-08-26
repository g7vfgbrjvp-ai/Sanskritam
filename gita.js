/* =========================================================
   🪷 SANSKRITAM
   PROFESSIONAL BHAGAVAD GITA ENGINE
   ---------------------------------------------------------
   Features:
   ✓ 18 Chapters
   ✓ 700 Shlokas
   ✓ Sanskrit
   ✓ English
   ✓ Hindi
   ✓ Gujarati Translation
   ✓ Gujarati Offline Cache
   ✓ Progress indicator
   ✓ Offline detection
   ✓ Retry
   ✓ Search
   ✓ Chapter filter
   ✓ Previous / Next verse
   ✓ Favorites
   ✓ Speech
   ✓ Share
   ✓ Safe rendering
   ✓ Cache versioning
   ========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const SANSKRITAM_GITA = {

    VERSION: "2.0.0",

    DATA_URL:
        "https://cdn.jsdelivr.net/gh/ChiragMirani/gita-quotes@main/docs/data.json",

    HINDI_URL:
        "https://raw.githubusercontent.com/kashishkhullar/gita_json/master/dataset_hindi.json",

    GUJARATI_TRANSLATE_URL:
        "https://translate.googleapis.com/translate_a/single",

    CACHE_KEY:
        "sanskritam_gita_gujarati_v2",

    FAVORITE_KEY:
        "sanskritamFavorites",

    REQUEST_DELAY:
        250

};


/* =========================================================
   18 CHAPTERS
========================================================= */

const GITA_CHAPTERS = [

    [1,  "अर्जुनविषादयोग",                 47],
    [2,  "सांख्ययोग",                       72],
    [3,  "कर्मयोग",                         43],
    [4,  "ज्ञानकर्मसंन्यासयोग",             42],
    [5,  "कर्मसंन्यासयोग",                  29],
    [6,  "आत्मसंयमयोग",                     47],
    [7,  "ज्ञानविज्ञानयोग",                 30],
    [8,  "अक्षरब्रह्मयोग",                  28],
    [9,  "राजविद्याराजगुह्ययोग",            34],
    [10, "विभूतियोग",                       42],
    [11, "विश्वरूपदर्शनयोग",               55],
    [12, "भक्तियोग",                        20],
    [13, "क्षेत्रक्षेत्रज्ञविभागयोग",       34],
    [14, "गुणत्रयविभागयोग",                27],
    [15, "पुरुषोत्तमयोग",                   20],
    [16, "दैवासुरसम्पद्विभागयोग",          24],
    [17, "श्रद्धात्रयविभागयोग",            28],
    [18, "मोक्षसंन्यासयोग",                78]

];


/* =========================================================
   STATE
========================================================= */

let gita = {};

let allVerses = [];

let hindiData = null;

let currentVerseKey = null;

let isGitaLoaded = false;

let isGujaratiSaving = false;


/* =========================================================
   DOM HELPER
========================================================= */

function G$(id){

    return document.getElementById(id);

}


/* =========================================================
   SAFE HTML
========================================================= */

function esc(value){

    return String(value ?? "")

        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   TEXT NORMALIZER
========================================================= */

function cleanText(value){

    return String(value ?? "")
        .replace(/\r/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

}


/* =========================================================
   FIRST AVAILABLE VALUE
========================================================= */

function firstValue(object, keys){

    if(
        !object ||
        typeof object !== "object"
    ){

        return "";

    }


    for(
        const key of keys
    ){

        if(

            object[key] !== undefined &&

            object[key] !== null &&

            String(object[key]).trim() !== ""

        ){

            return object[key];

        }

    }


    return "";

}


/* =========================================================
   NORMALIZE ONE VERSE
========================================================= */

function normalizeVerse(row){

    if(
        !row ||
        typeof row !== "object"
    ){

        return null;

    }


    const chapter = Number(

        firstValue(
            row,
            [
                "chapter",
                "chapter_number",
                "chapterNumber",
                "chapter_no"
            ]
        )

    );


    const verse = Number(

        firstValue(
            row,
            [
                "verse",
                "verse_number",
                "verseNumber",
                "verse_no"
            ]
        )

    );


    const sanskrit = cleanText(

        firstValue(
            row,
            [
                "sanskrit",
                "devanagari",
                "slok",
                "shloka",
                "verse_text",
                "text"
            ]
        )

    );


    const english = cleanText(

        firstValue(
            row,
            [
                "english",
                "translation",
                "translation_en",
                "meaning",
                "english_meaning"
            ]
        )

    );


    if(
        !chapter ||
        !verse ||
        !sanskrit
    ){

        return null;

    }


    return {

        chapter,

        verse,

        key:
            `${chapter}-${verse}`,

        sanskrit,

        english

    };

}


/* =========================================================
   NORMALIZE COMPLETE DATA
========================================================= */

function normalizeGitaData(data){

    let rows = [];


    /* Array */

    if(
        Array.isArray(data)
    ){

        rows =
            data;

    }


    /* data.verses */

    else if(
        Array.isArray(data?.verses)
    ){

        rows =
            data.verses;

    }


    /* data.data */

    else if(
        Array.isArray(data?.data)
    ){

        rows =
            data.data;

    }


    /* Object */

    else if(
        data &&
        typeof data === "object"
    ){

        /* Chapters */

        if(
            Array.isArray(data.chapters)
        ){

            data.chapters.forEach(

                chapter => {

                    if(
                        !Array.isArray(
                            chapter?.verses
                        )
                    ){

                        return;

                    }


                    chapter.verses.forEach(

                        verse => {

                            rows.push({

                                ...verse,

                                chapter:
                                    verse.chapter ??
                                    chapter.chapter ??
                                    chapter.chapter_number

                            });

                        }

                    );

                }

            );

        }


        /* Key format 1-1 */

        if(
            !rows.length
        ){

            Object.entries(data)
            .forEach(

                ([key,value]) => {

                    if(

                        /^\d+-\d+$/
                        .test(key)

                        &&

                        value &&

                        typeof value === "object"

                    ){

                        const [
                            chapter,
                            verse
                        ] =
                            key.split("-");


                        rows.push({

                            ...value,

                            chapter:
                                value.chapter ??
                                chapter,

                            verse:
                                value.verse ??
                                verse

                        });

                    }

                }

            );

        }

    }


    return rows

        .map(normalizeVerse)

        .filter(Boolean)

        .sort(

            (a,b) =>

                a.chapter - b.chapter ||

                a.verse - b.verse

        );

}


/* =========================================================
   REMOVE DUPLICATES
========================================================= */

function removeDuplicateVerses(verses){

    const map =
        new Map();


    verses.forEach(

        verse => {

            if(
                !map.has(
                    verse.key
                )
            ){

                map.set(
                    verse.key,
                    verse
                );

            }

        }

    );


    return Array.from(
        map.values()
    );

}


/* =========================================================
   HINDI LOOKUP
========================================================= */

function findHindi(
    chapter,
    verse
){

    if(!hindiData){

        return "";

    }


    const key =
        `${chapter}-${verse}`;


    let item =
        null;


    /* Direct key */

    if(
        hindiData[key]
    ){

        item =
            hindiData[key];

    }


    /* Array */

    if(
        !item &&
        Array.isArray(
            hindiData
        )
    ){

        item =
            hindiData.find(

                row => {

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

                }

            );

    }


    /* verses */

    if(
        !item &&
        hindiData.verses
    ){

        const chapterData =
            hindiData.verses[chapter];


        if(
            chapterData
        ){

            item =
                chapterData[verse];

        }

    }


    /* chapters */

    if(
        !item &&
        hindiData.chapters
    ){

        const chapterData =
            hindiData.chapters[chapter];


        if(
            chapterData?.verses
        ){

            item =
                chapterData
                    .verses[verse];

        }

    }


    if(!item){

        return "";

    }


    if(
        typeof item === "string"
    ){

        return cleanText(item);

    }


    return cleanText(

        firstValue(
            item,
            [
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
            ]
        )

    );

}


/* =========================================================
   BUILD GITA OBJECT
========================================================= */

function buildGitaObject(){

    gita = {};


    allVerses.forEach(

        verse => {

            gita[
                verse.key
            ] = {

                ...verse,

                hindi:
                    findHindi(
                        verse.chapter,
                        verse.verse
                    )

            };

        }

    );


    window.gita =
        gita;

}


/* =========================================================
   CACHE
========================================================= */

function getGujaratiCache(){

    try{

        const raw =
            localStorage.getItem(
                SANSKRITAM_GITA.CACHE_KEY
            );


        if(!raw){

            return {};

        }


        const parsed =
            JSON.parse(raw);


        if(
            !parsed ||
            typeof parsed !== "object"
        ){

            return {};

        }


        return parsed;

    }

    catch(error){

        console.warn(
            "Gujarati cache read error",
            error
        );


        return {};

    }

}


/* =========================================================
   SAVE CACHE
========================================================= */

function saveGujaratiCache(cache){

    try{

        localStorage.setItem(

            SANSKRITAM_GITA.CACHE_KEY,

            JSON.stringify(cache)

        );


        return true;

    }

    catch(error){

        console.warn(
            "Gujarati cache storage error",
            error
        );


        return false;

    }

}


/* =========================================================
   CACHE COUNT
========================================================= */

function getGujaratiCacheCount(){

    return Object.keys(
        getGujaratiCache()
    ).length;

}


/* =========================================================
   ONLINE CHECK
========================================================= */

function isOnline(){

    return (
        navigator.onLine !== false
    );

}


/* =========================================================
   TRANSLATE ONE ENGLISH TEXT
========================================================= */

async function translateEnglishToGujarati(
    english
){

    if(
        !english ||
        !isOnline()
    ){

        return "";

    }


    const url =

        SANSKRITAM_GITA
            .GUJARATI_TRANSLATE_URL

        +

        "?client=gtx"

        +

        "&sl=en"

        +

        "&tl=gu"

        +

        "&dt=t"

        +

        "&q="

        +

        encodeURIComponent(
            english
        );


    const response =
        await fetch(

            url,

            {
                cache:"no-store"
            }

        );


    if(
        !response.ok
    ){

        throw new Error(
            "Translation HTTP error"
        );

    }


    const data =
        await response.json();


    if(
        !Array.isArray(data) ||
        !Array.isArray(data[0])
    ){

        return "";

    }


    return cleanText(

        data[0]
            .map(
                part =>
                    part?.[0] || ""
            )
            .join("")

    );

}


/* =========================================================
   TRANSLATE CURRENT VERSE
========================================================= */

async function translateGujarati(key){

    const verse =
        gita[key];


    const target =
        document.getElementById(
            `gu-${key}`
        );


    if(
        !verse ||
        !target
    ){

        return;

    }


    /* Cache */

    const cache =
        getGujaratiCache();


    if(
        cache[key]
    ){

        target.textContent =
            cache[key];

        return;

    }


    if(
        !verse.english
    ){

        target.textContent =
            "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

        return;

    }


    if(
        !isOnline()
    ){

        target.textContent =
            "📴 આ શ્લોકનો ગુજરાતી અર્થ Offline માં સાચવાયેલો નથી.";

        return;

    }


    target.textContent =
        "ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";


    try{

        const translated =
            await translateEnglishToGujarati(
                verse.english
            );


        if(!translated){

            throw new Error(
                "Empty translation"
            );

        }


        cache[key] =
            translated;


        saveGujaratiCache(
            cache
        );


        target.textContent =
            translated;


    }

    catch(error){

        console.error(
            "Gujarati translation:",
            error
        );


        target.textContent =
            "ગુજરાતી અર્થ મેળવવામાં સમસ્યા આવી. Internet ફરી તપાસો.";

    }

}


/* =========================================================
   UPDATE CACHE UI
========================================================= */

function updateCacheUI(){

    const count =
        getGujaratiCacheCount();


    const element =
        document.getElementById(
            "gitaCacheCount"
        );


    if(element){

        element.textContent =
            count;

    }

}


/* =========================================================
   SAVE ALL GUJARATI
========================================================= */

async function saveAllGujaratiOffline(){

    if(
        isGujaratiSaving
    ){

        return;

    }


    if(
        !allVerses.length
    ){

        showGitaToast(
            "પહેલા Gita load થવા દો."
        );

        return;

    }


    if(
        !isOnline()
    ){

        showGitaToast(
            "📴 Internet ચાલુ કરો."
        );

        return;

    }


    isGujaratiSaving =
        true;


    const cache =
        getGujaratiCache();


    const verses =
        allVerses.filter(

            verse =>

                verse.english &&

                !cache[verse.key]

        );


    if(
        !verses.length
    ){

        showGitaToast(
            "✅ બધા Gujarati અર્થ પહેલેથી Offline છે."
        );

        isGujaratiSaving =
            false;

        return;

    }


    const progress =
        document.getElementById(
            "gitaOfflineProgress"
        );


    if(progress){

        progress.style.display =
            "block";

    }


    let completed =
        0;


    for(
        const verse of verses
    ){

        if(
            !isOnline()
        ){

            break;

        }


        try{

            const translated =
                await translateEnglishToGujarati(
                    verse.english
                );


            if(
                translated
            ){

                cache[
                    verse.key
                ] =
                    translated;

            }


        }

        catch(error){

            console.warn(
                "Translation failed:",
                verse.key
            );

        }


        completed++;


        const percent =
            Math.round(
                (
                    completed /
                    verses.length
                ) * 100
            );


        if(progress){

            progress.innerHTML = `

                <div
                    style="
                    font-size:13px;
                    margin-bottom:6px;
                    "
                >

                    Gujarati Offline Save

                    ${completed}
                    /
                    ${verses.length}

                    (${percent}%)

                </div>


                <div
                    style="
                    height:8px;
                    background:#eadfc9;
                    border-radius:20px;
                    overflow:hidden;
                    "
                >

                    <div
                        style="
                        width:${percent}%;
                        height:100%;
                        background:#16803c;
                        transition:.2s;
                        "
                    ></div>

                </div>

            `;

        }


        saveGujaratiCache(
            cache
        );


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    SANSKRITAM_GITA
                        .REQUEST_DELAY
                )
        );

    }


    saveGujaratiCache(
        cache
    );


    updateCacheUI();


    if(progress){

        progress.innerHTML = `

            <div
                style="
                color:#16803c;
                font-weight:bold;
                "
            >

                ✅ Gujarati Offline Save Complete

            </div>

        `;

    }


    showGitaToast(
        `✅ ${getGujaratiCacheCount()} Gujarati અર્થ Offline Save થયા.`
    );


    isGujaratiSaving =
        false;

}


/* =========================================================
   GITA TOAST
========================================================= */

function showGitaToast(message){

    if(
        typeof window.toast ===
        "function"
    ){

        window.toast(
            message
        );

        return;

    }


    let element =
        document.getElementById(
            "gitaToast"
        );


    if(!element){

        element =
            document.createElement(
                "div"
            );


        element.id =
            "gitaToast";


        element.style.cssText = `

            position:fixed;

            left:50%;

            bottom:90px;

            transform:
                translateX(-50%);

            background:#342719;

            color:white;

            padding:12px 18px;

            border-radius:12px;

            z-index:9999;

            font:600 13px Arial;

            box-shadow:
                0 8px 25px
                rgba(0,0,0,.2);

        `;


        document.body.appendChild(
            element
        );

    }


    element.textContent =
        message;


    clearTimeout(
        window.__gitaToastTimer
    );


    window.__gitaToastTimer =
        setTimeout(

            () => {

                element.remove();

            },

            2500

        );

}


/* =========================================================
   GITA HEADER
========================================================= */

function gitaHeaderHTML(){

    const count =
        Math.min(
            allVerses.length,
            700
        );


    const cached =
        getGujaratiCacheCount();


    return `

        <div
            class="gita700-status"
        >

            <div
                style="
                font-size:22px;
                font-weight:bold;
                "
            >

                🕉️ Bhagavad Gita

            </div>


            <div
                style="
                margin-top:5px;
                color:#786b5a;
                font:13px Arial;
                "
            >

                18 અધ્યાય •
                ${count}/700 શ્લોક

            </div>


            <div
                style="
                display:grid;
                grid-template-columns:
                repeat(2,1fr);
                gap:8px;
                margin-top:15px;
                "
            >

                <button
                    type="button"
                    class="gita-offline-btn"
                    onclick="
                    saveAllGujaratiOffline()
                    "
                    style="
                    margin:0;
                    "
                >

                    📥 Gujarati Offline

                </button>


                <button
                    type="button"
                    onclick="
                    renderGita()
                    "
                    style="
                    margin:0;
                    "
                >

                    🔄 Refresh

                </button>

            </div>


            <div
                style="
                margin-top:10px;
                text-align:center;
                font:12px Arial;
                color:#786b5a;
                "
            >

                💾 Gujarati Offline:
                <b id="gitaCacheCount">
                    ${cached}
                </b>

            </div>


            <div
                id="gitaOfflineProgress"
                style="
                display:none;
                margin-top:12px;
                "
            ></div>

        </div>

    `;

}


/* =========================================================
   SEARCH
========================================================= */

function searchGita(){

    const input =
        document.getElementById(
            "gitaSearch"
        );


    const results =
        document.getElementById(
            "gitaSearchResults"
        );


    if(
        !input ||
        !results
    ){

        return;

    }


    const query =
        input.value
            .trim()
            .toLowerCase();


    if(!query){

        results.innerHTML =
            "";

        return;

    }


    const found =
        allVerses.filter(

            verse =>

                verse.sanskrit
                    .toLowerCase()
                    .includes(query)

                ||

                verse.english
                    .toLowerCase()
                    .includes(query)

                ||

                verse.hindi
                    .toLowerCase()
                    .includes(query)

                ||

                `${verse.chapter}.${verse.verse}`
                    .includes(query)

        ).slice(
            0,
            30
        );


    if(!found.length){

        results.innerHTML = `

            <div
                class="gita700-status"
                style="
                text-align:center;
                "
            >

                🔎 કોઈ શ્લોક મળ્યો નથી.

            </div>

        `;

        return;

    }


    results.innerHTML = `

        <div
            class="gita700-status"
        >

            <b>
                🔎 ${found.length}
                Result
            </b>


            <div
                style="
                margin-top:12px;
                "
            >

                ${
                    found
                    .map(

                        verse => `

                        <button
                            type="button"
                            onclick="
                            openGitaVerse(
                            '${verse.key}'
                            )
                            "
                            style="
                            display:block;
                            width:100%;
                            text-align:left;
                            margin:6px 0;
                            "
                        >

                            📖
                            ${verse.chapter}.${verse.verse}

                            —
                            ${esc(
                                verse.sanskrit
                                    .slice(0,80)
                            )}

                        </button>

                        `

                    )
                    .join("")
                }

            </div>

        </div>

    `;

}


/* =========================================================
   CHAPTER FILTER
========================================================= */

function gitaChapterSelector(){

    return `

        <div
            style="
            margin-bottom:15px;
            "
        >

            <input
                id="gitaSearch"
                type="search"
                placeholder="
                🔍 શ્લોક શોધો...
                "
                oninput="
                searchGita()
                "
                style="
                width:100%;
                padding:13px 15px;
                border:1px solid #e7d9bc;
                border-radius:15px;
                background:#fffaf0;
                outline:none;
                "
            >


            <div
                id="gitaSearchResults"
            ></div>

        </div>

    `;

}


/* =========================================================
   RENDER CHAPTERS
========================================================= */

function renderGitaChapters(){

    let html = "";


    GITA_CHAPTERS.forEach(

        data => {

            const [
                chapter,
                name,
                count
            ] =
                data;


            const available =
                GITA_CHAPTERS_COUNT(
                    chapter,
                    count
                );


            html += `

                <div
                    class="gita700-chapter"
                >

                    <div
                        style="
                        display:flex;
                        justify-content:
                        space-between;
                        align-items:center;
                        gap:10px;
                        "
                    >

                        <h3>

                            અધ્યાય
                            ${chapter}

                            <br>

                            <span
                                style="
                                font-size:14px;
                                color:#786b5a;
                                "
                            >

                                ${esc(name)}

                            </span>

                        </h3>


                        <span
                            style="
                            font:12px Arial;
                            color:#786b5a;
                            "
                        >

                            ${available}/${count}

                        </span>

                    </div>


                    <div
                        class="gita700-grid"
                    >

            `;


            for(
                let verse = 1;
                verse <= count;
                verse++
            ){

                const key =
                    `${chapter}-${verse}`;


                if(
                    gita[key]
                ){

                    html += `

                        <button
                            type="button"
                            class="gita700-btn"
                            onclick="
                            openGitaVerse(
                            '${key}'
                            )
                            "
                        >

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


    return html;

}


/* =========================================================
   AVAILABLE VERSE COUNT
========================================================= */

function GITA_CHAPTERS_COUNT(
    chapter,
    expected
){

    let count = 0;


    for(
        let i=1;
        i<=expected;
        i++
    ){

        if(
            gita[
                `${chapter}-${i}`
            ]
        ){

            count++;

        }

    }


    return count;

}


/* =========================================================
   RENDER COMPLETE GITA
========================================================= */

function renderGita(){

    const section =
        document.getElementById(
            "gita"
        );


    if(!section){

        console.error(
            "SANSKRITAM: #gita not found."
        );

        return;

    }


    let box =
        document.getElementById(
            "gita700List"
        );


    if(!box){

        box =
            document.createElement(
                "div"
            );


        box.id =
            "gita700List";


        section.appendChild(
            box
        );

    }


    if(
        !allVerses.length
    ){

        box.innerHTML = `

            <div
                class="gita700-status"
            >

                <div
                    style="
                    text-align:center;
                    padding:25px;
                    "
                >

                    📖

                    <br><br>

                    Bhagavad Gita
                    loading...

                </div>

            </div>

        `;

        return;

    }


    box.innerHTML =

        gitaHeaderHTML()

        +

        gitaChapterSelector()

        +

        renderGitaChapters();


    updateCacheUI();

}


/* =========================================================
   PREVIOUS / NEXT
========================================================= */

function getVerseIndex(key){

    return allVerses.findIndex(
        verse =>
            verse.key === key
    );

}


function openPreviousVerse(){

    if(
        !currentVerseKey
    ){

        return;

    }


    const index =
        getVerseIndex(
            currentVerseKey
        );


    if(
        index <= 0
    ){

        showGitaToast(
            "આ પહેલો શ્લોક છે."
        );

        return;

    }


    openGitaVerse(
        allVerses[index - 1].key
    );

}


function openNextVerse(){

    if(
        !currentVerseKey
    ){

        return;

    }


    const index =
        getVerseIndex(
            currentVerseKey
        );


    if(
        index < 0 ||
        index >=
        allVerses.length - 1
    ){

        showGitaToast(
            "આ છેલ્લો શ્લોક છે."
        );

        return;

    }


    openGitaVerse(
        allVerses[index + 1].key
    );

}


/* =========================================================
   OPEN VERSE
========================================================= */

function openGitaVerse(key){

    const verse =
        gita[key];


    if(!verse){

        showGitaToast(
            "આ શ્લોક ઉપલબ્ધ નથી."
        );

        return;

    }


    currentVerseKey =
        key;


    const oldReader =
        document.getElementById(
            "gitaVerseReader"
        );


    if(oldReader){

        oldReader.remove();

    }


    const reader =
        document.createElement(
            "div"
        );


    reader.id =
        "gitaVerseReader";


    reader.className =
        "gita700-reader";


    const index =
        getVerseIndex(
            key
        );


    const isFirst =
        index <= 0;


    const isLast =
        index >=
        allVerses.length - 1;


    reader.innerHTML = `

        <div
            onclick="
            document
            .getElementById(
                'gitaVerseReader'
            )
            ?.remove()
            "
            style="
            cursor:pointer;
            color:#a96808;
            font:700 13px Arial;
            margin-bottom:15px;
            "
        >

            ← શ્લોક સૂચિ

        </div>


        <div
            style="
            font-size:21px;
            font-weight:bold;
            "
        >

            📖 Bhagavad Gita

        </div>


        <div
            style="
            font-size:16px;
            color:#a96808;
            margin-top:5px;
            "
        >

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

            ${esc(
                verse.sanskrit
            )}

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

                esc(
                    verse.english
                )

                :

                "English meaning उपलब्ध નથી."
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

                esc(
                    verse.hindi
                )

                :

                "हिन्दी अर्थ उपलब्ध નથી."
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

            ગુજરાતી અર્થ
            મેળવવામાં આવી રહ્યો છે...

        </p>


        <div
            style="
            display:grid;
            grid-template-columns:
            repeat(2,1fr);
            gap:8px;
            margin-top:15px;
            "
        >


            <button
                type="button"
                onclick="
                saveGitaFavorite(
                '${key}'
                )
                "
            >

                ❤️ Favorite

            </button>


            <button
                type="button"
                onclick="
                speakGita(
                '${key}'
                )
                "
            >

                🔊 સાંભળો

            </button>


            <button
                type="button"
                onclick="
                shareGita(
                '${key}'
                )
                "
            >

                📤 Share

            </button>


            <button
                type="button"
                onclick="
                copyGita(
                '${key}'
                )
                "
            >

                📋 Copy

            </button>

        </div>


        <div
            style="
            display:grid;
            grid-template-columns:
            repeat(2,1fr);
            gap:8px;
            margin-top:10px;
            "
        >


            <button
                type="button"
                ${isFirst ? "disabled" : ""}
                onclick="
                openPreviousVerse()
                "
            >

                ← Previous

            </button>


            <button
                type="button"
                ${isLast ? "disabled" : ""}
                onclick="
                openNextVerse()
                "
            >

                Next →

            </button>

        </div>

    `;


    const section =
        document.getElementById(
            "gita"
        );


    const list =
        document.getElementById(
            "gita700List"
        );


    if(list){

        section.insertBefore(
            reader,
            list
        );

    }

    else{

        section.appendChild(
            reader
        );

    }


    translateGujarati(
        key
    );


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}


/* =========================================================
   FAVORITE
========================================================= */

function saveGitaFavorite(key){

    const verse =
        gita[key];


    if(!verse){

        return;

    }


    let favorites = [];


    try{

        favorites =
            JSON.parse(

                localStorage.getItem(
                    SANSKRITAM_GITA
                        .FAVORITE_KEY
                ) || "[]"

            );

    }

    catch{

        favorites =
            [];

    }


    const item = {

        key:
            key,

        text:
            verse.sanskrit,

        chapter:
            verse.chapter,

        verse:
            verse.verse

    };


    const exists =
        favorites.some(

            favorite =>
                (
                    typeof favorite ===
                    "object"
                )

                ?

                favorite.key ===
                key

                :

                String(favorite)
                    .includes(key)

        );


    if(
        !exists
    ){

        favorites.push(
            item
        );


        localStorage.setItem(

            SANSKRITAM_GITA
                .FAVORITE_KEY,

            JSON.stringify(
                favorites
            )

        );


        showGitaToast(
            "❤️ Favorite Saved"
        );

    }

    else{

        showGitaToast(
            "❤️ Already in Favorites"
        );

    }

}


/* =========================================================
   COPY
========================================================= */

async function copyGita(key){

    const verse =
        gita[key];


    if(!verse){

        return;

    }


    const text =

        `Bhagavad Gita ${verse.chapter}.${verse.verse}

${verse.sanskrit}

${verse.english || ""}

${verse.hindi || ""}`;


    try{

        await navigator
            .clipboard
            .writeText(
                text
            );


        showGitaToast(
            "📋 Shlok copied"
        );

    }

    catch{

        showGitaToast(
            "Copy supported નથી."
        );

    }

}


/* =========================================================
   SHARE
========================================================= */

async function shareGita(key){

    const verse =
        gita[key];


    if(!verse){

        return;

    }


    const text =

        `🕉️ Bhagavad Gita
${verse.chapter}.${verse.verse}

${verse.sanskrit}`;


    try{

        if(
            navigator.share
        ){

            await navigator.share({

                title:
                    "SANSKRITAM",

                text:
                    text

            });

        }

        else{

            await navigator
                .clipboard
                .writeText(
                    text
                );


            showGitaToast(
                "📋 Shlok copied"
            );

        }

    }

    catch{

    }

}


/* =========================================================
   SPEECH
========================================================= */

function speakGita(key){

    const verse =
        gita[key];


    if(!verse){

        return;

    }


    if(
        !(
            "speechSynthesis"
            in window
        )
    ){

        showGitaToast(
            "🔊 Speech available નથી."
        );

        return;

    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            verse.sanskrit
        );


    utterance.lang =
        "hi-IN";


    utterance.rate =
        .78;


    utterance.pitch =
        1;


    speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   NETWORK STATUS
========================================================= */

function updateNetworkStatus(){

    const online =
        isOnline();


    const element =
        document.getElementById(
            "gitaNetworkStatus"
        );


    if(element){

        element.innerHTML = online

            ?

            "🟢 Online"

            :

            "🔴 Offline";

    }

}


window.addEventListener(
    "online",
    function(){

        updateNetworkStatus();

        showGitaToast(
            "🟢 Internet connected"
        );

    }
);


window.addEventListener(
    "offline",
    function(){

        updateNetworkStatus();

        showGitaToast(
            "📴 Offline mode"
        );

    }
);


/* =========================================================
   LOAD GITA
========================================================= */

async function loadGita(){

    injectProfessionalGitaStyles();


    const box =
        document.getElementById(
            "gita700List"
        );


    if(box){

        box.innerHTML = `

            <div
                class="gita700-status"
            >

                <div
                    style="
                    text-align:center;
                    padding:25px;
                    "
                >

                    🕉️

                    <br><br>

                    <b>
                        Bhagavad Gita
                    </b>

                    <br>

                    <span
                        style="
                        color:#786b5a;
                        font:13px Arial;
                        "
                    >

                        700 Shlokas loading...

                    </span>

                </div>

            </div>

        `;

    }


    try{

        const response =
            await fetch(

                SANSKRITAM_GITA
                    .DATA_URL,

                {
                    cache:
                        "force-cache"
                }

            );


        if(
            !response.ok
        ){

            throw new Error(
                "Gita data HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        let verses =
            normalizeGitaData(
                data
            );


        verses =
            removeDuplicateVerses(
                verses
            );


        /*
         * Standard Bhagavad Gita
         * has 700 verses.
         */

        if(
            verses.length > 700
        ){

            verses =
                verses
                    .filter(
                        verse =>

                        !(
                            verse.chapter === 13 &&
                            verse.verse === 1
                        )

                    )
                    .slice(
                        0,
                        700
                    );

        }


        allVerses =
            verses;


        /* Hindi */

        try{

            const hindiResponse =
                await fetch(

                    SANSKRITAM_GITA
                        .HINDI_URL,

                    {
                        cache:
                            "force-cache"
                    }

                );


            if(
                hindiResponse.ok
            ){

                hindiData =
                    await hindiResponse.json();

            }

        }

        catch(error){

            console.warn(
                "Hindi data unavailable",
                error
            );

            hindiData =
                null;

        }


        buildGitaObject();


        isGitaLoaded =
            true;


        renderGita();


        console.log(

            "🪷 SANSKRITAM GITA:",

            allVerses.length,

            "verses loaded"

        );

    }

    catch(error){

        console.error(
            "GITA LOAD ERROR:",
            error
        );


        if(box){

            box.innerHTML = `

                <div
                    class="gita700-status"
                >

                    <div
                        style="
                        text-align:center;
                        padding:20px;
                        "
                    >

                        ⚠️

                        <br><br>

                        <b>
                            ભગવદ્ ગીતા
                            લોડ થઈ શકી નથી.
                        </b>

                        <br><br>

                        <span
                            style="
                            font:13px Arial;
                            color:#786b5a;
                            "
                        >

                            Internet connection
                            તપાસો.

                        </span>

                        <br><br>

                        <button
                            type="button"
                            class="primary"
                            onclick="
                            loadGita()
                            "
                        >

                            🔄 Retry

                        </button>

                    </div>

                </div>

            `;

        }

    }

}


/* =========================================================
   PROFESSIONAL STYLES
========================================================= */

function injectProfessionalGitaStyles(){

    if(
        document.getElementById(
            "sanskritam-gita-pro-style"
        )
    ){

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "sanskritam-gita-pro-style";


    style.textContent = `

        .gita700-status{

            background:#fffaf0;

            border:
                1px solid
                #e7d9bc;

            border-radius:20px;

            padding:18px;

            margin:14px 0;

            box-shadow:
                0 6px 20px
                rgba(0,0,0,.06);

        }


        .gita700-chapter{

            background:#fffaf0;

            border:
                1px solid
                #e7d9bc;

            border-radius:20px;

            padding:18px;

            margin:16px 0;

            box-shadow:
                0 6px 20px
                rgba(0,0,0,.06);

        }


        .gita700-chapter h3{

            margin:0 0 16px;

            color:#342719;

            line-height:1.5;

        }


        .gita700-grid{

            display:grid;

            grid-template-columns:
                repeat(3,1fr);

            gap:9px;

        }


        .gita700-btn{

            border:0;

            border-radius:13px;

            padding:12px 5px;

            background:
                linear-gradient(
                    135deg,
                    #b87909,
                    #965f07
                );

            color:white;

            font:

                700 12px
                Arial;

            cursor:pointer;

            transition:
                transform .15s,
                box-shadow .15s;

        }


        .gita700-btn:active{

            transform:
                scale(.96);

        }


        .gita700-reader{

            background:#fffaf0;

            border:
                1px solid
                #e7d9bc;

            border-radius:22px;

            padding:20px;

            margin:18px 0;

            box-shadow:
                0 10px 28px
                rgba(73,48,15,.10);

        }


        .gita700-sanskrit{

            font-size:23px;

            line-height:1.9;

            white-space:pre-line;

            color:#342719;

        }


        .gita700-meaning{

            font:
                16px/1.8
                Arial,
                sans-serif;

            color:#493c2d;

        }


        .gita-offline-btn{

            border:0;

            border-radius:14px;

            padding:13px;

            background:
                linear-gradient(
                    135deg,
                    #16803c,
                    #10652f
                );

            color:white;

            font:
                700 13px
                Arial;

            cursor:pointer;

        }


        .gita-offline-btn:disabled{

            opacity:.6;

        }


        #gitaOfflineProgress{

            background:#f1e5ca;

            border-radius:14px;

            padding:10px;

        }


        #gitaSearch{

            width:100%;

            padding:13px 15px;

            border:
                1px solid
                #e7d9bc;

            border-radius:15px;

            background:#fffaf0;

            outline:none;

            font:
                14px
                Arial;

            color:#342719;

        }


        #gitaSearch:focus{

            border-color:
                #b87909;

            box-shadow:
                0 0 0 3px
                rgba(184,121,9,.10);

        }


        @media(max-width:360px){

            .gita700-grid{

                grid-template-columns:
                    repeat(2,1fr);

            }


            .gita700-sanskrit{

                font-size:20px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   START
========================================================= */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(

        "DOMContentLoaded",

        loadGita

    );

}

else{

    loadGita();

}