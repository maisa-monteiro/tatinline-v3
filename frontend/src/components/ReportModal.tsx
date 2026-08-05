import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Utensils, Droplets } from 'lucide-react';
import './ReportModal.css';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
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
          <h2>Relatório do Diário</h2>
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

        {/* Conteúdo do Relatório do Diário */}
        <div className="report-content-scroll">
          {viewMode === 'day' ? (
            /* --- VISTA DIÁRIA --- */
            <>
              <div className="report-section-title">BALANÇO CALÓRICO</div>
              <div className="report-stats-grid">
                <div className="report-mini-card">
                  <span className="mini-label">Consumido</span>
                  <span className="mini-value">650 kcal</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Meta</span>
                  <span className="mini-value">1,720 kcal</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Água</span>
                  <span className="mini-value" style={{ color: '#0284c7' }}><Droplets size={14} /> 1,250 ml</span>
                </div>
              </div>

              <div className="report-section-title"><Utensils size={14} /> REFEIÇÕES REGISTADAS</div>
              <div className="report-info-card" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span>Pequeno-almoço: Ovos mexidos e torrada</span>
                  <strong>350 kcal</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Lanche: iogurte com frutos vermelhos</span>
                  <strong>300 kcal</strong>
                </div>
              </div>
            </>
          ) : (
            /* --- VISTA MENSAL (Médias) --- */
            <>
              <div className="report-section-title">MÉDIAS MENSAIS DE ALIMENTAÇÃO</div>
              <div className="report-stats-grid">
                <div className="report-mini-card" style={{ gridColumn: 'span 3' }}>
                  <span className="mini-label">Média Diária de Calorias</span>
                  <span className="mini-value">1,650 kcal <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>(Meta: 1,720)</span></span>
                </div>
              </div>

              <div className="report-section-title">HIDRATAÇÃO DO MÊS</div>
              <div className="report-stats-grid">
                <div className="report-mini-card" style={{ gridColumn: 'span 3' }}>
                  <span className="mini-label">Média Diária de Água</span>
                  <span className="mini-value" style={{ color: '#0284c7' }}>2,100 ml / dia</span>
                </div>
              </div>

              <div className="report-section-title">CONSISTÊNCIA</div>
              <div className="report-info-card success">
                <span>✨ Cumpriste a meta calórica em <strong>22 dos 30 dias</strong> deste mês. Continua assim!</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
