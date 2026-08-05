import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import './ReportModal.css';

export interface ActivityEntry {
  id: number;
  kind: 'workout' | 'weight' | 'waist';
  workout_type?: string;
  workout_label?: string;
  minutes?: number;
  calories_burned?: number;
  weight_kg?: number;
  waist_cm?: number;
  timestamp: string;
}

interface ActivityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: ActivityEntry[];
}

export function ActivityReportModal({ isOpen, onClose, logs = [] }: ActivityReportModalProps) {
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  if (!isOpen) return null;

  const daysList = ['Hoje', 'Ontem', 'Há 2 dias', 'Há 3 dias'];
  const monthsList = ['Este Mês', 'Mês Passado'];

  const maxIndex = viewMode === 'day' ? daysList.length - 1 : monthsList.length - 1;

  const handlePrev = () => {
    setCurrentDateIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handleNext = () => {
    setCurrentDateIndex((prev) => Math.max(prev - 1, 0));
  };

  // Cálculos de exemplo baseados nos logs passados
  const workouts = logs.filter((l) => l.kind === 'workout');
  const totalSessions = workouts.length || 1;
  const totalDuration = workouts.reduce((acc, curr) => acc + (curr.minutes || 0), 0) || 30;
  const totalCalories = workouts.reduce((acc, curr) => acc + (curr.calories_burned || 0), 0) || 120;

  const latestWeight = logs.find((l) => l.kind === 'weight')?.weight_kg || '67.3';
  const latestWaist = logs.find((l) => l.kind === 'waist')?.waist_cm || '80.5';

  return (
    <div className="modal-overlay">
      <div className="report-modal-card">
        {/* Cabeçalho */}
        <div className="report-header">
          <h2>Relatório de Atividade</h2>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Seletor Dia / Mês */}
        <div className="toggle-container">
          <button 
            className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => { setViewMode('day'); setCurrentDateIndex(0); }}
          >
            Dia
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => { setViewMode('month'); setCurrentDateIndex(0); }}
          >
            Mês
          </button>
        </div>

        {/* Barra de Navegação Temporal */}
        <div className="date-nav-bar">
          <button className="nav-arrow-btn" onClick={handlePrev} disabled={currentDateIndex === maxIndex}>
            <ChevronLeft size={18} />
          </button>
          <span className="current-date-label">
            📅 {viewMode === 'day' ? daysList[currentDateIndex] : monthsList[currentDateIndex]}
          </span>
          <button className="nav-arrow-btn" onClick={handleNext} disabled={currentDateIndex === 0}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Conteúdo de Atividade */}
        <div className="report-content-scroll">
          {viewMode === 'day' ? (
            <>
              <div className="report-section-title">TREINOS</div>
              <div className="report-stats-grid">
                <div className="report-mini-card">
                  <span className="mini-label">Sessões</span>
                  <span className="mini-value">{totalSessions}</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Duração</span>
                  <span className="mini-value">{totalDuration} min</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Gasto</span>
                  <span className="mini-value green">{totalCalories} kcal</span>
                </div>
              </div>

              <div className="report-section-title">PESO</div>
              <div className="report-info-card">
                <span>Registado: <strong>{latestWeight} kg</strong></span>
              </div>

              <div className="report-section-title">CINTURA</div>
              <div className="report-info-card">
                <span>Registado: <strong>{latestWaist} cm</strong></span>
              </div>
            </>
          ) : (
            <>
              <div className="report-section-title">RESUMO DE TREINOS DO MÊS</div>
              <div className="report-stats-grid">
                <div className="report-mini-card">
                  <span className="mini-label">Total Sessões</span>
                  <span className="mini-value">{workouts.length || 12}</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Média Duração</span>
                  <span className="mini-value">35 min</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Total Gasto</span>
                  <span className="mini-value green"><Flame size={14} /> {totalCalories * 10} kcal</span>
                </div>
              </div>

              <div className="report-section-title">EVOLUÇÃO DO PESO E CINTURA</div>
              <div className="report-stats-grid">
                <div className="report-mini-card" style={{ gridColumn: 'span 3' }}>
                  <span className="mini-label">Variação Mensal</span>
                  <span className="mini-value" style={{ color: '#16a34a' }}>-1.2 kg <span style={{ color: '#64748b', fontWeight: 'normal', fontSize: '0.8rem' }}>(Média: 67.6 kg)</span></span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}