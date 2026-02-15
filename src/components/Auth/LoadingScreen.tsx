export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="relative mb-6">
          <div className="w-10 h-10 border-2 border-stone-200 dark:border-stone-800 border-t-accent-500 rounded-full animate-spin mx-auto" />
        </div>
        <p className="font-display text-lg text-stone-400 dark:text-stone-500">JuLang</p>
      </div>
    </div>
  )
}
