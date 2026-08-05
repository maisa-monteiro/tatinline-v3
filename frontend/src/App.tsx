import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Journal } from './pages/Journal';
import { Activity } from './pages/Activity';
import { Health } from './pages/Health';
import { Settings } from './pages/Settings';
import { OnboardingModal, type UserProfile } from './components/OnboardingModal';

export function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const handleCompleteOnboarding = (data: UserProfile) => {
    setProfile(data);
    setShowOnboarding(false);
  };

  const handleResetApp = () => {
    setProfile(null);
    setShowOnboarding(true);
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <Routes>
          {/* Passamos o nome do perfil para a página do Diário */}
          <Route path="/" element={<Journal userName={profile?.name || 'Utilizador'} />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/health" element={<Health />} />
          <Route 
            path="/settings" 
            element={
              <Settings 
                userName={profile?.name || 'Utilizador'} 
                onResetApp={handleResetApp} 
              />
            } 
          />
        </Routes>
      </main>

      <Navbar />

      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={handleCompleteOnboarding} 
      />
    </div>
  );
}

export default App;
