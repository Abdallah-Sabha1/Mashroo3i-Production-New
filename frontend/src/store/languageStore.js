import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '../i18n'

const applyLanguage = (lang) => {
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  localStorage.setItem('mashroo3i_lang', lang)
}

const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: 'ar',
      direction: 'rtl',

      setLanguage: (lang) => {
        applyLanguage(lang)
        set({ language: lang, direction: lang === 'ar' ? 'rtl' : 'ltr' })
      },

      toggleLanguage: () => {
        const next = get().language === 'ar' ? 'en' : 'ar'
        get().setLanguage(next)
      },
    }),
    {
      name: 'mashroo3i-language',
      partialize: (state) => ({ language: state.language }),
    }
  )
)

export default useLanguageStore
