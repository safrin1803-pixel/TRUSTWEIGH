import { useState, useEffect } from 'react';
import { 
  X, Scale, ShieldCheck, AlertCircle, AlertOctagon, 
  Calendar, Clock, Wifi, HardDrive, MapPin, Activity,
  FileCheck, ShieldAlert, Lock, Unlock
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, ReferenceArea, ReferenceLine 
} from 'recharts';
import { fetchDeviceDetails, blockDevice } from '../api';

export default function DeviceDetailModal({ 
  deviceId, 
  isOpen, 
  onClose,
  onUnblockClick,
  onDeviceUpdated 
}) {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (deviceId && isOpen) {
      loadDetails(deviceId);
    }
  }, [deviceId, isOpen]);

  const loadDetails = async (id) => {
    setLoading(true);
    try {
      const data = await fetchDeviceDetails(id);
      setDeviceData(data);
    } catch (err) {
      console.error('Error fetching device details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const device = deviceData?.device;
  const history = deviceData?.trust_history || [];
  const alerts = deviceData?.alerts || [];

  const statusClass = device?.trust_status?.toLowerCase() || 'trusted';
  const isBlocked = device?.is_blocked;

  const handleManualBlock = async () => {
    if (!window.confirm(`Administratively quarantine and block device ${device.device_id}?`)) return;
    try {
      await blockDevice(device.device_id, {
        admin_name: 'Officer R. Sundaram',
        reason: 'Quarantine lock initiated from inspection dossier.'
      });
      loadDetails(device.device_id);
      if (onDeviceUpdated) onDeviceUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to block device.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '880px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isBlocked ? '#ef4444' : '#38bdf8',
              border: `1px solid ${isBlocked ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.3)'}`
            }}>
              {isBlocked ? <Lock size={22} /> : <Scale size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-mono)' }}>
                  {device?.device_id || deviceId}
                </h3>
                {device && (
                  <>
                    <span className={`badge badge-${statusClass}`}>
                      <span className={`status-dot ${statusClass}`} />
                      {device.trust_status}
                    </span>
                    {isBlocked ? (
                      <span className="badge badge-critical" style={{ gap: '4px' }}>
                        <Lock size={11} /> BLOCKED / QUARANTINED
                      </span>
                    ) : (
                      <span className="badge badge-trusted" style={{ gap: '4px' }}>
                        <ShieldCheck size={11} /> OPERATIONAL
                      </span>
                    )}
                  </>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Legal Metrology Device Dossier & Inspection Records
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading instrument records...
          </div>
        ) : !device ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>
            Device data not found.
          </div>
        ) : (
          <div style={{ padding: '24px 28px' }}>
            {/* Blocked Quarantine Warning & Unblock Trigger Banner */}
            {isBlocked ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(14, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} color="#ef4444" />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f87171' }}>
                      SECURITY LOCKDOWN: DEVICE IS CURRENTLY BLOCKED
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Locked At: <b>{device.blocked_at || 'Automatic Enforcement Protocol'}</b>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    if (onUnblockClick) onUnblockClick(device);
                  }}
                  className="btn btn-primary"
                  style={{ background: '#059669', borderColor: '#10b981', gap: '6px' }}
                >
                  <Unlock size={16} /> Authorize & Unblock Instrument
                </button>
              </div>
            ) : (
              device.trust_status !== 'TRUSTED' && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#fde68a' }}>
                    ⚠️ Device is in <b>SUSPICIOUS</b> state. You may proactively quarantine this device.
                  </div>
                  <button
                    onClick={handleManualBlock}
                    className="btn btn-danger btn-sm"
                    style={{ gap: '4px' }}
                  >
                    <Lock size={13} /> Quarantine Device
                  </button>
                </div>
              )
            )}

            {/* 1. Device Hardware & Registration Specs Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
              background: 'rgba(9, 15, 29, 0.6)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SENSOR ID</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{device.sensor_id}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>IP ADDRESS</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{device.ip_address}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MAC ADDRESS</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{device.mac_address || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>INSTRUMENT TYPE</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>{device.device_type}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LOCATION</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#cbd5e1' }}>{device.location}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REGISTRATION DATE & TIME</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#94a3b8' }}>
                  {device.registration_date} | {device.registration_time}
                </div>
              </div>
            </div>

            {/* 2. Trust Evaluation Score Cards */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#10b981" /> Trust Evaluation Components
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px'
              }}>
                {/* Direct Trust */}
                <div className="glass-panel" style={{ padding: '14px 16px', background: 'rgba(14, 23, 42, 0.7)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DIRECT TRUST (α=40%)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                    {device.direct_trust.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Data Integrity & Weight Consistency</div>
                </div>

                {/* Indirect Trust */}
                <div className="glass-panel" style={{ padding: '14px 16px', background: 'rgba(14, 23, 42, 0.7)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>INDIRECT TRUST (β=30%)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                    {device.indirect_trust.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Cluster & Peer Recommendation</div>
                </div>

                {/* BiLSTM Behaviour Score */}
                <div className="glass-panel" style={{ padding: '14px 16px', background: 'rgba(14, 23, 42, 0.7)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>BEHAVIOUR SCORE (γ=30%)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                    {device.behaviour_score.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>BiLSTM Sequence Anomaly Metric</div>
                </div>

                {/* Dynamic Composite Trust */}
                <div className="glass-panel" style={{ 
                  padding: '14px 16px', 
                  background: device.dynamic_trust_score >= 0.8 ? 'rgba(16, 185, 129, 0.15)' : device.dynamic_trust_score >= 0.5 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.18)',
                  border: `1px solid ${device.dynamic_trust_score >= 0.8 ? '#10b981' : device.dynamic_trust_score >= 0.5 ? '#f59e0b' : '#ef4444'}`
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700 }}>DYNAMIC TRUST SCORE</div>
                  <div style={{ 
                    fontSize: '1.6rem', 
                    fontWeight: 900, 
                    color: device.dynamic_trust_score >= 0.8 ? '#10b981' : device.dynamic_trust_score >= 0.5 ? '#f59e0b' : '#ef4444', 
                    fontFamily: 'var(--font-mono)',
                    margin: '2px 0'
                  }}>
                    {device.dynamic_trust_score.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                    STATUS: {device.trust_status}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Dynamic Trust History Timeseries Chart */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="#38bdf8" /> Trust Score Degradation Timeline
                </h4>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Last Evaluated: <b>{device.last_evaluated_date} {device.last_evaluated_time}</b>
                </div>
              </div>

              <div style={{
                background: 'rgba(9, 15, 29, 0.8)',
                padding: '16px 12px 10px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                height: '240px'
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 1.0]} ticks={[0, 0.5, 0.8, 1.0]} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ background: '#0e172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }}
                      formatter={(val) => [val.toFixed(2), 'Dynamic Trust']}
                    />
                    <ReferenceArea y1={0.8} y2={1.0} fill="#10b981" fillOpacity={0.06} />
                    <ReferenceArea y1={0.5} y2={0.8} fill="#f59e0b" fillOpacity={0.06} />
                    <ReferenceArea y1={0.0} y2={0.5} fill="#ef4444" fillOpacity={0.08} />
                    <ReferenceLine y={0.8} stroke="#10b981" strokeDasharray="3 3" />
                    <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="3 3" />
                    <Line 
                      type="monotone" 
                      dataKey="dynamic_trust_score" 
                      stroke="#38bdf8" 
                      strokeWidth={2.5} 
                      dot={{ fill: '#0284c7', r: 4 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Alert Records for this Device (without reason) */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} color="#f43f5e" /> Device Metrology Alert History ({alerts.length})
              </h4>
              {alerts.length === 0 ? (
                <div style={{
                  padding: '16px',
                  background: 'rgba(9, 15, 29, 0.5)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}>
                  No tampering or trust degradation alerts recorded for this device.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {alerts.map((al) => (
                    <div 
                      key={al.alert_id} 
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: al.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.1)',
                        border: `1px solid ${al.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc' }}>
                          {al.alert_type}
                        </span>
                        <span className={`badge badge-${al.severity.toLowerCase()}`}>
                          {al.severity}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Score: <b>{al.trust_score.toFixed(2)}</b>
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.75rem', color: '#f8fafc', fontWeight: 600 }}>{al.date} | {al.time}</div>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          color: al.status === 'ACTIVE' ? '#ef4444' : '#10b981'
                        }}>
                          {al.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
