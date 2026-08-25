/* =========================================================
   SANSKRITAM — BHAGAVAD GITA 700 SHLOKA ENGINE
   ========================================================= */

const GITA_DATA_URL =
"https://cdn.jsdelivr.net/gh/ChiragMirani/gita-quotes@main/docs/data.json";

const GITA_HINDI_URL =
"https://raw.githubusercontent.com/kashishkhullar/gita_json/master/gita.json";


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


/* ================= SAFE HTML ================= */

function esc(v){

    return String(v ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* ================= NORMALIZE ROW ================= */

function normalizeRow(r){

    const c = Number(
        r?.chapter ??
        r?.chapter_number ??
        r?.chapterNumber
    );

    const v = Number(
        r?.verse ??
        r?.verse_number ??
        r?.verseNumber
    );

    const s =
        r?.sanskrit ??
        r?.text ??
        r?.devanagari ??
        r?.slok ??
        r?.verse_text ??
        "";

    const e =
        r?.english ??
        r?.translation ??
        r?.meaning ??
        r?.translation_en ??
        "";

    if(!c || !v || !s){
        return null;
    }

    return {

        chapter:c,

        verse:v,

        key:`${c}-${v}`,

        sanskrit:String(s).trim(),

        english:String(e || "").trim()

    };

}


/* ================= NORMALIZE DATA ================= */

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

            data.chapters.forEach(function(x){

                if(Array.isArray(x.verses)){

                    rows.push(...x.verses);

                }

            });

        }

        if(!rows.length){

            Object.entries(data).forEach(function([k,x]){

                if(
                    /^\d+-\d+$/.test(k) &&
                    x &&
                    typeof x === "object"
                ){

                    const parts = k.split("-");

                    rows.push({

                        ...x,

                        chapter:
                            x.chapter ?? parts[0],

                        verse:
                            x.verse ?? parts[1]

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
                a.chapter-b.chapter ||
                a.verse-b.verse
            );

        });

}


/* ================= HINDI ================= */

function findHindi(c,v){

    if(!hindiData){
        return "";
    }

    const key = `${c}-${v}`;

    let x =
        hindiData[key] ||
        hindiData.verses?.[c]?.[v] ||
        hindiData.chapters?.[c]?.verses?.[v];

    if(!x){
        return "";
    }

    if(typeof x === "string"){
        return x;
    }

    return (

        x.meaning ||
        x.text ||
        x.verse_meaning_hindi ||
        x.hindi ||
        ""

    );

}


/* ================= BUILD GITA ================= */

function buildObject(){

    gita = {};

    allVerses.forEach(function(x){

        gita[x.key] = {

            ...x,

            hindi:
                findHindi(
                    x.chapter,
                    x.verse
                ),

            gujarati:""

        };

    });

    window.gita = gita;

}


/* ================= STYLES ================= */

function injectStyles(){

    if(
        document.getElementById(
            "sanskritam-gita-style"
        )
    ){
        return;
    }

    const s =
        document.createElement("style");

    s.id =
        "sanskritam-gita-style";

    s.textContent = `

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

        color:#fff;

        font-weight:bold;

        cursor:pointer;

    }

    .gita700-sanskrit{

        font-size:22px;

        line-height:1.75;

        white-space:pre-line;

    }

    .gita700-meaning{

        font:16px Arial;

        line-height:1.7;

    }

    @media(max-width:360px){

        .gita700-grid{

            grid-template-columns:
            repeat(2,1fr);

        }

    }

    `;

    document.head.appendChild(s);

}


/* ================= LIST ================= */

function ensureList(){

    const sec =
        document.getElementById("gita");

    if(!sec){
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

    const h =
        sec.querySelector("h2");

    if(h){

        h.insertAdjacentElement(
            "afterend",
            box
        );

    }
    else{

        sec.appendChild(box);

    }

    return box;

}


/* ================= RENDER GITA ================= */

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
        function([c,name,count]){

            html += `

            <div class="gita700-chapter">

                <h3>
                    અધ્યાય ${c} — ${esc(name)}
                </h3>

                <div class="gita700-grid">

            `;


            for(
                let v=1;
                v<=count;
                v++
            ){

                const key =
                    `${c}-${v}`;

                if(gita[key]){

                    html += `

                    <button
                        class="gita700-btn"
                        onclick="openGitaVerse('${key}')">

                        શ્લોક ${c}.${v}

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


/* =========================================================
   GUJARATI TRANSLATION
   IMPORTANT: આ function openGitaVerse ની બહાર છે.
   ========================================================= */

async function translateGujarati(key){

    const x =
        gita[key];

    const target =
        document.getElementById(
            "gu-" + key
        );

    if(!x || !target){
        return;
    }


    target.textContent =
        "ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";


    if(!x.english){

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
                x.english
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


        let gujarati = "";


        if(
            Array.isArray(data) &&
            Array.isArray(data[0])
        ){

            gujarati =
                data[0]

                .map(function(item){

                    return (
                        item &&
                        item[0]
                    )
                    ?
                    item[0]
                    :
                    "";

                })

                .join("");

        }


        if(gujarati.trim()){

            target.textContent =
                gujarati.trim();

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


/* ================= OPEN VERSE ================= */

function openGitaVerse(key){

    const x =
        gita[key];


    if(!x){

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


    const r =
        document.createElement("div");


    r.id =
        "gitaVerseReader";


    r.className =
        "gita700-reader";


    r.innerHTML = `

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
        ${x.chapter}.${x.verse}

    </h2>


    <div class="source">

        અધ્યાય ${x.chapter}
        •
        શ્લોક ${x.verse}

    </div>


    <hr>


    <h3>
        🕉️ संस्कृत श्लोक
    </h3>


    <div class="gita700-sanskrit">

        ${esc(x.sanskrit)}

    </div>


    <hr>


    ${
        x.english
        ?

        `

        <h3>
            🇬🇧 English Meaning
        </h3>

        <p class="gita700-meaning">

            ${esc(x.english)}

        </p>

        `

        :

        ""

    }


    <hr>


    ${
        x.hindi
        ?

        `

        <h3>
            🇮🇳 हिन्दी अर्थ
        </h3>

        <p class="gita700-meaning">

            ${esc(x.hindi)}

        </p>

        `

        :

        ""

    }


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


    const sec =
        document.getElementById("gita");


    const box =
        document.getElementById(
            "gita700List"
        );


    if(sec){

        if(box){

            sec.insertBefore(
                r,
                box
            );

        }
        else{

            sec.appendChild(r);

        }

    }


    /* ગુજરાતી અર્થ શરૂ કરો */

    translateGujarati(key);


    window.scrollTo(
        {
            top:0,
            behavior:"smooth"
        }
    );

}


/* ================= FAVORITE ================= */

function saveGitaFavorite(key){

    const x =
        gita[key];

    if(!x){
        return;
    }


    let favorites =
        JSON.parse(
            localStorage.getItem(
                "sanskritamFavorites"
            ) || "[]"
        );


    const item =
        `${key} — ${x.sanskrit}`;


    if(!favorites.includes(item)){

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


/* ================= LOAD GITA ================= */

async function loadGita(){

    injectStyles();

    renderGita();


    try{

        const res =
            await fetch(
                GITA_DATA_URL,
                {
                    cache:"force-cache"
                }
            );


        if(!res.ok){

            throw new Error(
                "Gita data error"
            );

        }


        allVerses =
            normalizeData(
                await res.json()
            );


        /*
          Standard Bhagavad Gita =
          700 Shlokas.

          કેટલાક sourceમાં 701 records હોય છે,
          તેથી extra Chapter 13.1 દૂર કરીએ છીએ.
        */

        if(allVerses.length > 700){

            allVerses =
                allVerses.filter(
                    function(x){

                        return !(
                            x.chapter === 13 &&
                            x.verse === 1
                        );

                    }
                )

                .slice(0,700);

        }


        /* Hindi data */

        try{

            const hr =
                await fetch(
                    GITA_HINDI_URL,
                    {
                        cache:"force-cache"
                    }
                );


            if(hr.ok){

                hindiData =
                    await hr.json();

            }

        }
        catch(error){

            console.log(
                "Hindi data unavailable"
            );

        }


        buildObject();

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


/* ================= START ================= */

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