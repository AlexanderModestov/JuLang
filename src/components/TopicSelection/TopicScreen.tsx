import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface TopicCategory {
  id: string
  name: string
  icon: string
  topics: string[]
}

const CATEGORIES: TopicCategory[] = [
  {
    id: 'food',
    name: 'Еда и рестораны',
    icon: '🍽️',
    topics: ['В ресторане', 'Заказ еды', 'Французская кухня', 'Рецепты'],
  },
  {
    id: 'travel',
    name: 'Путешествия',
    icon: '✈️',
    topics: ['В аэропорту', 'В отеле', 'Достопримечательности', 'Транспорт'],
  },
  {
    id: 'work',
    name: 'Работа и карьера',
    icon: '💼',
    topics: ['Собеседование', 'В офисе', 'Деловая встреча', 'Телефонный разговор'],
  },
  {
    id: 'hobbies',
    name: 'Хобби и досуг',
    icon: '🎨',
    topics: ['Спорт', 'Музыка', 'Кино', 'Книги'],
  },
  {
    id: 'daily',
    name: 'Повседневная жизнь',
    icon: '🏠',
    topics: ['Утро', 'Покупки', 'В городе', 'Погода'],
  },
  {
    id: 'culture',
    name: 'Культура и искусство',
    icon: '🎭',
    topics: ['Музеи', 'Театр', 'Праздники', 'Традиции'],
  },
]

export default function TopicScreen() {
  const navigate = useNavigate()
  const { profile } = useAuthContext()
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory | null>(null)
  const [customTopic, setCustomTopic] = useState('')
  const [randomTopic, setRandomTopic] = useState<string | null>(null)

  const handleStartConversation = (topic: string) => {
    const encodedTopic = encodeURIComponent(topic)
    navigate(`/conversation?topic=${encodedTopic}`)
  }

  const handleRandomTopic = () => {
    const allTopics = CATEGORIES.flatMap((c) => c.topics)
    const available = randomTopic
      ? allTopics.filter((t) => t !== randomTopic)
      : allTopics
    const picked = available[Math.floor(Math.random() * available.length)]
    setRandomTopic(picked)
  }

  const handleSelectCategory = (category: TopicCategory | null) => {
    setSelectedCategory(category)
    setRandomTopic(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Выберите тему для разговора
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Уровень: {profile?.french_level || 'A1'}
        </p>
      </div>

      {/* Random topic button */}
      <Button
        onClick={handleRandomTopic}
        variant="secondary"
        className="w-full"
        size="lg"
      >
        🎲 Случайная тема
      </Button>

      {/* Random topic preview */}
      {randomTopic && (
        <Card className="border-2 border-primary-300 dark:border-primary-700">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {randomTopic}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => handleStartConversation(randomTopic)}>
                Начать
              </Button>
              <Button variant="secondary" onClick={handleRandomTopic}>
                Другую
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Custom topic */}
      <Card>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Или введите свою тему
        </h3>
        <div className="flex gap-2">
          <Input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onFocus={() => setRandomTopic(null)}
            placeholder="Например: моя семья, мои планы на выходные..."
            className="flex-1"
          />
          <Button
            onClick={() => handleStartConversation(customTopic)}
            disabled={!customTopic.trim()}
          >
            Начать
          </Button>
        </div>
      </Card>

      {/* Categories */}
      {!selectedCategory ? (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category) => (
            <Card
              key={category.id}
              variant="elevated"
              className="cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => handleSelectCategory(category)}
            >
              <div className="text-center">
                <span className="text-3xl block mb-2">{category.icon}</span>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  {category.name}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelectCategory(null)}
            >
              ← Назад
            </Button>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {selectedCategory.icon} {selectedCategory.name}
            </h3>
          </div>

          <div className="space-y-2">
            {selectedCategory.topics.map((topic) => (
              <Card
                key={topic}
                variant="outlined"
                padding="sm"
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => handleStartConversation(topic)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white">{topic}</span>
                  <span className="text-gray-400">→</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
