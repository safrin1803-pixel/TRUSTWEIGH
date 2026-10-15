import { useState, useEffect } from 'react';
import { 
  Settings, Sliders, ShieldCheck, AlertTriangle, 
  RotateCcw, Save, CheckCircle2, Info 
} from 'lucide-react';
import { fetchSettings, updateSettings } from '../api';
import axios from 'axios';

export default function SettingsView({ onSettingsSaved }) {
  const [settings, setSettings] = useState({
    trusted_min: 0.80,
    suspicious_min: 0.50,
    tampered_max: 0.49,
    alpha_direct_weight: 0.40,
    beta_indirect_weight: 0.30,
    gamma_behaviour_weight: 0.30
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: parseFloat(e.target.value)
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSaveSuccess(true);
      if (onSettingsSaved) onSettingsSaved();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all demo devices and alert history back to initial demonstration state?')) {
      return;
    }
    setResetting(true);
    try {
      await axios.post('http://127.0.0.1:8001/api/system/reset');
      if (onSettingsSaved) onSettingsSaved();
      alert('Demo data successfully reset to initial clean state.');
    } catch (err) {
      console.error(err);
      alert('Failed to reset database.');
    } finally {
      setResetting(false);
    }
  };

  const totalWeight = (settings.alpha_direct_weight + settings.beta_indirect_weight + settings.gamma_behaviour_weight).toFixed(2);

  return (
    <div>
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(14, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <Settings size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              Trust Evaluation Parameters & Thresholds Configuration
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Configure legal tolerance boundaries, status classifications, and trust component multipliers.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '28px'
        }}>
          {/* 1. Threshold Classification Boundaries */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10b981" /> Trust Classification Thresholds
            </h3>

            <div className="form-group">
              <label className="form-label">
                Trusted Minimum Cutoff (Current: <b>{settings.trusted_min}</b>)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                name="trusted_min"
                value={settings.trusted_min}
                onChange={handleChange}
                className="form-input"
              />
              <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
                Scores &gt;= {settings.trusted_min} are marked as <b>TRUSTED</b>.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Suspicious Minimum Cutoff (Current: <b>{settings.suspicious_min}</b>)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max={settings.trusted_min - 0.01}
                name="suspicious_min"
                value={settings.suspicious_min}
                onChange={handleChange}
                className="form-input"
              />
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '4px' }}>
                Scores between {settings.suspicious_min} and {(settings.trusted_min - 0.01).toFixed(2)} are marked as <b>SUSPICIOUS</b>.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Tampered Maximum Threshold (Current: <b>{settings.tampered_max}</b>)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.0"
                max={settings.suspicious_min - 0.01}
                name="tampered_max"
                value={settings.tampered_max}
                onChange={handleChange}
                className="form-input"
              />
              <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px' }}>
                Scores &lt; {settings.suspicious_min} trigger <b>TAMPERED</b> alerts.
              </div>
            </div>
          </div>

          {/* 2. Weight Multipliers */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#38bdf8" /> Trust Formula Weight Factors
              </h3>
              <span style={{
                fontSize: '0.75rem',
                color: totalWeight === '1.00' ? '#10b981' : '#f59e0b',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}>
                Sum = {totalWeight}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                Direct Trust Weight α (Current: <b>{settings.alpha_direct_weight}</b>)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                name="alpha_direct_weight"
                value={settings.alpha_direct_weight}
                onChange={handleChange}
                className="form-input"
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Weight allocated to local sensor data integrity checks.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Indirect Trust Weight β (Current: <b>{settings.beta_indirect_weight}</b>)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                name="beta_indirect_weight"
                value={settings.beta_indirect_weight}
                onChange={handleChange}
                className="form-input"
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Weight allocated to peer cluster & neighbor recommendations.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                BiLSTM Behaviour Score Weight γ (Current: <b>{settings.gamma_behaviour_weight}</b>)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                name="gamma_behaviour_weight"
                value={settings.gamma_behaviour_weight}
                onChange={handleChange}
                className="form-input"
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Weight allocated to deep learning sequence anomaly detection.
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="glass-panel" style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            {saveSuccess && (
              <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Parameters saved & device statuses re-evaluated!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleResetData}
              disabled={resetting}
              className="btn btn-danger"
              style={{ fontSize: '0.8rem' }}
            >
              <RotateCcw size={14} /> {resetting ? 'Resetting...' : 'Reset Demo Database'}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
