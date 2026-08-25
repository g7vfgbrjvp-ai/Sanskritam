const gita = {
  "2-47": {
    chapter: 2,
    verse: 47,
    sanskrit:
      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    english:
      "You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
    hindi:
      "तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में नहीं। इसलिए कर्म के फल को अपना उद्देश्य मत बनाओ और कर्म न करने में भी आसक्त मत हो।",
    gujarati:
      "તમારો અધિકાર માત્ર કર્મ કરવા પર છે, તેના ફળ પર નથી. તેથી કર્મના ફળને તમારો હેતુ ન બનાવો અને કર્મ ન કરવાની આસક્તિ પણ ન રાખો।"
  },

  "2-48": {
    chapter: 2,
    verse: 48,
    sanskrit:
      "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
    english:
      "Perform your duties with a balanced mind, giving up attachment to success and failure.",
    hindi:
      "हे धनंजय! आसक्ति को त्यागकर समभाव से कर्म करो। सफलता और असफलता में समान भाव रखना ही योग कहलाता है।",
    gujarati:
      "હે ધનંજય! આસક્તિ છોડીને સમતાભાવથી કર્મ કરો. સફળતા અને નિષ્ફળતામાં સમાન ભાવ રાખવો એ જ યોગ કહેવાય છે."
  }
};


/* =========================
   GITA CHAPTERS
========================= */

const gitaChapters = [
  [1, "अर्जुनविषादयोग"],
  [2, "सांख्ययोग"],
  [3, "कर्मयोग"],
  [4, "ज्ञानकर्मसंन्यासयोग"],
  [5, "कर्मसंन्यासयोग"],
  [6, "आत्मसंयमयोग"],
  [7, "ज्ञानविज्ञानयोग"],
  [8, "अक्षरब्रह्मयोग"],
  [9, "राजविद्याराजगुह्ययोग"],
  [10, "विभूतियोग"],
  [11, "विश्वरूपदर्शनयोग"],
  [12, "भक्तियोग"],
  [13, "क्षेत्रक्षेत्रज्ञविभागयोग"],
  [14, "गुणत्रयविभागयोग"],
  [15, "पुरुषोत्तमयोग"],
  [16, "दैवासुरसम्पद्विभागयोग"],
  [17, "श्रद्धात्रयविभागयोग"],
  [18, "मोक्षसंन्यासयोग"]
];


/* =========================
   VERSES PER CHAPTER
========================= */

const gitaVerseCount = [
  47,
  72,
  43,
  42,
  29,
  47,
  30,
  28,
  34,
  42,
  55,
  20,
  35,
  27,
  20,
  24,
  28,
  78
];


/* =========================
   OPEN VERSE
========================= */

function openGitaVerse(key) {

  const verse = gita[key];

  if (!verse) {

    alert(
      "આ શ્લોકનો data હજુ ઉમેરવાનો બાકી છે."
    );

    return;
  }

  document
    .querySelectorAll(".view")
    .forEach(function(v) {
      v.classList.remove("active");
    });


  let section =
    document.getElementById("dynamicGitaVerse");


  if (!section) {

    section =
      document.createElement("section");

    section.id =
      "dynamicGitaVerse";

    section.className =
      "view";

    document
      .querySelector("main")
      .appendChild(section);
  }


  section.innerHTML = `

    <div
      class="back"
      onclick="show('gita')">

      ← Bhagavad Gita

    </div>

    <div class="card">

      <h2>
        📖 Bhagavad Gita
        ${verse.chapter}.${verse.verse}
      </h2>

      <div class="shlok">
        ${verse.sanskrit}
      </div>

      <hr>

      <h3>🇬🇧 English Meaning</h3>

      <p>
        ${verse.english}
      </p>


      <h3>🇮🇳 हिन्दी अर्थ</h3>

      <p>
        ${verse.hindi}
      </p>


      <h3>🇮🇳 ગુજરાતી અર્થ</h3>

      <p>
        ${verse.gujarati}
      </p>


      <button
        class="primary"
        onclick="addFavorite(
          '${verse.sanskrit.replace(/'/g, "\\'")}'
        )">

        ❤️ Favorite

      </button>

    </div>
  `;


  section.classList.add("active");

  window.scrollTo(0, 0);
}