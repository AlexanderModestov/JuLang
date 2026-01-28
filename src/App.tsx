import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import Layout from './components/ui/Layout'
import HomeScreen from './components/Home/HomeScreen'
import ConversationScreen from './components/Conversation/ConversationScreen'
import ReviewScreen from './components/GrammarReview/ReviewScreen'
import CardDetailScreen from './components/GrammarReview/CardDetailScreen'
import PracticeScreen from './components/GrammarPractice/PracticeScreen'
import TopicScreen from './components/TopicSelection/TopicScreen'
import SettingsScreen from './components/Settings/SettingsScreen'
import VocabularyScreen from './components/Vocabulary/VocabularyScreen'
import OnboardingFlow from './components/Onboarding/OnboardingFlow'

function App() {
  const { isOnboarded } = useAppStore()

  if (!isOnboarded) {
    return <OnboardingFlow />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/topics" element={<TopicScreen />} />
        <Route path="/conversation" element={<ConversationScreen />} />
        <Route path="/conversation/:topicId" element={<ConversationScreen />} />
        <Route path="/vocabulary" element={<VocabularyScreen />} />
        <Route path="/review" element={<ReviewScreen />} />
        <Route path="/review/:topicId" element={<CardDetailScreen />} />
        <Route path="/practice/:cardId" element={<PracticeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
