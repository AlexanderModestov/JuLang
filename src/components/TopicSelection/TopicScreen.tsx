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
    icon: '\uD83C\uDF7D\uFE0F',
    topics: ['В ресторане', 'Заказ еды', 'Французская кухня', 'Рецепты'],
  },
  {
    id: 'travel',
    name: 'Путешествия',
    icon: '\u2708\uFE0F',
    topics: ['В аэропорту', 'В отеле', 'Достопримечательности', 'Транспорт'],
  },
  {
    id: 'work',
    name: 'Работа и карьера',
    icon: '\uD83D\uDCBC',
    topics: ['Собеседование', 'В офисе', 'Деловая встреча', 'Телефонный разговор'],
  },
  {
    id: 'hobbies',
    name: 'Хобби и досуг',
    icon: '\uD83C\uDFA8',
    topics: ['Спорт', 'Музыка', 'Кино', 'Книги'],
  },
  {
    id: 'daily',
    name: 'Повседневная жизнь',
    icon: '\uD83C\uDFE0',
    topics: ['Утро', 'Покупки', 'В городе', 'Погода'],
  },
  {
    id: 'culture',
    name: 'Культура и искусство',
    icon: '\uD83C\uDFAD',
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
    <div className="space-y-8 stagger-children">
      <div>
        <h1 className="font-display text-display-lg text-stone-900 dark:text-stone-50">
          Выберите тему для разговора
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2">
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
        &#127922; Случайная тема
      </Button>

      {/* Random topic preview */}
      {randomTopic && (
        <Card className="border-2 border-accent-300 dark:border-accent-700 animate-fade-in-up">
          <div className="text-center">
            <p className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-4">
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
        <h3 className="font-medium text-stone-900 dark:text-stone-50 mb-3">
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
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Категории</p>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((category) => (
              <Card
                key={category.id}
                variant="elevated"
                className="cursor-pointer card-interactive"
                onClick={() => handleSelectCategory(category)}
              >
                <div className="text-center">
                  <span className="text-3xl block mb-2">{category.icon}</span>
                  <h3 className="font-medium text-stone-900 dark:text-stone-50 text-sm">
                    {category.name}
                  </h3>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelectCategory(null)}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Назад
            </Button>
            <h3 className="font-medium text-stone-900 dark:text-stone-50">
              {selectedCategory.icon} {selectedCategory.name}
            </h3>
          </div>

          <div className="space-y-2">
            {selectedCategory.topics.map((topic) => (
              <Card
                key={topic}
                variant="outlined"
                padding="sm"
                className="cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-smooth active:scale-[0.98]"
                onClick={() => handleStartConversation(topic)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-stone-900 dark:text-stone-50">{topic}</span>
                  <svg className="w-4 h-4 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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
