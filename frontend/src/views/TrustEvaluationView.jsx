import { useState } from 'react';
import { 
  ShieldCheck, Activity, Cpu, Database, Network, 
  HelpCircle, RefreshCw, Sliders, ExternalLink, Lock, Unlock 
} from 'lucide-react';
import { evaluateTrust } from '../api';

export default function TrustEvaluationView({ 
  devices = [], 
  onRefresh, 
  onViewDetails,
  onUnblockClick
}) {
  const [selectedDevice, setSelectedDevice] = useState(devices[0]?.device_id || 'WEIGH-001');
  const [testDirect, setTestDirect] = useState(0.85);
  const [testIndirect, setTestIndirect] = useState(0.80);
  const [testBilstm, setTestBilstm] = useState(0.82);
  const [evaluating, setEvaluating] = useState(false);
  const [evalMessage, setEvalMessage] = useState(null);

  const handleTestEvaluation = async (e) => {
    e.preventDefault();
    setEvaluating(true);
    setEvalMessage(null);
    try {
      const res = await evaluateTrust({
        device_id: selectedDevice,
        direct_trust: parseFloat(testDirect),
        indirect_trust: parseFloat(testIndirect),
        behaviour_score: parseFloat(testBilstm),
        note: 'Live Trust Test / BiLSTM update from Legal Metrology Officer Console'
      });
      setEvalMessage(`Evaluation recorded: New Dynamic Score = ${res.dynamic_trust_score} (${res.trust_status})` + (res.is_blocked ? ' - 🔒 DEVICE AUTOMATICALLY BLOCKED & QUARANTINED' : ''));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setEvalMessage('Error evaluating trust score.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(14, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(56, 189, 248, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Trust Estimation & Auto-Quarantine Engine
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Multi-factor composite trust model with <b>Automatic Hardware Lockout</b> when tampering is detected. Unblocking requires Legal Metrology Admin authorization.
            </p>
          </div>
        </div>

        {/* Formula Representation Box */}
        <div style={{
          marginTop: '20px',
          padding: '14px 18px',
          background: 'rgba(9, 15, 29, 0.7)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>MATHEMATICAL MODEL:</span>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.92rem',
              color: '#38bdf8',
              fontWeight: 700,
              marginTop: '2px'
            }}>
              T<sub>dynamic</sub>(t) = α · T<sub>direct</sub>(t) + β · T<sub>indirect</sub>(t) + γ · S<sub>BiLSTM</sub>(t)
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div>α (Direct Weight) = <b style={{ color: '#ffffff' }}>0.40</b></div>
            <div>β (Indirect Weight) = <b style={{ color: '#ffffff' }}>0.30</b></div>
            <div>γ (BiLSTM Weight) = <b style={{ color: '#ffffff' }}>0.30</b></div>
          </div>
        </div>
      </div>

      {/* Grid of All Devices Trust Matrix Cards */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
        Live Trust Matrix by Instrument
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        {devices.map((dev) => {
          const statusClass = dev.trust_status.toLowerCase();
          const isBlocked = dev.is_blocked;

          return (
            <div 
              key={dev.device_id}
              className="glass-panel"
              style={{
                padding: '20px',
                borderRadius: '14px',
                border: isBlocked 
                  ? '1px solid rgba(239, 68, 68, 0.5)' 
                  : dev.trust_status === 'SUSPICIOUS' 
                  ? '1px solid rgba(245, 158, 11, 0.35)' 
                  : '1px solid var(--border-color)',
                background: isBlocked ? 'linear-gradient(145deg, rgba(239, 68, 68, 0.08) 0%, rgba(14, 23, 42, 0.8) 100%)' : 'rgba(14, 23, 42, 0.7)'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-dot ${isBlocked ? 'tampered' : statusClass}`} />
                    <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                      {dev.device_id}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      ({dev.sensor_id})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {dev.device_type}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className={`badge badge-${statusClass}`}>
                    {dev.trust_status}
                  </span>
                  {isBlocked && (
                    <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      <Lock size={10} /> BLOCKED
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Overall Score Gauge */}
              <div style={{
                background: 'rgba(9, 15, 29, 0.6)',
                padding: '12px 14px',
                borderRadius: '10px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Overall Dynamic Trust:
                </span>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: dev.dynamic_trust_score >= 0.8 ? '#10b981' : dev.dynamic_trust_score >= 0.5 ? '#f59e0b' : '#ef4444'
                }}>
                  {dev.dynamic_trust_score.toFixed(2)}
                </span>
              </div>

              {/* Component breakdown table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>DIRECT</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                    {dev.direct_trust.toFixed(2)}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>INDIRECT</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#818cf8' }}>
                    {dev.indirect_trust.toFixed(2)}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>BEHAVIOUR</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#c084fc' }}>
                    {dev.behaviour_score.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Last Evaluation Timestamp & Details link */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '12px',
                fontSize: '0.72rem'
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Evaluated: <b>{dev.last_evaluated_time}</b>
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {isBlocked && (
                    <button
                      onClick={() => onUnblockClick && onUnblockClick(dev)}
                      className="btn btn-primary btn-sm"
                      style={{ background: '#059669', borderColor: '#10b981', padding: '3px 8px', fontSize: '0.7rem' }}
                    >
                      <Unlock size={11} /> Unblock
                    </button>
                  )}
                  <button
                    onClick={() => onViewDetails(dev.device_id)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.7rem' }}
                  >
                    <ExternalLink size={12} /> Dossier
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Engine Input & BiLSTM Simulator Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sliders size={20} color="#38bdf8" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            BiLSTM & Multi-Factor Trust Evaluation Test Console
          </h3>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Test real-time trust ingestion. Setting scores below 0.50 triggers <b>automatic device lockout & quarantine</b>.
        </p>

        {evalMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.8rem',
            color: '#6ee7b7'
          }}>
            ✓ {evalMessage}
          </div>
        )}

        <form onSubmit={handleTestEvaluation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Target Device</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="form-select"
            >
              {devices.map(d => (
                <option key={d.device_id} value={d.device_id}>
                  {d.device_id} - {d.trust_status} {d.is_blocked ? '(LOCKED)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Direct Trust Score ({testDirect})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={testDirect}
              onChange={(e) => setTestDirect(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Indirect Trust Score ({testIndirect})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={testIndirect}
              onChange={(e) => setTestIndirect(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">BiLSTM Behaviour Score ({testBilstm})</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={testBilstm}
              onChange={(e) => setTestBilstm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={evaluating}
            style={{ height: '40px' }}
          >
            {evaluating ? 'Processing...' : 'Apply Trust Score'}
          </button>
        </form>
      </div>
    </div>
  );
}
