import { useState, useEffect } from 'react';
import { Target, RefreshCw, AlertTriangle } from 'lucide-react';
import { type UserProfile } from '../components/OnboardingModal';
import { api } from '../api';
import './Settings.css';

interface SettingsProps {
  profile?: UserProfile | null;
  onUpdateProfile?: (profile: UserProfile) => void;
  onResetApp?: () => void;
}

export function Settings({ profile, onUpdateProfile, onResetApp }: SettingsProps) {
  // Inicializamos os inputs com os valores vindos do perfil global
  const [calories, setCalories] = useState(String(profile?.calories || '2000'));
  const [water, setWater] = useState(String(profile?.water || '2500'));
  const [sleep, setSleep] = useState(String(profile?.sleep || '8'));
  const [idealWeight, setIdealWeight] = useState(String(profile?.idealWeight || '65'));

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const userName = profile?.name || 'Utilizador';

  // Se o perfil mudar externamente, atualiza os inputs
  useEffect(() => {
    if (profile) {
      if (profile.calories) setCalories(String(profile.calories));
      if (profile.water) setWater(String(profile.water));
      if (profile.sleep) setSleep(String(profile.sleep));
      if (profile.idealWeight) setIdealWeight(String(profile.idealWeight));
    }
  }, [profile]);

  // --- GUARDAR METAS NO BACKEND E NO ESTADO GLOBAL ---
  const handleSaveSettings = async () => {
    try {
      const newCal = Number(calories);
      const newWater = Number(water);
      const newSleep = Number(sleep);
      const newWeight = Number(idealWeight);

      // 1. Atualizar no backend
      await api.put('/user/1/goals', {
        calorie_goal: newCal,
        water_goal: newWater,
        sleep_goal: newSleep,
        ideal_weight: newWeight,
      });

      // 2. Atualizar imediatamente o estado global da aplicação
      if (profile && onUpdateProfile) {
        const updatedProfile: UserProfile = {
          ...profile,
          calories: newCal,
          water: newWater,
          sleep: newSleep,
          idealWeight: newWeight,
        };
        onUpdateProfile(updatedProfile);
      }

      alert('Metas guardadas e atualizadas com sucesso em toda a app!');
    } catch (error) {
      console.error('Erro ao guardar metas:', error);
      alert('Erro ao guardar as metas no servidor.');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Definições</h1>
      <p className="page-subtitle">Metas da tua rotina ({userName})</p>

      <div className="card">
        <div className="card-header">
          <div className="icon-badge light-green">
            <Target size={20} />
          </div>
          <h3>Metas</h3>
        </div>

        <div className="settings-list">
          {/* Calorias */}
          <div className="setting-row">
            <span className="setting-label">Calorias diárias</span>
            <div className="setting-input-wrapper">
              <input
                type="number"
                className="setting-input"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
              <span className="setting-unit">kcal</span>
            </div>
          </div>

          {/* Água */}
          <div className="setting-row">
            <span className="setting-label">Água diária</span>
            <div className="setting-input-wrapper">
              <input
                type="number"
                className="setting-input"
                value={water}
                onChange={(e) => setWater(e.target.value)}
              />
              <span className="setting-unit">ml</span>
            </div>
          </div>

          {/* Sono */}
          <div className="setting-row">
            <span className="setting-label">Horas de sono</span>
            <div className="setting-input-wrapper">
              <input
                type="number"
                className="setting-input"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
              />
              <span className="setting-unit">h</span>
            </div>
          </div>

          {/* Peso Ideal */}
          <div className="setting-row">
            <span className="setting-label">Peso ideal</span>
            <div className="setting-input-wrapper">
              <input
                type="number"
                className="setting-input"
                value={idealWeight}
                onChange={(e) => setIdealWeight(e.target.value)}
              />
              <span className="setting-unit">kg</span>
            </div>
          </div>
        </div>

        <button className="btn-save" style={{ marginTop: '20px' }} onClick={handleSaveSettings}>
          Guardar metas
        </button>
      </div>

      {/* Secção Danger Zone: Recomeçar App */}
      <div className="card" style={{ marginTop: '20px', border: '1px solid #fee2e2' }}>
        <button className="btn-reset-app" onClick={() => setShowResetConfirm(true)}>
          <RefreshCw size={18} /> Recomeçar aplicação
        </button>
      </div>

      {/* Modal de Dupla Confirmação */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="confirm-card">
            <div className="warning-icon">
              <AlertTriangle size={32} />
            </div>
            <h3>Tens a certeza?</h3>
            <p>Isto vai apagar todas as tuas configurações e abrir o questionário inicial novamente.</p>

            <div className="confirm-buttons">
              <button className="btn-cancel" onClick={() => setShowResetConfirm(false)}>
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  setShowResetConfirm(false);
                  if (onResetApp) onResetApp();
                }}
              >
                Sim, recomeçar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}