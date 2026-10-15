import { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, ReferenceLine, ReferenceArea 
} from 'recharts';
import { Activity, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fetchTrustHistory } from '../api';

export default function TrustChart({ devices = [], selectedDeviceId, onDeviceSelect }) {
  const [activeDeviceId, setActiveDeviceId] = useState(selectedDeviceId || 'WEIGH-003');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDeviceId) {
      setActiveDeviceId(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (activeDeviceId) {
      loadHistory(activeDeviceId);
    }
  }, [activeDeviceId]);

  const loadHistory = async (devId) => {
    setLoading(true);
    try {
      const data = await fetchTrustHistory(devId);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to load trust history for', devId, err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (e) => {
    const newId = e.target.value;
    setActiveDeviceId(newId);
    if (onDeviceSelect) onDeviceSelect(newId);
  };

  const currentDevice = devices.find(d => d.device_id === activeDeviceId);

  // Custom tooltip to show detailed trust factors and alert notes
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: '#090f1d',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '12px 16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          minWidth: '220px'
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-secondary)', 
            marginBottom: '6px',
            fontFamily: 'var(--font-mono)'
          }}>
            🕒 {data.time} ({data.date})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
              Dynamic Trust:
            </span>
            <span style={{ 
              fontSize: '1rem', 
              fontWeight: 800, 
              color: data.dynamic_trust_score >= 0.8 ? '#10b981' : data.dynamic_trust_score >= 0.5 ? '#f59e0b' : '#ef4444',
              fontFamily: 'var(--font-mono)'
            }}>
              {data.dynamic_trust_score.toFixed(2)}
            </span>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'grid', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
            <div>Direct Trust: <b style={{ color: '#38bdf8' }}>{data.direct_trust}</b></div>
            <div>Indirect Trust: <b style={{ color: '#818cf8' }}>{data.indirect_trust}</b></div>
            <div>BiLSTM Behaviour: <b style={{ color: '#c084fc' }}>{data.behaviour_score}</b></div>
          </div>

          {data.note && (
            <div style={{
              marginTop: '8px',
              padding: '6px 8px',
              borderRadius: '6px',
              background: data.status === 'TAMPERED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              fontSize: '0.7rem',
              color: data.status === 'TAMPERED' ? '#fca5a5' : '#cbd5e1',
              border: data.status === 'TAMPERED' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              {data.status === 'TAMPERED' ? '🚨 ' : 'ℹ️ '} {data.note}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '28px' }}>
      {/* Header with Title & Device Selector */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Dynamic Trust Score vs Time
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              Real-time trust degradation and tampering transition curve
            </p>
          </div>
        </div>

        {/* Device Picker & Quick Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentDevice && (
            <span className={`badge badge-${currentDevice.trust_status.toLowerCase()}`}>
              <span className={`status-dot ${currentDevice.trust_status.toLowerCase()}`} />
              {currentDevice.trust_status} ({currentDevice.dynamic_trust_score.toFixed(2)})
            </span>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Select Device:
            </label>
            <select
              value={activeDeviceId}
              onChange={handleDeviceChange}
              className="form-select"
              style={{ width: '180px', padding: '6px 10px', fontSize: '0.8rem' }}
            >
              {devices.map(d => (
                <option key={d.device_id} value={d.device_id}>
                  {d.device_id} ({d.trust_status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Legend & Threshold Explanation */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '18px',
        padding: '10px 16px',
        background: 'rgba(9, 15, 29, 0.6)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '20px',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.3)', border: '1px solid #10b981', borderRadius: '3px' }} />
          <span><b>Trusted Zone</b> (&gt;= 0.80)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(245, 158, 11, 0.3)', border: '1px solid #f59e0b', borderRadius: '3px' }} />
          <span><b>Suspicious Zone</b> (0.50 - 0.79)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.3)', border: '1px solid #ef4444', borderRadius: '3px' }} />
          <span><b>Tampered Zone</b> (&lt; 0.50)</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historyData} margin={{ top: 15, right: 30, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
            />
            <YAxis 
              domain={[0, 1.0]} 
              ticks={[0, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0]} 
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Threshold Reference Areas */}
            <ReferenceArea y1={0.8} y2={1.0} fill="#10b981" fillOpacity={0.07} />
            <ReferenceArea y1={0.5} y2={0.8} fill="#f59e0b" fillOpacity={0.07} />
            <ReferenceArea y1={0.0} y2={0.5} fill="#ef4444" fillOpacity={0.09} />

            {/* Threshold Cutoff Lines */}
            <ReferenceLine y={0.8} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />

            {/* Dynamic Trust Score Curve */}
            <Line 
              type="monotone" 
              dataKey="dynamic_trust_score" 
              name="Dynamic Trust Score" 
              stroke="#38bdf8" 
              strokeWidth={3} 
              dot={{ fill: '#0284c7', stroke: '#38bdf8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 7, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
