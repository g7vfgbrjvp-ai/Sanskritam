/* =========================================================
   🪷 SANSKRITAM — PROFESSIONAL GITA READER
   =========================================================
   FEATURES

   ✓ 18 Chapters
   ✓ 700 Shlokas
   ✓ Sanskrit
   ✓ Gujarati
   ✓ Hindi
   ✓ English
   ✓ Language Switch
   ✓ Search
   ✓ Chapter Navigation
   ✓ Easy Verse Opening
   ✓ Previous / Next
   ✓ Favorites
   ✓ Copy
   ✓ Share
   ✓ Speech
   ✓ Offline Cache
   ✓ Retry
   ✓ Mobile Friendly
   ✓ Safe Rendering
   ========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const GITA_CONFIG = {

    DATA_URL:
        "https://cdn.jsdelivr.net/gh/ChiragMirani/gita-quotes@main/docs/data.json",

    HINDI_URL:
        "https://raw.githubusercontent.com/kashishkhullar/gita_json/master/dataset_hindi.json",

    TRANSLATE_URL:
        "https://translate.googleapis.com/translate_a/single",

    CACHE_KEY:
        "sanskritam_gita_gujarati_v3",

    LANGUAGE_KEY:
        "sanskritam_language",

    FAVORITE_KEY:
        "sanskritamFavorites"

};


/* =========================================================
   CHAPTER DATA
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


/* =========================================================
   LANGUAGE
========================================================= */

const LANGUAGES = {

    gu: {
        name:"ગુજરાતી",
        flag:"🇮🇳",
        sanskrit:"સંસ્કૃત શ્લોક",
        meaning:"ગુજરાતી અર્થ",
        search:"શ્લોક શોધો...",
        chapter:"અધ્યાય",
        verse:"શ્લોક",
        previous:"← પાછો",
        next:"આગળ →",
        favorite:"❤️ મનપસંદ",
        copy:"📋 Copy",
        share:"📤 Share",
        speak:"🔊 સાંભળો",
        close:"← શ્લોકો",
        noResult:"કોઈ શ્લોક મળ્યો નથી.",
        loading:"શ્લોકો લોડ થઈ રહ્યા છે...",
        offline:"📴 Offline"
    },

    hi: {
        name:"हिन्दी",
        flag:"🇮🇳",
        sanskrit:"संस्कृत श्लोक",
        meaning:"हिन्दी अर्थ",
        search:"श्लोक खोजें...",
        chapter:"अध्याय",
        verse:"श्लोक",
        previous:"← पिछला",
        next:"अगला →",
        favorite:"❤️ पसंदीदा",
        copy:"📋 Copy",
        share:"📤 Share",
        speak:"🔊 सुनें",
        close:"← श्लोक",
        noResult:"कोई श्लोक नहीं मिला।",
        loading:"श्लोक लोड हो रहे हैं...",
        offline:"📴 Offline"
    },

    en: {
        name:"English",
        flag:"🇬🇧",
        sanskrit:"Sanskrit Shloka",
        meaning:"English Meaning",
        search:"Search Shloka...",
        chapter:"Chapter",
        verse:"Verse",
        previous:"← Previous",
        next:"Next →",
        favorite:"❤️ Favorite",
        copy:"📋 Copy",
        share:"📤 Share",
        speak:"🔊 Listen",
        close:"← Shlokas",
        noResult:"No shloka found.",
        loading:"Loading shlokas...",
        offline:"📴 Offline"
    }

};


/* =========================================================
   STATE
========================================================= */

let gita = {};

let allVerses = [];

let hindiData = null;

let currentVerse = null;

let currentLanguage =
    localStorage.getItem(
        GITA_CONFIG.LANGUAGE_KEY
    ) || "gu";


/* =========================================================
   HELPER
========================================================= */

function $id(id){

    return document.getElementById(id);

}


function lang(){

    return LANGUAGES[
        currentLanguage
    ] || LANGUAGES.gu;

}


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
   CLEAN TEXT
========================================================= */

function clean(value){

    return String(value ?? "")
        .replace(/\r/g,"")
        .replace(/\n{3,}/g,"\n\n")
        .trim();

}


/* =========================================================
   VALUE FINDER
========================================================= */

function getValue(
    object,
    keys
){

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
            String(object[key]).trim()
        ){

            return object[key];

        }

    }


    return "";

}


/* =========================================================
   NORMALIZE VERSE
========================================================= */

function normalizeVerse(row){

    if(
        !row ||
        typeof row !== "object"
    ){

        return null;

    }


    const chapter =
        Number(
            getValue(
                row,
                [
                    "chapter",
                    "chapter_number",
                    "chapterNumber"
                ]
            )
        );


    const verse =
        Number(
            getValue(
                row,
                [
                    "verse",
                    "verse_number",
                    "verseNumber"
                ]
            )
        );


    const sanskrit =
        clean(
            getValue(
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


    const english =
        clean(
            getValue(
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

        english,

        hindi:"",

        gujarati:""

    };

}


/* =========================================================
   NORMALIZE DATA
========================================================= */

function normalizeData(data){

    let rows = [];


    if(
        Array.isArray(data)
    ){

        rows =
            data;

    }


    else if(
        Array.isArray(data?.data)
    ){

        rows =
            data.data;

    }


    else if(
        Array.isArray(data?.verses)
    ){

        rows =
            data.verses;

    }


    else if(
        Array.isArray(data?.chapters)
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


    return rows

        .map(
            normalizeVerse
        )

        .filter(Boolean)

        .sort(

            (a,b) =>

                a.chapter-b.chapter ||

                a.verse-b.verse

        );

}


/* =========================================================
   REMOVE DUPLICATES
========================================================= */

function uniqueVerses(){

    const map =
        new Map();


    allVerses.forEach(

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


    allVerses =
        Array.from(
            map.values()
        );

}


/* =========================================================
   HINDI
========================================================= */

function findHindi(
    chapter,
    verse
){

    if(!hindiData){

        return "";

    }


    let item = null;


    if(
        Array.isArray(
            hindiData
        )
    ){

        item =
            hindiData.find(

                row =>

                    Number(
                        row?.chapter ??
                        row?.chapter_number
                    ) === chapter

                    &&

                    Number(
                        row?.verse ??
                        row?.verse_number
                    ) === verse

            );

    }


    if(
        !item &&
        hindiData.verses
    ){

        item =
            hindiData
                .verses?.[chapter]?.[verse];

    }


    if(
        !item &&
        hindiData.chapters
    ){

        item =
            hindiData
                .chapters?.[chapter]
                ?.verses?.[verse];

    }


    if(!item){

        return "";

    }


    if(
        typeof item === "string"
    ){

        return clean(item);

    }


    return clean(

        getValue(
            item,
            [
                "meaning_hindi",
                "hindi_meaning",
                "translation_hindi",
                "translation_hi",
                "hindi",
                "meaning",
                "text"
            ]
        )

    );

}


/* =========================================================
   BUILD
========================================================= */

function buildGita(){

    gita = {};


    allVerses.forEach(

        verse => {

            verse.hindi =
                findHindi(
                    verse.chapter,
                    verse.verse
                );


            gita[
                verse.key
            ] =
                verse;

        }

    );


    window.gita =
        gita;

}


/* =========================================================
   INDEXEDDB
========================================================= */

const DB_NAME =
    "SANSKRITAM_GITA_DB";

const DB_VERSION =
    1;

const STORE =
    "gujarati";


function openDB(){

    return new Promise(

        (resolve,reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                function(event){

                    const db =
                        event.target.result;


                    if(
                        !db.objectStoreNames
                            .contains(STORE)
                    ){

                        db.createObjectStore(
                            STORE
                        );

                    }

                };


            request.onsuccess =
                function(){

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                function(){

                    reject(
                        request.error
                    );

                };

        }

    );

}


/* =========================================================
   GET OFFLINE GUJARATI
========================================================= */

async function getGujarati(key){

    try{

        const db =
            await openDB();


        return new Promise(

            resolve => {

                const transaction =
                    db.transaction(
                        STORE,
                        "readonly"
                    );


                const store =
                    transaction
                        .objectStore(
                            STORE
                        );


                const request =
                    store.get(key);


                request.onsuccess =
                    () => {

                        resolve(
                            request.result || ""
                        );

                    };


                request.onerror =
                    () => {

                        resolve("");

                    };

            }

        );

    }

    catch{

        return "";

    }

}


/* =========================================================
   SAVE GUJARATI
========================================================= */

async function saveGujarati(
    key,
    text
){

    try{

        const db =
            await openDB();


        return new Promise(

            resolve => {

                const transaction =
                    db.transaction(
                        STORE,
                        "readwrite"
                    );


                transaction
                    .objectStore(
                        STORE
                    )
                    .put(
                        text,
                        key
                    );


                transaction.oncomplete =
                    () => resolve(true);


                transaction.onerror =
                    () => resolve(false);

            }

        );

    }

    catch{

        return false;

    }

}


/* =========================================================
   TRANSLATION
========================================================= */

async function translateGujarati(
    key
){

    const verse =
        gita[key];


    const target =
        $id(
            `gu-${key}`
        );


    if(
        !verse ||
        !target
    ){

        return;

    }


    const cached =
        await getGujarati(
            key
        );


    if(cached){

        target.textContent =
            cached;

        return;

    }


    if(
        !navigator.onLine
    ){

        target.textContent =
            "📴 ગુજરાતી અર્થ Offline માં ઉપલબ્ધ નથી.";

        return;

    }


    if(
        !verse.english
    ){

        target.textContent =
            "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

        return;

    }


    target.textContent =
        "ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";


    try{

        const url =

            GITA_CONFIG
                .TRANSLATE_URL

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
                verse.english
            );


        const response =
            await fetch(
                url
            );


        if(
            !response.ok
        ){

            throw new Error(
                "Translation failed"
            );

        }


        const data =
            await response.json();


        const translated =
            clean(

                data?.[0]
                    ?.map(
                        x => x?.[0] || ""
                    )
                    ?.join("")
                    || ""

            );


        if(!translated){

            throw new Error(
                "Empty translation"
            );

        }


        await saveGujarati(
            key,
            translated
        );


        target.textContent =
            translated;

    }

    catch(error){

        console.error(
            error
        );


        target.textContent =
            "ગુજરાતી અર્થ મેળવવામાં સમસ્યા આવી.";

    }

}


/* =========================================================
   LANGUAGE SELECTOR
========================================================= */

function languageSelector(){

    return `

        <div
            class="gita-language-box"
        >

            <span>
                🌐
            </span>


            <select
                id="gitaLanguage"
                onchange="
                changeGitaLanguage(this.value)
                "
            >

                <option
                    value="gu"
                    ${
                        currentLanguage === "gu"
                        ? "selected"
                        : ""
                    }
                >

                    🇮🇳 ગુજરાતી

                </option>


                <option
                    value="hi"
                    ${
                        currentLanguage === "hi"
                        ? "selected"
                        : ""
                    }
                >

                    🇮🇳 हिन्दी

                </option>


                <option
                    value="en"
                    ${
                        currentLanguage === "en"
                        ? "selected"
                        : ""
                    }
                >

                    🇬🇧 English

                </option>

            </select>

        </div>

    `;

}


/* =========================================================
   CHANGE LANGUAGE
========================================================= */

function changeGitaLanguage(language){

    if(
        !LANGUAGES[language]
    ){

        return;

    }


    currentLanguage =
        language;


    localStorage.setItem(

        GITA_CONFIG
            .LANGUAGE_KEY,

        language

    );


    renderGita();

    showGitaToast(
        LANGUAGES[language].name
    );

}


/* =========================================================
   GITA HEADER
========================================================= */

function gitaHeader(){

    const L =
        lang();


    return `

        <div
            class="gita-top-card"
        >

            <div
                class="gita-brand"
            >

                🕉️

                <div>

                    <strong>
                        Bhagavad Gita
                    </strong>

                    <small>
                        18 અધ્યાય • 700 શ્લોક
                    </small>

                </div>

            </div>


            ${languageSelector()}


            <div
                class="gita-search-wrap"
            >

                🔍

                <input
                    id="gitaSearch"
                    type="search"
                    placeholder="${L.search}"
                    oninput="
                    searchGita()
                    "
                >

            </div>


            <div
                id="gitaSearchResults"
            ></div>

        </div>

    `;

}


/* =========================================================
   CHAPTER CARD
========================================================= */

function chapterCard(
    chapter,
    title,
    total
){

    let buttons = "";


    for(
        let i=1;
        i<=total;
        i++
    ){

        const key =
            `${chapter}-${i}`;


        if(
            gita[key]
        ){

            buttons += `

                <button
                    class="gita-verse-btn"
                    onclick="
                    openGitaVerse(
                    '${key}'
                    )
                    "
                >

                    ${chapter}.${i}

                </button>

            `;

        }

    }


    return `

        <div
            class="gita-chapter-card"
        >

            <div
                class="chapter-heading"
            >

                <div
                    class="chapter-number"
                >

                    ${chapter}

                </div>


                <div>

                    <h3>

                        ${esc(title)}

                    </h3>

                    <small>

                        ${total} શ્લોક

                    </small>

                </div>

            </div>


            <div
                class="gita-verse-grid"
            >

                ${buttons}

            </div>

        </div>

    `;

}


/* =========================================================
   RENDER
========================================================= */

function renderGita(){

    const section =
        $id("gita");


    if(!section){

        return;

    }


    let box =
        $id(
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
                class="gita-loading-card"
            >

                🕉️

                <br><br>

                ${lang().loading}

            </div>

        `;

        return;

    }


    box.innerHTML =

        gitaHeader()

        +

        GITA_CHAPTERS
            .map(
                data =>
                    chapterCard(
                        data[0],
                        data[1],
                        data[2]
                    )
            )
            .join("");

}


/* =========================================================
   SEARCH
========================================================= */

function searchGita(){

    const input =
        $id(
            "gitaSearch"
        );


    const output =
        $id(
            "gitaSearchResults"
        );


    if(
        !input ||
        !output
    ){

        return;

    }


    const q =
        input.value
            .trim()
            .toLowerCase();


    if(!q){

        output.innerHTML =
            "";

        return;

    }


    const results =
        allVerses
            .filter(

                verse =>

                    verse.sanskrit
                        .toLowerCase()
                        .includes(q)

                    ||

                    verse.english
                        .toLowerCase()
                        .includes(q)

                    ||

                    verse.hindi
                        .toLowerCase()
                        .includes(q)

                    ||

                    `${verse.chapter}.${verse.verse}`
                        .includes(q)

            )
            .slice(
                0,
                20
            );


    if(!results.length){

        output.innerHTML = `

            <div
                class="search-result-empty"
            >

                ${lang().noResult}

            </div>

        `;

        return;

    }


    output.innerHTML = `

        <div
            class="search-results"
        >

            ${
                results
                .map(

                    verse => `

                        <button
                            onclick="
                            openGitaVerse(
                            '${verse.key}'
                            )
                            "
                        >

                            <b>
                                ${verse.chapter}.${verse.verse}
                            </b>

                            <span>

                                ${esc(
                                    verse.sanskrit
                                        .slice(0,70)
                                )}

                            </span>

                        </button>

                    `

                )
                .join("")
            }

        </div>

    `;

}


/* =========================================================
   OPEN VERSE
========================================================= */

async function openGitaVerse(key){

    const verse =
        gita[key];


    if(!verse){

        showGitaToast(
            "Shloka not found"
        );

        return;

    }


    currentVerse =
        key;


    const old =
        $id(
            "gitaVerseReader"
        );


    if(old){

        old.remove();

    }


    const index =
        allVerses.findIndex(
            v =>
                v.key === key
        );


    const reader =
        document.createElement(
            "div"
        );


    reader.id =
        "gitaVerseReader";


    reader.className =
        "gita-reader";


    const L =
        lang();


    reader.innerHTML = `

        <button
            class="gita-back"
            onclick="
            closeGitaVerse()
            "
        >

            ${L.close}

        </button>


        <div
            class="verse-title"
        >

            🕉️ Bhagavad Gita

        </div>


        <div
            class="verse-number"
        >

            ${L.chapter}
            ${verse.chapter}
            •
            ${L.verse}
            ${verse.verse}

        </div>


        <div
            class="language-mini"
        >

            ${languageSelector()}

        </div>


        <hr>


        <h3>
            🕉️ ${L.sanskrit}
        </h3>


        <div
            class="sanskrit-text"
        >

            ${esc(
                verse.sanskrit
            )}

        </div>


        <div
            class="meaning-box"
        >

            <h3>
                🇬🇧 English
            </h3>

            <p>

                ${
                    verse.english
                    ?
                    esc(
                        verse.english
                    )
                    :
                    "Not available."
                }

            </p>

        </div>


        <div
            class="meaning-box"
        >

            <h3>
                🇮🇳 हिन्दी
            </h3>

            <p>

                ${
                    verse.hindi
                    ?
                    esc(
                        verse.hindi
                    )
                    :
                    "हिन्दी अर्थ उपलब्ध नहीं है।"
                }

            </p>

        </div>


        <div
            class="meaning-box"
        >

            <h3>
                🇮🇳 ગુજરાતી
            </h3>

            <p
                id="gu-${key}"
            >

                ગુજરાતી અર્થ
                મેળવવામાં આવી રહ્યો છે...

            </p>

        </div>


        <div
            class="verse-actions"
        >

            <button
                onclick="
                saveFavorite(
                '${key}'
                )
                "
            >

                ${L.favorite}

            </button>


            <button
                onclick="
                speakGita(
                '${key}'
                )
                "
            >

                ${L.speak}

            </button>


            <button
                onclick="
                copyGita(
                '${key}'
                )
                "
            >

                ${L.copy}

            </button>


            <button
                onclick="
                shareGita(
                '${key}'
                )
                "
            >

                ${L.share}

            </button>

        </div>


        <div
            class="verse-navigation"
        >

            <button
                ${
                    index <= 0
                    ? "disabled"
                    : ""
                }
                onclick="
                openPreviousVerse()
                "
            >

                ${L.previous}

            </button>


            <button
                ${
                    index >=
                    allVerses.length-1
                    ? "disabled"
                    : ""
                }
                onclick="
                openNextVerse()
                "
            >

                ${L.next}

            </button>

        </div>

    `;


    const section =
        $id("gita");


    const list =
        $id(
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


    await translateGujarati(
        key
    );


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}


/* =========================================================
   CLOSE
========================================================= */

function closeGitaVerse(){

    const reader =
        $id(
            "gitaVerseReader"
        );


    if(reader){

        reader.remove();

    }

}


/* =========================================================
   PREVIOUS
========================================================= */

function openPreviousVerse(){

    if(!currentVerse){

        return;

    }


    const index =
        allVerses.findIndex(
            v =>
                v.key ===
                currentVerse
        );


    if(index > 0){

        openGitaVerse(
            allVerses[
                index-1
            ].key
        );

    }

}


/* =========================================================
   NEXT
========================================================= */

function openNextVerse(){

    if(!currentVerse){

        return;

    }


    const index =
        allVerses.findIndex(
            v =>
                v.key ===
                currentVerse
        );


    if(
        index >= 0 &&
        index <
        allVerses.length-1
    ){

        openGitaVerse(
            allVerses[
                index+1
            ].key
        );

    }

}


/* =========================================================
   FAVORITE
========================================================= */

function saveFavorite(key){

    const verse =
        gita[key];


    if(!verse){

        return;

    }


    let list = [];


    try{

        list =
            JSON.parse(

                localStorage.getItem(
                    GITA_CONFIG
                        .FAVORITE_KEY
                ) || "[]"

            );

    }

    catch{

        list = [];

    }


    if(
        !list.some(
            item =>
                item.key === key
        )
    ){

        list.push({

            key,

            text:
                verse.sanskrit,

            chapter:
                verse.chapter,

            verse:
                verse.verse

        });


        localStorage.setItem(

            GITA_CONFIG
                .FAVORITE_KEY,

            JSON.stringify(
                list
            )

        );


        showGitaToast(
            "❤️ Favorite Saved"
        );

    }

    else{

        showGitaToast(
            "Already Saved ❤️"
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

`🕉️ Bhagavad Gita
${verse.chapter}.${verse.verse}

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
            "📋 Copied"
        );

    }

    catch{

        showGitaToast(
            "Copy failed"
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

                text

            });

        }

        else{

            await copyGita(
                key
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


    if(
        !verse ||
        !window.speechSynthesis
    ){

        return;

    }


    speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            verse.sanskrit
        );


    speech.lang =
        "hi-IN";


    speech.rate =
        .75;


    speech.pitch =
        1;


    speechSynthesis.speak(
        speech
    );

}


/* =========================================================
   TOAST
========================================================= */

function showGitaToast(message){

    let toast =
        $id(
            "gitaToast"
        );


    if(!toast){

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "gitaToast";


        toast.className =
            "gita-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.gitaToastTimer
    );


    window.gitaToastTimer =
        setTimeout(

            () => {

                toast.classList.remove(
                    "show"
                );

            },

            2200

        );

}


/* =========================================================
   PROFESSIONAL CSS
========================================================= */

function injectGitaCSS(){

    if(
        $id(
            "sanskritam-gita-css"
        )
    ){

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "sanskritam-gita-css";


    style.textContent = `

        .gita-top-card{

            background:#fffaf0;

            border:
                1px solid
                #e7d9bc;

            border-radius:22px;

            padding:18px;

            margin-bottom:16px;

            box-shadow:
                0 7px 22px
                rgba(0,0,0,.06);

        }


        .gita-brand{

            display:flex;

            align-items:center;

            gap:12px;

            font-size:28px;

        }


        .gita-brand strong{

            display:block;

            font-size:21px;

        }


        .gita-brand small{

            display:block;

            font:
                12px
                Arial;

            color:#786b5a;

            margin-top:4px;

        }


        .gita-language-box{

            display:flex;

            align-items:center;

            gap:7px;

            margin:12px 0;

        }


        .gita-language-box select{

            flex:1;

            padding:10px;

            border:
                1px solid
                #e7d9bc;

            border-radius:12px;

            background:#fffaf0;

            outline:none;

        }


        .gita-search-wrap{

            display:flex;

            align-items:center;

            gap:8px;

            padding:12px 14px;

            border:
                1px solid
                #e7d9bc;

            border-radius:15px;

            background:#fff;

        }


        .gita-search-wrap input{

            width:100%;

            border:0;

            outline:0;

            background:transparent;

            font:
                14px
                Arial;

        }


        .search-results{

            margin-top:10px;

            border-radius:15px;

            overflow:hidden;

        }


        .search-results button{

            width:100%;

            text-align:left;

            margin:4px 0;

            background:#fff;

            border:
                1px solid
                #e7d9bc;

        }


        .search-results span{

            display:block;

            margin-top:4px;

            font:
                12px
                Arial;

            color:#786b5a;

        }


        .search-result-empty{

            text-align:center;

            padding:15px;

            font:
                13px
                Arial;

            color:#786b5a;

        }


        .gita-chapter-card{

            background:#fffaf0;

            border:
                1px solid
                #e7d9bc;

            border-radius:20px;

            padding:17px;

            margin-bottom:14px;

            box-shadow:
                0 5px 18px
                rgba(0,0,0,.05);

        }


        .chapter-heading{

            display:flex;

            align-items:center;

            gap:12px;

            margin-bottom:15px;

        }


        .chapter-number{

            min-width:44px;

            height:44px;

            border-radius:50%;

            display:grid;

            place-items:center;

            background:#b87909;

            color:#fff;

            font:
                bold 15px
                Arial;

        }


        .chapter-heading h3{

            margin:0;

            font-size:17px;

            line-height:1.4;

        }


        .chapter-heading small{

            color:#786b5a;

            font:
                12px
                Arial;

        }


        .gita-verse-grid{

            display:grid;

            grid-template-columns:
                repeat(3,1fr);

            gap:8px;

        }


        .gita-verse-btn{

            border:0;

            border-radius:12px;

            padding:12px 4px;

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

        }


        .gita-reader{

            background:#fffaf0;

            border:
                1px solid
                #e7d9bc;

            border-radius:23px;

            padding:20px;

            margin-bottom:18px;

            box-shadow:
                0 10px 30px
                rgba(0,0,0,.08);

        }


        .gita-back{

            border:0;

            background:none;

            color:#b87909;

            padding:0;

            margin:0 0 15px;

            font:
                bold 13px
                Arial;

            cursor:pointer;

        }


        .verse-title{

            font-size:23px;

            font-weight:bold;

        }


        .verse-number{

            margin-top:5px;

            color:#b87909;

            font:
                13px
                Arial;

        }


        .language-mini{

            margin-top:10px;

        }


        .sanskrit-text{

            font-size:23px;

            line-height:1.9;

            white-space:pre-line;

            margin:12px 0 20px;

        }


        .meaning-box{

            border:
                1px solid
                #e7d9bc;

            border-radius:15px;

            padding:14px;

            margin:12px 0;

            background:#fff;

        }


        .meaning-box h3{

            margin-top:0;

            font-size:16px;

        }


        .meaning-box p{

            font:
                16px/1.8
                Arial;

            margin-bottom:0;

            color:#493c2d;

        }


        .verse-actions{

            display:grid;

            grid-template-columns:
                repeat(2,1fr);

            gap:8px;

            margin-top:15px;

        }


        .verse-navigation{

            display:grid;

            grid-template-columns:
                repeat(2,1fr);

            gap:8px;

            margin-top:9px;

        }


        .verse-navigation button{

            margin:0;

        }


        button:disabled{

            opacity:.4;

            cursor:not-allowed;

        }


        .gita-loading-card{

            background:#fffaf0;

            border:
                1px solid
                #e7d9bc;

            border-radius:20px;

            text-align:center;

            padding:40px 15px;

            font:
                14px
                Arial;

        }


        .gita-toast{

            position:fixed;

            left:50%;

            bottom:85px;

            transform:
                translate(-50%,20px);

            opacity:0;

            pointer-events:none;

            background:#342719;

            color:#fff;

            padding:12px 18px;

            border-radius:13px;

            z-index:9999;

            font:
                600 13px
                Arial;

            transition:.25s;

        }


        .gita-toast.show{

            opacity:1;

            transform:
                translate(-50%,0);

        }


        @media(max-width:360px){

            .gita-verse-grid{

                grid-template-columns:
                    repeat(2,1fr);

            }


            .sanskrit-text{

                font-size:20px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   LOAD
========================================================= */

async function loadGita(){

    injectGitaCSS();


    const box =
        $id(
            "gita700List"
        );


    if(box){

        box.innerHTML = `

            <div
                class="gita-loading-card"
            >

                🕉️

                <br><br>

                ${lang().loading}

            </div>

        `;

    }


    try{

        const response =
            await fetch(
                GITA_CONFIG.DATA_URL,
                {
                    cache:
                        "force-cache"
                }
            );


        if(
            !response.ok
        ){

            throw new Error(
                "Gita data unavailable"
            );

        }


        const data =
            await response.json();


        allVerses =
            normalizeData(
                data
            );


        uniqueVerses();


        /*
         * Keep standard 700
         */

        if(
            allVerses.length > 700
        ){

            allVerses =
                allVerses
                    .filter(

                        v =>

                        !(
                            v.chapter === 13 &&
                            v.verse === 1
                        )

                    )
                    .slice(
                        0,
                        700
                    );

        }


        /* Hindi */

        try{

            const responseHindi =
                await fetch(
                    GITA_CONFIG.HINDI_URL,
                    {
                        cache:
                            "force-cache"
                    }
                );


            if(
                responseHindi.ok
            ){

                hindiData =
                    await responseHindi.json();

            }

        }

        catch(error){

            console.warn(
                "Hindi unavailable",
                error
            );

        }


        buildGita();


        renderGita();


        console.log(
            "🪷 SANSKRITAM:",
            allVerses.length,
            "verses loaded"
        );

    }

    catch(error){

        console.error(
            error
        );


        if(box){

            box.innerHTML = `

                <div
                    class="gita-loading-card"
                >

                    ⚠️

                    <br><br>

                    <b>
                        Bhagavad Gita
                        load થઈ શકી નથી.
                    </b>

                    <br><br>

                    Internet connection
                    તપાસો.

                    <br><br>

                    <button
                        class="primary"
                        onclick="
                        loadGita()
                        "
                    >

                        🔄 Retry

                    </button>

                </div>

            `;

        }

    }

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