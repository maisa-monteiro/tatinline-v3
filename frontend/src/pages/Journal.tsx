import { useState } from 'react';
import { Sparkles, Droplet, Plus, FileText, Trash2, Flame } from 'lucide-react';
import { ReportModal } from '../components/ReportModal';
import { type UserProfile } from '../components/OnboardingModal';
import { api } from '../api';
import './Journal.css';

interface LogItem {
  id: string;
  type: 'meal' | 'water';
  title: string;
  detail: string;
  calories?: number;
  time: string;
}

interface JournalProps {
  profile?: UserProfile | null;
}

export function Journal({ profile }: JournalProps) {
  const [mealText, setMealText] = useState('');
  const [waterAmount, setWaterAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showWaterModal, setShowWaterModal] = useState(false);
  const [customWaterInput, setCustomWaterInput] = useState('300');
  
  const [logs, setLogs] = useState<LogItem[]>([]);

  // Metas dinâmicas vindas do perfil (com valores de segurança caso o perfil venha vazio)
  const userName = profile?.name || 'Utilizador';
  const calorieGoal = Number(profile?.calories) || 2000;
  const burnedKcal = profile?.burnedKcal || 0;
  const waterGoal = Number(profile?.water) || 2500;

  const todayDate = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  const consumedKcal = logs.reduce((acc, item) => acc + (item.calories || 0), 0);
  
  // O total de calorias que se pode consumir inclui a meta base + o exercício gasto
  const totalCalorieAllowance = calorieGoal + burnedKcal;
  const remainingKcal = totalCalorieAllowance - consumedKcal;

  // --- ADICIONAR REFEIÇÃO NO BACKEND ---
  const handleAddMeal = async () => {
    if (!mealText.trim()) return;

    try {
      const response = await api.post('/diary', {
        user_id: 1,
        kind: 'food',
        description: mealText,
      });

      const savedItem = response.data;

      const newLog: LogItem = {
        id: savedItem.id || Date.now().toString(),
        type: 'meal',
        title: mealText,
        detail: `~${savedItem.calories} kcal`,
        calories: savedItem.calories,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setLogs([newLog, ...logs]);
      setMealText('');
    } catch (error) {
      console.error('Erro ao guardar refeição:', error);
      alert('Erro ao processar refeição com a IA.');
    }
  };

  // --- ADICIONAR ÁGUA NO BACKEND ---
  const handleAddWater = async (amount: number) => {
    try {
      await api.post('/diary', {
        user_id: 1,
        kind: 'water',
        description: `Água: ${amount} ml`,
        water_ml: amount,
      });

      setWaterAmount((prev) => Math.min(prev + amount, 5000));

      const newLog: LogItem = {
        id: Date.now().toString(),
        type: 'water',
        title: 'Água',
        detail: `+${amount} ml`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setLogs([newLog, ...logs]);
    } catch (error) {
      console.error('Erro ao guardar água:', error);
      alert('Erro ao guardar água no servidor.');
    }
  };

  const handleAddCustomWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customWaterInput);
    if (amount > 0) {
      handleAddWater(amount);
      setShowWaterModal(false);
      setCustomWaterInput('300');
    }
  };

  const handleDeleteLog = (id: string) => {
    const itemToDelete = logs.find(log => log.id === id);
    if (itemToDelete?.type === 'water') {
      const ml = parseInt(itemToDelete.detail.replace(/[^0-9]/g, '')) || 0;
      setWaterAmount(prev => Math.max(0, prev - ml));
    }
    setLogs(logs.filter(log => log.id !== id));
  };

  const waterPercentage = Math.round((waterAmount / waterGoal) * 100);

  return (
    <div className="page-container">
      <div className="header-flex">
        <div>
          <h1 className="page-title">Olá, {userName}</h1>
          <p className="page-subtitle">{todayDate}</p>
        </div>
        <button className="btn-report" onClick={() => setIsModalOpen(true)}>
          <FileText size={16} /> Relatório
        </button>
      </div>

      <div className="card">
        <div className="card-header-between">
          <span className="card-label">Calorias hoje</span>
          <span className="workout-kcal-tag">
            <Flame size={14} /> +{burnedKcal} kcal treino
          </span>
        </div>

        <div className="kcal-main-display">
          <span className="kcal-consumed">{consumedKcal}</span>
          <span className="kcal-goal">/{totalCalorieAllowance} kcal</span>
        </div>

        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${Math.min(100, (consumedKcal / totalCalorieAllowance) * 100)}%` }}
          />
        </div>

        <p className="kcal-remaining">{remainingKcal} kcal restantes</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="icon-badge sparkles">
            <Sparkles size={20} />
          </div>
          <div>
            <h3>Registar refeição</h3>
            <p className="card-sub">Estimativa "a olho" com IA</p>
          </div>
        </div>

        <textarea
          className="meal-input"
          placeholder="Ex: um prato normal de arroz de pato, meio pão e uma maçã."
          value={mealText}
          onChange={(e) => setMealText(e.target.value)}
          rows={3}
        />

        <button className="btn-primary" onClick={handleAddMeal}>
          + Adicionar
        </button>
      </div>

      <div className="card">
        <div className="water-summary">
          <div className="water-capsule">
            <Droplet size={28} className="water-icon" />
          </div>
          <div>
            <span className="water-label">Água</span>
            <div className="water-values">
              <span className="water-current">{waterAmount}</span>
              <span className="water-goal">/{waterGoal} ml</span>
            </div>
            <p className="water-percentage">{waterPercentage}% da meta</p>
          </div>
        </div>

        <div className="water-buttons">
          <button className="btn-quick-add" onClick={() => handleAddWater(150)}>
            <strong>150</strong> ml
          </button>
          <button className="btn-quick-add" onClick={() => handleAddWater(250)}>
            <strong>250</strong> ml
          </button>
          <button className="btn-quick-add" onClick={() => handleAddWater(500)}>
            <strong>500</strong> ml
          </button>
          <button className="btn-quick-add primary-icon" onClick={() => setShowWaterModal(true)} title="Adicionar quantidade personalizada">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {showWaterModal && (
        <div className="modal-overlay">
          <div className="confirm-card">
            <h3>💧 Adicionar Água</h3>
            <p>Quantos mililitros bebeste?</p>

            <form onSubmit={handleAddCustomWaterSubmit}>
              <input
                type="number"
                className="input-field"
                value={customWaterInput}
                onChange={(e) => setCustomWaterInput(e.target.value)}
                placeholder="Ex: 1000"
                autoFocus
                style={{ textAlign: 'center', marginBottom: '16px', fontSize: '1.2rem', fontWeight: 'bold' }}
                required
              />

              <div className="confirm-buttons">
                <button type="button" className="btn-cancel" onClick={() => setShowWaterModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" style={{ flex: 1, marginTop: 0 }}>
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: '#0f172a' }}>Registos de hoje</h3>
        
        {logs.length === 0 ? (
          <p className="empty-text">Ainda sem registos hoje.</p>
        ) : (
          <div className="logs-list">
            {logs.map((log) => (
              <div key={log.id} className="log-item">
                <div className="log-info">
                  <span className="log-title">{log.title}</span>
                  <span className="log-detail">{log.detail} • <small>{log.time}</small></span>
                </div>
                <button className="btn-delete" onClick={() => handleDeleteLog(log.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}