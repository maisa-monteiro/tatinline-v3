import { useState } from 'react';
import { Scale, Ruler, TrendingUp, Activity as ActivityIcon, FileText } from 'lucide-react';
import { ActivityReportModal } from '../components/ActivityReportModal';
import { api } from '../api'; // <-- Importar a API
import './Activity.css';

interface WeightLog {
  date: string;
  weight: number;
}

interface WaistLog {
  date: string;
  waist: number;
}

interface ActivityProps {
  idealWeight?: number;
  onSaveWorkout?: (kcal: number) => void;
}

export function Activity({ idealWeight = 65, onSaveWorkout }: ActivityProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Estados do Registo de Treino
  const [selectedType, setSelectedType] = useState('Pilates');
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState('Média');

  const calculateKcal = () => {
    let multiplier = 4;
    if (intensity === 'Baixa') multiplier = 3;
    if (intensity === 'Alta') multiplier = 6;
    return Math.round(duration * multiplier);
  };

  const estimatedKcal = calculateKcal();

  // --- GUARDAR TREINO NO BACKEND ---
  const handleSaveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Guarda o treino na tabela de diário do backend
      await api.post('/diary', {
        user_id: 1,
        kind: 'workout',
        description: `Treino de ${selectedType} (${duration} min - ${intensity})`,
        calories: estimatedKcal,
      });

      if (onSaveWorkout) {
        onSaveWorkout(estimatedKcal);
      }
      alert(`Treino de ${selectedType} (${estimatedKcal} kcal) guardado com sucesso!`);
    } catch (error) {
      console.error('Erro ao guardar treino:', error);
      alert('Erro ao guardar o treino no servidor.');
    }
  };

  // Estados de Peso e Cintura
  const [weightInput, setWeightInput] = useState('');
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([
    { date: '01/08', weight: 68.5 },
    { date: '03/08', weight: 67.8 },
    { date: '05/08', weight: 67.3 },
  ]);

  const [waistInput, setWaistInput] = useState('');
  const [waistLogs, setWaistLogs] = useState<WaistLog[]>([
    { date: '01/08', waist: 82 },
    { date: '03/08', waist: 81.5 },
    { date: '05/08', waist: 80.5 },
  ]);

  // --- GUARDAR PESO NO BACKEND ---
  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(weightInput);
    if (!val) return;

    try {
      await api.post('/diary', {
        user_id: 1,
        kind: 'weight',
        description: `Peso corporal: ${val} kg`,
      });

      const todayStr = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
      setWeightLogs([...weightLogs, { date: todayStr, weight: val }]);
      setWeightInput('');
      alert('Peso guardado com sucesso!');
    } catch (error) {
      console.error('Erro ao guardar peso:', error);
      alert('Erro ao guardar peso no servidor.');
    }
  };

  // --- GUARDAR CINTURA NO BACKEND ---
  const handleSaveWaist = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(waistInput);
    if (!val) return;

    try {
      await api.post('/diary', {
        user_id: 1,
        kind: 'waist',
        description: `Cintura: ${val} cm`,
      });

      const todayStr = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
      setWaistLogs([...waistLogs, { date: todayStr, waist: val }]);
      setWaistInput('');
      alert('Medida da cintura guardada com sucesso!');
    } catch (error) {
      console.error('Erro ao guardar cintura:', error);
      alert('Erro ao guardar cintura no servidor.');
    }
  };

  const currentWaist = waistLogs.length > 0 ? waistLogs[waistLogs.length - 1].waist : 0;
  const initialWaist = waistLogs.length > 0 ? waistLogs[0].waist : 0;
  const waistDiff = (currentWaist - initialWaist).toFixed(1);

  return (
    <div className="page-container">
      <div className="header-flex">
        <div>
          <h1 className="page-title">Atividade</h1>
          <p className="page-subtitle">Treinos e evolução de peso</p>
        </div>
        <button className="btn-report" onClick={() => setIsReportOpen(true)}>
          <FileText size={16} /> Relatório
        </button>
      </div>

      {/* Cartão de Registar Treino */}
      <div className="card">
        <div className="card-header">
          <div className="icon-badge" style={{ backgroundColor: '#dcfce7', color: '#15803d', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIcon size={20} />
          </div>
          <h3>Registar treino</h3>
        </div>

        <form onSubmit={handleSaveWorkout}>
          <div className="workout-types-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {['Pilates', 'Yoga', 'Caminhada', 'Outro'].map((type) => (
              <button
                key={type}
                type="button"
                className={`type-btn ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '10px',
                  borderRadius: '16px',
                  border: selectedType === type ? '1px solid #0077c8' : '1px solid #e2e8f0',
                  backgroundColor: selectedType === type ? '#f0f9ff' : '#f8fafc',
                  color: selectedType === type ? '#0077c8' : '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
              Duração ({duration} min)
            </label>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0077c8', cursor: 'pointer' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
              Intensidade
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {['Baixa', 'Média', 'Alta'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setIntensity(level)}
                  style={{
                    padding: '10px',
                    borderRadius: '16px',
                    border: intensity === level ? '1px solid #0077c8' : '1px solid #e2e8f0',
                    backgroundColor: intensity === level ? '#ffffff' : '#f8fafc',
                    color: intensity === level ? '#0077c8' : '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <span style={{ color: '#166534', fontWeight: 600, fontSize: '0.95rem' }}>Gasto estimado</span>
            <span style={{ color: '#15803d', fontWeight: 700, fontSize: '1.2rem' }}>{estimatedKcal} kcal</span>
          </div>

          <button type="submit" className="btn-save" style={{ width: '100%', padding: '14px', borderRadius: '16px', backgroundColor: '#0077c8', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            Guardar treino
          </button>
        </form>
      </div>

      {/* Cartão de Peso */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <div className="icon-badge light-blue">
            <Scale size={20} />
          </div>
          <h3>Peso corporal</h3>
        </div>

        <form onSubmit={handleSaveWeight} className="measure-form">
          <input
            type="number"
            step="0.1"
            className="input-field"
            placeholder="Peso hoje (kg)"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
          />
          <button type="submit" className="btn-save" style={{ marginTop: 0, width: '120px' }}>
            Guardar
          </button>
        </form>

        <div className="chart-box">
          <div className="chart-header-info">
            <span className="chart-title"><TrendingUp size={16} /> Evolução de peso</span>
            <span className="target-badge">Meta (Ideal): {idealWeight} kg</span>
          </div>

          <div className="svg-container">
            <svg viewBox="0 0 300 100" className="evolution-svg">
              <line 
                x1="0" 
                y1="50" 
                x2="300" 
                y2="50" 
                stroke="#cbd5e1" 
                strokeDasharray="4 4" 
                strokeWidth="1.5" 
              />
              
              <polyline
                fill="none"
                stroke="#0077c8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={weightLogs.map((log, index) => {
                  const x = (index / Math.max(1, weightLogs.length - 1)) * 260 + 20;
                  const y = 90 - ((log.weight - 50) / 40) * 80;
                  return `${x},${Math.min(90, Math.max(10, y))}`;
                }).join(' ')}
              />

              {weightLogs.map((log, index) => {
                const x = (index / Math.max(1, weightLogs.length - 1)) * 260 + 20;
                const y = 90 - ((log.weight - 50) / 40) * 80;
                const safeY = Math.min(90, Math.max(10, y));
                return (
                  <g key={index}>
                    <circle cx={x} cy={safeY} r="4.5" fill="#0077c8" />
                    <text x={x} y={safeY - 10} fontSize="10" textAnchor="middle" fill="#475569" fontWeight="bold">
                      {log.weight}kg
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Cartão de Cintura */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <div className="icon-badge light-blue">
            <Ruler size={20} />
          </div>
          <h3>Cintura</h3>
        </div>

        <form onSubmit={handleSaveWaist} className="measure-form">
          <input
            type="number"
            step="0.5"
            className="input-field"
            placeholder="Cintura hoje (cm)"
            value={waistInput}
            onChange={(e) => setWaistInput(e.target.value)}
          />
          <button type="submit" className="btn-save" style={{ marginTop: 0, width: '120px' }}>
            Guardar
          </button>
        </form>

        <div className="stats-row">
          <div className="stat-box">
            <span className="stat-label">Atual</span>
            <span className="stat-value">{currentWaist ? `${currentWaist} cm` : '—'}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Desde o início</span>
            <span className={`stat-value ${Number(waistDiff) <= 0 ? 'positive' : 'negative'}`}>
              {waistLogs.length > 1 ? `${waistDiff} cm` : '—'}
            </span>
          </div>
        </div>

        <div className="chart-box" style={{ marginTop: '16px' }}>
          <div className="chart-header-info">
            <span className="chart-title"><TrendingUp size={16} /> Evolução da cintura</span>
          </div>

          <div className="svg-container">
            <svg viewBox="0 0 300 100" className="evolution-svg">
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={waistLogs.map((log, index) => {
                  const x = (index / Math.max(1, waistLogs.length - 1)) * 260 + 20;
                  const y = 90 - ((log.waist - 60) / 40) * 80;
                  return `${x},${Math.min(90, Math.max(10, y))}`;
                }).join(' ')}
              />

              {waistLogs.map((log, index) => {
                const x = (index / Math.max(1, waistLogs.length - 1)) * 260 + 20;
                const y = 90 - ((log.waist - 60) / 40) * 80;
                const safeY = Math.min(90, Math.max(10, y));
                return (
                  <g key={index}>
                    <circle cx={x} cy={safeY} r="4.5" fill="#10b981" />
                    <text x={x} y={safeY - 10} fontSize="10" textAnchor="middle" fill="#475569" fontWeight="bold">
                      {log.waist}cm
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <ActivityReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  );
}
