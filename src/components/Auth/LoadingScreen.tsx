export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-900 bg-mesh flex items-center justify-center">
      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary-500/15 rounded-full blur-[80px] pointer-events-none" />

      <div className="text-center animate-fade-in">
        {/* Pulsing logo */}
        <div className="relative inline-block mb-6">
          <div className="w-16 h-16 relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-accent-500/30 rounded-2xl rotate-12" />
            <div className="absolute inset-0 flex items-center justify-center bg-surface-800/80 backdrop-blur-sm rounded-2xl border border-white/[0.10]">
              <span className="text-2xl font-extrabold gradient-text-cyber">J</span>
            </div>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center mb-4">
          <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>

        <h1 className="text-lg font-semibold text-white/50 tracking-wide">Загрузка...</h1>
      </div>
    </div>
  )
}
