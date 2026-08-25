/* =========================================================
   SANSKRITAM — BHAGAVAD GITA 700 SHLOKA ENGINE
   Sanskrit + English + Hindi + Gujarati
   ========================================================= */

const GITA_DATA_URL =
"https://cdn.jsdelivr.net/gh/ChiragMirani/gita-quotes@main/docs/data.json";

const GITA_HINDI_URL =
"const GITA_HINDI_URL =
"https://raw.githubusercontent.com/kashishkhullar/gita_json/master/dataset.json";


/* =========================================================
   18 CHAPTERS
   ========================================================= */

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
   GET VALUE
   ========================================================= */

function firstValue(obj, keys){

    if(!obj || typeof obj !== "object"){
        return "";
    }

    for(const key of keys){

        if(
            obj[key] !== undefined &&
            obj[key] !== null &&
            String(obj[key]).trim() !== ""
        ){

            return obj[key];

        }

    }

    return "";

}


/* =========================================================
   NORMALIZE ONE VERSE
   ========================================================= */

function normalizeRow(row){

    if(!row || typeof row !== "object"){
        return null;
    }

    const chapter = Number(
        firstValue(row,[
            "chapter",
            "chapter_number",
            "chapterNumber",
            "chapter_no"
        ])
    );

    const verse = Number(
        firstValue(row,[
            "verse",
            "verse_number",
            "verseNumber",
            "verse_no"
        ])
    );

    const sanskrit = firstValue(row,[
        "sanskrit",
        "devanagari",
        "slok",
        "shloka",
        "verse_text",
        "text"
    ]);

    const english = firstValue(row,[
        "english",
        "translation",
        "translation_en",
        "meaning",
        "english_meaning"
    ]);

    if(!chapter || !verse || !sanskrit){
        return null;
    }

    return {

        chapter: chapter,

        verse: verse,

        key: `${chapter}-${verse}`,

        sanskrit:
            String(sanskrit).trim(),

        english:
            String(english || "").trim(),

        hindi: "",

        gujarati: ""

    };

}


/* =========================================================
   NORMALIZE DATA
   ========================================================= */

function normalizeData(data){

    let rows = [];


    /* Array */

    if(Array.isArray(data)){

        rows = data;

    }


    /* verses */

    else if(Array.isArray(data?.verses)){

        rows = data.verses;

    }


    /* data */

    else if(Array.isArray(data?.data)){

        rows = data.data;

    }


    /* chapters */

    else if(
        data &&
        typeof data === "object"
    ){

        if(Array.isArray(data.chapters)){

            data.chapters.forEach(
                function(chapter){

                    if(
                        Array.isArray(
                            chapter?.verses
                        )
                    ){

                        chapter.verses.forEach(
                            function(verse){

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

                }
            );

        }


        /* 1-1 format */

        if(!rows.length){

            Object.entries(data).forEach(
                function([key,value]){

                    if(
                        /^\d+-\d+$/.test(key) &&
                        value &&
                        typeof value === "object"
                    ){

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

        .sort(
            function(a,b){

                return (
                    a.chapter - b.chapter ||
                    a.verse - b.verse
                );

            }
        );

}


/* =========================================================
   FIND HINDI MEANING
   ========================================================= */

function findHindi(chapter, verse){

    if(!hindiData){
        return "";
    }

    const key =
        `${chapter}-${verse}`;

    let item = null;


    /* Direct key */

    if(hindiData[key]){
        item = hindiData[key];
    }


    /* verses */

    if(
        !item &&
        hindiData.verses &&
        hindiData.verses[chapter] &&
        hindiData.verses[chapter][verse]
    ){

        item =
            hindiData.verses[chapter][verse];

    }


    /* chapters */

    if(
        !item &&
        hindiData.chapters &&
        hindiData.chapters[chapter]
    ){

        const ch =
            hindiData.chapters[chapter];

        if(
            ch.verses &&
            ch.verses[verse]
        ){

            item =
                ch.verses[verse];

        }

    }


    /* Array */

    if(
        !item &&
        Array.isArray(hindiData)
    ){

        item =
            hindiData.find(
                function(row){

                    const c = Number(
                        row?.chapter ??
                        row?.chapter_number ??
                        row?.chapterNumber
                    );

                    const v = Number(
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


    if(!item){
        return "";
    }


    if(typeof item === "string"){
        return item.trim();
    }


    const hindi =
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
        );


    return String(hindi || "").trim();

}


/* =========================================================
   BUILD GITA
   ========================================================= */

function buildObject(){

    gita = {};

    allVerses.forEach(
        function(verse){

            gita[verse.key] = {

                ...verse,

                hindi:
                    findHindi(
                        verse.chapter,
                        verse.verse
                    ),

                gujarati: ""

            };

        }
    );

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
            margin-top:18px;
        }


        .gita700-status,
        .gita700-chapter,
        .gita700-reader{

            background:#fffaf0;

            border:1px solid #e7d9bc;

            border-radius:20px;

            padding:18px;

            margin:18px 0;

            box-shadow:
                0 5px 18px #00000012;

        }


        .gita700-status{

            font-size:17px;

        }


        .gita700-chapter h3{

            font-size:21px;

            margin-top:0;

            margin-bottom:18px;

        }


        .gita700-grid{

            display:grid;

            grid-template-columns:
            repeat(3,1fr);

            gap:10px;

        }


        .gita700-btn{

            border:0;

            border-radius:14px;

            padding:13px 5px;

            background:#b87909;

            color:#fff;

            font-size:14px;

            font-weight:bold;

            cursor:pointer;

        }


        .gita700-btn:active{

            transform:scale(.97);

        }


        .gita700-reader h2{

            font-size:24px;

        }


        .gita700-reader h3{

            margin-top:20px;

            margin-bottom:8px;

        }


        .gita700-sanskrit{

            font-size:23px;

            line-height:1.9;

            white-space:pre-line;

            font-family:Georgia,serif;

        }


        .gita700-meaning{

            font-family:Arial,sans-serif;

            font-size:17px;

            line-height:1.8;

        }


        .gita700-hindi{

            font-family:
                Arial,
                "Noto Sans Devanagari",
                sans-serif;

            font-size:18px;

            line-height:1.9;

        }


        .gita700-gujarati{

            font-family:
                Arial,
                "Noto Sans Gujarati",
                sans-serif;

            font-size:18px;

            line-height:1.9;

        }


        .gita700-loading{

            text-align:center;

            padding:20px;

        }


        @media(max-width:500px){

            .gita700-grid{

                grid-template-columns:
                repeat(2,1fr);

            }

            .gita700-sanskrit{

                font-size:21px;

            }

        }

    `;


    document.head.appendChild(style);

}


/* =========================================================
   LIST
   ========================================================= */

function ensureList(){

    const section =
        document.getElementById("gita");


    if(!section){

        console.error(
            "SANSKRITAM: #gita section not found."
        );

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

        section.appendChild(
            box
        );

    }


    return box;

}


/* =========================================================
   RENDER GITA
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

                📖
                શ્લોકો લોડ થઈ રહ્યા છે...

            </div>

        `;

        return;

    }


    let html = `

        <div class="gita700-status">

            📚
            <b>ભગવદ્ ગીતા</b>

            <br>

            18 અધ્યાય •
            ${Math.min(
                allVerses.length,
                700
            )}
            શ્લોક

        </div>

    `;


    GITA_CHAPTERS.forEach(
        function(data){

            const chapter =
                data[0];

            const name =
                data[1];

            const count =
                data[2];


            html += `

                <div
                    class="gita700-chapter"
                >

                    <h3>

                        અધ્યાય
                        ${chapter}
                        —
                        ${esc(name)}

                    </h3>

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


                if(gita[key]){

                    html += `

                        <button
                            type="button"
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
   Google Translation
   ========================================================= */

async function translateGujarati(key){

    const verse =
        gita[key];


    const target =
        document.getElementById(
            "gu-" + key
        );


    if(!verse || !target){

        return;

    }


    if(!verse.english){

        target.textContent =
            "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

        return;

    }


    target.textContent =
        "ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";


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
            await fetch(
                url,
                {
                    method:"GET",
                    cache:"no-cache"
                }
            );


        if(!response.ok){

            throw new Error(
                "Gujarati translation failed"
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
                    .map(
                        function(part){

                            return (
                                part &&
                                part[0]
                            )
                            ?
                            part[0]
                            :
                            "";

                        }
                    )
                    .join("");

        }


        if(
            translated &&
            translated.trim()
        ){

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
            "ગુજરાતી અર્થ મેળવી શકાયો નથી. Internet ચાલુ રાખીને ફરી પ્રયાસ કરો.";

    }

}


/* =========================================================
   OPEN SHLOKA
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


    const oldReader =
        document.getElementById(
            "gitaVerseReader"
        );


    if(oldReader){

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
            class="back"
            onclick="
                document
                .getElementById(
                    'gitaVerseReader'
                )
                ?.remove()
            "
            style="
                cursor:pointer;
                font-weight:bold;
                margin-bottom:12px;
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
            class="gita700-hindi"
        >

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
            class="gita700-gujarati"
        >

            ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...

        </p>


        <hr>


        <button
            type="button"
            class="primary"
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


    if(!section){

        return;

    }


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


    /* Gujarati translation */

    translateGujarati(key);


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


    let favorites =
        JSON.parse(
            localStorage.getItem(
                "sanskritamFavorites"
            ) || "[]"
        );


    const item =
        `${key} — ${verse.sanskrit}`;


    if(
        !favorites.includes(item)
    ){

        favorites.push(item);

    }


    localStorage.setItem(
        "sanskritamFavorites",
        JSON.stringify(favorites)
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

        console.log(
            "SANSKRITAM: Loading Gita..."
        );


        /* =========================
           LOAD SANSKRIT + ENGLISH
           ========================= */

        const response =
            await fetch(
                GITA_DATA_URL,
                {
                    cache:"no-cache"
                }
            );


        if(!response.ok){

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
            "Gita records:",
            allVerses.length
        );


        /* =========================
           KEEP 700 SHLOKAS
           ========================= */

        if(
            allVerses.length > 700
        ){

            allVerses =
                allVerses
                    .filter(
                        function(v){

                            return !(
                                v.chapter === 13 &&
                                v.verse === 1
                            );

                        }
                    )
                    .slice(0,700);

        }


        /* =========================
           LOAD HINDI
           ========================= */

        try{

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


            if(
                hindiResponse.ok
            ){

                hindiData =
                    await hindiResponse.json();


                console.log(
                    "SANSKRITAM: Hindi loaded."
                );

            }
            else{

                console.warn(
                    "Hindi HTTP error:",
                    hindiResponse.status
                );

            }

        }
        catch(hindiError){

            console.warn(
                "Hindi loading failed:",
                hindiError
            );

        }


        /* =========================
           BUILD
           ========================= */

        buildObject();


        /* =========================
           RENDER
           ========================= */

        renderGita();


        console.log(
            "SANSKRITAM: " +
            allVerses.length +
            " verses ready."
        );

    }

    catch(error){

        console.error(
            "SANSKRITAM GITA ERROR:",
            error
        );


        const box =
            ensureList();


        if(box){

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