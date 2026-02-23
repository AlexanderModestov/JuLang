import { Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="mb-4 flex justify-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-primary-400">Загрузка...</h1>
      </div>
    </div>
  )
}
