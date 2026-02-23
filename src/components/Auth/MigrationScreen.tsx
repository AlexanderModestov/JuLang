import { CloudUpload, Loader2 } from 'lucide-react'

export default function MigrationScreen() {
  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-4">
      <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl shadow-glass-lg border border-white/[0.08] p-8 w-full max-w-md text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/[0.06] mb-4">
          <CloudUpload className="w-8 h-8 text-primary-300" />
        </div>
        <h1 className="text-xl font-semibold text-primary-100 mb-2">
          Переносим ваши данные
        </h1>
        <p className="text-primary-400 mb-6">
          Пожалуйста, подождите. Ваш прогресс обучения переносится в облако.
        </p>
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </div>
    </div>
  )
}
