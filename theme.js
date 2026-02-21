/**
 * Cosmos Theme — Dark / Light / System
 * Persists in localStorage as cosmosTheme: 'dark' | 'light' | 'system'
 */
(function () {
    const STORAGE_KEY = 'cosmosTheme';
    const THEMES = { DARK: 'dark', LIGHT: 'light', SYSTEM: 'system' };

    function getStored() {
        try {
            return localStorage.getItem(STORAGE_KEY) || THEMES.DARK;
        } catch (_) {
            return THEMES.DARK;
        }
    }

    function setStored(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (_) {}
    }

    function prefersDark() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function getEffectiveTheme() {
        const stored = getStored();
        if (stored === THEMES.SYSTEM) return prefersDark() ? THEMES.DARK : THEMES.LIGHT;
        return stored;
    }

    function applyTheme(theme) {
        const root = document.documentElement;
        root.removeAttribute('data-theme');
        root.setAttribute('data-theme', theme === THEMES.LIGHT ? 'light' : 'dark');
    }

    function init() {
        const effective = getEffectiveTheme();
        applyTheme(effective);

        const media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
        if (media && media.addEventListener) {
            media.addEventListener('change', function () {
                if (getStored() === THEMES.SYSTEM) {
                    applyTheme(getEffectiveTheme());
                }
            });
        }
    }

    window.Theme = {
        get: getStored,
        set: function (value) {
            if (![THEMES.DARK, THEMES.LIGHT, THEMES.SYSTEM].includes(value)) return;
            setStored(value);
            applyTheme(getEffectiveTheme());
        },
        getEffective: getEffectiveTheme,
        apply: applyTheme,
        THEMES: THEMES
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
