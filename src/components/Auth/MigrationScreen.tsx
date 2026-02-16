import { Loader2, PackageOpen } from 'lucide-react'

export default function MigrationScreen() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="bg-surface-1 border border-border-subtle rounded-2xl p-8 w-full max-w-md text-center animate-scale-in">
        <PackageOpen className="w-14 h-14 text-accent mx-auto mb-4 animate-bounce" />
        <h1 className="text-xl font-semibold text-text-primary mb-2">
          Переносим ваши данные
        </h1>
        <p className="text-text-secondary mb-6">
          Пожалуйста, подождите. Ваш прогресс обучения переносится в облако.
        </p>
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </div>
    </div>
  )
}
