export default function MigrationScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4 animate-bounce">📦</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Переносим ваши данные
        </h1>
        <p className="text-gray-600 mb-6">
          Пожалуйста, подождите. Ваш прогресс обучения переносится в облако.
        </p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
}
