import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
        <h1 className="text-lg font-medium text-text-secondary tracking-tight">
          Загрузка...
        </h1>
      </div>
    </div>
  )
}
