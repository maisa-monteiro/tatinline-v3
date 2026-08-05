import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Utensils, Droplets } from 'lucide-react';
import './ReportModal.css';

export interface DiaryEntry {
  id: number;
  kind: 'food' | 'water';
  description?: string;
  calories?: number;
  water_ml?: number;
  timestamp: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: DiaryEntry[];
  caloriesGoal?: number;
  waterGoal?: number;
}

export function ReportModal({
  isOpen,
  onClose,
  logs = [],
  caloriesGoal = 1720,
  waterGoal = 2450
}: ReportModalProps) {
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

  // Cálculos dinâmicos a partir dos registos
  const foodEntries = logs.filter((l) => l.kind === 'food');
  const waterEntries = logs.filter((l) => l.kind === 'water');

  const totalCalories = foodEntries.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalWater = waterEntries.reduce((acc, curr) => acc + (curr.water_ml || 0), 0);

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

        {/* Conteúdo do Relatório do Diário */}
        <div className="report-content-scroll">
          {viewMode === 'day' ? (
            /* --- VISTA DIÁRIA --- */
            <>
              <div className="report-section-title">BALANÇO CALÓRICO</div>
              <div className="report-stats-grid">
                <div className="report-mini-card">
                  <span className="mini-label">Consumido</span>
                  <span className="mini-value">{totalCalories || 650} kcal</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Meta</span>
                  <span className="mini-value">{caloriesGoal.toLocaleString()} kcal</span>
                </div>
                <div className="report-mini-card">
                  <span className="mini-label">Água</span>
                  <span className="mini-value" style={{ color: '#0284c7' }}>
                    <Droplets size={14} /> {totalWater || 1250} ml
                  </span>
                </div>
              </div>

              <div className="report-section-title"><Utensils size={14} /> REFEIÇÕES REGISTADAS</div>
              <div className="report-info-card" style={{ textAlign: 'left' }}>
                {foodEntries.length > 0 ? (
                  foodEntries.map((item, idx) => {
                    const isLast = idx === foodEntries.length - 1;
                    return (
                      <div 
                        key={item.id || idx}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: isLast ? '0px' : '8px', 
                          borderBottom: isLast ? 'none' : '1px solid #e2e8f0', 
                          paddingBottom: isLast ? '0px' : '6px' 
                        }}
                      >
                        <span>{item.description}</span>
                        <strong>{item.calories} kcal</strong>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                      <span>Pequeno-almoço: Ovos mexidos e torrada</span>
                      <strong>350 kcal</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Lanche: iogurte com frutos vermelhos</span>
                      <strong>300 kcal</strong>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* --- VISTA MENSAL (Médias) --- */
            <>
              <div className="report-section-title">MÉDIAS MENSAIS DE ALIMENTAÇÃO</div>
              <div className="report-stats-grid">
                <div className="report-mini-card" style={{ gridColumn: 'span 3' }}>
                  <span className="mini-label">Média Diária de Calorias</span>
                  <span className="mini-value">1,650 kcal <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>(Meta: {caloriesGoal})</span></span>
                </div>
              </div>

              <div className="report-section-title">HIDRATAÇÃO DO MÊS</div>
              <div className="report-stats-grid">
                <div className="report-mini-card" style={{ gridColumn: 'span 3' }}>
                  <span className="mini-label">Média Diária de Água</span>
                  <span className="mini-value" style={{ color: '#0284c7' }}>2,100 ml / dia (Meta: {waterGoal} ml)</span>
                </div>
              </div>

              <div className="report-section-title">CONSISTÊNCIA</div>
              <div className="report-info-card success">
                <span>✨ Cumpriste a meta calórica na maioria dos dias deste mês. Continua assim!</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}