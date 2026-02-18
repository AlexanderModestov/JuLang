export default function MigrationScreen() {
  return (
    <div className="min-h-screen bg-surface-900 bg-mesh flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 bg-neon-400/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-glass-lg p-8 w-full max-w-md text-center animate-slide-up">
        {/* Animated icon */}
        <div className="relative inline-block mb-6">
          <div className="w-16 h-16 flex items-center justify-center bg-neon-400/10 border border-neon-400/20 rounded-2xl animate-float">
            <svg className="w-8 h-8 text-neon-300" viewBox="0 0 24 24" fill="none">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-white/90 mb-2 tracking-wide">
          Переносим ваши данные
        </h1>
        <p className="text-white/40 mb-6">
          Пожалуйста, подождите. Ваш прогресс обучения переносится в облако.
        </p>

        {/* Spinning loader */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" style={{ boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)' }} />
        </div>
      </div>
    </div>
  )
}
