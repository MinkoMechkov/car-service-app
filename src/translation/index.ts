import { createI18n } from 'vue-i18n';
import en from '@/translation/locales/en.json';
import bg from '@/translation/locales/bg.json';

const i18n = createI18n({
    legacy: false,
    locale: 'bg',
    fallbackLocale: 'en',
    globalInjection: true,
    messages: {
        bg,
        en,
    },
});

export default i18n;
