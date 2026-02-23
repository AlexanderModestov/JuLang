import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { UtensilsCrossed, Plane, Briefcase, Palette, Home, Drama, Shuffle } from 'lucide-react'

interface TopicCategory {
  id: string
  name: string
  icon: ReactNode
  topics: string[]
}

const CATEGORIES: TopicCategory[] = [
  {
    id: 'food',
    name: 'Еда и рестораны',
    icon: <UtensilsCrossed className="w-6 h-6" />,
    topics: ['В ресторане', 'Заказ еды', 'Французская кухня', 'Рецепты'],
  },
  {
    id: 'travel',
    name: 'Путешествия',
    icon: <Plane className="w-6 h-6" />,
    topics: ['В аэропорту', 'В отеле', 'Достопримечательности', 'Транспорт'],
  },
  {
    id: 'work',
    name: 'Работа и карьера',
    icon: <Briefcase className="w-6 h-6" />,
    topics: ['Собеседование', 'В офисе', 'Деловая встреча', 'Телефонный разговор'],
  },
  {
    id: 'hobbies',
    name: 'Хобби и досуг',
    icon: <Palette className="w-6 h-6" />,
    topics: ['Спорт', 'Музыка', 'Кино', 'Книги'],
  },
  {
    id: 'daily',
    name: 'Повседневная жизнь',
    icon: <Home className="w-6 h-6" />,
    topics: ['Утро', 'Покупки', 'В городе', 'Погода'],
  },
  {
    id: 'culture',
    name: 'Культура и искусство',
    icon: <Drama className="w-6 h-6" />,
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
        <h1 className="text-2xl font-bold text-white">
          Выберите тему для разговора
        </h1>
        <p className="text-primary-400 mt-1">
          Уровень: {currentLevel}
        </p>
      </div>

      {/* Random topic button */}
      <Button
        onClick={handleRandomTopic}
        variant="secondary"
        className="w-full"
        size="lg"
      >
        <span className="inline-flex items-center gap-2">
          <Shuffle className="w-5 h-5" /> Случайная тема
        </span>
      </Button>

      {/* Random topic preview */}
      {randomTopic && (
        <Card className="border-2 border-white/[0.08]">
          <div className="text-center">
            <p className="text-lg font-medium text-white mb-4">
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
        <h3 className="font-medium text-white mb-3">
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
              className="cursor-pointer hover:scale-[1.02] hover:border-primary-500/20 transition-all"
              onClick={() => handleSelectCategory(category)}
            >
              <div className="text-center">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 mx-auto mb-2">
                  {category.icon}
                </div>
                <h3 className="font-medium text-white text-sm">
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
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                {selectedCategory.icon}
              </div>
              <h3 className="font-medium text-white">
                {selectedCategory.name}
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {selectedCategory.topics.map((topic) => (
              <Card
                key={topic}
                variant="outlined"
                padding="sm"
                className="cursor-pointer hover:bg-white/5 hover:border-primary-500/20 transition-colors"
                onClick={() => handleStartConversation(topic)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white">{topic}</span>
                  <span className="text-primary-400/60">→</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
