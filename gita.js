/* =========================================================
   BRAHMANSH — BHAGAVAD GITA ENGINE
   18 Chapters • 700 Shlokas
   Gujarati • Hindi • English
========================================================= */

(function () {

  "use strict";

  /* =======================================================
     CONFIG
  ======================================================= */

  const GITA_CONFIG = {

    DATA_URL:
      "https://raw.githubusercontent.com/ChiragMirani/gita-quotes/main/docs/data.json",

    HINDI_URL:
      "https://raw.githubusercontent.com/kashishkhullar/gita_json/master/dataset_hindi.json",

    MYMEMORY_URL:
      "https://api.mymemory.translated.net/get",

    GOOGLE_URL:
      "https://translate.googleapis.com/translate_a/single",

    CACHE_KEY:
      "brahmansh_gita_gujarati_v2"

  };


  /* =======================================================
     CHAPTERS
  ======================================================= */

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
    [18, "मोक्षसंन्यासयोग", 78

  ];


  /* =======================================================
     STATE
  ======================================================= */

  let gita = {};
  let allVerses = [];
  let hindiData = null;
  let currentVerse = null;
  let loadingPromise = null;


  /* =======================================================
     HELPERS
  ======================================================= */

  function $(id) {
    return document.getElementById(id);
  }


  function esc(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function clean(value) {

    return String(value ?? "")
      .replace(/\r/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  }


  function valueFrom(obj, keys) {

    if (!obj || typeof obj !== "object") {
      return "";
    }

    for (const key of keys) {

      if (
        obj[key] !== undefined &&
        obj[key] !== null &&
        obj[key] !== ""
      ) {

        return obj[key];

      }

    }

    return "";

  }


  function currentLanguage() {

    return (
      localStorage.getItem("brahmanshLanguage") ||
      "gu"
    );

  }


  /* =======================================================
     NORMALIZE VERSE
  ======================================================= */

  function normalizeVerse(row) {

    if (!row || typeof row !== "object") {
      return null;
    }

    const chapter = Number(
      valueFrom(row, [
        "chapter",
        "chapter_number",
        "chapterNumber",
        "chapter_id"
      ])
    );

    const verse = Number(
      valueFrom(row, [
        "verse",
        "verse_number",
        "verseNumber",
        "verse_id"
      ])
    );

    const sanskrit = clean(
      valueFrom(row, [
        "sanskrit",
        "devanagari",
        "slok",
        "shloka",
        "verse_text",
        "text"
      ])
    );

    const english = clean(
      valueFrom(row, [
        "english",
        "translation",
        "translation_en",
        "meaning",
        "english_meaning"
      ])
    );

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

      key:
        chapter + "-" + verse,

      sanskrit: sanskrit,

      english: english,

      hindi: ""

    };

  }


  /* =======================================================
     NORMALIZE DATA
  ======================================================= */

  function normalizeData(data) {

    let rows = [];


    if (Array.isArray(data)) {

      rows = data;

    }

    else if (
      data &&
      Array.isArray(data.data)
    ) {

      rows = data.data;

    }

    else if (
      data &&
      Array.isArray(data.verses)
    ) {

      rows = data.verses;

    }

    else if (
      data &&
      Array.isArray(data.chapters)
    ) {

      data.chapters.forEach(function (chapterData) {

        const verses =
          chapterData.verses;

        if (Array.isArray(verses)) {

          verses.forEach(function (verse) {

            rows.push({

              ...verse,

              chapter:
                verse.chapter ??
                chapterData.chapter ??
                chapterData.chapter_number

            });

          });

        }

        else if (
          verses &&
          typeof verses === "object"
        ) {

          Object.values(verses)
            .forEach(function (verse) {

              rows.push({

                ...verse,

                chapter:
                  verse.chapter ??
                  chapterData.chapter ??
                  chapterData.chapter_number

              });

            });

        }

      });

    }

    else if (
      data &&
      typeof data === "object"
    ) {

      Object.entries(data)
        .forEach(function ([key, value]) {

          if (
            /^\d+-\d+$/.test(key) &&
            value &&
            typeof value === "object"
          ) {

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


    const map = new Map();


    rows
      .map(normalizeVerse)
      .filter(Boolean)
      .forEach(function (verse) {

        if (!map.has(verse.key)) {

          map.set(
            verse.key,
            verse
          );

        }

      });


    return Array.from(map.values())
      .sort(function (a, b) {

        return (
          a.chapter - b.chapter ||
          a.verse - b.verse
        );

      });

  }


  /* =======================================================
     MAKE EXACT 700 VERSES
  ======================================================= */

  function makeExactly700(verses) {

    const allowed = {};

    GITA_CHAPTERS.forEach(function (chapter) {

      allowed[chapter[0]] = chapter[2];

    });


    const result = verses.filter(function (verse) {

      const max =
        allowed[verse.chapter];

      if (!max) {
        return false;
      }

      return verse.verse <= max;

    });


    return result.sort(function (a, b) {

      return (
        a.chapter - b.chapter ||
        a.verse - b.verse
      );

    });

  }


  /* =======================================================
     HINDI
  ======================================================= */

  function findHindi(chapter, verse) {

    if (!hindiData) {
      return "";
    }


    const key =
      chapter + "-" + verse;


    let item = null;


    if (
      hindiData &&
      hindiData[key]
    ) {

      item =
        hindiData[key];

    }


    if (
      !item &&
      Array.isArray(hindiData)
    ) {

      item =
        hindiData.find(function (row) {

          return (

            Number(
              valueFrom(row, [
                "chapter",
                "chapter_number",
                "chapterNumber"
              ])
            ) === chapter &&

            Number(
              valueFrom(row, [
                "verse",
                "verse_number",
                "verseNumber"
              ])
            ) === verse

          );

        });

    }


    if (!item) {
      return "";
    }


    if (typeof item === "string") {

      return clean(item);

    }


    return clean(
      valueFrom(item, [

        "verse_meaning_hindi",
        "meaning_hindi",
        "hindi_meaning",
        "translation_hindi",
        "translation_hi",
        "hindi",
        "meaning"

      ])
    );

  }


  function buildGita() {

    gita = {};


    allVerses.forEach(function (verse) {

      verse.hindi =
        findHindi(
          verse.chapter,
          verse.verse
        );

      gita[verse.key] =
        verse;

    });


    window.gita =
      gita;

  }


  /* =======================================================
     GUJARATI CACHE
  ======================================================= */

  function getGujaratiCache() {

    try {

      return JSON.parse(
        localStorage.getItem(
          GITA_CONFIG.CACHE_KEY
        ) || "{}"
      );

    }

    catch (error) {

      return {};

    }

  }


  function saveGujaratiCache(
    key,
    text
  ) {

    try {

      const cache =
        getGujaratiCache();

      cache[key] =
        text;

      localStorage.setItem(
        GITA_CONFIG.CACHE_KEY,
        JSON.stringify(cache)
      );

    }

    catch (error) {}

  }


  /* =======================================================
     TRANSLATION
  ======================================================= */

  function splitTranslation(text) {

    const words =
      String(text)
        .trim()
        .split(/\s+/);


    const chunks = [];

    let current = "";


    for (
      let i = 0;
      i < words.length;
      i++
    ) {

      const word =
        words[i];

      const next =
        current
          ? current + " " + word
          : word;


      if (
        new TextEncoder()
          .encode(next)
          .length > 450 &&
        current
      ) {

        chunks.push(
          current
        );

        current =
          word;

      }

      else {

        current =
          next;

      }

    }


    if (current) {

      chunks.push(
        current
      );

    }


    return chunks;

  }


  async function translateMyMemory(text) {

    const chunks =
      splitTranslation(text);

    const result = [];


    for (
      let i = 0;
      i < chunks.length;
      i++
    ) {

      const url =
        GITA_CONFIG.MYMEMORY_URL +
        "?q=" +
        encodeURIComponent(
          chunks[i]
        ) +
        "&langpair=en|gu";


      const response =
        await fetch(
          url,
          {
            cache: "no-store"
          }
        );


      if (!response.ok) {

        throw new Error(
          "Translation HTTP " +
          response.status
        );

      }


      const data =
        await response.json();


      const translated =
        data &&
        data.responseData &&
        data.responseData.translatedText
          ? data.responseData.translatedText
          : "";


      if (!translated) {

        throw new Error(
          "Empty translation"
        );

      }


      result.push(
        translated
      );

    }


    return clean(
      result.join(" ")
    );

  }


  async function translateGoogle(text) {

    const url =
      GITA_CONFIG.GOOGLE_URL +
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
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Google HTTP " +
        response.status
      );

    }


    const data =
      await response.json();


    const translated =
      Array.isArray(data[0])
        ? data[0]
            .map(function (part) {

              return part[0] || "";

            })
            .join("")
        : "";


    if (!translated.trim()) {

      throw new Error(
        "Empty translation"
      );

    }


    return clean(
      translated
    );

  }


  async function translateGujarati(key) {

    const verse =
      gita[key];

    const target =
      $("gu-" + key);


    if (
      !verse ||
      !target
    ) {

      return;

    }


    const cache =
      getGujaratiCache();


    if (cache[key]) {

      target.textContent =
        cache[key];

      return;

    }


    if (!verse.english) {

      target.textContent =
        "ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

      return;

    }


    target.textContent =
      "ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";


    try {

      const translated =
        await translateMyMemory(
          verse.english
        );


      saveGujaratiCache(
        key,
        translated
      );


      target.textContent =
        translated;

    }

    catch (error1) {

      try {

        const translated =
          await translateGoogle(
            verse.english
          );


        saveGujaratiCache(
          key,
          translated
        );


        target.textContent =
          translated;

      }

      catch (error2) {

        target.textContent =
          navigator.onLine
            ? "ગુજરાતી અર્થ હાલ મેળવી શકાયો નથી."
            : "Internet વગર ગુજરાતી અર્થ ઉપલબ્ધ નથી.";

      }

    }

  }


  /* =======================================================
     LANGUAGE
  ======================================================= */

  function languageSelector() {

    const lang =
      currentLanguage();


    return `

      <div class="gita-language">

        <select
          onchange="changeGitaLanguage(this.value)"
          aria-label="Language">

          <option
            value="gu"
            ${lang === "gu" ? "selected" : ""}>
            ગુજરાતી
          </option>

          <option
            value="hi"
            ${lang === "hi" ? "selected" : ""}>
            हिन्दी
          </option>

          <option
            value="en"
            ${lang === "en" ? "selected" : ""}>
            English
          </option>

        </select>

      </div>

    `;

  }


  window.changeGitaLanguage =
    function (lang) {

      localStorage.setItem(
        "brahmanshLanguage",
        lang
      );


      const globalSelect =
        $("languageSelect");

      if (globalSelect) {

        globalSelect.value =
          lang;

      }


      renderGita();

    };


  /* =======================================================
     CHAPTER CARD
  ======================================================= */

  function chapterCard(
    chapter,
    name,
    count
  ) {

    let buttons = "";


    for (
      let i = 1;
      i <= count;
      i++
    ) {

      const key =
        chapter + "-" + i;


      if (gita[key]) {

        buttons += `

          <button
            class="gita-verse-btn"
            onclick="openGitaVerse('${key}')">

            ${i}

          </button>

        `;

      }

    }


    return `

      <div class="gita-chapter">

        <div class="gita-chapter-head">

          <div class="gita-number">
            ${chapter}
          </div>

          <div>

            <strong>
              ${esc(name)}
            </strong>

            <small>
              ${count} શ્લોક
            </small>

          </div>

        </div>


        <div class="gita-verse-grid">

          ${buttons}

        </div>

      </div>

    `;

  }


  /* =======================================================
     RENDER GITA
  ======================================================= */

  function renderGita() {

    const box =
      $("gita700List");


    if (!box) {
      return;
    }


    if (!allVerses.length) {

      box.innerHTML = `

        <div class="gita-loading">

          ભગવદ્ ગીતા લોડ થઈ રહી છે...

        </div>

      `;

      return;

    }


    const lang =
      currentLanguage();


    box.innerHTML = `

      <div class="gita-card">

        <div class="gita-heading">

          <div class="gita-round">
            ॐ
          </div>

          <div>

            <h2>
              શ્રીમદ્ ભગવદ્ ગીતા
            </h2>

            <p>
              18 અધ્યાય • 700 શ્લોક
            </p>

          </div>

        </div>


        ${languageSelector()}


        <input
          id="gitaSearch"
          class="gita-search"
          type="search"
          placeholder="શ્લોક શોધો..."
          oninput="searchGita()">


        <div
          id="gitaSearchResults"
          class="gita-results">
        </div>

      </div>


      ${GITA_CHAPTERS
        .map(function (chapter) {

          return chapterCard(
            chapter[0],
            chapter[1],
            chapter[2]
          );

        })
        .join("")}

    `;

  }


  /* =======================================================
     SEARCH
  ======================================================= */

  window.searchGita =
    function () {

      const input =
        $("gitaSearch");

      const output =
        $("gitaSearchResults");


      if (
        !input ||
        !output
      ) {

        return;

      }


      const query =
        input.value
          .trim()
          .toLowerCase();


      if (!query) {

        output.innerHTML =
          "";

        return;

      }


      const results =
        allVerses
          .filter(function (verse) {

            return (

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

              verse.key
                .includes(query)

            );

          })
          .slice(0, 20);


      if (!results.length) {

        output.innerHTML = `

          <div class="gita-result">

            કોઈ શ્લોક મળ્યો નથી.

          </div>

        `;

        return;

      }


      output.innerHTML =
        results
          .map(function (verse) {

            return `

              <div
                class="gita-result"
                onclick="openGitaVerse('${verse.key}')">

                <strong>
                  ${verse.key}
                </strong>

                —
                ${esc(
                  verse.sanskrit
                    .substring(0, 100)
                )}

              </div>

            `;

          })
          .join("");

    };


  /* =======================================================
     VERSE READER
  ======================================================= */

  window.openGitaVerse =
    async function (key) {

      const verse =
        gita[key];


      if (!verse) {
        return;
      }


      currentVerse =
        key;


      const oldReader =
        $("gitaVerseReader");


      if (oldReader) {
        oldReader.remove();
      }


      const index =
        allVerses.findIndex(
          function (item) {

            return item.key === key;

          }
        );


      const lang =
        currentLanguage();


      let meaningTitle =
        "ગુજરાતી અર્થ";

      let meaningText =
        "ગુજરાતી અર્થ મેળવવામાં આવી રહ્યો છે...";


      if (lang === "hi") {

        meaningTitle =
          "हिन्दी अर्थ";

        meaningText =
          verse.hindi ||
          "हिन्दी अर्थ उपलब्ध नहीं है.";

      }


      if (lang === "en") {

        meaningTitle =
          "English Meaning";

        meaningText =
          verse.english ||
          "English meaning उपलब्ध नहीं है.";

      }


      const reader =
        document.createElement("div");


      reader.id =
        "gitaVerseReader";


      reader.className =
        "gita-reader";


      reader.innerHTML = `

        <div class="card-actions">

          <button
            class="small-btn"
            onclick="closeGitaVerse()">

            ← શ્લોકો પર પાછા

          </button>

        </div>


        <div class="gita-reader-title">

          શ્રીમદ્ ભગવદ્ ગીતા

        </div>


        <div class="gita-reader-meta">

          અધ્યાય ${verse.chapter}
          •
          શ્લોક ${verse.verse}

        </div>


        <div class="gita-sanskrit">

          ${esc(verse.sanskrit)}

        </div>


        <div class="gita-meaning">

          <h3>
            ${meaningTitle}
          </h3>

          <p id="gitaMeaning-${key}">

            ${esc(meaningText)}

          </p>

        </div>


        <div class="gita-reader-actions">

          <button
            onclick="saveGitaFavorite('${key}')">

            Favorite

          </button>


          <button
            onclick="speakGita('${key}')">

            સાંભળો

          </button>


          <button
            onclick="copyGita('${key}')">

            Copy

          </button>


          <button
            onclick="shareGita('${key}')">

            Share

          </button>

        </div>


        <div class="gita-navigation">

          <button
            ${index <= 0 ? "disabled" : ""}
            onclick="openGitaVerse('${
              index > 0
                ? allVerses[index - 1].key
                : key
            }')">

            ← પાછો

          </button>


          <button
            ${index >= allVerses.length - 1 ? "disabled" : ""}
            onclick="openGitaVerse('${
              index < allVerses.length - 1
                ? allVerses[index + 1].key
                : key
            }')">

            આગળ →

          </button>

        </div>

      `;


      const section =
        $("gitaPage");

      const list =
        $("gita700List");


      if (
        section &&
        list
      ) {

        section.insertBefore(
          reader,
          list
        );

      }


      window.scrollTo(
        0,
        0
      );


      /*
       * Gujarati only when Gujarati
       * language is selected.
       */

      if (lang === "gu") {

        await translateGujarati(
          key
        );

      }

    };


  /* =======================================================
     CLOSE READER
  ======================================================= */

  window.closeGitaVerse =
    function () {

      const reader =
        $("gitaVerseReader");


      if (reader) {

        reader.remove();

      }

    };


  /* =======================================================
     FAVORITE
  ======================================================= */

  window.saveGitaFavorite =
    function (key) {

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
              "brahmanshFavorites"
            ) || "[]"
          );

      }

      catch (error) {

        favorites = [];

      }


      const text =
        "ભગવદ્ ગીતા " +
        key +
        "\n\n" +
        verse.sanskrit;


      if (
        favorites.indexOf(text) === -1
      ) {

        favorites.push(text);

      }


      localStorage.setItem(
        "brahmanshFavorites",
        JSON.stringify(favorites)
      );


      if (
        typeof window.renderFavorites ===
        "function"
      ) {

        window.renderFavorites();

      }


      alert(
        "શ્લોક મનપસંદમાં સાચવવામાં આવ્યો."
      );

    };


  /* =======================================================
     COPY
  ======================================================= */

  window.copyGita =
    function (key) {

      const verse =
        gita[key];


      if (!verse) {
        return;
      }


      const text =
        "ભગવદ્ ગીતા " +
        key +
        "\n\n" +
        verse.sanskrit +
        "\n\n" +
        verse.english;


      if (
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {

        navigator.clipboard
          .writeText(text)
          .then(function () {

            alert(
              "શ્લોક Copy થયો."
            );

          });

      }

      else {

        const area =
          document.createElement(
            "textarea"
          );

        area.value =
          text;

        document.body.appendChild(
          area
        );

        area.select();

        document.execCommand(
          "copy"
        );

        area.remove();

        alert(
          "શ્લોક Copy થયો."
        );

      }

    };


  /* =======================================================
     SHARE
  ======================================================= */

  window.shareGita =
    async function (key) {

      const verse =
        gita[key];


      if (!verse) {
        return;
      }


      const text =
        "ભગવદ્ ગીતા " +
        key +
        "\n\n" +
        verse.sanskrit +
        "\n\n" +
        verse.english;


      try {

        if (
          navigator.share
        ) {

          await navigator.share({

            title:
              "BRAHMANSH",

            text:
              text

          });

        }

        else if (
          navigator.clipboard
        ) {

          await navigator.clipboard
            .writeText(text);

          alert(
            "Share ઉપલબ્ધ નથી. Text Copy થયો."
          );

        }

      }

      catch (error) {}

    };


  /* =======================================================
     SPEAK
  ======================================================= */

  window.speakGita =
    function (key) {

      const verse =
        gita[key];


      if (
        !verse ||
        !window.speechSynthesis
      ) {

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
        0.78;


      speechSynthesis.speak(
        utterance
      );

    };


  /* =======================================================
     LOAD GITA
  ======================================================= */

  window.loadGita =
    function () {

      if (loadingPromise) {

        return loadingPromise;

      }


      const box =
        $("gita700List");


      if (box) {

        box.innerHTML = `

          <div class="gita-loading">

            ભગવદ્ ગીતા લોડ થઈ રહી છે...

          </div>

        `;

      }


      loadingPromise =
        fetch(
          GITA_CONFIG.DATA_URL,
          {
            cache: "no-store"
          }
        )

        .then(function (response) {

          if (!response.ok) {

            throw new Error(
              "Gita data HTTP " +
              response.status
            );

          }


          return response.json();

        })


        .then(function (data) {

          allVerses =
            normalizeData(data);


          /*
           * Important:
           * Some editions expose 701 records
           * because Chapter 13 has an extra 35th
           * verse. The app follows the 700-verse
           * chapter structure defined above.
           */

          allVerses =
            makeExactly700(
              allVerses
            );


          /*
           * Load Hindi dataset separately.
           * If unavailable, Sanskrit + English
           * still continue to work.
           */

          return fetch(
            GITA_CONFIG.HINDI_URL,
            {
              cache: "no-store"
            }
          )

          .then(function (response) {

            if (
              response.ok
            ) {

              return response.json();

            }

            return null;

          })

          .catch(function () {

            return null;

          });

        })


        .then(function (hindi) {

          hindiData =
            hindi;


          buildGita();


          renderGita();


          /*
           * Safety check
           */

          console.log(
            "BRAHMANSH Gita loaded:",
            allVerses.length,
            "verses"
          );


        })


        .catch(function (error) {

          console.error(
            "BRAHMANSH Gita error:",
            error
          );


          const target =
            $("gita700List");


          if (target) {

            target.innerHTML = `

              <div class="gita-error">

                <strong>
                  ભગવદ્ ગીતા લોડ થઈ શકી નથી.
                </strong>

                <br><br>

                Internet connection તપાસો.

                <br><br>

                <button
                  class="primary"
                  onclick="loadGita()">

                  ફરી પ્રયાસ કરો

                </button>

              </div>

            `;

          }

        })


        .finally(function () {

          loadingPromise =
            null;

        });


      return loadingPromise;

    };


  /* =======================================================
     INITIALIZE
  ======================================================= */

  document.addEventListener(
    "DOMContentLoaded",
    function () {

      /*
       * Gita data is loaded once.
       * openGita() can render it again later.
       */

      loadGita();

    }
  );


})();