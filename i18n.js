/* ===================================================
   i18n — Multi-language module for Bar 26
   ---------------------------------------------------
   Usage:
     i18n.init(['ca', 'en', 'es', 'fr', 'de'], 'ca')
       .then(() => console.log('Ready'));
   ---------------------------------------------------
   To add a language:
     1. Create locales/xx.json following the same schema
     2. Pass the code to the supported list in init()
   To remove a language:
     Just remove it from the supported list
   =================================================== */

const i18n = (() => {
  const cache = {};
  let currentLang = null;
  let supportedLangs = [];
  let fallbackLang = 'en';

  /**
   * Load a translation JSON from /locales/{lang}.json
   * Uses an in-memory cache to avoid duplicate requests.
   */
  async function load(lang) {
    if (cache[lang]) return cache[lang];
    const resp = await fetch(`locales/${lang}.json`);
    if (!resp.ok) throw new Error(`i18n: failed to load "${lang}"`);
    const data = await resp.json();
    cache[lang] = data;
    return data;
  }

  /**
   * Deep-get a value from a nested object using dot-notation keys,
   * e.g. get(translations, 'hero.title')
   */
  function get(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
  }

  /**
   * Replace all [data-i18n], [data-i18n-alt], [data-i18n-aria] elements with
   * the text / attribute from the translations object.
   */
  function apply(translations) {
    // Text nodes
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = get(translations, key);
      if (value !== null && value !== undefined) {
        el.innerHTML = value;
      }
    });

    // Alt attributes (images, etc.)
    document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      const key = el.getAttribute('data-i18n-alt');
      const value = get(translations, key);
      if (value !== null && value !== undefined) {
        el.setAttribute('alt', value);
      }
    });

    // Aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      const value = get(translations, key);
      if (value !== null && value !== undefined) {
        el.setAttribute('aria-label', value);
      }
    });
  }

  /**
   * Switch the current language, saving preference to localStorage.
   */
  async function switchTo(lang) {
    if (lang === currentLang) return;
    if (!supportedLangs.includes(lang)) {
      console.warn(`i18n: "${lang}" is not in the supported list, falling back to "${fallbackLang}"`);
      lang = fallbackLang;
    }
    const translations = await load(lang);
    apply(translations);
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('i18n-lang', lang);

    // Update language switcher UI
    document.querySelectorAll('[data-i18n-switcher]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-i18n-switcher') === lang);
    });
  }

  /**
   * Detect the best initial language:
   *   1. localStorage saved preference
   *   2. Browser language (navigator.language)
   *   3. fallbackLang
   */
  function detect() {
    const saved = localStorage.getItem('i18n-lang');
    if (saved && supportedLangs.includes(saved)) return saved;

    const browserLang = (navigator.language || '').slice(0, 2);
    if (browserLang && supportedLangs.includes(browserLang)) return browserLang;

    return fallbackLang;
  }

  /**
   * Initialize the i18n system.
   * @param {string[]} langs       – Array of language codes to support
   * @param {string}   [fallback]  – Fallback language (default 'en')
   */
  async function init(langs, fallback = 'en') {
    supportedLangs = langs;
    fallbackLang = fallback;

    // Preload all translation files in parallel so switching is instant
    const loadPromises = langs.map((code) =>
      load(code).catch((err) => console.warn(`i18n: ${err.message}`))
    );
    await Promise.all(loadPromises);

    // Apply initial language
    const initial = detect();
    const translations = await load(initial);
    apply(translations);
    currentLang = initial;
    document.documentElement.lang = initial;

    // Mark the active language button
    document.querySelectorAll('[data-i18n-switcher]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-i18n-switcher') === initial);
    });

    // Wire up language switcher buttons
    document.querySelectorAll('[data-i18n-switcher]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const lang = btn.getAttribute('data-i18n-switcher');
        await switchTo(lang);
      });
    });
  }

  return { init, switchTo, detect, load };
})();