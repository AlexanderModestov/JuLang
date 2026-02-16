import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  UtensilsCrossed,
  Plane,
  Briefcase,
  Palette,
  Home,
  Drama,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

interface TopicCategory {
  id: string
  name: string
  IconComponent: LucideIcon
  topics: string[]
}

const CATEGORIES: TopicCategory[] = [
  {
    id: 'food',
    name: 'Еда и рестораны',
    IconComponent: UtensilsCrossed,
    topics: ['В ресторане', 'Заказ еды', 'Французская кухня', 'Рецепты'],
  },
  {
    id: 'travel',
    name: 'Путешествия',
    IconComponent: Plane,
    topics: ['В аэропорту', 'В отеле', 'Достопримечательности', 'Транспорт'],
  },
  {
    id: 'work',
    name: 'Работа и карьера',
    IconComponent: Briefcase,
    topics: ['Собеседование', 'В офисе', 'Деловая встреча', 'Телефонный разговор'],
  },
  {
    id: 'hobbies',
    name: 'Хобби и досуг',
    IconComponent: Palette,
    topics: ['Спорт', 'Музыка', 'Кино', 'Книги'],
  },
  {
    id: 'daily',
    name: 'Повседневная жизнь',
    IconComponent: Home,
    topics: ['Утро', 'Покупки', 'В городе', 'Погода'],
  },
  {
    id: 'culture',
    name: 'Культура и искусство',
    IconComponent: Drama,
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Выберите тему для разговора
        </h1>
        <p className="text-text-muted mt-1">
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
        <Shuffle size={18} className="mr-2" />
        Случайная тема
      </Button>

      {/* Random topic preview */}
      {randomTopic && (
        <Card className="border-2 border-accent/30 animate-slide-down">
          <div className="text-center">
            <p className="text-lg font-medium text-text-primary mb-4">
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
        <h3 className="font-medium text-text-primary mb-3">
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
              className="cursor-pointer hover:scale-[1.02] transition-transform animate-slide-up"
              onClick={() => handleSelectCategory(category)}
            >
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <category.IconComponent size={24} className="text-accent" />
                </div>
                <h3 className="font-medium text-text-primary text-sm">
                  {category.name}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSelectCategory(null)}
            >
              <ChevronLeft size={16} className="mr-1" />
              Назад
            </Button>
            <div className="flex items-center gap-2">
              <selectedCategory.IconComponent size={20} className="text-accent" />
              <h3 className="font-medium text-text-primary">
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
                className="cursor-pointer hover:bg-surface-2 transition-colors"
                onClick={() => handleStartConversation(topic)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">{topic}</span>
                  <ChevronRight size={16} className="text-text-muted" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
