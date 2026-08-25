const GITA_DATA_URL =
"https://cdn.jsdelivr.net/gh/ChiragMirani/gita-quotes@main/docs/data.json";

const GITA_MEANINGS_URL = "./gita-meanings.json";

let gita = {};
let allVerses = [];
let meaningData = {};

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

function esc(v){
    return String(v ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function normalizeRow(row){

    if(!row) return null;

    const chapter = Number(
        row.chapter ??
        row.chapter_number ??
        row.chapterNumber
    );

    const verse = Number(
        row.verse ??
        row.verse_number ??
        row.verseNumber
    );

    const sanskrit =
        row.sanskrit ??
        row.devanagari ??
        row.slok ??
        row.shloka ??
        row.verse_text ??
        row.text ??
        "";

    const english =
        row.english ??
        row.translation ??
        row.translation_en ??
        row.meaning ??
        row.english_meaning ??
        "";

    if(!chapter || !verse || !sanskrit){
        return null;
    }

    return {
        chapter,
        verse,
        key:`${chapter}-${verse}`,
        sanskrit:String(sanskrit).trim(),
        english:String(english || "").trim()
    };
}

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

    else if(Array.isArray(data?.chapters)){

        data.chapters.forEach(chapter=>{

            if(Array.isArray(chapter.verses)){

                chapter.verses.forEach(verse=>{

                    rows.push({
                        ...verse,
                        chapter:
                            verse.chapter ??
                            chapter.chapter ??
                            chapter.chapter_number
                    });

                });

            }

        });

    }

    return rows
        .map(normalizeRow)
        .filter(Boolean)
        .sort((a,b)=>
            a.chapter-b.chapter ||
            a.verse-b.verse
        );
}


/* ===============================
   LOAD MEANINGS
   =============================== */

async function loadMeanings(){

    try{

        const response =
            await fetch(
                GITA_MEANINGS_URL,
                {cache:"no-cache"}
            );

        if(!response.ok){
            throw new Error("Meaning JSON not found");
        }

        meaningData =
            await response.json();

        console.log(
            "Hindi + Gujarati meanings loaded."
        );

    }

    catch(error){

        console.error(
            "Meaning file error:",
            error
        );

        meaningData = {};

    }

}


/* ===============================
   GET MEANING
   =============================== */

function getMeaning(key){

    const item =
        meaningData[key];

    if(!item){
        return {
            hindi:"",
            gujarati:""
        };
    }

    return {
        hindi:
            item.hindi ??
            item.meaning_hindi ??
            "",

        gujarati:
            item.gujarati ??
            item.meaning_gujarati ??
            ""
    };

}


/* ===============================
   BUILD GITA
   =============================== */

function buildGita(){

    gita = {};

    allVerses.forEach(verse=>{

        const meaning =
            getMeaning(verse.key);

        gita[verse.key] = {

            ...verse,

            hindi:
                meaning.hindi,

            gujarati:
                meaning.gujarati

        };

    });

    window.gita = gita;
}


/* ===============================
   STYLES
   =============================== */

function injectStyles(){

    if(
        document.getElementById(
            "sanskritam-gita-style"
        )
    ) return;

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
        box-shadow:0 5px 18px #00000012;

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
        color:white;
        font-weight:bold;
        cursor:pointer;

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

    @media(max-width:500px){

        .gita700-grid{
            grid-template-columns:
            repeat(2,1fr);
        }

    }

    `;

    document.head.appendChild(style);
}


/* ===============================
   LIST
   =============================== */

function ensureList(){

    const section =
        document.getElementById("gita");

    if(!section) return null;

    let box =
        document.getElementById(
            "gita700List"
        );

    if(box) return box;

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


/* ===============================
   RENDER
   =============================== */

function renderGita(){

    const box =
        ensureList();

    if(!box) return;

    if(!allVerses.length){

        box.innerHTML = `
        <div class="gita700-status">
            📖 શ્લોકો લોડ થઈ રહ્યા છે...
        </div>`;

        return;
    }

    let html = `
    <div class="gita700-status">
        📚 <b>ભગવદ્ ગીતા</b><br>
        18 અધ્યાય •
        ${Math.min(allVerses.length,700)}
        શ્લોક
    </div>
    `;

    GITA_CHAPTERS.forEach(
        ([chapter,name,count])=>{

            html += `
            <div class="gita700-chapter">

                <h3>
                    અધ્યાય ${chapter}
                    — ${esc(name)}
                </h3>

                <div class="gita700-grid">
            `;

            for(
                let verse=1;
                verse<=count;
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
                        શ્લોક ${chapter}.${verse}
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

    box.innerHTML = html;
}


/* ===============================
   OPEN SHLOKA
   =============================== */

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
                "English meaning उपलब्ध નથી."
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
                "हिन्दी अर्थ ઉપલબ્ધ નથી."
            }
        </p>

        <hr>

        <h3>
            🇮🇳 ગુજરાતી અર્થ
        </h3>

        <p class="gita700-meaning">
            ${
                verse.gujarati
                ?
                esc(verse.gujarati)
                :
                "ગુજરાતી અર્થ ઉપલબ્ધ નથી."
            }
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
        document.getElementById("gita");

    const list =
        document.getElementById(
            "gita700List"
        );

    if(!section) return;

    if(list){

        section.insertBefore(
            reader,
            list
        );

    }
    else{

        section.appendChild(reader);

    }

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}


/* ===============================
   FAVORITE
   =============================== */

function saveGitaFavorite(key){

    const verse =
        gita[key];

    if(!verse) return;

    let favorites =
        JSON.parse(
            localStorage.getItem(
                "sanskritamFavorites"
            ) || "[]"
        );

    const item =
        `${key} — ${verse.sanskrit}`;

    if(!favorites.includes(item)){
        favorites.push(item);
    }

    localStorage.setItem(
        "sanskritamFavorites",
        JSON.stringify(favorites)
    );

    alert("❤️ Favorite Saved");
}


/* ===============================
   LOAD
   =============================== */

async function loadGita(){

    injectStyles();

    renderGita();

    try{

        const response =
            await fetch(
                GITA_DATA_URL,
                {cache:"no-cache"}
            );

        if(!response.ok){

            throw new Error(
                "Gita data HTTP error"
            );

        }

        const data =
            await response.json();

        allVerses =
            normalizeData(data);

        /*
          Standard 700 Shlokas
        */

        if(allVerses.length > 700){

            allVerses =
                allVerses
                .filter(v =>
                    !(
                        v.chapter === 13 &&
                        v.verse === 1
                    )
                )
                .slice(0,700);

        }

        await loadMeanings();

        buildGita();

        renderGita();

        console.log(
            "SANSKRITAM:",
            allVerses.length,
            "verses ready."
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

                ⚠️
                <b>
                    ભગવદ્ ગીતા લોડ થઈ શકી નથી.
                </b>

                <br><br>

                Internet તપાસો અને
                page ફરી ખોલો.

            </div>
            `;

        }

    }

}


/* ===============================
   START
   =============================== */

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