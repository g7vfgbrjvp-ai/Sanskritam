/* =========================================================
   🚩 SANSKRITAM — RAMAYANA ENGINE
   Valmiki Ramayana
   Sanskrit + English + Hindi + Gujarati
========================================================= */

const RAMAYANA_KANDAS = [
    [1, "બાલકાંડ", "Bala Kanda", "શ્રી રામનો જન્મ અને બાળપણ"],
    [2, "અયોધ્યાકાંડ", "Ayodhya Kanda", "રાજ્યાભિષેકની તૈયારી અને વનવાસ"],
    [3, "અરણ્યકાંડ", "Aranya Kanda", "વનવાસ અને સીતા હરણ"],
    [4, "કિષ્કિંધાકાંડ", "Kishkindha Kanda", "સુગ્રીવ સાથે મૈત્રી અને વાનર સેના"],
    [5, "સુંદરકાંડ", "Sundara Kanda", "હનુમાનજીની લંકા યાત્રા"],
    [6, "યુદ્ધકાંડ", "Yuddha Kanda", "રામ-રાવણ યુદ્ધ"],
    [7, "ઉત્તરકાંડ", "Uttara Kanda", "અયોધ્યા પરત અને આગળની કથા"]
];


/* =========================================================
   RAMAYANA SAMPLE DATA
   ========================================================= */

const ramayanaData = {

    /* ---------- બાલકાંડ ---------- */

    "1-1-1": {
        kanda: 1,
        sarga: 1,
        verse: 1,
        sanskrit:
`तपःस्वाध्यायनिरतं तपस्वी वाग्विदां वरम् ।
नारदं परिपप्रच्छ वाल्मीकिर्मुनिपुङ्गवम् ॥`,
        english:
        "Valmiki, the foremost among sages, asked Narada, who was devoted to austerity and study and was the best among those skilled in speech."
    },

    "1-1-2": {
        kanda: 1,
        sarga: 1,
        verse: 2,
        sanskrit:
`कोन्वस्मिन् साम्प्रतं लोके गुणवान् कश्च वीर्यवान् ।
धर्मज्ञश्च कृतज्ञश्च सत्यवाक्यो दृढव्रतः ॥`,
        english:
        "Who in this world is virtuous, powerful, righteous, grateful, truthful and firm in his vows?"
    },

    "1-1-3": {
        kanda: 1,
        sarga: 1,
        verse: 3,
        sanskrit:
`चारित्रेण च को युक्तः सर्वभूतेषु को हितः ।
विद्वान् कः कः समर्थश्च कश्चैकप्रियदर्शनः ॥`,
        english:
        "Who is endowed with noble character, who is devoted to the welfare of all beings, who is learned, capable and pleasing to behold?"
    },


    /* ---------- અયોધ્યાકાંડ ---------- */

    "2-21-41": {
        kanda: 2,
        sarga: 21,
        verse: 41,
        sanskrit:
`धर्मो हि परमो लोके धर्मे सत्यं प्रतिष्ठितम् ।
धर्मसंश्रितमेतच्च पितुर्वचनमुत्तमम् ॥`,
        english:
        "Dharma is supreme in this world, and truth is established in Dharma. This excellent command of my father is also based upon Dharma."
    },

    "2-111-14": {
        kanda: 2,
        sarga: 111,
        verse: 14,
        sanskrit:
`सत्यमेवेश्वरो लोके सत्ये धर्मः सदाश्रितः ।
सत्यमूलानि सर्वाणि सत्यान्नास्ति परं पदम् ॥`,
        english:
        "Truth is God in this world. Dharma always rests upon truth. Everything has its root in truth, and there is no higher principle than truth."
    },


    /* ---------- અરણ્યકાંડ ---------- */

    "3-43-1": {
        kanda: 3,
        sarga: 43,
        verse: 1,
        sanskrit:
`सीताया वचनं श्रुत्वा परुषं रोमहर्षणम् ।
लक्ष्मणः प्राञ्जलिर्भूत्वा उवाच जनकनन्दिनीम् ॥`,
        english:
        "Hearing the harsh and disturbing words of Sita, Lakshmana, with folded hands, spoke to the daughter of Janaka."
    },

    "3-68-30": {
        kanda: 3,
        sarga: 68,
        verse: 30,
        sanskrit:
`उत्साहो बलवानार्य नास्त्युत्साहात्परं बलम् ।
सोत्साहस्य च लोकेषु न किंचिदपि दुर्लभम् ॥`,
        english:
        "O noble one, enthusiasm is powerful. There is no strength greater than enthusiasm. For an enthusiastic person, nothing in this world is difficult to obtain."
    },


    /* ---------- કિષ્કિંધાકાંડ ---------- */

    "4-8-32": {
        kanda: 4,
        sarga: 8,
        verse: 32,
        sanskrit:
`यद्यदागच्छति प्राप्तं तत्तदत्र विमृश्यते ।
सुहृदामर्थकृच्छ्रेषु किं न कुर्वन्ति साधवः ॥`,
        english:
        "When friends are in difficulty, good people carefully consider the situation and do whatever is necessary."
    },


    /* ---------- સુંદરકાંડ ---------- */

    "5-15-2": {
        kanda: 5,
        sarga: 15,
        verse: 2,
        sanskrit:
`नमस्तुभ्यं महादेवि सीते दुःखविनाशिनि ।
रामाय रामभद्राय रामचन्द्राय वेधसे ॥`,
        english:
        "Salutations to you, O great goddess Sita, destroyer of sorrow. Salutations to Rama, Ramabhadra and Ramachandra."
    },

    "5-36-40": {
        kanda: 5,
        sarga: 36,
        verse: 40,
        sanskrit:
`न रामसदृशो लोके गुणवान् कश्च वीर्यवान् ।
तस्यैव च कृते सीतां मार्गमाणोऽहमागतः ॥`,
        english:
        "There is no one in the world equal to Rama in virtue and valor. For his sake I have come searching for Sita."
    },


    /* ---------- યુદ્ધકાંડ ---------- */

    "6-105-1": {
        kanda: 6,
        sarga: 105,
        verse: 1,
        sanskrit:
`ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम् ।
रावणं चाग्रतो दृष्ट्वा युद्धाय समुपस्थितम् ॥`,
        english:
        "Seeing Rama exhausted from the battle and Ravana standing before him ready for combat..."
    },

    "6-105-2": {
        kanda: 6,
        sarga: 105,
        verse: 2,
        sanskrit:
`दैवतैश्च समागम्य द्रष्टुमभ्यागतो रणम् ।
उपगम्याब्रवीद् राममगस्त्यो भगवान् ऋषिः ॥`,
        english:
        "The great sage Agastya, who had come with the gods to witness the battle, approached Rama and spoke."
    },


    /* ---------- ઉત્તરકાંડ ---------- */

    "7-97-1": {
        kanda: 7,
        sarga: 97,
        verse: 1,
        sanskrit:
`ततः सीतामुपादाय राघवो लक्ष्मणस्तदा ।
अभिवाद्य मुनिं रामः प्रहृष्टेनान्तरात्मना ॥`,
        english:
        "Then Raghava and Lakshmana, having taken Sita, respectfully greeted the sage with joyful hearts."
    }
};


/* =========================================================
   RAMAYANA MAIN PAGE
========================================================= */

function renderRamayana(){

    const box = document.getElementById("ramayanaList");

    if(!box) return;

    document.getElementById("granthVerseReader")?.remove();

    let html = `
        <div class="granth-status">
            <b>🚩 વાલ્મીકિ રામાયણ</b><br>
            <span class="source">
                7 કાંડ • સંસ્કૃત શ્લોક • અર્થ
            </span>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
    `;

    RAMAYANA_KANDAS.forEach(
        ([id, guName, enName, subtitle]) => {

            html += `
                <div
                    class="card chapter"
                    onclick="openRamayanaKanda(${id})"
                    style="margin-bottom:0;"
                >

                    <div
                        class="chapterNo"
                        style="
                            background:
                            linear-gradient(
                                145deg,
                                #e74c3c,
                                #c0392b
                            );
                        "
                    >
                        ${id}
                    </div>

                    <div>

                        <div class="chapterTitle">
                            ${guName}
                        </div>

                        <div class="chapterSub">
                            ${enName} • ${subtitle}
                        </div>

                    </div>

                </div>
            `;
        }
    );

    html += `</div>`;

    box.innerHTML = html;
}


/* =========================================================
   OPEN KANDA
========================================================= */

function openRamayanaKanda(kandaId){

    const box = document.getElementById("ramayanaList");

    if(!box) return;

    document.getElementById("granthVerseReader")?.remove();

    const kanda = RAMAYANA_KANDAS.find(
        x => x[0] === kandaId
    );

    if(!kanda) return;

    let html = `
        <div
            class="back"
            onclick="renderRamayana()"
        >
            ← બધા કાંડ
        </div>

        <div class="granth-chapter">

            <h3>
                🚩 ${kanda[1]}
            </h3>

            <div class="chapterSub">
                ${kanda[2]} • ${kanda[3]}
            </div>

            <br>

            <div class="granth-grid">
    `;

    let found = false;

    Object.entries(ramayanaData).forEach(
        ([key, verse]) => {

            if(verse.kanda !== kandaId) return;

            found = true;

            html += `
                <button
                    type="button"
                    class="granth-btn"
                    onclick="openRamayanaVerse('${key}')"
                >
                    સર્ગ ${verse.sarga}.${verse.verse}
                </button>
            `;
        }
    );

    if(!found){

        html += `
            <div
                style="
                    grid-column:1/-1;
                    text-align:center;
                    padding:25px 10px;
                    color:var(--muted);
                "
            >
                📖 આ કાંડના વધુ શ્લોકો
                ટૂંક સમયમાં ઉમેરવામાં આવશે.
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    box.innerHTML = html;

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}


/* =========================================================
   OPEN RAMAYANA VERSE
========================================================= */

async function openRamayanaVerse(key){

    const verse = ramayanaData[key];

    if(!verse){
        if(typeof toast === "function"){
            toast("આ શ્લોક ઉપલબ્ધ નથી.");
        }
        return;
    }

    document.getElementById("granthVerseReader")?.remove();

    const reader = document.createElement("div");

    reader.id = "granthVerseReader";
    reader.className = "granth-reader";

    reader.innerHTML = `

        <div
            class="back"
            onclick="openRamayanaKanda(${verse.kanda})"
        >
            ← શ્લોક સૂચિ
        </div>

        <div
            style="
                font-size:20px;
                font-weight:bold;
            "
        >
            🚩 Valmiki Ramayana
        </div>

        <div class="source">
            કાંડ ${verse.kanda}
            • સર્ગ ${verse.sarga}
            • શ્લોક ${verse.verse}
        </div>

        <hr>

        <h3>
            🕉️ संस्कृत श्लोक
        </h3>

        <div class="granth-sanskrit">
            ${esc(verse.sanskrit)}
        </div>

        <hr>

        <h3>
            🇬🇧 English Meaning
        </h3>

        <p class="meaning">
            ${esc(verse.english)}
        </p>

        <hr>

        <h3>
            🇮🇳 हिन्दी अर्थ
        </h3>

        <p
            id="ram-hi-${key}"
            class="meaning"
        >
            हिन्दी अर्थ મેળવવામાં આવી રહ્યો છે...
        </p>

        <hr>

        <h3>
            🇮🇳 ગુજરાતી અર્થ
        </h3>

        <p
            id="ram-gu-${key}"
            class="meaning"
        >
            ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...
        </p>

        <div class="actions">

            <button
                onclick="saveRamayanaFavorite('${key}')"
            >
                ❤️ Favorite
            </button>

            <button
                onclick="speakText(${JSON.stringify(verse.sanskrit)})"
            >
                🔊 સાંભળો
            </button>

            <button
                onclick="shareText(${JSON.stringify(verse.sanskrit)})"
            >
                📤 Share
            </button>

        </div>
    `;

    document
        .getElementById("ramayana")
        .insertBefore(
            reader,
            document.getElementById("ramayanaList")
        );

    await translateRamayanaMeaning(key);

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}


/* =========================================================
   TRANSLATION
========================================================= */

async function translateRamayanaMeaning(key){

    const verse = ramayanaData[key];

    if(!verse) return;

    const hi = document.getElementById(
        "ram-hi-" + key
    );

    const gu = document.getElementById(
        "ram-gu-" + key
    );

    if(!verse.english){

        if(hi)
            hi.textContent =
            "हिन्दी अर्थ उपलब्ध नहीं है।";

        if(gu)
            gu.textContent =
            "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

        return;
    }


    /* ---------- Hindi ---------- */

    if(hi)
        hi.textContent =
        "हिन्दी अर्थ प्राप्त किया जा रहा है...";

    try{

        const hindi =
            await translateText(
                verse.english,
                "hi"
            );

        if(hi){

            hi.textContent =
                hindi ||
                "हिन्दी अर्थ उपलब्ध नहीं है।";
        }

    }catch{

        if(hi)
            hi.textContent =
            "हिन्दी अर्थ उपलब्ध नहीं है।";
    }


    /* ---------- Gujarati ---------- */

    if(gu)
        gu.textContent =
        "ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";

    try{

        const gujarati =
            await translateText(
                verse.english,
                "gu"
            );

        if(gu){

            gu.textContent =
                gujarati ||
                "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";
        }

    }catch{

        if(gu)
            gu.textContent =
            "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";
    }
}


/* =========================================================
   FAVORITE
========================================================= */

function saveRamayanaFavorite(key){

    const verse = ramayanaData[key];

    if(!verse) return;

    if(typeof addFavorite === "function"){

        addFavorite(
            `Ramayana ${verse.kanda}.${verse.sarga}.${verse.verse} — ${verse.sanskrit}`
        );

    }
}


/* =========================================================
   GLOBAL
========================================================= */

window.RAMAYANA_KANDAS =
    RAMAYANA_KANDAS;

window.ramayanaData =
    ramayanaData;

window.renderRamayana =
    renderRamayana;

window.openRamayanaKanda =
    openRamayanaKanda;

window.openRamayanaVerse =
    openRamayanaVerse;

window.saveRamayanaFavorite =
    saveRamayanaFavorite;


/* =========================================================
   START
========================================================= */

if(document.readyState === "loading"){

    document.addEventListener(
        "DOMContentLoaded",
        renderRamayana
    );

}else{

    renderRamayana();

}