import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import Layout from './components/ui/Layout'
import HomeScreen from './components/Home/HomeScreen'
import ConversationScreen from './components/Conversation/ConversationScreen'
import GrammarScreen from './components/Grammar/GrammarScreen'
import TopicDetail from './components/Grammar/TopicDetail'
import PracticeScreen from './components/GrammarPractice/PracticeScreen'
import TopicScreen from './components/TopicSelection/TopicScreen'
import SettingsScreen from './components/Settings/SettingsScreen'
import VocabularyScreen from './components/Vocabulary/VocabularyScreen'
import OnboardingFlow from './components/Onboarding/OnboardingFlow'

// Redirect component for /review/:topicId to /grammar/:topicId
function ReviewTopicRedirect() {
  const { topicId } = useParams<{ topicId: string }>()
  return <Navigate to={`/grammar/${topicId}`} replace />
}

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
        <Route path="/grammar" element={<GrammarScreen />} />
        <Route path="/grammar/:topicId" element={<TopicDetail />} />
        {/* Redirect old /review routes to new /grammar routes */}
        <Route path="/review" element={<Navigate to="/grammar" replace />} />
        <Route path="/review/:topicId" element={<ReviewTopicRedirect />} />
        <Route path="/exercises" element={<PracticeScreen />} />
        <Route path="/practice/:cardId" element={<PracticeScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
