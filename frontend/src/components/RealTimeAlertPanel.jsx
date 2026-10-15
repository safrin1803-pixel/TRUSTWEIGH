import { 
  AlertTriangle, ShieldAlert, CheckCircle2, 
  ExternalLink, Clock, Calendar, AlertOctagon, Check, Lock, Unlock 
} from 'lucide-react';
import { acknowledgeAlert } from '../api';

export default function RealTimeAlertPanel({ 
  alerts = [], 
  onAlertAcknowledged, 
  onViewDevice,
  onUnblockClick,
  devices = []
}) {
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  if (activeAlerts.length === 0) {
    return (
      <div className="glass-panel" style={{
        padding: '16px 20px',
        marginBottom: '28px',
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <CheckCircle2 size={18} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>
              All Legal Metrology Instruments Within Valid Trust Tolerances
            </span>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              No critical tampering or anomalous load cell deviations active.
            </p>
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
          ● LIVE MONITORING ACTIVE
        </span>
      </div>
    );
  }

  const criticalAlert = activeAlerts.find(a => a.severity === 'CRITICAL') || activeAlerts[0];
  const targetDevice = devices.find(d => d.device_id === criticalAlert.device_id);
  const isDeviceBlocked = targetDevice?.is_blocked;

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId);
      if (onAlertAcknowledged) onAlertAcknowledged(alertId);
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    }
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Primary Highlight Alert Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        background: criticalAlert.severity === 'CRITICAL' 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(14, 23, 42, 0.95) 100%)' 
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(14, 23, 42, 0.95) 100%)',
        border: `1px solid ${criticalAlert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.4)'}`,
        boxShadow: criticalAlert.severity === 'CRITICAL' ? '0 0 25px rgba(239, 68, 68, 0.2)' : 'none',
        borderRadius: '14px'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: criticalAlert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: criticalAlert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'
            }}>
              <AlertOctagon size={24} className={criticalAlert.severity === 'CRITICAL' ? 'status-dot tampered' : ''} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '0.02em', color: '#ffffff' }}>
                  🚨 {criticalAlert.alert_type.toUpperCase()}
                </h3>
                <span className={`badge badge-${criticalAlert.severity.toLowerCase()}`}>
                  {criticalAlert.severity}
                </span>
                {isDeviceBlocked && (
                  <span className="badge badge-critical" style={{ gap: '4px' }}>
                    <Lock size={11} /> AUTO-BLOCKED
                  </span>
                )}
                <span style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {criticalAlert.alert_id}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: '3px 0 0' }}>
                {isDeviceBlocked ? '🔒 Device quarantined & locked from commercial transactions. Admin unblock required.' : 'Immediate Legal Metrology Inspection Recommended'}
              </p>
            </div>
          </div>

          {/* Quick Metrics of the Alert */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>FLAGGED DEVICE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                {criticalAlert.device_id}
              </div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>TRUST SCORE</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#f87171' }}>
                {criticalAlert.trust_score.toFixed(2)}
              </div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>TIMESTAMP</div>
              <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600 }}>
                {criticalAlert.date} | {criticalAlert.time}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {isDeviceBlocked && targetDevice && (
              <button
                onClick={() => onUnblockClick && onUnblockClick(targetDevice)}
                className="btn btn-primary btn-sm"
                style={{ background: '#059669', borderColor: '#10b981', gap: '4px' }}
              >
                <Unlock size={14} /> Admin Unblock
              </button>
            )}

            <button
              onClick={() => onViewDevice(criticalAlert.device_id)}
              className="btn btn-secondary btn-sm"
            >
              <ExternalLink size={13} /> View Device Dossier
            </button>
            <button
              onClick={() => handleAcknowledge(criticalAlert.alert_id)}
              className="btn btn-secondary btn-sm"
            >
              <Check size={14} /> Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
