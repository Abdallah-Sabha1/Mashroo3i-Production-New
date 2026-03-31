import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
}

const Landing = () => {
  const { t } = useTranslation()

  const features = [
    { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, title: t('landing.features.aiEval.title'), desc: t('landing.features.aiEval.desc') },
    { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, title: t('landing.features.financial.title'), desc: t('landing.features.financial.desc') },
    { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, title: t('landing.features.pdf.title'), desc: t('landing.features.pdf.desc') },
    { icon: <svg className="w-6 h-6 rtl:-scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, title: t('landing.features.market.title'), desc: t('landing.features.market.desc') },
    { icon: <svg className="w-6 h-6 font-normal" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>, title: t('landing.features.swot.title'), desc: t('landing.features.swot.desc') },
    { icon: <svg className="w-6 h-6 rtl:-scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>, title: t('landing.features.growth.title'), desc: t('landing.features.growth.desc') },
  ]

  const stats = [
    { value: '< 5 min', label: t('landing.stats.time') },
    { value: '7 sectors', label: t('landing.stats.sectors') },
    { value: 'Free', label: t('landing.stats.free') },
  ]

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <motion.div className="text-center" initial="initial" animate="animate" variants={stagger}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">{t('landing.badge')}</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
            {t('landing.heroTitle')}{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {t('landing.heroTitleHighlight')}
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('landing.heroSubtitle')}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="min-w-[200px]">
                {t('landing.startFree')}
                <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="lg" className="min-w-[200px]">{t('landing.tryFree')}</Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16">
            <p className="text-sm text-slate-500 dark:text-gray-500">
              {t('landing.builtFor')} <span className="font-medium text-slate-700 dark:text-gray-300">{t('landing.ammanJordan')}</span>
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="text-center">
                <p className="text-4xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-2xl mx-auto mb-16" initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">{t('landing.features.label')}</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{t('landing.features.title')}</motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600 dark:text-gray-400">{t('landing.features.subtitle')}</motion.p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 hover:shadow-md hover:shadow-blue-500/10 dark:hover:shadow-indigo-500/10 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-12 lg:p-16 text-center shadow-xl"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('landing.cta.title')}</h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">{t('landing.cta.subtitle')}</p>
            <Link to="/register">
              <button className="px-8 py-3.5 rounded-xl bg-white text-indigo-600 font-semibold hover:shadow-lg transition-all">
                {t('landing.cta.button')}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
