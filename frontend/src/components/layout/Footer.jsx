import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()
  return (
    <footer className="mt-16 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center sm:text-start">
          📍 {t('footer.disclaimer')}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} Mashroo3i
        </p>
      </div>
    </footer>
  )
}

export default Footer
