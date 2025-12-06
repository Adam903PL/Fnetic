const resources = window.locales || {};

document.addEventListener('DOMContentLoaded', () => {
    i18next
        .use(i18nextBrowserLanguageDetector)
        .init({
            resources,
            fallbackLng: 'en',
            debug: true,
            detection: {
                order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
                caches: ['localStorage', 'cookie'],
            }
        }, function (err, t) {
            if (err) return console.error('something went wrong loading', err);
            updateContent();
            updateLanguageSwitcherState();
        });

    function updateContent() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.setAttribute('placeholder', i18next.t(key));
            }
            else {
                element.innerText = i18next.t(key);
            }
        });
    }


    window.changeLanguage = function (lng) {
        if (!i18next.isInitialized) {
            console.warn('i18next is not initialized yet.');
            return;
        }
        i18next.changeLanguage(lng, () => {
            updateContent();
            updateLanguageSwitcherState(lng);
        });
    }

    function updateLanguageSwitcherState(lng) {
        const currentLng = lng || i18next.language;
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            if (btn.dataset.lang === currentLng.split('-')[0]) { 
                btn.classList.add('text-brand-accent', 'font-bold');
                btn.classList.remove('text-gray-300');
            } else {
                btn.classList.remove('text-brand-accent', 'font-bold');
                btn.classList.add('text-gray-300');
            }
        });
    }
});
