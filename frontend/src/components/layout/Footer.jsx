const Footer = () => (
  <footer className="mt-16 border-t border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-slate-500 dark:text-gray-500 text-center sm:text-left">
        📍 Mashroo3i benchmarks and evaluations are built for entrepreneurs in Amman, Jordan.
      </p>
      <p className="text-xs text-slate-400 dark:text-gray-600">
        © {new Date().getFullYear()} Mashroo3i
      </p>
    </div>
  </footer>
)

export default Footer
