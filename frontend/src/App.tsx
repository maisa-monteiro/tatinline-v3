import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Journal } from './pages/Journal';
import { Activity } from './pages/Activity';
import { Health } from './pages/Health';
import { Settings } from './pages/Settings';
import { OnboardingModal, type UserProfile } from './components/OnboardingModal';

export function App() {
  // Inicializa o estado lendo do localStorage para os dados não se perderem
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('tatinline_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(!profile);

  // Sempre que o perfil mudar, guarda-o no localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem('tatinline_profile', JSON.stringify(profile));
      setShowOnboarding(false);
    } else {
      localStorage.removeItem('tatinline_profile');
    }
  }, [profile]);

  const handleCompleteOnboarding = (data: UserProfile) => {
    setProfile(data);
    setShowOnboarding(false);
  };

  const handleResetApp = () => {
    localStorage.removeItem('tatinline_profile');
    setProfile(null);
    setShowOnboarding(true);
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={<Journal profile={profile} />} 
          />
          <Route 
            path="/activity" 
            element={<Activity profile={profile} />} 
          />
          <Route 
            path="/health" 
            element={<Health profile={profile} />} 
          />
          <Route 
            path="/settings" 
            element={
              <Settings 
                profile={profile}
                onUpdateProfile={setProfile}
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