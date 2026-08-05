import { useState } from 'react';
import './OnboardingModal.css';

export interface UserProfile {
  name: string;
  calories: string;
  water: string;
  sleep: string;
  idealWeight: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: UserProfile) => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('1720');
  const [water, setWater] = useState('2450');
  const [sleep, setSleep] = useState('8');
  const [idealWeight, setIdealWeight] = useState('65');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onComplete({ name, calories, water, sleep, idealWeight });
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <h2>👋 Bem-vinda!</h2>
        <p className="onboarding-sub">Configura o teu perfil e as tuas metas iniciais.</p>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {/* Nome */}
          <div className="form-group">
            <label>Qual é o teu nome?</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Maria"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* 4 Metas */}
          <div className="form-grid">
            <div className="form-group">
              <label>Calorias (kcal)</label>
              <input
                type="number"
                className="input-field"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Água (ml)</label>
              <input
                type="number"
                className="input-field"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Sono (horas)</label>
              <input
                type="number"
                step="0.5"
                className="input-field"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Peso ideal (kg)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={idealWeight}
                onChange={(e) => setIdealWeight(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="onboarding-submit-btn">
            Guardar e Começar
          </button>
        </form>
      </div>
    </div>
  );
}