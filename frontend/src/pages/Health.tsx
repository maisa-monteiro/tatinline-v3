import { useState, useEffect } from 'react';
import { Heart, Moon, Smile, Brain, TrendingUp, Trash2 } from 'lucide-react';
import { HealthReportModal } from '../components/HealthReportModal';
import { type UserProfile } from '../components/OnboardingModal';
import { api } from '../api';
import './Health.css';

interface SleepLog {
  id: string;
  bedTime: string;
  wakeTime: string;
  durationMinutes: number;
}

interface HealthProps {
  profile?: UserProfile | null;
}

export function Health({ profile }: HealthProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const userName = profile?.name || 'Utilizador';

  // --- ESTADO PARA OS LOGS VINDOS DA BASE DE DADOS ---
  const [healthLogs, setHealthLogs] = useState<any[]>([]);

  // Pressão Arterial e BPM
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [bpm, setBpm] = useState('70');

  // Sono
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  // Humor e Stress
  const [mood, setMood] = useState('Neutra');
  const [lastMoodTime, setLastMoodTime] = useState('17:09');
  
  const [stress, setStress] = useState('Baixo');
  const [lastStressTime, setLastStressTime] = useState('17:09');

  // --- FUNÇÃO PARA BUSCAR O HISTÓRICO DA BASE DE DADOS ---
  const fetchHealthLogs = async () => {
    try {
      const response = await api.get('/health/user/1'); // ID 1 do utilizador
      setHealthLogs(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico de saúde:', error);
    }
  };

  useEffect(() => {
    fetchHealthLogs();
  }, []);

  const getBPStatus = () => {
    const sys = Number(systolic);
    const dia = Number(diastolic);

    if (sys >= 140 || dia >= 90) {
      return { status: 'ALTO', label: 'ALTA', class: 'bp-red' };
    }
    if ((sys >= 125 && sys < 140) || (dia >= 80 && dia < 90)) {
      return { status: 'ATENÇÃO', label: 'ATENÇÃO', class: 'bp-yellow' };
    }
    return { status: 'NORMAL', label: 'NORMAL', class: 'bp-green' };
  };

  const calculateIntervalMinutes = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [bH, bM] = start.split(':').map(Number);
    const [wH, wM] = end.split(':').map(Number);

    let bDate = new Date(2026, 0, 1, bH, bM);
    let wDate = new Date(2026, 0, 1, wH, wM);

    if (wDate <= bDate) {
      wDate.setDate(wDate.getDate() + 1);
    }

    return Math.round((wDate.getTime() - bDate.getTime()) / (1000 * 60));
  };

  // --- FUNÇÃO PARA GUARDAR PRESSÃO ARTERIAL NO BACKEND ---
  const handleSaveBP = async () => {
    try {
      await api.post('/health', {
        user_id: 1,
        kind: 'bp',
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        bpm: Number(bpm),
      });
      alert('Pressão arterial registada com sucesso!');
      fetchHealthLogs(); // Atualiza a lista para o relatório
    } catch (error) {
      console.error('Erro ao guardar pressão arterial:', error);
      alert('Erro ao comunicar com o servidor.');
    }
  };

  // --- FUNÇÃO PARA GUARDAR SONO NO BACKEND ---
  const handleAddSleep = async () => {
    const minutes = calculateIntervalMinutes(bedTime, wakeTime);
    if (minutes <= 0) return;

    const totalHours = Number((minutes / 60).toFixed(1));

    try {
      await api.post('/health', {
        user_id: 1,
        kind: 'sleep',
        sleep_hours: totalHours,
      });

      const newLog: SleepLog = {
        id: Date.now().toString(),
        bedTime,
        wakeTime,
        durationMinutes: minutes,
      };

      setSleepLogs([...sleepLogs, newLog]);
      fetchHealthLogs(); // Atualiza a lista para o relatório
    } catch (error) {
      console.error('Erro ao guardar sono:', error);
    }
  };

  const handleDeleteSleep = (id: string) => {
    setSleepLogs(sleepLogs.filter((log) => log.id !== id));
  };

  const getTotalSleepDisplay = () => {
    const totalMinutes = sleepLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (totalMinutes === 0) return '0.0h';
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // --- FUNÇÃO PARA GUARDAR HUMOR NO BACKEND ---
  const handleSelectMood = async (selectedMood: string) => {
    setMood(selectedMood);
    setLastMoodTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    try {
      await api.post('/health', {
        user_id: 1,
        kind: 'mood',
        mood_value: selectedMood,
      });
      fetchHealthLogs(); // Atualiza a lista para o relatório
    } catch (error) {
      console.error('Erro ao guardar humor:', error);
    }
  };

  // --- FUNÇÃO PARA GUARDAR STRESS NO BACKEND ---
  const handleSelectStress = async (selectedStress: string) => {
    setStress(selectedStress);
    setLastStressTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    try {
      await api.post('/health', {
        user_id: 1,
        kind: 'stress',
        stress_value: selectedStress,
      });
      fetchHealthLogs(); // Atualiza a lista para o relatório
    } catch (error) {
      console.error('Erro ao guardar stress:', error);
    }
  };

  const bpInfo = getBPStatus();

  return (
    <div className="page-container">
      <div className="header-flex">
        <div>
          <h1 className="page-title">Saúde</h1>
          <p className="page-subtitle">Sinais do teu corpo e mente, {userName}</p>
        </div>
        <button className="btn-report" onClick={() => setIsReportOpen(true)}>
          📄 Relatório
        </button>
      </div>

      {/* Pressão Arterial */}
      <div className="card">
        <div className="card-header">
          <div className="icon-badge light-blue">
            <Heart size={20} />
          </div>
          <h3>Pressão arterial</h3>
        </div>

        <div className={`bp-alert-banner ${bpInfo.class}`}>
          <div>
            <span className="alert-tag">{bpInfo.label}</span>
            <div className="bp-value-row">
              <span className="bp-main">{systolic}/{diastolic}</span>
              <span className="bpm-sub">• {bpm} bpm</span>
            </div>
          </div>
          <span className="time-tag">17:07</span>
        </div>

        <div className="bp-inputs-grid">
          <div className="input-group">
            <label>Sistólica</label>
            <input
              type="number"
              className="input-field"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Diastólica</label>
            <input
              type="number"
              className="input-field"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>BPM</label>
            <input
              type="number"
              className="input-field"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-save" onClick={handleSaveBP}>Registar</button>
      </div>

      {/* Sono Multi-registo */}
      <div className="card">
        <div className="sleep-header">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div className="icon-badge light-blue">
              <Moon size={20} />
            </div>
            <h3>Sono</h3>
          </div>
          <span className="sleep-val">Hoje: <strong>{getTotalSleepDisplay()}</strong></span>
        </div>

        <div className="sleep-inputs-grid" style={{ marginTop: '16px', marginBottom: '12px' }}>
          <div className="input-group">
            <label>Deitou-se</label>
            <input
              type="time"
              className="input-field"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Acordou</label>
            <input
              type="time"
              className="input-field"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-save" onClick={handleAddSleep} style={{ marginBottom: sleepLogs.length > 0 ? '16px' : '0' }}>
          Guardar sono
        </button>

        {sleepLogs.length > 0 && (
          <div className="sleep-logs-list">
            {sleepLogs.map((log) => {
              const h = Math.floor(log.durationMinutes / 60);
              const m = log.durationMinutes % 60;
              const durationStr = m > 0 ? `${h}h ${m}m` : `${h}h`;

              return (
                <div key={log.id} className="sleep-log-item">
                  <span>🛌 {log.bedTime} até {log.wakeTime} (<strong>{durationStr}</strong>)</span>
                  <button className="btn-delete" onClick={() => handleDeleteSleep(log.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Humor */}
      <div className="card">
        <div className="card-header-between">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div className="icon-badge light-blue">
              <Smile size={20} />
            </div>
            <h3>Humor</h3>
          </div>
          <span className="time-sub">Último: {lastMoodTime}</span>
        </div>

        <div className="mood-grid">
          {[
            { label: 'Bem', class: 'good' },
            { label: 'Neutra', class: 'neutral' },
            { label: 'Mal', class: 'bad' },
          ].map((item) => (
            <button
              key={item.label}
              className={`mood-btn ${item.class} ${mood === item.label ? 'active' : ''}`}
              onClick={() => handleSelectMood(item.label)}
            >
              <span className="emoji-icon">
                {item.label === 'Bem' ? '😊' : item.label === 'Neutra' ? '😐' : '🙁'}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nível de Stress */}
      <div className="card">
        <div className="card-header-between">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div className="icon-badge light-blue">
              <Brain size={20} />
            </div>
            <h3>Nível de stress</h3>
          </div>
          <span className="time-sub">Último: {lastStressTime}</span>
        </div>

        <div className="mood-grid">
          {[
            { label: 'Baixo', class: 'good' },
            { label: 'Médio', class: 'neutral' },
            { label: 'Alto', class: 'bad' },
          ].map((item) => (
            <button
              key={item.label}
              className={`mood-btn ${item.class} ${stress === item.label ? 'active' : ''}`}
              onClick={() => handleSelectStress(item.label)}
            >
              <span className="emoji-icon">
                {item.label === 'Baixo' ? '😊' : item.label === 'Médio' ? '😐' : '🙁'}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tendências / Padrões IA */}
      <div className="card">
        <div className="trends-header">
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div className="icon-badge light-green">
              <TrendingUp size={20} />
            </div>
            <h3>Tendências</h3>
          </div>
          <span className="time-sub">últimos 7 dias</span>
        </div>
        <div className="empty-state-box">
          Regista humor e stress alguns dias para a IA identificar padrões na tua alimentação e saúde.
        </div>
      </div>

      {/* Passamos o estado real 'healthLogs' vindo do backend para o modal de relatório */}
      <HealthReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        logs={healthLogs} 
      />
    </div>
  );
}