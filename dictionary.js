/* =====================================================
   SANSKRITAM 🪷
   SANSKRIT DICTIONARY
   Sanskrit → Gujarati / Hindi / English
   ===================================================== */

(function () {

  "use strict";

  /* ===================================================
     STYLE
     =================================================== */

  const style = document.createElement("style");

  style.textContent = `
    #dictionary {
      padding: 18px;
      padding-bottom: 100px;
    }

    .dictionary-box {
      background: white;
      border-radius: 18px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,.08);
    }

    .dictionary-title {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 6px;
    }

    .dictionary-subtitle {
      color: #777;
      font-size: 14px;
      margin-bottom: 16px;
    }

    #dictionaryInput {
      width: 100%;
      padding: 14px 16px;
      border: 1px solid #ddd;
      border-radius: 14px;
      font-size: 17px;
      outline: none;
      background: #fffaf0;
    }

    #dictionaryInput:focus {
      border-color: #8f5b0a;
    }

    .dictionary-search-btn {
      width: 100%;
      margin-top: 10px;
      padding: 13px;
      border: none;
      border-radius: 14px;
      background: #8f5b0a;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
    }

    .dictionary-result {
      margin-top: 16px;
    }

    .meaning-card {
      background: #fffaf0;
      border-radius: 15px;
      padding: 15px;
      margin-top: 12px;
    }

    .meaning-label {
      font-size: 13px;
      font-weight: 700;
      color: #8f5b0a;
      margin-bottom: 5px;
    }

    .meaning-text {
      font-size: 18px;
      line-height: 1.6;
    }

    .sanskrit-word {
      font-family:
        "Noto Sans Devanagari",
        serif;
      font-size: 30px;
      font-weight: 800;
      text-align: center;
      margin: 8px 0 16px;
    }

    .speak-dictionary-btn {
      display: block;
      margin: 10px auto;
      padding: 10px 18px;
      border: none;
      border-radius: 25px;
      background: #f0dfbd;
      color: #3d2b1f;
      font-size: 15px;
      cursor: pointer;
    }

    .dictionary-loading {
      text-align: center;
      padding: 20px;
      color: #777;
    }

    .dictionary-error {
      background: #fff0f0;
      color: #a33;
      padding: 14px;
      border-radius: 12px;
      margin-top: 12px;
    }

    .dictionary-example {
      margin-top: 16px;
      color: #777;
      font-size: 13px;
    }
  `;

  document.head.appendChild(style);


  /* ===================================================
     ADD DICTIONARY SECTION
     =================================================== */

  function createDictionary() {

    if (document.getElementById("dictionary")) {
      return;
    }

    const main = document.querySelector("main");

    if (!main) {
      return;
    }

    const section = document.createElement("section");

    section.id = "dictionary";

    section.style.display = "none";

    section.innerHTML = `

      <div class="dictionary-box">

        <div class="dictionary-title">
          📖 Sanskrit Dictionary
        </div>

        <div class="dictionary-subtitle">
          संस्कृत शब्दનો ગુજરાતી, हिन्दी અને English અર્થ
        </div>

        <input
          id="dictionaryInput"
          type="search"
          placeholder="🔍 संस्कृत शब्द લખો..."
          autocomplete="off"
        >

        <button
          class="dictionary-search-btn"
          onclick="searchSanskritWord()"
        >
          🔎 અર્થ શોધો
        </button>

        <div
          id="dictionaryResult"
          class="dictionary-result"
        ></div>

        <div class="dictionary-example">
          ઉદાહરણ: धर्म, कर्म, ज्ञान, प्रेम, सत्य, आत्मा
        </div>

      </div>

    `;

    main.appendChild(section);
  }


  /* ===================================================
     GOOGLE TRANSLATE
     =================================================== */

  async function translateSanskrit(
    text,
    target
  ) {

    const url =
      "https://translate.googleapis.com/" +
      "translate_a/single" +
      "?client=gtx" +
      "&sl=sa" +
      "&tl=" +
      encodeURIComponent(target) +
      "&dt=t" +
      "&q=" +
      encodeURIComponent(text);

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Translation failed"
      );
    }

    const data =
      await response.json();

    let result = "";

    if (
      Array.isArray(data) &&
      Array.isArray(data[0])
    ) {

      data[0].forEach(part => {

        if (
          Array.isArray(part) &&
          part[0]
        ) {
          result += part[0];
        }

      });

    }

    return result.trim();
  }


  /* ===================================================
     LOCAL BASIC DICTIONARY
     =================================================== */

  const LOCAL_WORDS = {

    "धर्म": {
      gu: "ધર્મ, કર્તવ્ય, ન્યાય",
      hi: "धर्म, कर्तव्य, न्याय",
      en: "Dharma, duty, righteousness"
    },

    "कर्म": {
      gu: "કર્મ, કાર્ય",
      hi: "कर्म, कार्य",
      en: "Action, deed"
    },

    "ज्ञान": {
      gu: "જ્ઞાન, સમજ",
      hi: "ज्ञान, समझ",
      en: "Knowledge, wisdom"
    },

    "प्रेम": {
      gu: "પ્રેમ, સ્નેહ",
      hi: "प्रेम, स्नेह",
      en: "Love, affection"
    },

    "सत्य": {
      gu: "સત્ય",
      hi: "सत्य",
      en: "Truth"
    },

    "आत्मा": {
      gu: "આત્મા",
      hi: "आत्मा",
      en: "Soul, self"
    },

    "ईश्वर": {
      gu: "ઈશ્વર, ભગવાન",
      hi: "ईश्वर, भगवान",
      en: "God, Supreme Being"
    },

    "भगवान": {
      gu: "ભગવાન",
      hi: "भगवान",
      en: "God, Lord"
    },

    "शान्ति": {
      gu: "શાંતિ",
      hi: "शान्ति",
      en: "Peace"
    },

    "योग": {
      gu: "યોગ, આધ્યાત્મિક સાધના",
      hi: "योग, आध्यात्मिक साधना",
      en: "Yoga, spiritual discipline"
    },

    "भक्ति": {
      gu: "ભક્તિ, ભગવાન પ્રત્યે પ્રેમ",
      hi: "भक्ति, ईश्वर के प्रति प्रेम",
      en: "Devotion, love for God"
    },

    "ज्ञानम्": {
      gu: "જ્ઞાન",
      hi: "ज्ञान",
      en: "Knowledge"
    },

    "मोक्ष": {
      gu: "મોક્ષ, મુક્તિ",
      hi: "मोक्ष, मुक्ति",
      en: "Liberation, salvation"
    },

    "माता": {
      gu: "માતા",
      hi: "माता",
      en: "Mother"
    },

    "पिता": {
      gu: "પિતા",
      hi: "पिता",
      en: "Father"
    },

    "गुरु": {
      gu: "ગુરુ, શિક્ષક",
      hi: "गुरु, शिक्षक",
      en: "Teacher, spiritual guide"
    }

  };


  /* ===================================================
     NORMALIZE
     =================================================== */

  function normalizeWord(word) {

    return String(word || "")
      .trim()
      .replace(/[।॥,.!?]/g, "");

  }


  /* ===================================================
     SEARCH
     =================================================== */

  window.searchSanskritWord =
    async function () {

      const input =
        document.getElementById(
          "dictionaryInput"
        );

      const result =
        document.getElementById(
          "dictionaryResult"
        );

      if (!input || !result) {
        return;
      }

      const word =
        normalizeWord(input.value);

      if (!word) {

        result.innerHTML = `
          <div class="dictionary-error">
            કૃપા કરીને સંસ્કૃત શબ્દ લખો.
          </div>
        `;

        return;
      }


      /* LOCAL RESULT */

      const local =
        LOCAL_WORDS[word];


      result.innerHTML = `
        <div class="dictionary-loading">
          🔄 અર્થ શોધી રહ્યા છીએ...
        </div>
      `;


      try {

        let gu = "";
        let hi = "";
        let en = "";


        if (local) {

          gu = local.gu;
          hi = local.hi;
          en = local.en;

        } else {

          /*
             Google Translate
             Sanskrit → Gujarati
          */

          const results =
            await Promise.all([

              translateSanskrit(
                word,
                "gu"
              ),

              translateSanskrit(
                word,
                "hi"
              ),

              translateSanskrit(
                word,
                "en"
              )

            ]);

          gu = results[0];
          hi = results[1];
          en = results[2];

        }


        result.innerHTML = `

          <div class="sanskrit-word">
            ${escapeDictionary(word)}
          </div>

          <button
            class="speak-dictionary-btn"
            onclick="speakSanskritWord(
              '${escapeJs(word)}'
            )"
          >
            🔊 ઉચ્ચાર સાંભળો
          </button>


          <div class="meaning-card">

            <div class="meaning-label">
              🇮🇳 ગુજરાતી અર્થ
            </div>

            <div class="meaning-text">
              ${escapeDictionary(
                gu || "અર્થ મળ્યો નથી"
              )}
            </div>

          </div>


          <div class="meaning-card">

            <div class="meaning-label">
              🇮🇳 हिन्दी अर्थ
            </div>

            <div class="meaning-text">
              ${escapeDictionary(
                hi || "अर्थ नहीं मिला"
              )}
            </div>

          </div>


          <div class="meaning-card">

            <div class="meaning-label">
              🇬🇧 English Meaning
            </div>

            <div class="meaning-text">
              ${escapeDictionary(
                en || "Meaning not found"
              )}
            </div>

          </div>

        `;

      } catch (error) {

        console.error(
          "Dictionary error:",
          error
        );

        result.innerHTML = `

          <div class="dictionary-error">

            ❌ અત્યારે online અર્થ મળી શક્યો નથી.

            <br><br>

            Internet connection check કરો
            અને ફરી પ્રયાસ કરો.

          </div>

        `;

      }

    };


  /* ===================================================
     SPEECH
     =================================================== */

  window.speakSanskritWord =
    function (word) {

      if (
        !("speechSynthesis" in window)
      ) {

        alert(
          "તમારા browserમાં voice support નથી."
        );

        return;
      }

      speechSynthesis.cancel();

      const voice =
        new SpeechSynthesisUtterance(
          word
        );

      voice.lang = "sa-IN";

      voice.rate = 0.75;

      speechSynthesis.speak(
        voice
      );

    };


  /* ===================================================
     ESCAPE HTML
     =================================================== */

  function escapeDictionary(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function escapeJs(value) {

    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'");

  }


  /* ===================================================
     ENTER KEY
     =================================================== */

  document.addEventListener(
    "keydown",
    function (event) {

      const input =
        document.getElementById(
          "dictionaryInput"
        );

      if (
        input &&
        document.activeElement === input &&
        event.key === "Enter"
      ) {

        searchSanskritWord();

      }

    }
  );


  /* ===================================================
     INITIALIZE
     =================================================== */

  function initializeDictionary() {

    createDictionary();

  }


  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initializeDictionary
    );

  } else {

    initializeDictionary();

  }

})();