import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, HeartPulse } from 'lucide-react';
import './ReportModal.css';

interface HealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HealthReportModal({ isOpen, onClose }: HealthReportModalProps) {
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  if (!isOpen) return null;

  const daysList = ['Hoje', 'Ontem', '03/08/2026', '02/08/2026'];
  const monthsList = ['Agosto 2026', 'Julho 2026', 'Junho 2026'];

  const handlePrev = () => {
    if (viewMode === 'day') {
      setCurrentDateIndex((prev) => Math.min(prev + 1, daysList.length - 1));
    } else {
      setCurrentDateIndex((prev) => Math.min(prev + 1, monthsList.length - 1));
    }
  };

  const handleNext = () => {
    setCurrentDateIndex((prev) => Math.max(prev - 1, 0));
  };

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
          <button className="nav-arrow-btn" onClick={handlePrev}>
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
                  <span className="mini-value">7.5 h</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Humor</span>
                  <span className="mini-value">😊 Bom</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Stress</span>
                  <span className="mini-value" style={{ color: '#eab308' }}>Baixo</span>
                </div>
              </div>

              <div className="report-section-title">NOTAS DE BEM-ESTAR</div>
              <div className="report-info-card">
                <span>Sem sintomas ou observações registadas hoje.</span>
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
                <span>✨ O teu padrão de descanso melhorou <strong>12%</strong> em comparação com o mês passado.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
