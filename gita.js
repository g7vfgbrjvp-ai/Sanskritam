/* =========================================================
   SANSKRITAM — BHAGAVAD GITA 700 SHLOKA ENGINE
   ========================================================= */

const GITA_DATA_URL =
"https://cdn.jsdelivr.net/gh/ChiragMirani/gita-quotes@main/docs/data.json";

const GITA_HINDI_URL =
"https://raw.githubusercontent.com/kashishkhullar/gita_json/master/gita.json";


/* ================= CHAPTERS ================= */

const GITA_CHAPTERS = [
    [1,"अर्जुनविषादयोग",47],
    [2,"सांख्ययोग",72],
    [3,"कर्मयोग",43],
    [4,"ज्ञानकर्मसंन्यासयोग",42],
    [5,"कर्मसंन्यासयोग",29],
    [6,"आत्मसंयमयोग",47],
    [7,"ज्ञानविज्ञानयोग",30],
    [8,"अक्षरब्रह्मयोग",28],
    [9,"राजविद्याराजगुह्ययोग",34],
    [10,"विभूतियोग",42],
    [11,"विश्वरूपदर्शनयोग",55],
    [12,"भक्तियोग",20],
    [13,"क्षेत्रक्षेत्रज्ञविभागयोग",34],
    [14,"गुणत्रयविभागयोग",27],
    [15,"पुरुषोत्तमयोग",20],
    [16,"दैवासुरसम्पद्विभागयोग",24],
    [17,"श्रद्धात्रयविभागयोग",28],
    [18,"मोक्षसंन्यासयोग",78]
];


let gita = {};
let allVerses = [];
let hindiData = null;


/* =========================================================
   SAFE HTML
   ========================================================= */

function esc(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* =========================================================
   NORMALIZE SINGLE VERSE
   ========================================================= */

function normalizeRow(row){

    const chapter = Number(
        row?.chapter ??
        row?.chapter_number ??
        row?.chapterNumber
    );

    const verse = Number(
        row?.verse ??
        row?.verse_number ??
        row?.verseNumber
    );

    const sanskrit =
        row?.sanskrit ??
        row?.text ??
        row?.devanagari ??
        row?.slok ??
        row?.verse_text ??
        "";

    const english =
        row?.english ??
        row?.translation ??
        row?.meaning ??
        row?.translation_en ??
        "";

    if(!chapter || !verse || !sanskrit){

        return null;

    }

    return {

        chapter: chapter,

        verse: verse,

        key: `${chapter}-${verse}`,

        sanskrit: String(sanskrit).trim(),

        english: String(english || "").trim()

    };

}


/* =========================================================
   NORMALIZE GITA DATA
   ========================================================= */

function normalizeData(data){

    let rows = [];

    if(Array.isArray(data)){

        rows = data;

    }

    else if(Array.isArray(data?.verses)){

        rows = data.verses;

    }

    else if(Array.isArray(data?.data)){

        rows = data.data;

    }

    else if(data && typeof data === "object"){

        if(Array.isArray(data.chapters)){

            data.chapters.forEach(function(chapter){

                if(Array.isArray(chapter.verses)){

                    rows.push(...chapter.verses);

                }

            });

        }

        if(!rows.length){

            Object.entries(data).forEach(function([key,value]){

                if(
                    /^\d+-\d+$/.test(key) &&
                    value &&
                    typeof value === "object"
                ){

                    const parts = key.split("-");

                    rows.push({

                        ...value,

                        chapter:
                            value.chapter ?? parts[0],

                        verse:
                            value.verse ?? parts[1]

                    });

                }

            });

        }

    }

    return rows

        .map(normalizeRow)

        .filter(Boolean)

        .sort(function(a,b){

            return (
                a.chapter - b.chapter ||
                a.verse - b.verse
            );

        });

}


/* =========================================================
   FIND HINDI MEANING
   ========================================================= */

function findHindi(chapter,verse){

    if(!hindiData){

        return "";

    }

    const key =
        `${chapter}-${verse}`;

    let item = null;


    /* Format 1 */

    if(hindiData[key]){

        item =
            hindiData[key];

    }


    /* Format 2 */

    else if(
        hindiData.verses?.[chapter]?.[verse]
    ){

        item =
            hindiData.verses[chapter][verse];

    }


    /* Format 3 */

    else if(
        hindiData.chapters?.[chapter]?.verses?.[verse]
    ){

        item =
            hindiData.chapters[chapter].verses[verse];

    }


    /* Format 4 — Array */

    else if(Array.isArray(hindiData)){

        item =
            hindiData.find(function(row){

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


    if(!item){

        return "";

    }


    /* Direct Hindi string */

    if(typeof item === "string"){

        return item.trim();

    }


    /* Common Hindi fields */

    return String(

        item.meaning_hindi ??
        item.hindi_meaning ??
        item.hindiMeaning ??
        item.verse_meaning_hindi ??
        item.translation_hindi ??
        item.translation ??
        item.meaning ??
        item.hindi ??
        item.text_hindi ??
        item.text ??
        ""

    ).trim();

}


/* =========================================================
   BUILD GITA OBJECT
   ========================================================= */

function buildObject(){

    gita = {};

    allVerses.forEach(function(verse){

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

function injectStyles(){

    if(
        document.getElementById(
            "sanskritam-gita-style"
        )
    ){

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "sanskritam-gita-style";


    style.textContent = `

        #gita700List{
            margin-top:14px;
        }

        .gita700-status,
        .gita700-reader,
        .gita700-chapter{

            background:#fffaf0;

            border:1px solid #e7d9bc;

            border-radius:18px;

            padding:16px;

            margin:14px 0;

            box-shadow:0 5px 18px #00000012;

        }

        .gita700-grid{

            display:grid;

            grid-template-columns:
            repeat(3,1fr);

            gap:8px;

        }

        .gita700-btn{

            border:0;

            border-radius:12px;

            padding:10px 5px;

            background:#b87909;

            color:white;

            font-weight:bold;

            cursor:pointer;

        }

        .gita700-sanskrit{

            font-size:22px;

            line-height:1.8;

            white-space:pre-line;

        }

        .gita700-meaning{

            font-family:Arial,sans-serif;

            font-size:16px;

            line-height:1.7;

        }

        .gita700-reader h3{

            margin-top:18px;

        }

        @media(max-width:360px){

            .gita700-grid{

                grid-template-columns:
                repeat(2,1fr);

            }

        }

    `;


    document.head.appendChild(style);

}


/* =========================================================
   CREATE SHLOKA LIST
   ========================================================= */

function ensureList(){

    const section =
        document.getElementById("gita");


    if(!section){

        return null;

    }


    let box =
        document.getElementById(
            "gita700List"
        );


    if(box){

        return box;

    }


    box =
        document.createElement("div");


    box.id =
        "gita700List";


    const heading =
        section.querySelector("h2");


    if(heading){

        heading.insertAdjacentElement(
            "afterend",
            box
        );

    }

    else{

        section.appendChild(box);

    }


    return box;

}


/* =========================================================
   RENDER ALL 18 CHAPTERS / 700 SHLOKAS
   ========================================================= */

function renderGita(){

    const box =
        ensureList();


    if(!box){

        return;

    }


    if(!allVerses.length){

        box.innerHTML = `

            <div class="gita700-status">

                📖 શ્લોકો લોડ થઈ રહ્યા છે...

            </div>

        `;

        return;

    }


    let html = `

        <div class="gita700-status">

            📚 ભગવદ્ ગીતા —
            18 અધ્યાય •
            ${Math.min(allVerses.length,700)}
            શ્લોક

        </div>

    `;


    GITA_CHAPTERS.forEach(
        function([chapter,name,count]){

            html += `

                <div class="gita700-chapter">

                    <h3>
                        અધ્યાય ${chapter}
                        —
                        ${esc(name)}
                    </h3>

                    <div class="gita700-grid">

            `;


            for(
                let verse = 1;
                verse <= count;
                verse++
            ){

                const key =
                    `${chapter}-${verse}`;


                if(gita[key]){

                    html += `

                        <button
                            class="gita700-btn"
                            onclick="
                                openGitaVerse('${key}')
                            "
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
   GUJARATI TRANSLATION
   ========================================================= */

async function translateGujarati(key){

    const verse =
        gita[key];


    const target =
        document.getElementById(
            `gu-${key}`
        );


    if(!verse || !target){

        return;

    }


    target.textContent =
        "ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";


    if(!verse.english){

        target.textContent =
            "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

        return;

    }


    try{

        const url =
            "https://translate.googleapis.com/translate_a/single" +
            "?client=gtx" +
            "&sl=en" +
            "&tl=gu" +
            "&dt=t" +
            "&q=" +
            encodeURIComponent(
                verse.english
            );


        const response =
            await fetch(url);


        if(!response.ok){

            throw new Error(
                "Translation failed"
            );

        }


        const data =
            await response.json();


        let translated = "";


        if(
            Array.isArray(data) &&
            Array.isArray(data[0])
        ){

            translated =
                data[0]
                    .map(function(part){

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


        if(translated.trim()){

            target.textContent =
                translated.trim();

        }

        else{

            target.textContent =
                "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

        }

    }

    catch(error){

        console.error(
            "Gujarati Translation Error:",
            error
        );


        target.textContent =
            "ગુજરાતી અર્થ મેળવવામાં સમસ્યા આવી. Internet ચાલુ રાખો.";

    }

}


/* =========================================================
   OPEN ONE SHLOKA
   ========================================================= */

function openGitaVerse(key){

    const verse =
        gita[key];


    if(!verse){

        alert(
            "આ શ્લોક હાલમાં ઉપલબ્ધ નથી."
        );

        return;

    }


    document
        .getElementById(
            "gitaVerseReader"
        )
        ?.remove();


    const reader =
        document.createElement("div");


    reader.id =
        "gitaVerseReader";


    reader.className =
        "gita700-reader";


    reader.innerHTML = `

        <div
            class="back"
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


        <div class="source">

            અધ્યાય ${verse.chapter}
            •
            શ્લોક ${verse.verse}

        </div>


        <hr>


        <h3>
            🕉️ संस्कृत श्लोक
        </h3>


        <div class="gita700-sanskrit">

            ${esc(verse.sanskrit)}

        </div>


        <hr>


        <h3>
            🇬🇧 English Meaning
        </h3>


        <p class="gita700-meaning">

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


        <p class="gita700-meaning">

            ${
                verse.hindi
                ?
                esc(verse.hindi)
                :
                "हिन्दी अर्थ उपलब्ध नहीं है।"
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
            class="primary"
            onclick="
                saveGitaFavorite('${key}')
            "
        >

            ❤️ Favorite

        </button>

    `;


    const section =
        document.getElementById("gita");


    const list =
        document.getElementById(
            "gita700List"
        );


    if(section){

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

    }


    /* Gujarati translation */

    translateGujarati(key);


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}


/* =========================================================
   SAVE FAVORITE
   ========================================================= */

function saveGitaFavorite(key){

    const verse =
        gita[key];


    if(!verse){

        return;

    }


    let favorites =
        JSON.parse(

            localStorage.getItem(
                "sanskritamFavorites"
            )

            || "[]"

        );


    const item =
        `${key} — ${verse.sanskrit}`;


    if(!favorites.includes(item)){

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

async function loadGita(){

    injectStyles();

    renderGita();


    try{

        const response =
            await fetch(

                GITA_DATA_URL,

                {
                    cache:"force-cache"
                }

            );


        if(!response.ok){

            throw new Error(
                "Gita data loading failed"
            );

        }


        allVerses =
            normalizeData(
                await response.json()
            );


        /*
          Standard Bhagavad Gita =
          700 Shlokas.
        */

        if(allVerses.length > 700){

            allVerses =
                allVerses

                .filter(function(verse){

                    return !(
                        verse.chapter === 13 &&
                        verse.verse === 1
                    );

                })

                .slice(0,700);

        }


        /* ================= HINDI DATA ================= */

        try{

            const hindiResponse =
                await fetch(

                    GITA_HINDI_URL,

                    {
                        cache:"force-cache"
                    }

                );


            if(hindiResponse.ok){

                hindiData =
                    await hindiResponse.json();

            }

        }

        catch(error){

            console.log(
                "Hindi data unavailable:",
                error
            );

        }


        /* Build */

        buildObject();


        /* Render */

        renderGita();


        console.log(

            "SANSKRITAM: " +
            allVerses.length +
            " Gita verses loaded."

        );

    }


    catch(error){

        console.error(
            "GITA LOAD ERROR:",
            error
        );


        const box =
            ensureList();


        if(box){

            box.innerHTML = `

                <div class="gita700-status">

                    ⚠️ <b>
                    શ્લોકો લોડ થઈ શક્યા નથી.
                    </b>

                    <br><br>

                    Internet ચાલુ કરીને
                    page ફરી ખોલો.

                </div>

            `;

        }

    }

}


/* =========================================================
   START
   ========================================================= */

if(
    document.readyState === "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        loadGita
    );

}

else{

    loadGita();

}