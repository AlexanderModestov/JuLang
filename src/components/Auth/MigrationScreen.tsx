export default function MigrationScreen() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-5">
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/60 rounded-2xl p-8 w-full max-w-sm text-center animate-fade-in-up shadow-soft-md">
        <div className="relative mb-6">
          <div className="w-12 h-12 mx-auto border-2 border-stone-200 dark:border-stone-800 border-t-accent-500 rounded-full animate-spin" />
        </div>
        <h1 className="text-base font-semibold text-stone-900 dark:text-stone-50 mb-2">
          Переносим ваши данные
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
          Пожалуйста, подождите. Ваш прогресс обучения переносится в облако.
        </p>
      </div>
    </div>
  )
}
