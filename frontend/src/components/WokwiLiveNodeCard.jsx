import { useState, useEffect } from 'react';
import { 
  Cpu, Radio, ShieldCheck, ShieldAlert, AlertOctagon, 
  Lock, Unlock, RefreshCw, Zap, Scale, Activity, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { fetchLiveWokwiState, triggerWokwiAction } from '../api';

export default function WokwiLiveNodeCard({ onUnblockClick, onStateChange }) {
  const [wokwiState, setWokwiState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadLiveState = async () => {
    try {
      const data = await fetchLiveWokwiState();
      setWokwiState(data);
    } catch (err) {
      console.error('Failed to fetch Wokwi live state:', err);
    }
  };

  useEffect(() => {
    loadLiveState();
    const interval = setInterval(loadLiveState, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (actionType) => {
    setActionLoading(true);
    try {
      const res = await triggerWokwiAction(actionType);
      setWokwiState(res.live_state);
      if (onStateChange) onStateChange();
    } catch (err) {
      console.error('Failed to trigger Wokwi action:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!wokwiState) {
    return (
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '28px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Connecting to Wokwi ESP32 Bridge...
      </div>
    );
  }

  const isTampered = wokwiState.trust_class === 'TAMPERED' || wokwiState.is_blocked;
  const isSuspicious = wokwiState.trust_class === 'SUSPICIOUS';
  const isNormal = wokwiState.mode === 'NORMAL' && !wokwiState.tamper_locked;
  const isAlt = wokwiState.mode === 'ALTERNATE';
  const isLocked = wokwiState.tamper_locked;

  const statusColor = isTampered ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981';

  return (
    <div className="glass-panel" style={{
      padding: '24px 28px',
      marginBottom: '28px',
      background: isTampered 
        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(14, 23, 42, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(14, 23, 42, 0.95) 100%)',
      border: `1px solid ${isTampered ? 'rgba(239, 68, 68, 0.45)' : 'rgba(14, 165, 233, 0.35)'}`,
      boxShadow: isTampered ? '0 0 25px rgba(239, 68, 68, 0.18)' : '0 0 25px rgba(14, 165, 233, 0.15)',
      borderRadius: '16px'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: isTampered ? 'rgba(239, 68, 68, 0.25)' : 'rgba(14, 165, 233, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: statusColor,
            border: `1px solid ${statusColor}40`
          }}>
            <Cpu size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, letterSpacing: '0.02em', color: '#ffffff' }}>
                WOKWI LIVE EDGE NODE
              </h3>
              <span style={{
                background: 'rgba(56, 189, 248, 0.18)',
                color: '#38bdf8',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                {wokwiState.edge_id}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.68rem',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}>
                <Radio size={10} className="status-dot trusted" /> LIVE TELEMETRY
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              ESP32 DevKit-C v4 + HX711 24-bit ADC + DS1307 RTC Hardware Simulator
            </p>
          </div>
        </div>

        {/* Top Controls: Interactive Wokwi Pushbuttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleAction('toggle_alternate')}
            disabled={actionLoading}
            className="btn btn-secondary btn-sm"
            style={{
              background: isAlt ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isAlt ? '#f59e0b' : 'var(--border-color)',
              color: isAlt ? '#fde68a' : '#f8fafc',
              fontSize: '0.74rem',
              gap: '6px'
            }}
            title="Toggles Wokwi Yellow Pushbutton (+20% Weight Alteration Attack)"
          >
            🟡 Yellow Btn ({isAlt ? 'Alter +20% ACTIVE' : '+20% Alter Tamper'})
          </button>

          <button
            onClick={() => handleAction('trigger_lock')}
            disabled={actionLoading}
            className="btn btn-danger btn-sm"
            style={{
              background: isLocked ? '#b91c1c' : 'rgba(239, 68, 68, 0.2)',
              fontSize: '0.74rem',
              gap: '6px'
            }}
            title="Triggers Wokwi Red Pushbutton (Physical Tampering Machine Lockout)"
          >
            🔴 Red Btn ({isLocked ? 'LOCKED' : 'Machine Lock'})
          </button>

          <button
            onClick={() => handleAction('reset_normal')}
            disabled={actionLoading}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', gap: '6px' }}
          >
            🟢 Reset Normal
          </button>

          {wokwiState.is_blocked && (
            <button
              onClick={() => onUnblockClick && onUnblockClick({
                device_id: wokwiState.edge_id,
                sensor_id: wokwiState.sensor_id,
                location: 'Wokwi Live Edge Node (Scale #1)',
                trust_status: wokwiState.trust_class
              })}
              className="btn btn-primary btn-sm"
              style={{ background: '#059669', borderColor: '#10b981', fontSize: '0.74rem', gap: '6px' }}
            >
              <Unlock size={14} /> 🔓 Admin Unblock
            </button>
          )}
        </div>
      </div>

      {/* 9 Required Output Badges Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* 1. Edge ID */}
        <div style={{ background: 'rgba(9, 15, 29, 0.7)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>1. EDGE ID</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8', marginTop: '2px' }}>
            {wokwiState.edge_id}
          </div>
        </div>

        {/* 2. Sensor ID */}
        <div style={{ background: 'rgba(9, 15, 29, 0.7)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>2. SENSOR ID</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#cbd5e1', marginTop: '2px' }}>
            {wokwiState.sensor_id}
          </div>
        </div>

        {/* 3. IP Address */}
        <div style={{ background: 'rgba(9, 15, 29, 0.7)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>3. IP ADDRESS</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#cbd5e1', marginTop: '2px' }}>
            {wokwiState.ip_address}
          </div>
        </div>

        {/* 4. Hop Level */}
        <div style={{ background: 'rgba(9, 15, 29, 0.7)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>4. HOP LEVEL</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {wokwiState.hop_level}
          </div>
        </div>

        {/* 5. Overall Trust Score */}
        <div style={{
          background: isTampered ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)',
          padding: '12px 14px',
          borderRadius: '10px',
          border: `1px solid ${statusColor}50`
        }}>
          <div style={{ fontSize: '0.68rem', color: statusColor, fontWeight: 800 }}>5. OVERALL TRUST SCORE</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: statusColor, marginTop: '2px' }}>
            {wokwiState.overall_trust_score.toFixed(2)}
          </div>
        </div>

        {/* 6. Trust Class */}
        <div style={{ background: 'rgba(9, 15, 29, 0.7)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>6. TRUST CLASS</div>
          <div style={{ marginTop: '4px' }}>
            <span className={`badge badge-${wokwiState.trust_class.toLowerCase()}`}>
              {wokwiState.trust_class}
            </span>
          </div>
        </div>

        {/* 7. Trust Level */}
        <div style={{ background: 'rgba(9, 15, 29, 0.7)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>7. TRUST LEVEL</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
            {wokwiState.trust_level}
          </div>
        </div>

        {/* 8. Attack Risk */}
        <div style={{ background: 'rgba(9, 15, 29, 0.7)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>8. ATTACK RISK</div>
          <div style={{ 
            fontSize: '0.85rem', 
            fontWeight: 800, 
            color: wokwiState.attack_risk_pct > 50 ? '#ef4444' : wokwiState.attack_risk_pct > 20 ? '#f59e0b' : '#10b981',
            marginTop: '4px' 
          }}>
            {wokwiState.attack_risk}
          </div>
        </div>

        {/* 9. Comm Allowed / Blocked */}
        <div style={{ background: 'rgba(9, 15, 29, 0.7)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>9. COMM STATE</div>
          <div style={{ marginTop: '4px' }}>
            {wokwiState.is_blocked ? (
              <span className="badge badge-critical" style={{ gap: '4px' }}>
                <Lock size={11} /> 🔒 BLOCKED
              </span>
            ) : (
              <span className="badge badge-trusted" style={{ gap: '4px' }}>
                <ShieldCheck size={11} /> ALLOWED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Physical Weighing Comparison & BiLSTM Vector Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        background: 'rgba(9, 15, 29, 0.5)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.04)'
      }}>
        {/* Real-Time Weight Sensor Stream */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale size={15} color="#38bdf8" /> Real-Time HX711 Load Cell vs Displayed Output
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(14, 23, 42, 0.8)', padding: '8px 14px', borderRadius: '8px', flex: 1 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>ACTUAL SENSOR WEIGHT</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                {wokwiState.actual_weight.toFixed(2)} kg
              </div>
            </div>

            <ArrowRight size={16} color="var(--text-secondary)" />

            <div style={{
              background: isAlt ? 'rgba(239, 68, 68, 0.15)' : 'rgba(14, 23, 42, 0.8)',
              padding: '8px 14px',
              borderRadius: '8px',
              flex: 1,
              border: `1px solid ${isAlt ? 'rgba(239, 68, 68, 0.4)' : 'transparent'}`
            }}>
              <div style={{ fontSize: '0.65rem', color: isAlt ? '#fca5a5' : 'var(--text-secondary)' }}>
                DISPLAYED TO CONSUMER {isAlt && '(+20% TAMPERED)'}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isAlt ? '#ef4444' : '#10b981' }}>
                {wokwiState.displayed_weight.toFixed(2)} kg
              </div>
            </div>
          </div>
        </div>

        {/* BiLSTM Trust Sub-Component Vector */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={15} color="#818cf8" /> Deep BiLSTM Sequence Trust Vector
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <div style={{ background: 'rgba(14, 23, 42, 0.8)', padding: '8px 10px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>DIRECT (40%)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                {wokwiState.direct_trust.toFixed(2)}
              </div>
            </div>
            <div style={{ background: 'rgba(14, 23, 42, 0.8)', padding: '8px 10px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>INDIRECT (30%)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#818cf8' }}>
                {wokwiState.indirect_trust.toFixed(2)}
              </div>
            </div>
            <div style={{ background: 'rgba(14, 23, 42, 0.8)', padding: '8px 10px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>BiLSTM (30%)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#c084fc' }}>
                {wokwiState.bilstm_score.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
