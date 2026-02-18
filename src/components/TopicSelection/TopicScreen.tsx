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
  const { currentLevel } = useAuthContext()
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
        <h1 className="text-2xl font-bold text-white/90 tracking-wide">
          Выберите тему для разговора
        </h1>
        <p className="text-white/40 mt-1 text-sm">
          Уровень: <span className="text-primary-400 font-semibold">{currentLevel}</span>
        </p>
      </div>

      <Button
        onClick={handleRandomTopic}
        variant="secondary"
        className="w-full"
        size="lg"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
        Случайная тема
      </Button>

      {randomTopic && (
        <Card className="neon-border-cyan">
          <div className="text-center">
            <p className="text-lg font-medium text-white/90 mb-4">
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

      <Card>
        <h3 className="font-medium text-white/90 mb-3 tracking-wide">
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

      {!selectedCategory ? (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((category, i) => (
            <Card
              key={category.id}
              variant="elevated"
              className="cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'backwards' } as React.CSSProperties}
              onClick={() => handleSelectCategory(category)}
            >
              <div className="text-center">
                <span className="text-3xl block mb-2">{category.icon}</span>
                <h3 className="font-medium text-white/90 text-sm tracking-wide">
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
            <h3 className="font-medium text-white/90">
              {selectedCategory.icon} {selectedCategory.name}
            </h3>
          </div>

          <div className="space-y-2">
            {selectedCategory.topics.map((topic) => (
              <Card
                key={topic}
                variant="outlined"
                padding="sm"
                className="cursor-pointer hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
                onClick={() => handleStartConversation(topic)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white/80">{topic}</span>
                  <svg className="w-4 h-4 text-primary-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
