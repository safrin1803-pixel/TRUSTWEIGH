import { useState } from 'react';
import { X, Unlock, ShieldCheck, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { unblockDevice } from '../api';

export default function UnblockDeviceModal({ isOpen, device, onClose, onDeviceUnblocked }) {
  const [adminName, setAdminName] = useState('Admin (Legal Metrology)');
  const [sealNo, setSealNo] = useState(`LM-SEAL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [reason, setReason] = useState('Hardware load cell inspected, zero-point re-calibrated with Class M1 standard weights, and tamper-evident wire seal applied.');
  const [restoreScore, setRestoreScore] = useState(0.95);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !device) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await unblockDevice(device.device_id, {
        admin_name: adminName,
        calibration_seal_no: sealNo,
        reason: reason,
        restore_trust_score: parseFloat(restoreScore)
      });
      if (onDeviceUnblocked) onDeviceUnblocked(res.device);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to authorize and unblock device.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <Unlock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: '#ffffff' }}>
                Admin Authorization: Unblock Instrument
              </h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                Legal Metrology Physical Seal Verification & Device Re-certification
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
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Device Highlight */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 700 }}>BLOCKED INSTRUMENT</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                {device.device_id} ({device.sensor_id})
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '2px' }}>
                {device.location}
              </div>
            </div>
            <span className="badge badge-critical">QUARANTINED</span>
          </div>

          {/* Admin Name */}
          <div className="form-group">
            <label className="form-label">Admin / Authorizing Officer Name *</label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Calibration Seal Number */}
          <div className="form-group">
            <label className="form-label">Physical Metrology Wire Seal No. *</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={sealNo}
                onChange={(e) => setSealNo(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>
          </div>

          {/* Re-certification Audit Reason */}
          <div className="form-group">
            <label className="form-label">Verification & Unblock Audit Reason *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          {/* Restored Trust Score */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Restored Trust Score Baseline</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                {restoreScore} (TRUSTED)
              </span>
            </div>
            <input
              type="range"
              min="0.80"
              max="1.0"
              step="0.01"
              value={restoreScore}
              onChange={(e) => setRestoreScore(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ background: '#059669', borderColor: '#10b981' }}
              disabled={submitting}
            >
              <Unlock size={16} /> {submitting ? 'Authorizing...' : 'Authorize & Unblock Instrument'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
