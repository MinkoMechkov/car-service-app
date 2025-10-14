// src/composables/useLocale.ts

import Cookies from 'js-cookie';
import { format, parseISO, isValid, Locale } from 'date-fns';
import { bg, enGB } from 'date-fns/locale';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

/**
 * Vue 3 composable for locale management and date formatting.
 * Handles locale persistence via cookies and provides a locale-aware date formatter.
 * Supports 'bg' (Bulgarian) and 'en' (English) locales only.
 */
export function useLocale() {
    // Get the reactive locale from vue-i18n
    const { locale } = useI18n();
    const queryClient = useQueryClient();
    const route = useRoute();

    /**
     * Set the current locale and persist it in cookies.
     * Only triggers refetches if the new locale is different from the current one.
     * Validates input to 'bg' or 'en' only.
     * @param {string} newLocale - The new locale code ('en' or 'bg').
     */
    const setLocale = (newLocale: string) => {
        const validLocales = ['en', 'bg'] as const;
        const validatedLocale = validLocales.includes(newLocale as any) ? newLocale : 'en';
        
        if (locale.value !== validatedLocale) {
            Cookies.set('locale', validatedLocale);
            // Type assertion ensures only supported locales are set
            locale.value = validatedLocale as 'bg' | 'en';

            if (route?.meta?.refetchKeys) {
                queryClient.refetchQueries({ queryKey: route?.meta?.refetchKeys as any });
            }
        }
    };

    /**
     * Initialize the locale from data-lang attribute on #app element, 
     * then from cookies, defaulting to 'en' if not set.
     * Validates to supported locales only.
     */
    const initLocale = () => {
        // First try to get locale from data-lang attribute on #app element
        const appElement = document.getElementById('app');
        const dataLang = appElement?.getAttribute('data-lang');
 
        console.log('dataLang', dataLang);
        
        // Use data-lang if available and not "None", otherwise fall back to cookies, then default to 'en'
        let initialLocale = 'en';
        if (dataLang && dataLang !== 'None') {
            initialLocale = dataLang;
        } else if (Cookies.get('locale')) {
            initialLocale = Cookies.get('locale')!;
        }
        
        setLocale(initialLocale);
    };

    /**
     * Format a date string or Date object according to the current locale.
     * - For 'en': dd/MM/yyyy HH:mm (UK format)
     * - For 'bg': dd.MM.yyyy HH:mm
     * @param {string|Date} date - The date to format.
     * @param {Object} [options] - Formatting options.
     * @param {boolean} [options.onlyDate=false] - If true, only the date part is shown.
     * @returns {string} The formatted date string, or empty string if invalid.
     */
    const formatDate = (date: string | Date, options?: { onlyDate?: boolean }): string => {
        let d: Date;

        // Parse the date input robustly
        if (typeof date === 'string') {
            d = parseISO(date);
            if (!isValid(d)) d = new Date(date);
        } else {
            d = date;
        }
        if (!isValid(d)) return '';

        const onlyDate = options?.onlyDate ?? false;

        // Map locale to date-fns locale and format string (only 'en' and 'bg')
        const localeMap: Record<string, { locale: Locale; format: [string, string] }> = {
            en: { locale: enGB, format: ['dd/MM/yyyy', 'dd/MM/yyyy HH:mm'] },
            bg: { locale: bg, format: ['dd.MM.yyyy', 'dd.MM.yyyy HH:mm'] },
        };

        const current = localeMap[locale.value] || localeMap['en'];
        const fmt = onlyDate ? current.format[0] : current.format[1];

        return format(d, fmt, { locale: current.locale });
    };

    // Expose composable API
    return {
        initLocale, // Initialize locale from cookies
        setLocale, // Set and persist locale
        locale, // Reactive locale ref
        formatDate, // Locale-aware date formatter
    };
}