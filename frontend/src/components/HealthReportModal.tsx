import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, HeartPulse } from 'lucide-react';
import './ReportModal.css';

export interface HealthEntry {
  id: number;
  kind: 'bp' | 'sleep' | 'mood' | 'stress';
  systolic?: number;
  diastolic?: number;
  bpm?: number;
  sleep_hours?: number;
  mood_value?: string;
  stress_value?: string;
  timestamp: string;
}

interface HealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: HealthEntry[];
}

export function HealthReportModal({ isOpen, onClose, logs = [] }: HealthReportModalProps) {
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

  // Cálculo dinâmico dos dados mais recentes
  const sleepEntry = logs.find((l) => l.kind === 'sleep');
  const moodEntry = logs.find((l) => l.kind === 'mood');
  const stressEntry = logs.find((l) => l.kind === 'stress');
  const bpEntry = logs.find((l) => l.kind === 'bp');

  const sleepHours = sleepEntry?.sleep_hours ? `${sleepEntry.sleep_hours} h` : '7.5 h';
  const moodText = moodEntry?.mood_value ? `😊 ${moodEntry.mood_value}` : '😊 Bom';
  const stressText = stressEntry?.stress_value || 'Baixo';

  return (
    <div className="modal-overlay">
      <div className="report-modal-card">
        {/* Cabeçalho */}
        <div className="report-header">
          <h2>Relatório de Saúde</h2>
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

        {/* Conteúdo de Saúde */}
        <div className="report-content-scroll">
          {viewMode === 'day' ? (
            <>
              <div className="report-section-title"><HeartPulse size={14} /> ESTADO DIÁRIO</div>
              <div className="report-stats-grid">
                <div className="report-mini-card">
                  <span className="mini-label">Sono</span>
                  <span className="mini-value">{sleepHours}</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Humor</span>
                  <span className="mini-value">{moodText}</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Stress</span>
                  <span className="mini-value" style={{ color: '#eab308' }}>{stressText}</span>
                </div>
              </div>

              {bpEntry && (
                <>
                  <div className="report-section-title">PRESSÃO ARTERIAL</div>
                  <div className="report-info-card">
                    <span>
                      Registado: <strong>{bpEntry.systolic}/{bpEntry.diastolic} mmHg</strong> ({bpEntry.bpm} BPM)
                    </span>
                  </div>
                </>
              )}

              <div className="report-section-title">NOTAS DE BEM-ESTAR</div>
              <div className="report-info-card">
                <span>Sem sintomas ou observações críticas registadas para este dia.</span>
              </div>
            </>
          ) : (
            <>
              <div className="report-section-title">MÉDIAS DE BEM-ESTAR DO MÊS</div>
              <div className="report-stats-grid">
                <div className="report-mini-card">
                  <span className="mini-label">Média de Sono</span>
                  <span className="mini-value">7.8 h / dia</span>
                </div>
                <div className="report-mini-card" style={{ gridColumn: 'span 2' }}>
                  <span className="mini-label">Humor Predominante</span>
                  <span className="mini-value">😊 Estável / Positivo</span>
                </div>
              </div>

              <div className="report-section-title">REGULARIDADE</div>
              <div className="report-info-card success">
                <span>✨ O teu padrão de descanso manteve-se consistente ao longo do mês.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}